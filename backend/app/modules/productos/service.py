"""Se aplican las reglas del catalogo y de la baja logica."""

from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class CategoriaInvalida(Exception):
    pass


class ProductoService:
    @property
    def uow(self) -> ProductoUnitOfWork:
        return ProductoUnitOfWork()

    # Se devuelve la pagina de productos activos.
    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(item) for item in items])

    # Se muestra un producto activo con su categoria.
    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado("Producto no encontrado")
            return ProductoRead.model_validate(producto)

    # Se da de alta el producto en una categoria que siga vigente.
    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._categoria_activa(uow, data.categoria_id)
            producto = Producto(
                nombre=data.nombre.strip(),
                descripcion=data.descripcion,
                precio_base=data.precio_base,
                imagen_url=data.imagen_url,
                stock=data.stock,
                disponible=data.disponible,
                categoria_id=data.categoria_id,
                activo=True,
            )
            uow.productos.add(producto)
            producto = self._con_categoria(uow, producto.id)
            return ProductoRead.model_validate(producto)

    # Se modifican los campos enviados y se conserva el resto.
    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado("Producto no encontrado")
            cambios = data.model_dump(exclude_unset=True)
            if cambios.get("categoria_id") is not None:
                self._categoria_activa(uow, cambios["categoria_id"])
            if "nombre" in cambios and cambios["nombre"] is not None:
                cambios["nombre"] = cambios["nombre"].strip()
            for campo, valor in cambios.items():
                setattr(producto, campo, valor)
            uow.productos.add(producto)
            producto = self._con_categoria(uow, producto.id)
            return ProductoRead.model_validate(producto)

    # Se cambia el stock y si el producto se puede vender.
    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.productos.add(producto)
            producto = self._con_categoria(uow, producto.id)
            return ProductoRead.model_validate(producto)

    # Se da de baja el producto sin borrar la fila.
    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.activo = False
            uow.productos.add(producto)

    # Se comprueba que la categoria exista y no este dada de baja.
    def _categoria_activa(self, uow: ProductoUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.session.get(Categoria, categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaInvalida("La categoría no existe o está dada de baja")
        return categoria

    # Se vuelve a leer el producto ya con su categoria cargada.
    def _con_categoria(self, uow: ProductoUnitOfWork, producto_id: int | None) -> Producto:
        statement = select_producto(producto_id)
        producto = uow.session.exec(statement).first()
        if producto is None:
            raise ProductoNoEncontrado("Producto no encontrado")
        return producto


# Se arma la consulta que trae el producto y su categoria.
def select_producto(producto_id: int | None):
    return select(Producto).where(Producto.id == producto_id).options(selectinload(Producto.categoria))
