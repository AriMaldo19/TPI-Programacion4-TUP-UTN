"""Se publica la lectura de categorias y la escritura solo para admin."""

from fastapi import APIRouter, Depends, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["categorias"])


# Se prepara el servicio de categorias.
def get_categoria_service() -> CategoriaService:
    return CategoriaService()


@router.get("", response_model=list[CategoriaRead])
# Se lista la carta de categorias para cualquiera.
def listar_categorias(service: CategoriaService = Depends(get_categoria_service)) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
# Se muestra una categoria.
def obtener_categoria(categoria_id: int, service: CategoriaService = Depends(get_categoria_service)) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise _http(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
# Se crea una categoria. Solo puede hacerlo un admin.
def crear_categoria(
    data: CategoriaCreate,
    _: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado as exc:
        raise _http(status.HTTP_409_CONFLICT, str(exc)) from exc


@router.put("/{categoria_id}", response_model=CategoriaRead)
# Se actualiza la categoria.
def actualizar_categoria(
    categoria_id: int,
    data: CategoriaUpdate,
    _: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as exc:
        raise _http(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except NombreDuplicado as exc:
        raise _http(status.HTTP_409_CONFLICT, str(exc)) from exc


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
# Se da de baja la categoria y se responde 204.
def eliminar_categoria(
    categoria_id: int,
    _: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
) -> Response:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise _http(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Se traduce el error de negocio a una respuesta HTTP.
def _http(code: int, detail: str) -> Exception:
    from fastapi import HTTPException

    return HTTPException(status_code=code, detail=detail)
