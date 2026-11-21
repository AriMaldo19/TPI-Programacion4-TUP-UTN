# Food Store

Food Store es una tienda de comidas para pedir desde el navegador. El cliente recorre la carta, arma un carrito y confirma el pedido con una dirección y una forma de pago. Quien administra el negocio carga productos, mira los pedidos y los va pasando de estado.

El sistema está partido en dos proyectos que se hablan por HTTP:

- `backend`: la API, hecha con FastAPI y SQLModel. Ahí viven los usuarios, la carta, el stock y las reglas de los pedidos. La sesión viaja en una cookie HttpOnly: el navegador la manda solo y la pantalla nunca lee el token.
- `frontend`: la aplicación en React y TypeScript. La carta, el carrito, el checkout y el panel de administración están de este lado.

Para probarlo en tu máquina hacen falta las dos partes encendidas al mismo tiempo.

## Qué necesitás instalado

- Python 3.11, 3.12 o 3.13
- Node.js 20.19 o superior
- pnpm 9 o superior

En esta entrega la base es SQLite: es un archivo y no hay que instalar un servidor de base de datos. Si más adelante querés usar PostgreSQL 15 o superior, alcanza con cambiar `DATABASE_URL`.

## Cómo levantar el backend

Abrí una terminal en la carpeta del proyecto y entrá a `backend`:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m app.db.seed
uvicorn app.main:app --reload
```

En Linux o macOS el entorno se activa con `source .venv/bin/activate` y el archivo de entorno se copia con `cp .env.example .env`.

Cuando la terminal diga que Uvicorn está corriendo, la API queda en `http://localhost:8000`. La documentación de los endpoints está en `http://localhost:8000/docs` y en `http://localhost:8000/redoc`. Dejá esta terminal abierta.

El comando `python -m app.db.seed` se puede correr más de una vez. Si el administrador y los productos ya existen, no los duplica.

## Cómo levantar el frontend

Abrí otra terminal, también en la carpeta del proyecto:

```bash
cd frontend
pnpm install
copy .env.example .env
pnpm build
pnpm dev
```

Si `pnpm` no está en el PATH, usá los mismos comandos con `corepack pnpm`. En Linux o macOS el `.env` se copia con `cp .env.example .env`.

`pnpm build` comprueba que el TypeScript compile. `pnpm dev` abre la tienda en `http://localhost:5173`. Entrá a esa dirección con el backend todavía corriendo.

Para frenar cada servidor, andá a su terminal y presioná `Ctrl+C`.

## Variables de entorno

El backend lee `backend/.env`. Esos valores no se suben al repositorio: en el proyecto está `backend/.env.example`, que sirve de modelo.

| Variable | Para qué sirve | Ejemplo |
| --- | --- | --- |
| DATABASE_URL | Dónde está la base | `sqlite:///./foodstore.db` |
| SECRET_KEY | Firma del token de sesión. Tiene que tener al menos 32 caracteres | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| ALGORITHM | Algoritmo del token | `HS256` |
| ACCESS_TOKEN_EXPIRE_MINUTES | Cuántos minutos dura la cookie | `30` |
| FRONTEND_ORIGIN | Desde qué dirección puede entrar el navegador | `http://localhost:5173` |

Si usás PostgreSQL, `DATABASE_URL` queda así: `postgresql://user:pass@localhost:5432/foodstore_db`.

El frontend lee `frontend/.env`:

| Variable | Para qué sirve | Ejemplo |
| --- | --- | --- |
| VITE_API_URL | Dirección de la API | `http://localhost:8000/api/v1` |

## Usuarios para entrar

El seed crea un administrador:

- usuario: `admin`
- contraseña: `Admin1234!`
- rol: `admin`

Con esa cuenta se abre el panel: resumen, categorías, productos, pedidos y usuarios.

Cualquier otra persona se registra desde la pantalla. Esa cuenta nace como cliente: puede comprar y ver sus propios pedidos, y no entra al panel.

También quedan cargadas 4 categorías y 13 productos con stock: pizzas, lomitos, papas y bebidas.

## Repositorio y video

Repositorio: 

Video de demostración: se encuentra dentro del README en el archivo que contiene el proyecto completo (para mantener la privacidad).
