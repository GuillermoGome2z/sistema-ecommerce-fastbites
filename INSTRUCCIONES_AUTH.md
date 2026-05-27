# 🔐 Guía de Autenticación, MFA y Cuentas de Prueba — FastBites

¡Bienvenido al nuevo sistema unificado de autenticación con doble factor (MFA) por PIN de FastBites! Este documento te guiará paso a paso sobre cómo interactuar con el sistema de seguridad, cómo loguearte con las cuentas pre-creadas y cómo registrar nuevos usuarios.

---

## 🚀 1. Cuentas de Prueba Pre-Creadas (SQL Server)

Hemos inyectado directamente en tu base de datos de SQL Server Express (`FastBitesDB`) tres cuentas con roles de negocio diferenciados para facilitar tus pruebas de desarrollo:

| Rol de Usuario | Correo Electrónico (Email) | Contraseña | ¿Qué permite hacer en el sistema? |
| :--- | :--- | :--- | :--- |
| **👑 Administrador** | `admin@fastbites.com` | `Password123` | Control total del sistema y acceso completo a toda la consola `/admin`. |
| **👥 Empleado Backoffice** | `empleado@fastbites.com` | `Password123` | Operación diaria, administración de productos y locales en `/admin` (sin acceso financiero). |
| **📈 Supervisor** | `supervisor@fastbites.com` | `Password123` | Supervisión operativa y acceso completo a los reportes financieros en `/admin`. |
| **👤 Cliente Estándar** | *Regístrate en la web* | *La que elijas* | Navegar por la tienda, gestionar carrito, checkout y ver su propio historial. |

### 🛠️ Script SQL para Recrear Cuentas de Prueba
Si por cualquier motivo necesitas recrear estas tres cuentas de prueba en tu base de datos local (por ejemplo, si restableces tu base de datos), puedes ejecutar directamente el siguiente script SQL en SSMS:

```sql
USE FastBitesDB;
GO

-- 1. Insertar Administrador (Contraseña: Password123)
IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Email = 'admin@fastbites.com')
BEGIN
    DECLARE @AdminId INT;
    INSERT INTO Usuarios (Email, PasswordHash, NombreCompleto, Telefono, EmailVerificado, Activo)
    VALUES ('admin@fastbites.com', '$2b$10$gYjPaLg3mb4fG1GKZfzx1.wbTKwvNyoAZxprX7mtFff4uonP/53p6', 'Administrador FastBites', '555-0100', 1, 1);
    
    SET @AdminId = SCOPE_IDENTITY();
    
    INSERT INTO UsuarioRoles (UsuarioId, RolId, Activo)
    VALUES (@AdminId, 2, 1);
    
    PRINT 'Usuario admin@fastbites.com creado con éxito.';
END

-- 2. Insertar Empleado (Contraseña: Password123)
IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Email = 'empleado@fastbites.com')
BEGIN
    DECLARE @EmpleadoId INT;
    INSERT INTO Usuarios (Email, PasswordHash, NombreCompleto, Telefono, EmailVerificado, Activo)
    VALUES ('empleado@fastbites.com', '$2b$10$gYjPaLg3mb4fG1GKZfzx1.wbTKwvNyoAZxprX7mtFff4uonP/53p6', 'Empleado FastBites', '555-0200', 1, 1);
    
    SET @EmpleadoId = SCOPE_IDENTITY();
    
    INSERT INTO UsuarioRoles (UsuarioId, RolId, Activo)
    VALUES (@EmpleadoId, 3, 1);
    
    PRINT 'Usuario empleado@fastbites.com creado con éxito.';
END

-- 3. Insertar Supervisor (Contraseña: Password123)
IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Email = 'supervisor@fastbites.com')
BEGIN
    DECLARE @SupervisorId INT;
    INSERT INTO Usuarios (Email, PasswordHash, NombreCompleto, Telefono, EmailVerificado, Activo)
    VALUES ('supervisor@fastbites.com', '$2b$10$gYjPaLg3mb4fG1GKZfzx1.wbTKwvNyoAZxprX7mtFff4uonP/53p6', 'Supervisor FastBites', '555-0300', 1, 1);
    
    SET @SupervisorId = SCOPE_IDENTITY();
    
    INSERT INTO UsuarioRoles (UsuarioId, RolId, Activo)
    VALUES (@SupervisorId, 4, 1);
    
    PRINT 'Usuario supervisor@fastbites.com creado con éxito.';
END
GO
```

---

## 🔑 2. Cómo Iniciar Sesión (Paso a Paso con MFA)

1.  Abre el navegador en **[http://localhost:5173/login](http://localhost:5173/login)**.
2.  Ingresa el correo y contraseña de cualquiera de las cuentas de arriba (ej. `admin@fastbites.com` con `Password123`).
3.  Al presionar **"Ingresar"**, el sistema validará tus datos y detectará que requieres autenticación de doble factor (MFA). El navegador te redirigirá automáticamente a la pantalla **`/verificar-pin`**.
4.  **Recupera tu PIN:** Abre la consola/terminal donde está corriendo tu backend (`npm run dev` de tu backend). Verás que se ha impreso una notificación visual simulando una carta de correo con este diseño:
    ```bash
    ┌────────────────────────────────────────────────────────────────────────┐
    │                  📩  FASTBITES — NOTIFICACIÓN DE SISTEMA              │
    ├────────────────────────────────────────────────────────────────────────┤
    │  Para: admin@fastbites.com                                             │
    │  Asunto: Tu código de acceso de doble factor (MFA) 🔐                  │
    ├────────────────────────────────────────────────────────────────────────┤
    │  CÓDIGO DE VERIFICACIÓN:              357912                           │
    └────────────────────────────────────────────────────────────────────────┘
    ```
5.  Ingresa el código PIN de 6 dígitos que apareció en tu terminal en las casillas segmentadas del navegador.
6.  **¡Acceso Exitoso!** Una vez validado, entrarás al Portal de Cliente. Como iniciaste sesión con un rol administrativo, verás un botón llamado **"Consola Admin"** en el header superior para entrar al panel `/admin`.

---

## 👥 3. Cómo Crear Nuevos Usuarios

### A. Para Clientes Nuevos (Registro Directo):
1.  Ingresa a la pantalla de Registro: **[http://localhost:5173/registro](http://localhost:5173/registro)**.
2.  Completa el formulario (Nombre completo, Email, Teléfono y Contraseña) y dale a **"Registrarse"**.
3.  El navegador te solicitará el PIN de activación. **Copia el código PIN impreso en la consola de tu backend** y digítalo en el navegador.
4.  Tu cuenta se activará automáticamente con el rol de `Cliente` y tu sesión quedará iniciada de forma segura.

### B. Para Asignar Roles Administrativos a Usuarios Existentes:
1.  Realiza el registro del nuevo usuario en el portal web de forma normal (**[http://localhost:5173/registro](http://localhost:5173/registro)**) con su correo real. Esto le asignará inicialmente el rol de `Cliente` por seguridad.
2.  Para cambiarle el rol al de un Administrador, Empleado o Supervisor, ejecuta el script SQL correspondiente en tu herramienta de base de datos (SSMS - SQL Server Management Studio):

#### 👑 Asignar Rol de Administrador
```sql
USE FastBitesDB;
GO

-- Reemplaza 'correo@ejemplo.com' con el email del usuario registrado
UPDATE ur
SET ur.RolId = (SELECT RolId FROM Roles WHERE Nombre = 'Administrador')
FROM UsuarioRoles ur
INNER JOIN Usuarios u ON u.UsuarioId = ur.UsuarioId
WHERE u.Email = 'correo@ejemplo.com';
GO
```

#### 📈 Asignar Rol de Supervisor
```sql
USE FastBitesDB;
GO

-- Reemplaza 'correo@ejemplo.com' con el email del usuario registrado
UPDATE ur
SET ur.RolId = (SELECT RolId FROM Roles WHERE Nombre = 'Supervisor')
FROM UsuarioRoles ur
INNER JOIN Usuarios u ON u.UsuarioId = ur.UsuarioId
WHERE u.Email = 'correo@ejemplo.com';
GO
```

#### 👥 Asignar Rol de Empleado de Backoffice
```sql
USE FastBitesDB;
GO

-- Reemplaza 'correo@ejemplo.com' con el email del usuario registrado
UPDATE ur
SET ur.RolId = (SELECT RolId FROM Roles WHERE Nombre = 'EmpleadoBackoffice')
FROM UsuarioRoles ur
INNER JOIN Usuarios u ON u.UsuarioId = ur.UsuarioId
WHERE u.Email = 'correo@ejemplo.com';
GO
```

#### 👤 Regresar a Rol de Cliente
```sql
USE FastBitesDB;
GO

-- Reemplaza 'correo@ejemplo.com' con el email del usuario registrado
UPDATE ur
SET ur.RolId = (SELECT RolId FROM Roles WHERE Nombre = 'Cliente')
FROM UsuarioRoles ur
INNER JOIN Usuarios u ON u.UsuarioId = ur.UsuarioId
WHERE u.Email = 'correo@ejemplo.com';
GO
```

3.  Una vez ejecutado, la próxima vez que el usuario inicie sesión, entrará automáticamente con sus nuevos privilegios y restricciones visuales.

---

## 🚪 4. Salir de la Consola de Administrador

Cuando te encuentres dentro de la Consola de Administración (`/admin`), no necesitas cerrar sesión si deseas ir a comprar o navegar por la tienda como cliente. 

Hemos integrado un botón de retorno rápido en la barra lateral izquierda (Sidebar) llamado **"⬅ Salir a Portal Cliente"**. Al hacer clic en él, regresarás instantáneamente al portal principal de compras manteniendo tu sesión activa de manera cómoda.
