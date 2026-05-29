# FastBites — Sistema de Comercio Electrónico

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-Express-CC2927?logo=microsoftsqlserver&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)

Plataforma full-stack de delivery de comida con portal de cliente, panel de administración y módulo de reportes financieros. Incluye autenticación MFA, control de acceso por roles y arquitectura desacoplada frontend/backend.

---

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura del sistema](#3-arquitectura-del-sistema)
4. [Módulos y funcionalidades](#4-módulos-y-funcionalidades)
5. [Requisitos previos](#5-requisitos-previos)
6. [Instalación y puesta en marcha](#6-instalación-y-puesta-en-marcha)
7. [Variables de entorno](#7-variables-de-entorno)
8. [Estructura del proyecto](#8-estructura-del-proyecto)
9. [Control de acceso por roles (RBAC)](#9-control-de-acceso-por-roles-rbac)
10. [Autenticación y MFA](#10-autenticación-y-mfa)
11. [Referencia de API](#11-referencia-de-api)
12. [Base de datos](#12-base-de-datos)
13. [Scripts disponibles](#13-scripts-disponibles)
14. [Cuentas de prueba](#14-cuentas-de-prueba)
15. [Guía de pruebas manuales](#15-guía-de-pruebas-manuales)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. Visión general

FastBites es una solución de comercio electrónico orientada a cadenas de restaurantes de comida rápida. El sistema cubre el ciclo completo del negocio:

- **Portal cliente:** catálogo, carrito, checkout, historial de pedidos y perfil.
- **Admin Panel / Backoffice:** CRUD de restaurantes, productos, ofertas, dayparts y gestión de pedidos.
- **Módulo de reportes:** métricas de ventas por día, hora, daypart y comparativa entre restaurantes.
- **Seguridad:** autenticación JWT con doble factor (MFA por PIN), control de acceso granular por rol.

```
Cliente → Portal Web (React) → API REST (Express) → SQL Server
                                     ↓
                        Admin Panel (React) ─── Reportes
```

---

## 2. Stack tecnológico

### Frontend

| Tecnología | Versión | Rol |
|------------|---------|-----|
| React | 19.2 | Framework de UI |
| TypeScript | 6.0 | Tipado estático |
| Tailwind CSS | 4.3 | Utilidades CSS |
| Vite | 8.0 | Build tool y dev server |
| React Router | 7.15 | Enrutamiento SPA |
| Lucide React | 1.16 | Iconografía |
| SweetAlert2 | 11 | Modales de confirmación |

### Backend

| Tecnología | Versión | Rol |
|------------|---------|-----|
| Node.js + Express | 4.19 | Servidor HTTP y API REST |
| TypeScript | 5.4 | Tipado estático |
| mssql | 11 | Driver SQL Server |
| jsonwebtoken | 9 | Tokens JWT |
| bcryptjs | 3 | Hash de contraseñas |
| tsx | 4 | Ejecución TypeScript en desarrollo |

### Base de datos

| Tecnología | Rol |
|------------|-----|
| SQL Server Express | Motor de base de datos |
| ODBC Driver 17 | Conector del sistema operativo |
| Vistas SQL | Cálculo de reportes de ventas |

---

## 3. Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vite)                         │
│                       http://localhost:5173                     │
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────────────────────┐   │
│  │  Portal Cliente │    │        Admin Panel               │   │
│  │                 │    │                                  │   │
│  │  - Catálogo     │    │  - Dashboard    - Reportes       │   │
│  │  - Carrito      │    │  - Restaurantes - Pedidos        │   │
│  │  - Checkout     │    │  - Productos    - Ofertas        │   │
│  │  - Mi perfil    │    │  - Usuarios     - Roles          │   │
│  └────────┬────────┘    └──────────────┬───────────────────┘   │
│           └─────────────────┬──────────┘                       │
└─────────────────────────────│───────────────────────────────────┘
                              │ HTTP / REST + JWT Bearer
┌─────────────────────────────▼───────────────────────────────────┐
│                      BACKEND (Express)                          │
│                      http://localhost:3000                      │
│                                                                 │
│  authenticate ──► requireRole ──► controllers ──► SQL queries  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ mssql (ODBC Driver 17)
┌─────────────────────────────▼───────────────────────────────────┐
│                   SQL SERVER EXPRESS                            │
│                   Base de datos: FastBitesDB                   │
│                                                                 │
│  Tablas principales:  Restaurantes, Productos, Pedidos         │
│  Vistas de reporte:   VentasPorDia, VentasPorHora, etc.       │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de autenticación

```
Login (email + password)
        │
        ▼
  Valida credenciales
        │
        ▼
  Genera PIN MFA ──► Imprime en consola del backend (simulación)
        │
        ▼
  Usuario ingresa PIN en /verificar-pin
        │
        ▼
  Backend emite JWT (roles embebidos en payload)
        │
        ▼
  Frontend almacena token en localStorage (fb_token)
        │
        ▼
  Cada request lleva Authorization: Bearer <token>
```

---

## 4. Módulos y funcionalidades

### Portal Cliente (`/`)

| Ruta | Descripción |
|------|-------------|
| `/` | Home con productos destacados por restaurante |
| `/productos` | Catálogo completo con filtros |
| `/productos/:id` | Detalle de producto |
| `/carrito` | Carrito de compras |
| `/checkout` | Formulario de pago y entrega |
| `/confirmacion/:numero` | Confirmación del pedido |
| `/pedidos` | Historial de pedidos |
| `/mi-cuenta` | Perfil del cliente |
| `/mis-direcciones` | Gestión de direcciones |
| `/mis-metodos-pago` | Métodos de pago guardados |

### Admin Panel (`/admin`)

| Sección | Descripción | Roles con acceso |
|---------|-------------|-----------------|
| Dashboard | KPIs en tiempo real: pedidos, ventas, pendientes | Admin, Empleado, Supervisor |
| Restaurantes | CRUD completo de sucursales | Admin, Empleado, Supervisor |
| Productos | CRUD con toggle activo/inactivo y destacados | Admin, Empleado, Supervisor |
| Ofertas | Gestión de descuentos por porcentaje o monto fijo | Admin, Empleado, Supervisor |
| Pedidos | Listado con cambio de estado y detalle | Admin, Empleado, Supervisor |
| Dayparts | Configuración de turnos (Desayuno, Almuerzo, Cena) | Admin, Empleado |
| Reportes | Dashboard financiero con gráficas por restaurante | Admin, Supervisor |
| Usuarios | Gestión de cuentas y toggle activo/inactivo | Solo Admin |
| Roles | Descripción y permisos por rol | Solo Admin |

### Módulo de Reportes (`/admin/reportes`)

Todas las gráficas usan datos reales de la base de datos a través de vistas SQL. No dependen de librerías externas de gráficas.

| Reporte | Vista SQL | Filtros disponibles |
|---------|-----------|---------------------|
| Dashboard general | VentasPorDia + VentasPorHora + VentasPorDaypart | — |
| Ventas por Día | VentasPorDia | Restaurante, fecha inicio, fecha fin |
| Ventas por Hora | VentasPorHora | Restaurante, hora específica |
| Ventas por Daypart | VentasPorDaypart | Restaurante, daypart |
| Comparativa por Restaurante | VentasPorDia (agregado) | — |

---

## 5. Requisitos previos

| Requisito | Versión mínima | Verificación |
|-----------|---------------|--------------|
| Node.js | 18 LTS | `node --version` |
| npm | 9 | `npm --version` |
| SQL Server Express | 2019 | SQL Server Configuration Manager |
| ODBC Driver for SQL Server | 17 | Panel de control → ODBC |
| Git | Cualquiera | `git --version` |

> **Windows:** El backend usa autenticación Windows (`trustedConnection: true`) por defecto. Si usas SQL Authentication, configura `DB_USER` y `DB_PASSWORD` en el `.env`.

---

## 6. Instalación y puesta en marcha

### Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd sistema-ecommerce-fastbites
```

### 1. Configurar la base de datos

Abre **SQL Server Management Studio (SSMS)** y ejecuta los scripts en este orden:

```
database/
├── FastBitesDB.sql          # 1. Crea la base de datos y todas las tablas
├── seed_productos.sql       # 2. Productos de muestra
├── seed_imagenes.sql        # 3. Imágenes de productos
└── seed_restaurantes.sql    # 4. Restaurantes de prueba (opcional)
```

Para las cuentas de prueba de empleados y administradores, consulta [INSTRUCCIONES_AUTH.md](INSTRUCCIONES_AUTH.md).

### 2. Configurar el backend

```bash
cd backend
cp .env.example .env     # O crea el archivo .env manualmente (ver sección 7)
npm install
npm run dev
```

El servidor estará disponible en `http://localhost:3000`. Verifica la conexión con:

```
GET http://localhost:3000/api/health/db
```

### 3. Configurar el frontend

Abre una **nueva terminal** en la raíz del proyecto:

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## 7. Variables de entorno

Crea el archivo `backend/.env` con las siguientes variables:

```env
# Puerto del servidor
PORT=3000

# Base de datos — Windows Authentication (sin usuario/contraseña)
DB_SERVER=localhost\SQLEXPRESS
DB_DATABASE=FastBitesDB

# Base de datos — SQL Authentication (si no usas Windows Auth)
# DB_USER=sa
# DB_PASSWORD=tu_password_segura
# DB_PORT=1433

# ODBC Driver instalado en el sistema
DB_ODBC_DRIVER=ODBC Driver 17 for SQL Server

# JWT — usa una cadena larga y aleatoria en producción
JWT_SECRET=fastbites_jwt_secret_dev_change_in_production
JWT_EXPIRES_IN=8h
```

> El campo `DB_SERVER` acepta tanto nombre de instancia (`localhost\SQLEXPRESS`) como IP con puerto (`127.0.0.1,1433`). Si defines `DB_PORT`, el driver conecta directo por TCP sin depender del SQL Server Browser.

---

## 8. Estructura del proyecto

```
sistema-ecommerce-fastbites/
│
├── src/                                # Código fuente del frontend
│   ├── config/
│   │   └── api.ts                      # URL base de la API (VITE_API_URL)
│   ├── routes/
│   │   ├── AppRoutes.tsx               # Definición de todas las rutas SPA
│   │   └── RequireRole.tsx             # Guard de autorización por rol
│   ├── layouts/
│   │   ├── ClientLayout.tsx            # Navbar del portal cliente
│   │   └── AdminLayout.tsx             # Guard de acceso al panel admin
│   └── modules/
│       ├── auth/                       # Login, registro, MFA, contexto global
│       ├── catalogo/                   # Home, listado y detalle de productos
│       ├── carrito/                    # Carrito, checkout, confirmación, historial
│       ├── cliente/                    # Perfil, direcciones, métodos de pago
│       ├── backoffice/
│       │   ├── components/             # AdminLayout, Sidebar, Header, modales, tablas
│       │   ├── pages/                  # Dashboard, Usuarios, Roles, Restaurantes...
│       │   └── types/                  # Interfaces TypeScript del backoffice
│       └── reportes/
│           ├── components/             # ReportChartCard, ReportHeader, FilterBar...
│           ├── pages/                  # Dashboard, VentasDia, VentasHora, Daypart
│           └── types/                  # Interfaces de reportes
│
├── backend/
│   └── src/
│       ├── config/
│       │   └── db.ts                   # Pool de conexión con fallback multi-servidor
│       ├── middleware/
│       │   └── auth.middleware.ts      # authenticate + requireRole factory
│       ├── controllers/                # Lógica por recurso (auth, orders, products...)
│       ├── routes/                     # Registro de rutas por dominio
│       ├── types/
│       │   └── api.types.ts            # Interfaces compartidas (JwtPayload, Producto...)
│       ├── app.ts                      # Configuración de Express y middlewares
│       └── server.ts                   # Arranque del servidor
│
├── database/
│   ├── FastBitesDB.sql                 # DDL completo: tablas, vistas, constraints
│   ├── seed_productos.sql              # Datos de productos
│   ├── seed_imagenes.sql               # URLs de imágenes
│   └── seed_restaurantes.sql          # Restaurantes de prueba
│
├── INSTRUCCIONES_AUTH.md               # Guía detallada de cuentas y MFA
├── package.json                        # Dependencias y scripts del frontend
└── vite.config.ts                      # Configuración de Vite
```

---

## 9. Control de acceso por roles (RBAC)

### Roles definidos

| Rol | Descripción |
|-----|-------------|
| `Cliente` | Usuario final. Solo accede al portal de compras. |
| `Administrador` | Acceso total al sistema. |
| `EmpleadoBackoffice` | Operaciones diarias: productos, pedidos, restaurantes. Sin acceso a reportes financieros ni gestión de usuarios. |
| `Supervisor` | Operaciones + reportes financieros. Sin acceso a gestión de usuarios, roles ni configuración de dayparts. |

### Matriz de permisos

| Sección | Cliente | Empleado | Supervisor | Admin |
|---------|:-------:|:--------:|:----------:|:-----:|
| Portal cliente | ✓ | ✓ | ✓ | ✓ |
| Dashboard admin | — | ✓ | ✓ | ✓ |
| Restaurantes | — | ✓ | ✓ | ✓ |
| Productos | — | ✓ | ✓ | ✓ |
| Ofertas | — | ✓ | ✓ | ✓ |
| Pedidos | — | ✓ | ✓ | ✓ |
| Dayparts | — | ✓ | — | ✓ |
| Reportes | — | — | ✓ | ✓ |
| Usuarios | — | — | — | ✓ |
| Roles | — | — | — | ✓ |

### Implementación técnica

**Frontend:** El componente `RequireRole` en `src/routes/RequireRole.tsx` actúa como guard de ruta. Si el usuario no tiene el rol necesario, redirige a `/admin`. El `AdminSidebar` filtra los ítems de navegación visibles según los roles del usuario activo.

**Backend:** El middleware `requireRole(...roles)` en `backend/src/middleware/auth.middleware.ts` valida el payload JWT en cada endpoint protegido. Cualquier acceso directo a una URL sin el rol correcto retorna `403 Forbidden`.

---

## 10. Autenticación y MFA

El sistema implementa autenticación de doble factor (2FA) mediante PIN de 6 dígitos en cada inicio de sesión.

### Flujo completo

1. `POST /api/auth/login` con `{ email, password }`.
2. El backend valida credenciales con bcrypt y genera un PIN temporal.
3. El PIN se imprime en la consola del servidor (simulación de envío por email/SMS).
4. El frontend redirige a `/verificar-pin`.
5. El usuario ingresa el PIN. `POST /api/auth/verify-pin`.
6. Si es válido, el backend emite un JWT firmado con los roles del usuario.
7. El token se almacena en `localStorage` bajo la clave `fb_token`.
8. Todas las peticiones protegidas envían `Authorization: Bearer <token>`.

### Registro de nuevos usuarios

Los registros desde el portal (`POST /api/auth/register`) asignan automáticamente el rol `Cliente`. Para asignar roles administrativos, ejecuta los scripts SQL de la sección [Cuentas de prueba](#14-cuentas-de-prueba) o consulta [INSTRUCCIONES_AUTH.md](INSTRUCCIONES_AUTH.md).

---

## 11. Referencia de API

**Base URL:** `http://localhost:3000`

Los endpoints marcados con 🔒 requieren el header `Authorization: Bearer <token>`.

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/login` | Inicia sesión y dispara MFA | — |
| `POST` | `/api/auth/register` | Registra un nuevo cliente | — |
| `POST` | `/api/auth/verify-pin` | Valida PIN y emite JWT | — |
| `GET` | `/api/auth/me` | Datos del usuario autenticado | 🔒 |

### Catálogo (público)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/products` | Lista todos los productos activos |
| `GET` | `/api/payment-types` | Lista tipos de pago disponibles |
| `GET` | `/api/health` | Health check del servidor |
| `GET` | `/api/health/db` | Health check de la base de datos |

### Clientes 🔒

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/customers/me` | Perfil del cliente autenticado |
| `GET/POST` | `/api/customers/me/addresses` | Direcciones de envío |
| `PUT/DELETE` | `/api/customers/me/addresses/:id` | Editar o eliminar dirección |
| `GET/POST` | `/api/customers/me/payment-methods` | Métodos de pago |
| `DELETE` | `/api/customers/me/payment-methods/:id` | Eliminar método de pago |

### Carrito 🔒

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/cart` | Obtiene el carrito activo |
| `POST` | `/api/cart/items` | Agrega un ítem |
| `PATCH` | `/api/cart/items/:id` | Actualiza cantidad |
| `DELETE` | `/api/cart/items/:id` | Elimina un ítem |
| `DELETE` | `/api/cart` | Vacía el carrito |

### Pedidos 🔒

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/orders` | Crea un nuevo pedido |
| `GET` | `/api/orders` | Historial del cliente |
| `GET` | `/api/orders/:id` | Detalle de un pedido |
| `PATCH` | `/api/orders/:id/cancel` | Cancela un pedido |

### Admin — Pedidos 🔒 `Admin | Empleado | Supervisor`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/admin/orders` | Todos los pedidos del sistema |
| `GET` | `/api/admin/orders/:id` | Detalle completo de un pedido |
| `PATCH` | `/api/admin/orders/:id/status` | Actualiza estado del pedido |

### Admin — Catálogo 🔒 `Admin | Empleado | Supervisor`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET/POST` | `/api/admin/products` | Listar / crear productos |
| `PUT` | `/api/admin/products/:id` | Editar producto |
| `PATCH` | `/api/admin/products/:id/toggle` | Activar / desactivar |
| `GET` | `/api/admin/categories` | Lista de categorías |
| `GET/POST` | `/api/admin/restaurants` | Listar / crear restaurantes |
| `PUT` | `/api/admin/restaurants/:id` | Editar restaurante |
| `PATCH` | `/api/admin/restaurants/:id/toggle` | Activar / desactivar |
| `GET/POST` | `/api/admin/offers` | Listar / crear ofertas |
| `PUT` | `/api/admin/offers/:id` | Editar oferta |
| `PATCH` | `/api/admin/offers/:id/toggle` | Activar / desactivar |

### Admin — Usuarios y Roles 🔒 `Admin | Empleado | Supervisor`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/admin/users` | Lista todos los usuarios |
| `PATCH` | `/api/admin/users/:id/toggle` | Activar / desactivar usuario |
| `GET` | `/api/admin/roles` | Lista roles con conteo de usuarios |

### Admin — Dayparts 🔒 `Admin | Empleado`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/admin/dayparts` | Lista configuración de dayparts |
| `PATCH` | `/api/admin/dayparts/:id/toggle` | Activar / desactivar daypart |

### Reportes 🔒 `Admin | Supervisor`

| Método | Endpoint | Vista SQL | Descripción |
|--------|----------|-----------|-------------|
| `GET` | `/api/reports/ventas-dia` | `VentasPorDia` | Ventas agregadas por día y restaurante |
| `GET` | `/api/reports/ventas-hora` | `VentasPorHora` | Distribución horaria de ventas |
| `GET` | `/api/reports/ventas-daypart` | `VentasPorDaypart` | Ventas por turno (Desayuno/Almuerzo/Cena) |

---

## 12. Base de datos

**Nombre:** `FastBitesDB`  
**Motor:** SQL Server Express  
**Autenticación por defecto:** Windows Authentication

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `Usuarios` | Cuentas de usuario con hash bcrypt y control de intentos fallidos |
| `Roles` | Catálogo de roles (Cliente, Administrador, EmpleadoBackoffice, Supervisor) |
| `UsuarioRoles` | Relación N:M usuario-rol |
| `Restaurantes` | Sucursales con nombre, dirección, ciudad, teléfono y estado activo |
| `Productos` | Productos por restaurante con precio, categoría, calorías y tiempo de preparación |
| `Pedidos` | Cabecera del pedido con estado, tipo de entrega y totales |
| `DetallePedido` | Ítems del pedido con precio unitario y subtotal |
| `Dayparts` | Configuración de turnos horarios |
| `Ofertas` | Descuentos por porcentaje o monto fijo |

### Vistas de reportes

| Vista | Datos que expone |
|-------|-----------------|
| `VentasPorDia` | Fecha, RestauranteId, Restaurante, TotalPedidos, TotalSubtotal, TotalDescuento, TotalEnvio, TotalVentas |
| `VentasPorHora` | Fecha, Hora, RestauranteId, Restaurante, TotalPedidos, TotalVentas |
| `VentasPorDaypart` | Fecha, DaypartId, Daypart, RestauranteId, Restaurante, TotalPedidos, TotalVentas |

### Scripts SQL disponibles

```
database/
├── FastBitesDB.sql          # DDL completo — ejecutar primero
├── seed_productos.sql       # Inserta productos de muestra
├── seed_imagenes.sql        # Asigna imágenes a productos
├── seed_restaurantes.sql    # Inserta 5 restaurantes de prueba con NOT EXISTS
└── fix_imagenes.sql         # Correcciones de URLs de imágenes
```

---

## 13. Scripts disponibles

### Frontend (raíz del proyecto)

```bash
npm run dev       # Inicia el servidor de desarrollo (puerto 5173)
npm run build     # Compila TypeScript y genera el bundle de producción en /dist
npm run preview   # Sirve el bundle de producción localmente
npm run lint      # Ejecuta ESLint sobre todo el código fuente
```

### Backend (`/backend`)

```bash
npm run dev       # Inicia el servidor con tsx watch (recarga automática)
npm run build     # Compila TypeScript a /dist
npm start         # Inicia el servidor compilado (producción)
```

---

## 14. Cuentas de prueba

> Todas las contraseñas en desarrollo son `Password123`.

| Rol | Email | Acceso |
|-----|-------|--------|
| Administrador | `admin@fastbites.com` | Control total del sistema |
| EmpleadoBackoffice | `empleado@fastbites.com` | Operaciones diarias sin reportes |
| Supervisor | `supervisor@fastbites.com` | Operaciones + reportes financieros |
| Cliente | Regístrate en `/registro` | Solo portal de compras |

> El inicio de sesión activa el flujo MFA. El PIN de 6 dígitos se imprime en la consola del backend. Consulta [INSTRUCCIONES_AUTH.md](INSTRUCCIONES_AUTH.md) para el flujo paso a paso y los scripts SQL para recrear cuentas.

---

## 15. Guía de pruebas manuales

Con ambos servidores corriendo (`npm run dev` en frontend y backend):

### Flujo de cliente

1. Abrir `http://localhost:5173`
2. Ir a `/registro`, crear una cuenta nueva, verificar el PIN en la consola del backend.
3. Navegar por el catálogo, agregar productos al carrito.
4. Completar el checkout — verificar la confirmación en `/confirmacion/:numero`.
5. Revisar el historial en `/pedidos`.

### Flujo de administrador

1. Login con `admin@fastbites.com` / `Password123` + PIN de consola.
2. Hacer clic en **"Consola Admin"** en el header.
3. Verificar que se ven todas las secciones del sidebar (incluyendo Usuarios y Roles).
4. Crear un restaurante nuevo desde `/admin/restaurants`.
5. Crear un producto asociado al restaurante desde `/admin/products`.
6. Revisar el Dashboard de Reportes en `/admin/reportes`.

### Flujo de supervisor

1. Login con `supervisor@fastbites.com` / `Password123` + PIN de consola.
2. Verificar que el sidebar **no muestra** Usuarios, Roles ni Dayparts.
3. Verificar que **sí muestra** Restaurantes, Productos, Ofertas, Pedidos y Reportes.
4. Intentar acceder manualmente a `/admin/users` — debe redirigir a `/admin`.

### Prueba de responsividad

1. Abrir DevTools del navegador (`F12`).
2. Activar el modo dispositivo (`Ctrl+Shift+M`).
3. Probar en resolución 375px (mobile) y verificar que el sidebar se oculta.
4. Usar el botón hamburguesa en el header para desplegar el sidebar.
5. Verificar que las tarjetas del dashboard se apilan en una columna.
6. Navegar a Reportes y verificar que las tablas tienen scroll horizontal si es necesario.

---

## 16. Troubleshooting

### El backend no conecta a SQL Server

```
Error: DB_SERVER no está definido en .env
```
Asegúrate de que el archivo `backend/.env` existe y tiene `DB_SERVER` configurado.

```
Failed to connect — named pipes / TCP
```
- Verifica que SQL Server Express está corriendo: `services.msc` → `SQL Server (SQLEXPRESS)`.
- Activa TCP/IP en **SQL Server Configuration Manager → Protocolos para SQLEXPRESS**.
- Si usas puerto personalizado, define `DB_PORT` en el `.env`.

### El frontend no carga datos

- Verifica que el backend está corriendo: `GET http://localhost:3000/api/health`.
- Revisa la variable `VITE_API_URL` si usas un puerto diferente al 3000.

### El PIN de MFA no llega

El PIN se imprime en la consola de la terminal donde corre el backend (`npm run dev`). Busca el bloque con el diseño de carta:

```
┌─────────────────────────────────────────────┐
│  Para: usuario@ejemplo.com                  │
│  CÓDIGO DE VERIFICACIÓN:    123456          │
└─────────────────────────────────────────────┘
```

### TypeScript reporta errores

```bash
# Frontend
npx tsc --noEmit

# Backend
cd backend && npx tsc --noEmit
```

---

## Licencia

Proyecto de desarrollo interno. Todos los derechos reservados.
