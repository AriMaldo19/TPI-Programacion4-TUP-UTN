"""Se publica la carta y el ABM de productos."""

from fastapi import APIRouter, Depends, Query, Response, status

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import CategoriaInvalida, ProductoNoEncontrado, ProductoService
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["productos"])


# Se prepara el servicio de productos.
def get_producto_service() -> ProductoService:
    return ProductoService()


@router.get("", response_model=ProductosPaginados)
# Se lista la carta con paginado y filtros.
def listar_productos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
    service: ProductoService = Depends(get_producto_service),
) -> ProductosPaginados:
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
# Se muestra el detalle de un producto.
def obtener_producto(producto_id: int, service: ProductoService = Depends(get_producto_service)) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as exc:
        raise _not_found(exc) from exc


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
# Se crea el producto. Si la categoria no sirve, se responde 404.
def crear_producto(
    data: ProductoCreate,
    _: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaInvalida as exc:
        raise _not_found(exc) from exc


@router.put("/{producto_id}", response_model=ProductoRead)
# Se edita el producto.
def actualizar_producto(
    producto_id: int,
    data: ProductoUpdate,
    _: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaInvalida) as exc:
        raise _not_found(exc) from exc


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
# Se actualiza stock y disponibilidad.
def actualizar_stock(
    producto_id: int,
    data: ProductoStockUpdate,
    _: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as exc:
        raise _not_found(exc) from exc


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
# Se da de baja el producto y se responde 204.
def eliminar_producto(
    producto_id: int,
    _: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> Response:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as exc:
        raise _not_found(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Se responde 404 cuando el producto o la categoria no estan.
def _not_found(exc: Exception):
    from fastapi import HTTPException

    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
