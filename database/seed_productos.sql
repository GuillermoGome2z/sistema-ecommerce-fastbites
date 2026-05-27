-- ============================================================
-- FastBites — Seed de Productos (8 Desayuno + 8 Almuerzo + 8 Cena)
-- Ejecutar en SQL Server Management Studio o Azure Data Studio
-- conectado a la base FastBitesDB
-- ============================================================

DECLARE @RestId   INT;
DECLARE @CatDes   INT;
DECLARE @CatAlm   INT;
DECLARE @CatCena  INT;

-- Toma el primer restaurante activo de la BD
SELECT TOP 1 @RestId = RestauranteId
FROM Restaurantes
WHERE Activo = 1
ORDER BY RestauranteId;

-- Toma los IDs de categoría por nombre (no asume orden)
SELECT @CatDes  = CategoriaId FROM Categorias WHERE Nombre = 'Desayuno';
SELECT @CatAlm  = CategoriaId FROM Categorias WHERE Nombre = 'Almuerzo';
SELECT @CatCena = CategoriaId FROM Categorias WHERE Nombre = 'Cena';

IF @RestId IS NULL
BEGIN
    RAISERROR('No hay ningún restaurante activo en la tabla Restaurantes. Crea uno primero desde el backoffice.', 16, 1);
    RETURN;
END

IF @CatDes IS NULL OR @CatAlm IS NULL OR @CatCena IS NULL
BEGIN
    RAISERROR('Faltan categorías Desayuno/Almuerzo/Cena. Ejecuta primero el script principal FastBitesDB.sql.', 16, 1);
    RETURN;
END

-- ─── DESAYUNO ────────────────────────────────────────────────
INSERT INTO Productos (RestauranteId, CategoriaId, Nombre, Descripcion, PrecioBase, Calorias, TiempoPreparacion, EsDestacado, Activo)
VALUES
(@RestId, @CatDes, 'Pancakes con Arándanos',
 'Esponjosos pancakes con arándanos frescos, jarabe de maple puro y mantequilla artesanal.',
 8.50, 420, 10, 1, 1),

(@RestId, @CatDes, 'Omelette de Queso y Jamón',
 'Omelette cremoso relleno de queso gouda derretido, jamón serrano y hierbas finas.',
 7.90, 380, 12, 0, 1),

(@RestId, @CatDes, 'Tostadas Francesas',
 'Pan brioche empapado en huevo batido con canela y vainilla, servido con frutos rojos frescos.',
 7.50, 450, 10, 0, 1),

(@RestId, @CatDes, 'Smoothie Bowl de Mango',
 'Base cremosa de mango congelado con granola artesanal, coco rallado y semillas de chía.',
 9.20, 310, 8, 1, 1),

(@RestId, @CatDes, 'Burrito de Desayuno',
 'Tortilla de harina rellena de huevos revueltos, chorizo casero, frijoles y pico de gallo.',
 8.00, 540, 12, 0, 1),

(@RestId, @CatDes, 'Yogurt Parfait',
 'Capas de yogurt griego natural, granola crujiente de miel y mix de frutos rojos de temporada.',
 6.50, 280, 5, 0, 1),

(@RestId, @CatDes, 'Bagel con Salmón Ahumado',
 'Bagel tostado con crema cheese, salmón ahumado noruego, alcaparras y cebolla morada.',
 10.50, 460, 8, 0, 1),

(@RestId, @CatDes, 'Avena con Frutos Secos',
 'Avena cocida en leche de almendras con nueces, almendras tostadas, miel de abeja y canela.',
 6.00, 350, 8, 0, 1);

-- ─── ALMUERZO ────────────────────────────────────────────────
INSERT INTO Productos (RestauranteId, CategoriaId, Nombre, Descripcion, PrecioBase, Calorias, TiempoPreparacion, EsDestacado, Activo)
VALUES
(@RestId, @CatAlm, 'Hamburguesa Clásica FastBites',
 'Carne 180g al carbón, lechuga, tomate, queso cheddar fundido, encurtidos y papas crujientes.',
 12.90, 720, 15, 1, 1),

(@RestId, @CatAlm, 'Pasta Alfredo con Pollo',
 'Fettuccine al dente con salsa alfredo cremosa, pechuga de pollo a la plancha y parmesano.',
 11.50, 680, 18, 0, 1),

(@RestId, @CatAlm, 'Ensalada César con Camarones',
 'Lechuga romana, aderezo césar casero, crutones al ajo, parmesano y camarones grillados.',
 13.00, 420, 10, 0, 1),

(@RestId, @CatAlm, 'Tacos de Carnitas (3 pzs)',
 'Tortillas de maíz artesanales con carnitas confitadas, cilantro, cebolla y salsa verde tatemada.',
 10.50, 580, 12, 1, 1),

(@RestId, @CatAlm, 'Wrap de Pollo BBQ',
 'Tortilla de trigo con pollo BBQ desmechado, col morada encurtida, queso y aderezo ranch.',
 9.80, 520, 10, 0, 1),

(@RestId, @CatAlm, 'Pizza Margherita Personal',
 'Base de tomate San Marzano, mozzarella fresca, albahaca y un toque de aceite de oliva.',
 11.00, 640, 20, 0, 1),

(@RestId, @CatAlm, 'Bowl de Arroz Teriyaki',
 'Arroz jazmín con pollo glaseado en salsa teriyaki, edamame, zanahoria y ajonjolí tostado.',
 10.00, 590, 15, 0, 1),

(@RestId, @CatAlm, 'Sándwich Club',
 'Pan de molde tostado en tres capas con pollo, tocino crocante, lechuga, tomate y mayonesa.',
 9.50, 510, 10, 0, 1);

-- ─── CENA ────────────────────────────────────────────────────
INSERT INTO Productos (RestauranteId, CategoriaId, Nombre, Descripcion, PrecioBase, Calorias, TiempoPreparacion, EsDestacado, Activo)
VALUES
(@RestId, @CatCena, 'Filete de Res a la Plancha',
 'Filete 200g término medio con puré de papa trufado, espárragos asados y salsa de champiñones.',
 18.50, 680, 25, 1, 1),

(@RestId, @CatCena, 'Salmón a las Hierbas',
 'Filete de salmón atlántico con costra de hierbas finas, limón asado y ensalada verde mixta.',
 17.00, 520, 20, 1, 1),

(@RestId, @CatCena, 'Pollo al Vino Blanco',
 'Pechuga confitada en salsa de vino blanco con champiñones silvestres y tagliatelle al mantequilla.',
 14.50, 590, 22, 0, 1),

(@RestId, @CatCena, 'Costillas BBQ',
 'Rack de costillas de cerdo con salsa BBQ casera ahumada, coleslaw de col y pan de ajo.',
 19.90, 880, 35, 0, 1),

(@RestId, @CatCena, 'Risotto de Hongos',
 'Arroz arborio cremoso con mezcla de hongos porcini, shiitake y crimini, acabado con parmesano.',
 13.50, 620, 25, 0, 1),

(@RestId, @CatCena, 'Camarones al Ajillo',
 'Camarones jumbo salteados en aceite de oliva, ajo confitado y perejil, servidos con pan artesanal.',
 15.00, 450, 15, 0, 1),

(@RestId, @CatCena, 'Lasagna de Carne',
 'Capas de pasta fresca, carne molida en salsa boloñesa, bechamel y queso gratinado al horno.',
 13.00, 740, 20, 0, 1),

(@RestId, @CatCena, 'Pechuga Rellena de Espinaca',
 'Pechuga de pollo rellena con espinaca salteada, queso feta y tomates secos, con papas rústicas.',
 14.00, 560, 25, 0, 1);

GO

-- Verificar resultado
SELECT
    p.ProductoId,
    c.Nombre AS Categoria,
    p.Nombre,
    p.PrecioBase,
    p.Calorias,
    p.TiempoPreparacion,
    p.EsDestacado
FROM Productos p
INNER JOIN Categorias c ON c.CategoriaId = p.CategoriaId
WHERE p.Activo = 1
ORDER BY c.Orden, p.ProductoId;
