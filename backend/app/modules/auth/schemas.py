"""Se define el mensaje corto del login. El token no va en este texto."""

from sqlmodel import SQLModel


class LoginResponse(SQLModel):
    message: str
