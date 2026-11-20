"""Se registran personas, se entra, se sale y se consulta el perfil."""

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.core.config import settings
from app.core.database import get_session
from app.core.deps import get_current_active_user
from app.core.security import create_access_token
from app.modules.auth.schemas import LoginResponse
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


# Se arma el servicio de autenticacion con la sesion de este pedido.
def get_auth_service(session: Session = Depends(get_session)) -> AuthService:
    return AuthService(session)


# Se deja el token en una cookie que el navegador no puede leer.
def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
        path="/",
    )


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
# Se registra a la persona y se responde 201.
def register(data: UserCreate, service: AuthService = Depends(get_auth_service)) -> UserPublic:
    return service.register(data)


@router.post("/token", response_model=LoginResponse)
# Se valida el formulario y se deja la cookie de sesion.
def login(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
) -> LoginResponse:
    usuario = service.authenticate(form.username, form.password)
    token = create_access_token(str(usuario.id))
    _set_auth_cookie(response, token)
    return LoginResponse(message="Login exitoso")


@router.post("/logout", response_model=LoginResponse)
# Se borra la cookie para cerrar la sesion.
def logout(response: Response) -> LoginResponse:
    response.delete_cookie(key="access_token", path="/", samesite="lax", secure=False)
    return LoginResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
# Se devuelve quien esta logueado.
def me(usuario: Usuario = Depends(get_current_active_user), service: AuthService = Depends(get_auth_service)) -> UserPublic:
    return service.me(usuario)
