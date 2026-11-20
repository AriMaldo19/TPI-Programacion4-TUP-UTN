"""Se da de alta al cliente y se comprueban usuario y contraseña."""

from fastapi import HTTPException, status
from sqlmodel import Session

from app.core.security import get_password_hash, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository
from app.modules.usuarios.schemas import UserCreate, UserPublic


class AuthService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repo = UsuarioRepository(session)

    # Se crea un cliente nuevo. Si el usuario o el email ya existen, se responde 409.
    def register(self, data: UserCreate) -> UserPublic:
        username = data.username.strip()
        email = str(data.email).strip().lower()
        if self.repo.get_by_username(username) or self.repo.get_by_email(email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El username o el email ya existen",
            )
        usuario = Usuario(
            username=username,
            full_name=data.full_name.strip(),
            email=email,
            hashed_password=get_password_hash(data.password),
            role="user",
            disabled=False,
        )
        self.repo.add(usuario)
        self.session.commit()
        self.session.refresh(usuario)
        return UserPublic.model_validate(usuario)

    # Se revisan usuario y contraseña. Si la cuenta esta apagada, se responde 400.
    def authenticate(self, username: str, password: str) -> Usuario:
        usuario = self.repo.get_by_username(username.strip())
        if usuario is None or not verify_password(password, usuario.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")
        if usuario.disabled:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
        return usuario

    # Se devuelve el perfil de quien ya entro, sin la contraseña.
    def me(self, usuario: Usuario) -> UserPublic:
        return UserPublic.model_validate(usuario)
