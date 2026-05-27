-- ============================================================
-- FastBites — Imágenes individuales por producto
-- Ejecutar DESPUÉS de seed_productos.sql
-- ============================================================

-- Elimina imágenes previas de los productos del seed para evitar duplicados
DELETE img
FROM ImagenesProducto img
INNER JOIN Productos p ON p.ProductoId = img.ProductoId
WHERE p.Nombre IN (
  'Pancakes con Arándanos','Omelette de Queso y Jamón','Tostadas Francesas',
  'Smoothie Bowl de Mango','Burrito de Desayuno','Yogurt Parfait',
  'Bagel con Salmón Ahumado','Avena con Frutos Secos',
  'Hamburguesa Clásica FastBites','Pasta Alfredo con Pollo',
  'Ensalada César con Camarones','Tacos de Carnitas (3 pzs)',
  'Wrap de Pollo BBQ','Pizza Margherita Personal',
  'Bowl de Arroz Teriyaki','Sándwich Club',
  'Filete de Res a la Plancha','Salmón a las Hierbas',
  'Pollo al Vino Blanco','Costillas BBQ','Risotto de Hongos',
  'Camarones al Ajillo','Lasagna de Carne','Pechuga Rellena de Espinaca'
);

-- ─── DESAYUNO ────────────────────────────────────────────────
INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Pancakes con Arándanos' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Omelette de Queso y Jamón' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1484723091739-30990a2b9c5b?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Tostadas Francesas' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Smoothie Bowl de Mango' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Burrito de Desayuno' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Yogurt Parfait' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1585325701165-62e1b2c4ce0b?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Bagel con Salmón Ahumado' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Avena con Frutos Secos' AND Activo = 1;

-- ─── ALMUERZO ────────────────────────────────────────────────
INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Hamburguesa Clásica FastBites' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Pasta Alfredo con Pollo' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Ensalada César con Camarones' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Tacos de Carnitas (3 pzs)' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Wrap de Pollo BBQ' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Pizza Margherita Personal' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Bowl de Arroz Teriyaki' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Sándwich Club' AND Activo = 1;

-- ─── CENA ────────────────────────────────────────────────────
INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Filete de Res a la Plancha' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Salmón a las Hierbas' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Pollo al Vino Blanco' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1544025162-d76538485696?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Costillas BBQ' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Risotto de Hongos' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Camarones al Ajillo' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Lasagna de Carne' AND Activo = 1;

INSERT INTO ImagenesProducto (ProductoId, UrlImagen, EsPrincipal, Orden, Activo)
SELECT ProductoId, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80', 1, 1, 1
FROM Productos WHERE Nombre = 'Pechuga Rellena de Espinaca' AND Activo = 1;

GO

-- Verificar resultado
SELECT p.Nombre, img.UrlImagen
FROM Productos p
INNER JOIN ImagenesProducto img ON img.ProductoId = p.ProductoId AND img.EsPrincipal = 1
ORDER BY p.Nombre;
