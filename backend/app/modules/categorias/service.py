"""Se aplican las reglas de la categoria, sobre todo el nombre unico."""

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    @property
    def uow(self) -> CategoriaUnitOfWork:
        return CategoriaUnitOfWork()

    # Se devuelven las categorias activas.
    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(categoria) for categoria in uow.categorias.list_activas()]

    # Se trae una categoria activa. Si no esta, se responde 404.
    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            return CategoriaRead.model_validate(categoria)

    # Se crea la categoria si el nombre no esta usado.
    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            self._nombre_libre(uow, data.nombre)
            categoria = Categoria(nombre=data.nombre.strip(), descripcion=data.descripcion, activo=True)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    # Se cambian solo los campos que vinieron en el pedido.
    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True)
            if "nombre" in cambios and cambios["nombre"] is not None:
                self._nombre_libre(uow, cambios["nombre"], excluir_id=categoria.id)
                cambios["nombre"] = cambios["nombre"].strip()
            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    # Se da de baja la categoria sin borrar la fila.
    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

    # Se exige que la categoria exista y siga activa.
    def _activa(self, uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria

    # Se controla que el nombre no lo tenga otra categoria.
    def _nombre_libre(self, uow: CategoriaUnitOfWork, nombre: str, excluir_id: int | None = None) -> None:
        existente = uow.categorias.get_by_nombre(nombre.strip())
        if existente is not None and existente.id != excluir_id:
            raise NombreDuplicado("Ya existe una categoría con ese nombre")
