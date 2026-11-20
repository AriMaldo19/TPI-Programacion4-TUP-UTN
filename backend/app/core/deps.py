"""Se identifica a la persona por la cookie y se controla su rol."""

from collections.abc import Callable

from fastapi import Depends, HTTPException, Request, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


# Se lee la cookie y se busca a la persona. Si falta o no sirve, se responde 401.
def get_current_user(request: Request, session: Session = Depends(get_session)) -> Usuario:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub", ""))
    except (ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    user = session.get(Usuario, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado")
    return user


# Se rechaza la cuenta si esta desactivada.
def get_current_active_user(user: Usuario = Depends(get_current_user)) -> Usuario:
    if user.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
    return user


# Se deja pasar solo si el rol esta en la lista permitida.
def require_role(roles: list[str]) -> Callable:
    def checker(user: Usuario = Depends(get_current_active_user)) -> Usuario:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tenés permiso para esta acción")
        return user

    return checker
