"""Se exponen las rutas de usuarios, solo para un admin."""

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


# Se prepara el servicio de usuarios.
def get_usuario_service(session: Session = Depends(get_session)) -> UsuarioService:
    return UsuarioService(session)


@router.get("", response_model=list[UserPublic])
# Se listan los usuarios. Solo entra un admin.
def listar_usuarios(
    _: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> list[UserPublic]:
    return service.listar()


@router.post("/{user_id}/activar", response_model=UserPublic)
# Se activa la cuenta indicada.
def activar_usuario(
    user_id: int,
    _: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    return service.activar(user_id)


@router.post("/{user_id}/desactivar", response_model=UserPublic)
# Se desactiva la cuenta indicada.
def desactivar_usuario(
    user_id: int,
    actor: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    return service.desactivar(user_id, actor)
