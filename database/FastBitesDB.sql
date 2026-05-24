-- ============================================================
--  FastBitesDB — Script T-SQL completo
--  Motor: Microsoft SQL Server
--  Generado: 2026-05-24
-- ============================================================

-- ============================================================
-- RESUMEN DE TABLAS
-- ============================================================
-- Seguridad / Autenticacion:
--   Roles, Usuarios, UsuarioRoles
--   IntentosLogin, PinesVerificacionLogin, TokensRecuperacionPassword
-- Clientes:
--   Clientes, DireccionesCliente, MetodosPagoCliente
-- Restaurantes:
--   Restaurantes, HorariosRestaurante
-- Catalogo:
--   Categorias, Productos, ImagenesProducto
--   TamaniosProducto, Complementos, Bebidas, Ingredientes
--   ProductoTamanio, ProductoComplemento, ProductoBebida, ProductoIngrediente
-- Disponibilidad:
--   Dayparts, ProductoDaypart
-- Transacciones:
--   Carritos, CarritoDetalle
--   Pedidos, PedidoDetalle, PedidoDetallePersonalizacion
--   TiposPago, Pagos
-- Ofertas:
--   Ofertas, OfertaProductos
-- Auditoria:
--   BitacoraSistema
-- Vistas de reportes:
--   VentasPorDia, VentasPorHora, VentasPorDaypart
-- ============================================================

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'FastBitesDB')
BEGIN
    ALTER DATABASE FastBitesDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE FastBitesDB;
END
GO

CREATE DATABASE FastBitesDB
    COLLATE SQL_Latin1_General_CP1_CI_AS;
GO

USE FastBitesDB;
GO

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE Roles (
    RolId          INT            NOT NULL IDENTITY(1,1),
    Nombre         NVARCHAR(50)   NOT NULL,
    Descripcion    NVARCHAR(200)  NULL,
    FechaCreacion  DATETIME2      NOT NULL DEFAULT SYSDATETIME(),
    Activo         BIT            NOT NULL DEFAULT 1,
    CONSTRAINT PK_Roles        PRIMARY KEY (RolId),
    CONSTRAINT UQ_Roles_Nombre UNIQUE      (Nombre)
);
GO

-- ============================================================
-- 2. USUARIOS  (sistema: admins, empleados, supervisores)
-- ============================================================
CREATE TABLE Usuarios (
    UsuarioId              INT            NOT NULL IDENTITY(1,1),
    Email                  NVARCHAR(150)  NOT NULL,
    PasswordHash           NVARCHAR(500)  NOT NULL,
    NombreCompleto         NVARCHAR(150)  NOT NULL,
    Telefono               NVARCHAR(20)   NULL,
    EmailVerificado        BIT            NOT NULL DEFAULT 0,
    IntentosFallidosLogin  INT            NOT NULL DEFAULT 0,
    BloqueadoHasta         DATETIME2      NULL,
    UltimoIntentoLogin     DATETIME2      NULL,
    FechaCreacion          DATETIME2      NOT NULL DEFAULT SYSDATETIME(),
    FechaActualizacion     DATETIME2      NULL,
    Activo                 BIT            NOT NULL DEFAULT 1,
    CONSTRAINT PK_Usuarios        PRIMARY KEY (UsuarioId),
    CONSTRAINT UQ_Usuarios_Email  UNIQUE      (Email),
    CONSTRAINT CK_Usuarios_Intentos CHECK (IntentosFallidosLogin >= 0 AND IntentosFallidosLogin <= 10)
);
GO

-- ============================================================
-- 3. USUARIO ROLES  (M:N)
-- ============================================================
CREATE TABLE UsuarioRoles (
    UsuarioRolId   INT       NOT NULL IDENTITY(1,1),
    UsuarioId      INT       NOT NULL,
    RolId          INT       NOT NULL,
    FechaAsignacion DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    Activo         BIT       NOT NULL DEFAULT 1,
    CONSTRAINT PK_UsuarioRoles         PRIMARY KEY (UsuarioRolId),
    CONSTRAINT UQ_UsuarioRoles         UNIQUE      (UsuarioId, RolId),
    CONSTRAINT FK_UsuarioRoles_Usuario FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId),
    CONSTRAINT FK_UsuarioRoles_Rol     FOREIGN KEY (RolId)     REFERENCES Roles(RolId)
);
GO

-- ============================================================
-- 4. INTENTOS LOGIN  (auditoria de cada intento)
-- ============================================================
CREATE TABLE IntentosLogin (
    IntentoId       INT            NOT NULL IDENTITY(1,1),
    UsuarioId       INT            NULL,
    EmailIngresado  NVARCHAR(150)  NOT NULL,
    DireccionIP     NVARCHAR(45)   NOT NULL,
    UserAgent       NVARCHAR(500)  NULL,
    Exitoso         BIT            NOT NULL DEFAULT 0,
    Motivo          NVARCHAR(200)  NULL,
    FechaIntento    DATETIME2      NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT PK_IntentosLogin         PRIMARY KEY (IntentoId),
    CONSTRAINT FK_IntentosLogin_Usuario FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId)
);
GO

-- ============================================================
-- 5. PINES VERIFICACION LOGIN
-- ============================================================
CREATE TABLE PinesVerificacionLogin (
    PinId              INT       NOT NULL IDENTITY(1,1),
    UsuarioId          INT       NOT NULL,
    CodigoHash         NVARCHAR(500) NOT NULL,
    FechaExpiracion    DATETIME2 NOT NULL,
    Usado              BIT       NOT NULL DEFAULT 0,
    FechaUso           DATETIME2 NULL,
    IntentosFallidos   INT       NOT NULL DEFAULT 0,
    FechaCreacion      DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT PK_PinesVerificacionLogin         PRIMARY KEY (PinId),
    CONSTRAINT FK_PinesVerificacionLogin_Usuario FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId),
    CONSTRAINT CK_PinesVerificacion_Intentos     CHECK (IntentosFallidos >= 0 AND IntentosFallidos <= 10)
);
GO

-- ============================================================
-- 6. TOKENS RECUPERACION PASSWORD
-- ============================================================
CREATE TABLE TokensRecuperacionPassword (
    TokenId          INT           NOT NULL IDENTITY(1,1),
    UsuarioId        INT           NOT NULL,
    TokenHash        NVARCHAR(500) NOT NULL,
    FechaExpiracion  DATETIME2     NOT NULL,
    Usado            BIT           NOT NULL DEFAULT 0,
    FechaUso         DATETIME2     NULL,
    FechaCreacion    DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT PK_TokensRecuperacion         PRIMARY KEY (TokenId),
    CONSTRAINT FK_TokensRecuperacion_Usuario FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId)
);
GO

-- ============================================================
-- 7. CLIENTES  (cuenta del portal de compra)
-- ============================================================
CREATE TABLE Clientes (
    ClienteId          INT            NOT NULL IDENTITY(1,1),
    UsuarioId          INT            NOT NULL,
    Nombre             NVARCHAR(100)  NOT NULL,
    Apellido           NVARCHAR(100)  NOT NULL,
    Telefono           NVARCHAR(20)   NULL,
    FechaNacimiento    DATE           NULL,
    FechaCreacion      DATETIME2      NOT NULL DEFAULT SYSDATETIME(),
    FechaActualizacion DATETIME2      NULL,
    Activo             BIT            NOT NULL DEFAULT 1,
    CONSTRAINT PK_Clientes          PRIMARY KEY (ClienteId),
    CONSTRAINT UQ_Clientes_Usuario  UNIQUE      (UsuarioId),
    CONSTRAINT FK_Clientes_Usuario  FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId)
);
GO

-- ============================================================
-- 8. DIRECCIONES CLIENTE
-- ============================================================
CREATE TABLE DireccionesCliente (
    DireccionId        INT            NOT NULL IDENTITY(1,1),
    ClienteId          INT            NOT NULL,
    Alias              NVARCHAR(50)   NOT NULL,
    Calle              NVARCHAR(200)  NOT NULL,
    NumeroExterior     NVARCHAR(20)   NULL,
    NumeroInterior     NVARCHAR(20)   NULL,
    Colonia            NVARCHAR(100)  NULL,
    Ciudad             NVARCHAR(100)  NOT NULL,
    Estado             NVARCHAR(100)  NOT NULL,
    CodigoPostal       NVARCHAR(10)   NOT NULL,
    Referencias        NVARCHAR(300)  NULL,
    Latitud            DECIMAL(10,7)  NULL,
    Longitud           DECIMAL(10,7)  NULL,
    EsPrincipal        BIT            NOT NULL DEFAULT 0,
    FechaCreacion      DATETIME2      NOT NULL DEFAULT SYSDATETIME(),
    FechaActualizacion DATETIME2      NULL,
    Activo             BIT            NOT NULL DEFAULT 1,
    CONSTRAINT PK_DireccionesCliente         PRIMARY KEY (DireccionId),
    CONSTRAINT FK_DireccionesCliente_Cliente FOREIGN KEY (ClienteId) REFERENCES Clientes(ClienteId)
);
GO

-- ============================================================
-- 9. TIPOS PAGO  (catalogo)
-- ============================================================
CREATE TABLE TiposPago (
    TipoPagoId    INT           NOT NULL IDENTITY(1,1),
    Nombre        NVARCHAR(50)  NOT NULL,
    Descripcion   NVARCHAR(200) NULL,
    Activo        BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_TiposPago        PRIMARY KEY (TipoPagoId),
    CONSTRAINT UQ_TiposPago_Nombre UNIQUE      (Nombre)
);
GO

-- ============================================================
-- 10. METODOS PAGO CLIENTE  (tokenizados, sin numero completo)
-- ============================================================
CREATE TABLE MetodosPagoCliente (
    MetodoPagoId       INT           NOT NULL IDENTITY(1,1),
    ClienteId          INT           NOT NULL,
    TipoPagoId         INT           NOT NULL,
    Alias              NVARCHAR(50)  NULL,
    Ultimos4Digitos    CHAR(4)       NULL,
    MarcaTarjeta       NVARCHAR(30)  NULL,
    TokenReferenciaPago NVARCHAR(300) NULL,
    EsPrincipal        BIT           NOT NULL DEFAULT 0,
    FechaCreacion      DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    FechaActualizacion DATETIME2     NULL,
    Activo             BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_MetodosPagoCliente           PRIMARY KEY (MetodoPagoId),
    CONSTRAINT FK_MetodosPagoCliente_Cliente   FOREIGN KEY (ClienteId)   REFERENCES Clientes(ClienteId),
    CONSTRAINT FK_MetodosPagoCliente_TipoPago  FOREIGN KEY (TipoPagoId)  REFERENCES TiposPago(TipoPagoId),
    CONSTRAINT CK_MetodosPago_Ultimos4 CHECK (Ultimos4Digitos IS NULL OR Ultimos4Digitos LIKE '[0-9][0-9][0-9][0-9]')
);
GO

-- ============================================================
-- 11. RESTAURANTES
-- ============================================================
CREATE TABLE Restaurantes (
    RestauranteId      INT            NOT NULL IDENTITY(1,1),
    Nombre             NVARCHAR(100)  NOT NULL,
    Direccion          NVARCHAR(300)  NOT NULL,
    Ciudad             NVARCHAR(100)  NOT NULL,
    Telefono           NVARCHAR(20)   NULL,
    Email              NVARCHAR(150)  NULL,
    Latitud            DECIMAL(10,7)  NULL,
    Longitud           DECIMAL(10,7)  NULL,
    FechaCreacion      DATETIME2      NOT NULL DEFAULT SYSDATETIME(),
    FechaActualizacion DATETIME2      NULL,
    Activo             BIT            NOT NULL DEFAULT 1,
    CONSTRAINT PK_Restaurantes PRIMARY KEY (RestauranteId)
);
GO

-- ============================================================
-- 12. HORARIOS RESTAURANTE
-- ============================================================
CREATE TABLE HorariosRestaurante (
    HorarioId      INT          NOT NULL IDENTITY(1,1),
    RestauranteId  INT          NOT NULL,
    DiaSemana      TINYINT      NOT NULL,
    HoraApertura   TIME         NOT NULL,
    HoraCierre     TIME         NOT NULL,
    Activo         BIT          NOT NULL DEFAULT 1,
    CONSTRAINT PK_HorariosRestaurante            PRIMARY KEY (HorarioId),
    CONSTRAINT UQ_HorariosRestaurante            UNIQUE      (RestauranteId, DiaSemana),
    CONSTRAINT FK_HorariosRestaurante_Restaurante FOREIGN KEY (RestauranteId) REFERENCES Restaurantes(RestauranteId),
    CONSTRAINT CK_HorariosRestaurante_Dia        CHECK (DiaSemana BETWEEN 1 AND 7)
);
GO

-- ============================================================
-- 13. CATEGORIAS
-- ============================================================
CREATE TABLE Categorias (
    CategoriaId        INT           NOT NULL IDENTITY(1,1),
    Nombre             NVARCHAR(80)  NOT NULL,
    Descripcion        NVARCHAR(300) NULL,
    UrlImagen          NVARCHAR(500) NULL,
    Orden              INT           NOT NULL DEFAULT 0,
    FechaCreacion      DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    FechaActualizacion DATETIME2     NULL,
    Activo             BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_Categorias        PRIMARY KEY (CategoriaId),
    CONSTRAINT UQ_Categorias_Nombre UNIQUE      (Nombre)
);
GO

-- ============================================================
-- 14. PRODUCTOS
-- ============================================================
CREATE TABLE Productos (
    ProductoId         INT             NOT NULL IDENTITY(1,1),
    RestauranteId      INT             NOT NULL,
    CategoriaId        INT             NOT NULL,
    Nombre             NVARCHAR(150)   NOT NULL,
    Descripcion        NVARCHAR(500)   NULL,
    PrecioBase         DECIMAL(10,2)   NOT NULL,
    Calorias           INT             NULL,
    TiempoPreparacion  INT             NULL,
    EsDestacado        BIT             NOT NULL DEFAULT 0,
    FechaCreacion      DATETIME2       NOT NULL DEFAULT SYSDATETIME(),
    FechaActualizacion DATETIME2       NULL,
    Activo             BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_Productos              PRIMARY KEY (ProductoId),
    CONSTRAINT FK_Productos_Restaurante  FOREIGN KEY (RestauranteId) REFERENCES Restaurantes(RestauranteId),
    CONSTRAINT FK_Productos_Categoria    FOREIGN KEY (CategoriaId)   REFERENCES Categorias(CategoriaId),
    CONSTRAINT CK_Productos_Precio       CHECK (PrecioBase >= 0),
    CONSTRAINT CK_Productos_Calorias     CHECK (Calorias IS NULL OR Calorias >= 0)
);
GO

-- ============================================================
-- 15. IMAGENES PRODUCTO
-- ============================================================
CREATE TABLE ImagenesProducto (
    ImagenId    INT           NOT NULL IDENTITY(1,1),
    ProductoId  INT           NOT NULL,
    UrlImagen   NVARCHAR(500) NOT NULL,
    EsPrincipal BIT           NOT NULL DEFAULT 0,
    Orden       INT           NOT NULL DEFAULT 0,
    Activo      BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_ImagenesProducto          PRIMARY KEY (ImagenId),
    CONSTRAINT FK_ImagenesProducto_Producto FOREIGN KEY (ProductoId) REFERENCES Productos(ProductoId)
);
GO

-- ============================================================
-- 16. TAMANIOS PRODUCTO  (catalogo global)
-- ============================================================
CREATE TABLE TamaniosProducto (
    TamanioId    INT          NOT NULL IDENTITY(1,1),
    Nombre       NVARCHAR(30) NOT NULL,
    Abreviatura  NVARCHAR(5)  NULL,
    Orden        INT          NOT NULL DEFAULT 0,
    Activo       BIT          NOT NULL DEFAULT 1,
    CONSTRAINT PK_TamaniosProducto        PRIMARY KEY (TamanioId),
    CONSTRAINT UQ_TamaniosProducto_Nombre UNIQUE      (Nombre)
);
GO

-- ============================================================
-- 17. COMPLEMENTOS  (catalogo global de add-ons)
-- ============================================================
CREATE TABLE Complementos (
    ComplementoId      INT           NOT NULL IDENTITY(1,1),
    Nombre             NVARCHAR(100) NOT NULL,
    Descripcion        NVARCHAR(300) NULL,
    Precio             DECIMAL(10,2) NOT NULL DEFAULT 0,
    FechaCreacion      DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    FechaActualizacion DATETIME2     NULL,
    Activo             BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_Complementos        PRIMARY KEY (ComplementoId),
    CONSTRAINT UQ_Complementos_Nombre UNIQUE      (Nombre),
    CONSTRAINT CK_Complementos_Precio CHECK (Precio >= 0)
);
GO

-- ============================================================
-- 18. BEBIDAS  (catalogo global)
-- ============================================================
CREATE TABLE Bebidas (
    BebidaId           INT           NOT NULL IDENTITY(1,1),
    Nombre             NVARCHAR(100) NOT NULL,
    Descripcion        NVARCHAR(300) NULL,
    Precio             DECIMAL(10,2) NOT NULL DEFAULT 0,
    FechaCreacion      DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    FechaActualizacion DATETIME2     NULL,
    Activo             BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_Bebidas        PRIMARY KEY (BebidaId),
    CONSTRAINT UQ_Bebidas_Nombre UNIQUE      (Nombre),
    CONSTRAINT CK_Bebidas_Precio CHECK (Precio >= 0)
);
GO

-- ============================================================
-- 19. INGREDIENTES  (catalogo global)
-- ============================================================
CREATE TABLE Ingredientes (
    IngredienteId      INT           NOT NULL IDENTITY(1,1),
    Nombre             NVARCHAR(100) NOT NULL,
    Descripcion        NVARCHAR(300) NULL,
    EsAlergenico       BIT           NOT NULL DEFAULT 0,
    FechaCreacion      DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    FechaActualizacion DATETIME2     NULL,
    Activo             BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_Ingredientes        PRIMARY KEY (IngredienteId),
    CONSTRAINT UQ_Ingredientes_Nombre UNIQUE      (Nombre)
);
GO

-- ============================================================
-- 20. PRODUCTO - TAMANIO  (precio por tamanio)
-- ============================================================
CREATE TABLE ProductoTamanio (
    ProductoTamanioId INT           NOT NULL IDENTITY(1,1),
    ProductoId        INT           NOT NULL,
    TamanioId         INT           NOT NULL,
    PrecioAdicional   DECIMAL(10,2) NOT NULL DEFAULT 0,
    Activo            BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_ProductoTamanio          PRIMARY KEY (ProductoTamanioId),
    CONSTRAINT UQ_ProductoTamanio          UNIQUE      (ProductoId, TamanioId),
    CONSTRAINT FK_ProductoTamanio_Producto FOREIGN KEY (ProductoId) REFERENCES Productos(ProductoId),
    CONSTRAINT FK_ProductoTamanio_Tamanio  FOREIGN KEY (TamanioId)  REFERENCES TamaniosProducto(TamanioId),
    CONSTRAINT CK_ProductoTamanio_Precio   CHECK (PrecioAdicional >= 0)
);
GO

-- ============================================================
-- 21. PRODUCTO - COMPLEMENTO
-- ============================================================
CREATE TABLE ProductoComplemento (
    ProductoComplementoId INT NOT NULL IDENTITY(1,1),
    ProductoId            INT NOT NULL,
    ComplementoId         INT NOT NULL,
    EsObligatorio         BIT NOT NULL DEFAULT 0,
    Activo                BIT NOT NULL DEFAULT 1,
    CONSTRAINT PK_ProductoComplemento            PRIMARY KEY (ProductoComplementoId),
    CONSTRAINT UQ_ProductoComplemento            UNIQUE      (ProductoId, ComplementoId),
    CONSTRAINT FK_ProductoComplemento_Producto   FOREIGN KEY (ProductoId)    REFERENCES Productos(ProductoId),
    CONSTRAINT FK_ProductoComplemento_Complement FOREIGN KEY (ComplementoId) REFERENCES Complementos(ComplementoId)
);
GO

-- ============================================================
-- 22. PRODUCTO - BEBIDA
-- ============================================================
CREATE TABLE ProductoBebida (
    ProductoBebidaId INT NOT NULL IDENTITY(1,1),
    ProductoId       INT NOT NULL,
    BebidaId         INT NOT NULL,
    Activo           BIT NOT NULL DEFAULT 1,
    CONSTRAINT PK_ProductoBebida          PRIMARY KEY (ProductoBebidaId),
    CONSTRAINT UQ_ProductoBebida          UNIQUE      (ProductoId, BebidaId),
    CONSTRAINT FK_ProductoBebida_Producto FOREIGN KEY (ProductoId) REFERENCES Productos(ProductoId),
    CONSTRAINT FK_ProductoBebida_Bebida   FOREIGN KEY (BebidaId)   REFERENCES Bebidas(BebidaId)
);
GO

-- ============================================================
-- 23. PRODUCTO - INGREDIENTE
-- ============================================================
CREATE TABLE ProductoIngrediente (
    ProductoIngredienteId INT NOT NULL IDENTITY(1,1),
    ProductoId            INT NOT NULL,
    IngredienteId         INT NOT NULL,
    EsRemovible           BIT NOT NULL DEFAULT 1,
    Activo                BIT NOT NULL DEFAULT 1,
    CONSTRAINT PK_ProductoIngrediente            PRIMARY KEY (ProductoIngredienteId),
    CONSTRAINT UQ_ProductoIngrediente            UNIQUE      (ProductoId, IngredienteId),
    CONSTRAINT FK_ProductoIngrediente_Producto   FOREIGN KEY (ProductoId)    REFERENCES Productos(ProductoId),
    CONSTRAINT FK_ProductoIngrediente_Ingredient FOREIGN KEY (IngredienteId) REFERENCES Ingredientes(IngredienteId)
);
GO

-- ============================================================
-- 24. DAYPARTS
-- ============================================================
CREATE TABLE Dayparts (
    DaypartId    INT          NOT NULL IDENTITY(1,1),
    Nombre       NVARCHAR(50) NOT NULL,
    HoraInicio   TIME         NOT NULL,
    HoraFin      TIME         NOT NULL,
    Activo       BIT          NOT NULL DEFAULT 1,
    CONSTRAINT PK_Dayparts        PRIMARY KEY (DaypartId),
    CONSTRAINT UQ_Dayparts_Nombre UNIQUE      (Nombre)
);
GO

-- ============================================================
-- 25. PRODUCTO - DAYPART
-- ============================================================
CREATE TABLE ProductoDaypart (
    ProductoDaypartId INT NOT NULL IDENTITY(1,1),
    ProductoId        INT NOT NULL,
    DaypartId         INT NOT NULL,
    Activo            BIT NOT NULL DEFAULT 1,
    CONSTRAINT PK_ProductoDaypart          PRIMARY KEY (ProductoDaypartId),
    CONSTRAINT UQ_ProductoDaypart          UNIQUE      (ProductoId, DaypartId),
    CONSTRAINT FK_ProductoDaypart_Producto FOREIGN KEY (ProductoId) REFERENCES Productos(ProductoId),
    CONSTRAINT FK_ProductoDaypart_Daypart  FOREIGN KEY (DaypartId)  REFERENCES Dayparts(DaypartId)
);
GO

-- ============================================================
-- 26. CARRITOS
-- ============================================================
CREATE TABLE Carritos (
    CarritoId      INT       NOT NULL IDENTITY(1,1),
    ClienteId      INT       NOT NULL,
    RestauranteId  INT       NOT NULL,
    FechaCreacion  DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FechaActualizacion DATETIME2 NULL,
    CONSTRAINT PK_Carritos             PRIMARY KEY (CarritoId),
    CONSTRAINT FK_Carritos_Cliente     FOREIGN KEY (ClienteId)     REFERENCES Clientes(ClienteId),
    CONSTRAINT FK_Carritos_Restaurante FOREIGN KEY (RestauranteId) REFERENCES Restaurantes(RestauranteId)
);
GO

-- ============================================================
-- 27. CARRITO DETALLE
-- ============================================================
CREATE TABLE CarritoDetalle (
    CarritoDetalleId  INT           NOT NULL IDENTITY(1,1),
    CarritoId         INT           NOT NULL,
    ProductoId        INT           NOT NULL,
    TamanioId         INT           NULL,
    Cantidad          INT           NOT NULL DEFAULT 1,
    PrecioUnitario    DECIMAL(10,2) NOT NULL,
    Notas             NVARCHAR(300) NULL,
    CONSTRAINT PK_CarritoDetalle          PRIMARY KEY (CarritoDetalleId),
    CONSTRAINT FK_CarritoDetalle_Carrito  FOREIGN KEY (CarritoId)  REFERENCES Carritos(CarritoId),
    CONSTRAINT FK_CarritoDetalle_Producto FOREIGN KEY (ProductoId) REFERENCES Productos(ProductoId),
    CONSTRAINT FK_CarritoDetalle_Tamanio  FOREIGN KEY (TamanioId)  REFERENCES TamaniosProducto(TamanioId),
    CONSTRAINT CK_CarritoDetalle_Cantidad CHECK (Cantidad > 0),
    CONSTRAINT CK_CarritoDetalle_Precio   CHECK (PrecioUnitario >= 0)
);
GO

-- ============================================================
-- 28. PEDIDOS
-- ============================================================
CREATE TABLE Pedidos (
    PedidoId           INT            NOT NULL IDENTITY(1,1),
    ClienteId          INT            NOT NULL,
    RestauranteId      INT            NOT NULL,
    DireccionId        INT            NULL,
    Subtotal           DECIMAL(10,2)  NOT NULL,
    Descuento          DECIMAL(10,2)  NOT NULL DEFAULT 0,
    CostoEnvio         DECIMAL(10,2)  NOT NULL DEFAULT 0,
    Total              DECIMAL(10,2)  NOT NULL,
    Estado             NVARCHAR(30)   NOT NULL DEFAULT 'Pendiente',
    TipoEntrega        NVARCHAR(20)   NOT NULL DEFAULT 'Domicilio',
    Notas              NVARCHAR(500)  NULL,
    FechaPedido        DATETIME2      NOT NULL DEFAULT SYSDATETIME(),
    FechaActualizacion DATETIME2      NULL,
    Activo             BIT            NOT NULL DEFAULT 1,
    CONSTRAINT PK_Pedidos              PRIMARY KEY (PedidoId),
    CONSTRAINT FK_Pedidos_Cliente      FOREIGN KEY (ClienteId)     REFERENCES Clientes(ClienteId),
    CONSTRAINT FK_Pedidos_Restaurante  FOREIGN KEY (RestauranteId) REFERENCES Restaurantes(RestauranteId),
    CONSTRAINT FK_Pedidos_Direccion    FOREIGN KEY (DireccionId)   REFERENCES DireccionesCliente(DireccionId),
    CONSTRAINT CK_Pedidos_Estado       CHECK (Estado IN ('Pendiente','Confirmado','EnPreparacion','EnCamino','Entregado','Cancelado')),
    CONSTRAINT CK_Pedidos_TipoEntrega  CHECK (TipoEntrega IN ('Domicilio','Recoger')),
    CONSTRAINT CK_Pedidos_Subtotal     CHECK (Subtotal >= 0),
    CONSTRAINT CK_Pedidos_Descuento    CHECK (Descuento >= 0),
    CONSTRAINT CK_Pedidos_CostoEnvio   CHECK (CostoEnvio >= 0),
    CONSTRAINT CK_Pedidos_Total        CHECK (Total >= 0)
);
GO

-- ============================================================
-- 29. PEDIDO DETALLE
-- ============================================================
CREATE TABLE PedidoDetalle (
    PedidoDetalleId  INT           NOT NULL IDENTITY(1,1),
    PedidoId         INT           NOT NULL,
    ProductoId       INT           NOT NULL,
    TamanioId        INT           NULL,
    Cantidad         INT           NOT NULL DEFAULT 1,
    PrecioUnitario   DECIMAL(10,2) NOT NULL,
    Subtotal         DECIMAL(10,2) NOT NULL,
    Notas            NVARCHAR(300) NULL,
    CONSTRAINT PK_PedidoDetalle          PRIMARY KEY (PedidoDetalleId),
    CONSTRAINT FK_PedidoDetalle_Pedido   FOREIGN KEY (PedidoId)   REFERENCES Pedidos(PedidoId),
    CONSTRAINT FK_PedidoDetalle_Producto FOREIGN KEY (ProductoId) REFERENCES Productos(ProductoId),
    CONSTRAINT FK_PedidoDetalle_Tamanio  FOREIGN KEY (TamanioId)  REFERENCES TamaniosProducto(TamanioId),
    CONSTRAINT CK_PedidoDetalle_Cantidad CHECK (Cantidad > 0),
    CONSTRAINT CK_PedidoDetalle_Precio   CHECK (PrecioUnitario >= 0),
    CONSTRAINT CK_PedidoDetalle_Subtotal CHECK (Subtotal >= 0)
);
GO

-- ============================================================
-- 30. PEDIDO DETALLE PERSONALIZACION
--     (ingredientes removidos, complementos o bebidas agregados)
-- ============================================================
CREATE TABLE PedidoDetallePersonalizacion (
    PersonalizacionId INT           NOT NULL IDENTITY(1,1),
    PedidoDetalleId   INT           NOT NULL,
    TipoItem          NVARCHAR(20)  NOT NULL,
    ItemId            INT           NOT NULL,
    Accion            NVARCHAR(10)  NOT NULL,
    PrecioExtra       DECIMAL(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT PK_PedidoDetallePersonalizacion            PRIMARY KEY (PersonalizacionId),
    CONSTRAINT FK_PedidoDetallePersonalizacion_Detalle    FOREIGN KEY (PedidoDetalleId) REFERENCES PedidoDetalle(PedidoDetalleId),
    CONSTRAINT CK_PedidoDetallePersonalizacion_TipoItem   CHECK (TipoItem IN ('Ingrediente','Complemento','Bebida')),
    CONSTRAINT CK_PedidoDetallePersonalizacion_Accion     CHECK (Accion IN ('Agregar','Quitar')),
    CONSTRAINT CK_PedidoDetallePersonalizacion_PrecioExtra CHECK (PrecioExtra >= 0)
);
GO

-- ============================================================
-- 31. PAGOS
-- ============================================================
CREATE TABLE Pagos (
    PagoId             INT           NOT NULL IDENTITY(1,1),
    PedidoId           INT           NOT NULL,
    TipoPagoId         INT           NOT NULL,
    MetodoPagoId       INT           NULL,
    Monto              DECIMAL(10,2) NOT NULL,
    Estado             NVARCHAR(20)  NOT NULL DEFAULT 'Pendiente',
    ReferenciaExterna  NVARCHAR(300) NULL,
    FechaPago          DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    FechaActualizacion DATETIME2     NULL,
    CONSTRAINT PK_Pagos               PRIMARY KEY (PagoId),
    CONSTRAINT FK_Pagos_Pedido        FOREIGN KEY (PedidoId)     REFERENCES Pedidos(PedidoId),
    CONSTRAINT FK_Pagos_TipoPago      FOREIGN KEY (TipoPagoId)   REFERENCES TiposPago(TipoPagoId),
    CONSTRAINT FK_Pagos_MetodoPago    FOREIGN KEY (MetodoPagoId) REFERENCES MetodosPagoCliente(MetodoPagoId),
    CONSTRAINT CK_Pagos_Estado        CHECK (Estado IN ('Pendiente','Aprobado','Rechazado','Reembolsado')),
    CONSTRAINT CK_Pagos_Monto         CHECK (Monto >= 0)
);
GO

-- ============================================================
-- 32. OFERTAS
-- ============================================================
CREATE TABLE Ofertas (
    OfertaId           INT            NOT NULL IDENTITY(1,1),
    Nombre             NVARCHAR(150)  NOT NULL,
    Descripcion        NVARCHAR(500)  NULL,
    TipoDescuento      NVARCHAR(20)   NOT NULL,
    ValorDescuento     DECIMAL(10,2)  NOT NULL,
    MontoMinimoPedido  DECIMAL(10,2)  NOT NULL DEFAULT 0,
    CodigoPromo        NVARCHAR(30)   NULL,
    FechaInicio        DATETIME2      NOT NULL,
    FechaFin           DATETIME2      NOT NULL,
    UsoMaximo          INT            NULL,
    UsoActual          INT            NOT NULL DEFAULT 0,
    UrlImagen          NVARCHAR(500)  NULL,
    FechaCreacion      DATETIME2      NOT NULL DEFAULT SYSDATETIME(),
    FechaActualizacion DATETIME2      NULL,
    Activo             BIT            NOT NULL DEFAULT 1,
    CONSTRAINT PK_Ofertas                PRIMARY KEY (OfertaId),
    CONSTRAINT UQ_Ofertas_CodigoPromo    UNIQUE      (CodigoPromo),
    CONSTRAINT CK_Ofertas_TipoDescuento  CHECK (TipoDescuento IN ('Porcentaje','MontoFijo')),
    CONSTRAINT CK_Ofertas_ValorDescuento CHECK (ValorDescuento > 0),
    CONSTRAINT CK_Ofertas_Fechas         CHECK (FechaFin > FechaInicio),
    CONSTRAINT CK_Ofertas_UsoMaximo      CHECK (UsoMaximo IS NULL OR UsoMaximo > 0)
);
GO

-- ============================================================
-- 33. OFERTA - PRODUCTOS
-- ============================================================
CREATE TABLE OfertaProductos (
    OfertaProductoId INT NOT NULL IDENTITY(1,1),
    OfertaId         INT NOT NULL,
    ProductoId       INT NOT NULL,
    CONSTRAINT PK_OfertaProductos          PRIMARY KEY (OfertaProductoId),
    CONSTRAINT UQ_OfertaProductos          UNIQUE      (OfertaId, ProductoId),
    CONSTRAINT FK_OfertaProductos_Oferta   FOREIGN KEY (OfertaId)   REFERENCES Ofertas(OfertaId),
    CONSTRAINT FK_OfertaProductos_Producto FOREIGN KEY (ProductoId) REFERENCES Productos(ProductoId)
);
GO

-- ============================================================
-- 34. BITACORA SISTEMA
-- ============================================================
CREATE TABLE BitacoraSistema (
    BitacoraId    INT            NOT NULL IDENTITY(1,1),
    UsuarioId     INT            NULL,
    Tabla         NVARCHAR(100)  NOT NULL,
    Operacion     NVARCHAR(10)   NOT NULL,
    RegistroId    INT            NULL,
    DatosAnteriores NVARCHAR(MAX) NULL,
    DatosNuevos   NVARCHAR(MAX)  NULL,
    DireccionIP   NVARCHAR(45)   NULL,
    FechaOperacion DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT PK_BitacoraSistema         PRIMARY KEY (BitacoraId),
    CONSTRAINT FK_BitacoraSistema_Usuario FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId),
    CONSTRAINT CK_BitacoraSistema_Op      CHECK (Operacion IN ('INSERT','UPDATE','DELETE','SELECT'))
);
GO

-- ============================================================
-- INDICES
-- ============================================================

-- Login por email
CREATE INDEX IX_Usuarios_Email
    ON Usuarios (Email)
    INCLUDE (PasswordHash, Activo, BloqueadoHasta, EmailVerificado);

-- Intentos login por usuario y fecha
CREATE INDEX IX_IntentosLogin_UsuarioFecha
    ON IntentosLogin (UsuarioId, FechaIntento DESC);

CREATE INDEX IX_IntentosLogin_EmailFecha
    ON IntentosLogin (EmailIngresado, FechaIntento DESC);

-- Pines por usuario (buscar pin vigente)
CREATE INDEX IX_PinesVerificacion_Usuario
    ON PinesVerificacionLogin (UsuarioId, Usado, FechaExpiracion);

-- Tokens recuperacion por usuario
CREATE INDEX IX_TokensRecuperacion_Usuario
    ON TokensRecuperacionPassword (UsuarioId, Usado, FechaExpiracion);

-- Productos por categoria
CREATE INDEX IX_Productos_Categoria
    ON Productos (CategoriaId, Activo)
    INCLUDE (Nombre, PrecioBase, EsDestacado);

-- Productos por restaurante
CREATE INDEX IX_Productos_Restaurante
    ON Productos (RestauranteId, Activo);

-- Pedidos por cliente
CREATE INDEX IX_Pedidos_Cliente
    ON Pedidos (ClienteId, FechaPedido DESC)
    INCLUDE (Estado, Total);

-- Pedidos por restaurante
CREATE INDEX IX_Pedidos_Restaurante
    ON Pedidos (RestauranteId, FechaPedido DESC)
    INCLUDE (Estado, Total);

-- Reportes por fecha (columna FechaPedido es la base de todas las vistas de reporte)
CREATE INDEX IX_Pedidos_FechaPedido
    ON Pedidos (FechaPedido DESC)
    INCLUDE (RestauranteId, Estado, Total, Subtotal, Descuento);

-- Carrito activo por cliente
CREATE INDEX IX_Carritos_Cliente
    ON Carritos (ClienteId);

-- Ofertas vigentes
CREATE INDEX IX_Ofertas_Fechas
    ON Ofertas (FechaInicio, FechaFin, Activo)
    INCLUDE (Nombre, TipoDescuento, ValorDescuento, CodigoPromo);

-- Bitacora por tabla y fecha
CREATE INDEX IX_Bitacora_TablaFecha
    ON BitacoraSistema (Tabla, FechaOperacion DESC);

GO

-- ============================================================
-- VISTAS DE REPORTES
-- ============================================================

CREATE VIEW VentasPorDia
AS
SELECT
    CAST(p.FechaPedido AS DATE)   AS Fecha,
    r.RestauranteId,
    r.Nombre                       AS Restaurante,
    COUNT(p.PedidoId)              AS TotalPedidos,
    SUM(p.Subtotal)                AS TotalSubtotal,
    SUM(p.Descuento)               AS TotalDescuento,
    SUM(p.CostoEnvio)              AS TotalEnvio,
    SUM(p.Total)                   AS TotalVentas
FROM Pedidos p
INNER JOIN Restaurantes r ON r.RestauranteId = p.RestauranteId
WHERE p.Estado NOT IN ('Cancelado')
GROUP BY
    CAST(p.FechaPedido AS DATE),
    r.RestauranteId,
    r.Nombre;
GO

CREATE VIEW VentasPorHora
AS
SELECT
    CAST(p.FechaPedido AS DATE)        AS Fecha,
    DATEPART(HOUR, p.FechaPedido)      AS Hora,
    r.RestauranteId,
    r.Nombre                            AS Restaurante,
    COUNT(p.PedidoId)                   AS TotalPedidos,
    SUM(p.Total)                        AS TotalVentas
FROM Pedidos p
INNER JOIN Restaurantes r ON r.RestauranteId = p.RestauranteId
WHERE p.Estado NOT IN ('Cancelado')
GROUP BY
    CAST(p.FechaPedido AS DATE),
    DATEPART(HOUR, p.FechaPedido),
    r.RestauranteId,
    r.Nombre;
GO

CREATE VIEW VentasPorDaypart
AS
SELECT
    CAST(p.FechaPedido AS DATE)  AS Fecha,
    d.DaypartId,
    d.Nombre                      AS Daypart,
    r.RestauranteId,
    r.Nombre                      AS Restaurante,
    COUNT(DISTINCT p.PedidoId)    AS TotalPedidos,
    SUM(pd.Subtotal)              AS TotalVentas
FROM PedidoDetalle pd
INNER JOIN Pedidos p         ON p.PedidoId         = pd.PedidoId
INNER JOIN Restaurantes r    ON r.RestauranteId     = p.RestauranteId
INNER JOIN ProductoDaypart pdp ON pdp.ProductoId    = pd.ProductoId AND pdp.Activo = 1
INNER JOIN Dayparts d        ON d.DaypartId         = pdp.DaypartId
WHERE p.Estado NOT IN ('Cancelado')
  AND CAST(DATEPART(HOUR, p.FechaPedido) AS TINYINT) * 100
    + DATEPART(MINUTE, p.FechaPedido)
    BETWEEN DATEPART(HOUR, d.HoraInicio) * 100 + DATEPART(MINUTE, d.HoraInicio)
        AND DATEPART(HOUR, d.HoraFin)    * 100 + DATEPART(MINUTE, d.HoraFin)
GROUP BY
    CAST(p.FechaPedido AS DATE),
    d.DaypartId,
    d.Nombre,
    r.RestauranteId,
    r.Nombre;
GO

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Roles
INSERT INTO Roles (Nombre, Descripcion) VALUES
    ('Cliente',             'Usuario registrado en el portal de compra'),
    ('Administrador',       'Acceso total al backoffice'),
    ('EmpleadoBackoffice',  'Operaciones del dia a dia en backoffice'),
    ('Supervisor',          'Supervision de operaciones y reportes');
GO

-- Categorias
INSERT INTO Categorias (Nombre, Descripcion, Orden) VALUES
    ('Desayuno', 'Productos disponibles en horario de desayuno', 1),
    ('Almuerzo', 'Productos disponibles en horario de almuerzo', 2),
    ('Cena',     'Productos disponibles en horario de cena',     3);
GO

-- Tipos de pago
INSERT INTO TiposPago (Nombre, Descripcion) VALUES
    ('Tarjeta',                   'Pago con tarjeta de credito o debito'),
    ('Efectivo contra entrega',   'Pago en efectivo al momento de la entrega');
GO

-- Dayparts
INSERT INTO Dayparts (Nombre, HoraInicio, HoraFin) VALUES
    ('Desayuno', '06:00', '11:59'),
    ('Almuerzo', '12:00', '17:59'),
    ('Cena',     '18:00', '23:59');
GO

-- Tamanios estandar
INSERT INTO TamaniosProducto (Nombre, Abreviatura, Orden) VALUES
    ('Chico',    'S', 1),
    ('Mediano',  'M', 2),
    ('Grande',   'L', 3),
    ('Extra',    'XL', 4);
GO

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
