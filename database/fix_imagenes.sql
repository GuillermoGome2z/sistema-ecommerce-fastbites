-- ============================================================
-- FastBites — Corrección de URLs de imágenes problemáticas
-- Usando Pexels CDN (URLs permanentes, sin cambios)
-- Ejecutar en FastBitesDB desde SSMS
-- ============================================================

-- Smoothie Bowl de Mango
UPDATE img
SET UrlImagen = 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=500'
FROM ImagenesProducto img
INNER JOIN Productos p ON p.ProductoId = img.ProductoId
WHERE p.Nombre = 'Smoothie Bowl de Mango' AND img.EsPrincipal = 1;

-- Avena con Frutos Secos
UPDATE img
SET UrlImagen = 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=500'
FROM ImagenesProducto img
INNER JOIN Productos p ON p.ProductoId = img.ProductoId
WHERE p.Nombre = 'Avena con Frutos Secos' AND img.EsPrincipal = 1;

-- Filete de Res a la Plancha
UPDATE img
SET UrlImagen = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500'
FROM ImagenesProducto img
INNER JOIN Productos p ON p.ProductoId = img.ProductoId
WHERE p.Nombre = 'Filete de Res a la Plancha' AND img.EsPrincipal = 1;

GO

-- Verificar
SELECT p.Nombre, img.UrlImagen
FROM Productos p
INNER JOIN ImagenesProducto img ON img.ProductoId = p.ProductoId AND img.EsPrincipal = 1
WHERE p.Nombre IN (
  'Smoothie Bowl de Mango',
  'Avena con Frutos Secos',
  'Filete de Res a la Plancha'
)
ORDER BY p.Nombre;
