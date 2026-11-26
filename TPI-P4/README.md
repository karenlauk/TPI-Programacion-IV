# Food Store — Sistema de pedidos de comida
**Trabajo Práctico Integrador · Programación IV**  
Tecnicatura Universitaria en Programación · UTN

Food Store es una aplicación web para un negocio de comidas. Los clientes pueden registrarse, consultar el catálogo, armar un carrito, confirmar pedidos y consultar su historial. El personal administrador puede gestionar categorías, productos, stock, pedidos y usuarios desde un panel privado.

El sistema está dividido en dos aplicaciones que se comunican mediante una API REST:
- **Backend:** Python, FastAPI, SQLModel y PostgreSQL.
- **Frontend:** React, TypeScript, Vite y Tailwind CSS.

---

## 1. Funcionalidades

### Cliente
- Registro e inicio/cierre de sesión.
- Catálogo público con búsqueda, filtro por categoría y paginación del lado del servidor.
- Carrito persistido en el navegador.
- Checkout con dirección de entrega, forma de pago y notas.
- Consulta del historial y detalle de los pedidos propios.
- Cancelación de pedidos propios únicamente mientras estén pendientes.

### Administración
- Resumen de pedidos e ingresos.
- Alta, edición y baja lógica de categorías.
- Alta, edición y baja lógica de productos.
- Administración de stock y disponibilidad.
- Listado de pedidos, filtro por estado, consulta del detalle y gestión de sus estados.
- Listado de usuarios y activación/desactivación de cuentas.

### Reglas principales de pedidos
- Un pedido debe contener al menos un producto y no admite productos repetidos.
- Solo se pueden comprar productos activos, disponibles y con stock suficiente.
- La creación del pedido y el descuento de stock se realizan en una misma transacción.
- Cada línea conserva una copia del nombre y del precio del producto al momento de la compra.
- La cancelación restituye el stock en la misma transacción que cambia el estado.
- Estados: `PENDIENTE`, `EN_PREPARACION`, `ENTREGADO` y `CANCELADO`.
- Transiciones: `PENDIENTE` → `EN_PREPARACION` o `CANCELADO`; `EN_PREPARACION` → `ENTREGADO` o `CANCELADO`. Los estados finales no admiten nuevas transiciones.
- El pago es manual (efectivo o transferencia); no se integra una pasarela de pago.

---

## 2. Tecnologías

### Backend
- Python 3.11 a 3.13.
- FastAPI.
- SQLModel y SQLAlchemy.
- PostgreSQL 15 o superior.
- Pydantic y pydantic-settings.
- python-jose para JWT.
- Passlib y bcrypt para el hash de contraseñas.
- Repository y Unit of Work para persistencia y transacciones.

Las dependencias y versiones se encuentran en `backend/requirements.txt`.

### Frontend
- Node.js 20.19 o superior.
- pnpm 9 o superior.
- React 19 y TypeScript.
- Vite 8.
- Tailwind CSS 4.
- React Router 7.
- TanStack Query 5, TanStack Form y TanStack Table 8.
- Zustand 5.
- Axios.

Las dependencias exactas resueltas se encuentran en `frontend/pnpm-lock.yaml`.

---

## 3. Arquitectura

### Backend
El backend está organizado por módulos de dominio: `auth`, `usuarios`, `categorias`, `productos` y `pedidos`. Los módulos de dominio separan responsabilidades:

- **Router:** define endpoints, dependencias, permisos y respuestas HTTP.
- **Service:** implementa reglas de negocio.
- **Unit of Work:** administra la sesión y confirma o revierte la transacción.
- **Repository:** concentra consultas y operaciones de persistencia.
- **Models:** entidades SQLModel persistidas.
- **Schemas:** validación de entrada y salida.

La API utiliza el prefijo `/api/v1`. La documentación interactiva se publica en `/docs` y `/redoc`.

### Frontend
El frontend está organizado por funcionalidades dentro de `src/features/`. Cada feature agrupa páginas, componentes, hooks, acceso a la API y tipos. El código transversal se encuentra en `src/shared/`, las rutas en `src/routes/` y los stores globales en `src/store/` y en la feature de autenticación.

- **TanStack Query:** estado del servidor, consultas, mutaciones e invalidación de caché.
- **Zustand:** estado del cliente, sesión y carrito, con persistencia.
- **Axios:** instancia HTTP compartida con `withCredentials` e interceptor de respuestas.
- **ProtectedRoute:** protección de rutas por sesión y rol; la autorización también se valida en el backend.

---

## 4. Requisitos previos
Instalar y verificar:
| Herramienta | Versión |
|---|---|
| Python | 3.11, 3.12 o 3.13 |
| PostgreSQL | 15 o superior |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior |
| Git | Versión estable |

> Se recomienda Python 3.12 para este proyecto. No utilizar Python 3.14/3.15 con la versión de SQLModel fijada en los requisitos.

---

## 5. Obtener el proyecto
Clonar el repositorio (reemplazar la URL por la dirección real):
```powershell
git clone URL_PUBLICA_DEL_REPOSITORIO
cd TrabajoIntegrador_P4
```

También se puede descargar el ZIP del repositorio y descomprimirlo. El paquete de entrega no debe incluir `.env`, `.venv`, `venv`, `node_modules`, `dist` ni carpetas `.git`.

---

## 6. Configurar PostgreSQL
1. Iniciar el servicio de PostgreSQL.
2. Crear una base de datos llamada `foodstore`.
3. Confirmar el host, puerto, usuario y contraseña de la instalación.

El ejemplo de configuración utiliza `localhost:5433`. Si la instalación local utiliza otro puerto (por ejemplo, `5432`), ajustar `DATABASE_URL` en `backend/.env`.

---

## 7. Instalar y ejecutar el backend
Abrir una terminal PowerShell y ejecutar:
```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Si PowerShell no permite activar el entorno virtual, ejecutar en esa terminal:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### Variables de entorno del backend
Crear el archivo local `.env` a partir del ejemplo:
```powershell
Copy-Item .env.example .env
```

Editar `backend/.env` y completar los valores propios:
```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5433/foodstore
SECRET_KEY=REEMPLAZAR_POR_UNA_CLAVE_ALEATORIA_DE_AL_MENOS_32_CARACTERES
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@foodstore.local
ADMIN_PASSWORD=DEFINIR_UNA_CLAVE_SEGURA
ADMIN_NOMBRE=Administrador
ADMIN_APELLIDO=FoodStore
```

- Reemplazar `TU_PASSWORD` por la contraseña del usuario de PostgreSQL.
- Generar una `SECRET_KEY` aleatoria de al menos 32 caracteres.
- Definir una contraseña segura para el administrador inicial.
- No compartir ni versionar `backend/.env`.

### Cargar los datos iniciales
Desde la carpeta `backend/`, con el entorno virtual activado:
```powershell
python -m app.db.seed
```

El seed crea o verifica el administrador configurado en `.env`, tres categorías (Pizzas, Hamburguesas y Bebidas) y ocho productos iniciales. Es idempotente: puede ejecutarse nuevamente sin duplicar esos registros ni reactivar categorías o productos dados de baja.

**Credenciales del administrador:** son las definidas en `ADMIN_USERNAME` y `ADMIN_PASSWORD` dentro de `backend/.env`. El proyecto no debe depender de una contraseña fija compartida.

### Iniciar la API
Desde `backend/`:
```powershell
uvicorn app.main:app --reload
```

Direcciones locales:
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 8. Instalar y ejecutar el frontend
Abrir una segunda terminal PowerShell. Desde la raíz del proyecto:
```powershell
cd frontend
Copy-Item .env.example .env
```

Verificar que `frontend/.env` contenga:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

Instalar dependencias y verificar la compilación:
```powershell
pnpm install
pnpm build
```

Iniciar el servidor de desarrollo:
```powershell
pnpm dev
```

La aplicación estará disponible en http://localhost:5173.

Para utilizar el sistema deben estar funcionando PostgreSQL, el backend y el frontend al mismo tiempo.

---

## 9. Recorrido de uso

### Como cliente
1. Abrir la aplicación y registrarse.
2. Iniciar sesión con el usuario creado.
3. Explorar el catálogo y utilizar la búsqueda o el filtro por categoría.
4. Agregar productos al carrito y ajustar las cantidades.
5. Ir al checkout, ingresar la dirección de entrega, seleccionar efectivo o transferencia y completar las notas si corresponde.
6. Confirmar el pedido.
7. Consultar el pedido desde **Mis pedidos**.
8. Cancelarlo mientras su estado sea `PENDIENTE`, si fuera necesario.

### Como administrador
1. Iniciar sesión con las credenciales configuradas en `backend/.env`.
2. Ingresar al panel de administración.
3. Consultar el resumen del negocio.
4. Gestionar categorías y productos.
5. Actualizar stock y disponibilidad.
6. Consultar los pedidos, abrir su detalle y avanzar o cancelar su estado según las transiciones permitidas.
7. Activar o desactivar usuarios.

---

## 10. Seguridad y configuración
- La autenticación utiliza JWT en una cookie `HttpOnly`; el frontend no lee ni almacena el token.
- Axios envía las credenciales mediante `withCredentials`.
- CORS permite el origen configurado en `FRONTEND_ORIGIN` y credenciales.
- Las contraseñas se almacenan mediante hash bcrypt.
- Las rutas del frontend se protegen por rol y los endpoints vuelven a validar los permisos en el backend.
- Las operaciones de pedidos y stock utilizan transacciones para mantener la consistencia.
- Los archivos `.env` contienen configuración privada y no deben incluirse en Git ni en el ZIP de entrega. Los archivos `.env.example` sí deben entregarse.

### Variables de entorno
| Archivo | Variable | Descripción |
|---|---|---|
| `backend/.env` | `DATABASE_URL` | Conexión a PostgreSQL. |
| `backend/.env` | `SECRET_KEY` | Clave de firma JWT. |
| `backend/.env` | `ALGORITHM` | Algoritmo de firma. |
| `backend/.env` | `ACCESS_TOKEN_EXPIRE_MINUTES` | Vigencia del token/cookie. |
| `backend/.env` | `FRONTEND_ORIGIN` | Origen permitido por CORS. |
| `backend/.env` | `ADMIN_USERNAME` | Usuario del administrador inicial. |
| `backend/.env` | `ADMIN_EMAIL` | Email del administrador inicial. |
| `backend/.env` | `ADMIN_PASSWORD` | Contraseña del administrador inicial. |
| `backend/.env` | `ADMIN_NOMBRE`, `ADMIN_APELLIDO` | Nombre del administrador. |
| `frontend/.env` | `VITE_API_URL` | URL base de la API. |

---

## 11. Entrega
- **Repositorio público:** https://github.com/karenlauk/TPI-Programacion-IV.git
- **Video de demostración:** COMPLETAR_CON_URL_DEL_VIDEO.

El video debe mostrar, como mínimo, la presentación inicial con la cámara encendida, registro e inicio de sesión de un cliente, una compra completa, la consulta/gestión del pedido como administrador y la cancelación con restitución de stock.

---

**Food Store · Trabajo Práctico Integrador · Programación IV**