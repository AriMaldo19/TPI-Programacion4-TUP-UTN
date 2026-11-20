"""Se listan, se activan y se desactivan cuentas desde el panel."""

from fastapi import HTTPException, status
from sqlmodel import Session

from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.usuarios.schemas import UserPublic


class UsuarioService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repo = UsuarioRepository(session)

    # Se listan todas las cuentas para el panel.
    def listar(self) -> list[UserPublic]:
        usuarios = self.repo.get_all()
        return [UserPublic.model_validate(usuario) for usuario in usuarios]

    # Se vuelve a habilitar la cuenta. Si ya estaba activa, igual se responde bien.
    def activar(self, user_id: int) -> UserPublic:
        usuario = self._obtener(user_id)
        usuario.disabled = False
        self.session.add(usuario)
        self.session.commit()
        self.session.refresh(usuario)
        return UserPublic.model_validate(usuario)

    # Se da de baja la cuenta. No se permite que el admin se apague a si mismo.
    def desactivar(self, user_id: int, actor: Usuario) -> UserPublic:
        if user_id == actor.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No podés desactivar tu propia cuenta",
            )
        usuario = self._obtener(user_id)
        usuario.disabled = True
        self.session.add(usuario)
        self.session.commit()
        self.session.refresh(usuario)
        return UserPublic.model_validate(usuario)

    # Se busca el usuario y, si no esta, se responde 404.
    def _obtener(self, user_id: int) -> Usuario:
        usuario = self.repo.get_by_id(user_id)
        if usuario is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        return usuario
