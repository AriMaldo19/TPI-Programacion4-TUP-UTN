"""Se carga el administrador y la carta inicial, sin duplicar lo que ya existe."""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import get_password_hash
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.repository import UsuarioRepository

CATEGORIAS = [
    ("Pizzas", "Muzzarella, napolitana, fugazzeta y especial."),
    ("Lomitos", "Lomo completo, americano y con chimichurri."),
    ("Papas", "Porción clásica, con cheddar y con huevo."),
    ("Bebidas", "Coca-Cola, Sprite y cerveza, bien frías."),
]

# Se arma la carta con las fotos que estan en la carpeta img.
PRODUCTOS = [
    ("Pizza muzzarella", "Salsa de tomate, muzzarella y orégano.", 14900, 20, 0, "/img/pizza-muzarella.jpg"),
    ("Pizza napolitana", "Muzzarella, tomate en rodajas, ajo y aceitunas.", 16900, 16, 0, "/img/pizza-napolitana.jpg"),
    ("Pizza fugazzeta", "Cebolla, muzzarella y orégano.", 17200, 14, 0, "/img/pizza-fugazzeta.jpg"),
    ("Pizza especial", "Muzzarella, jamón, aceitunas y orégano.", 17400, 14, 0, "/img/pizza-especial.jpg"),
    ("Lomito completo", "Lomo, jamón, queso, huevo, lechuga y tomate.", 14500, 18, 1, "/img/lomito.jpg"),
    ("Lomo americano", "Lomo, panceta, huevo, cebolla y queso.", 16200, 14, 1, "/img/lomo-americano.jpg"),
    ("Lomo con chimichurri", "Lomo, chimichurri, morrón, huevo, lechuga y tomate.", 15800, 14, 1, "/img/lomo-chimi.jpg"),
    ("Papas fritas", "Porción clásica, crocantes.", 6500, 25, 2, "/img/papas-fritas-clasicas.jpg"),
    ("Papas con cheddar y panceta", "Papas, salsa cheddar y panceta.", 8900, 18, 2, "/img/papas-cheddar-panceta.png"),
    ("Papas con huevo", "Papas fritas con huevo frito.", 7900, 18, 2, "/img/papas-con-huevo.jpg"),
    ("Coca-Cola", "Botella de 500 ml.", 3500, 40, 3, "/img/coca-cola.png"),
    ("Sprite", "Botella de 500 ml.", 3500, 40, 3, "/img/sprite.png"),
    ("Cerveza", "Cerveza rubia, bien fría.", 4500, 30, 3, "/img/cerveza.png"),
]


# Se cargan el admin, las categorias y los productos. Si ya estan, no se duplican.
def seed() -> None:
    create_all_tables()
    with Session(engine) as session:
        repo = UsuarioRepository(session)
        if repo.get_by_username("admin") is None:
            session.add(
                Usuario(
                    username="admin",
                    full_name="Administración Food Store",
                    email="admin@foodstore.local",
                    hashed_password=get_password_hash("Admin1234!"),
                    role="admin",
                    disabled=False,
                )
            )
            session.commit()

        nombres_categoria = {nombre for nombre, _ in CATEGORIAS}
        categorias: list[Categoria] = []
        for nombre, descripcion in CATEGORIAS:
            existente = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if existente is None:
                existente = Categoria(nombre=nombre, descripcion=descripcion, activo=True)
                session.add(existente)
                session.commit()
                session.refresh(existente)
            else:
                existente.descripcion = descripcion
                existente.activo = True
                session.add(existente)
            categorias.append(existente)

        for vieja in session.exec(select(Categoria)).all():
            if vieja.nombre not in nombres_categoria and vieja.activo:
                vieja.activo = False
                session.add(vieja)

        nombres_producto = {nombre for nombre, *_resto in PRODUCTOS}
        for nombre, descripcion, precio, stock, categoria_idx, imagen in PRODUCTOS:
            ya = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if ya is None:
                session.add(
                    Producto(
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=float(precio),
                        stock=stock,
                        disponible=True,
                        activo=True,
                        categoria_id=categorias[categoria_idx].id,
                        imagen_url=imagen,
                    )
                )
            else:
                ya.descripcion = descripcion
                ya.precio_base = float(precio)
                ya.stock = stock
                ya.disponible = True
                ya.activo = True
                ya.categoria_id = categorias[categoria_idx].id
                ya.imagen_url = imagen
                session.add(ya)

        for viejo in session.exec(select(Producto)).all():
            if viejo.nombre not in nombres_producto and viejo.activo:
                viejo.activo = False
                session.add(viejo)
        session.commit()
        print("Seed listo: admin / Admin1234!")


if __name__ == "__main__":
    seed()
