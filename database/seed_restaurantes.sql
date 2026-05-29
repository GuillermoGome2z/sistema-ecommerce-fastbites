-- =====================================================================
-- Seed: Restaurantes de prueba para FastBites
-- Campos reales: Nombre, Direccion, Ciudad, Telefono, Activo
-- Usa NOT EXISTS para no duplicar si ya existen
-- =====================================================================

IF NOT EXISTS (SELECT 1 FROM Restaurantes WHERE Nombre = 'FastBites Central')
BEGIN
  INSERT INTO Restaurantes (Nombre, Direccion, Ciudad, Telefono, Activo)
  VALUES ('FastBites Central', 'Av. Reforma 125, Col. Centro', 'Ciudad de México', '55-1000-2001', 1);
END;

IF NOT EXISTS (SELECT 1 FROM Restaurantes WHERE Nombre = 'FastBites Zona 10')
BEGIN
  INSERT INTO Restaurantes (Nombre, Direccion, Ciudad, Telefono, Activo)
  VALUES ('FastBites Zona 10', 'Blvd. Los Próceres 6-50, Zona 10', 'Guatemala', '502-2200-3300', 1);
END;

IF NOT EXISTS (SELECT 1 FROM Restaurantes WHERE Nombre = 'FastBites Oakland')
BEGIN
  INSERT INTO Restaurantes (Nombre, Direccion, Ciudad, Telefono, Activo)
  VALUES ('FastBites Oakland', 'Telegraph Ave 4200, Temescal', 'Oakland', '510-555-0190', 1);
END;

IF NOT EXISTS (SELECT 1 FROM Restaurantes WHERE Nombre = 'FastBites Miraflores')
BEGIN
  INSERT INTO Restaurantes (Nombre, Direccion, Ciudad, Telefono, Activo)
  VALUES ('FastBites Miraflores', 'Av. Larco 740, Miraflores', 'Lima', '01-610-4400', 1);
END;

IF NOT EXISTS (SELECT 1 FROM Restaurantes WHERE Nombre = 'FastBites Cayalá')
BEGIN
  INSERT INTO Restaurantes (Nombre, Direccion, Ciudad, Telefono, Activo)
  VALUES ('FastBites Cayalá', 'Boulevard Cayalá 22-01, Zona 16', 'Guatemala', '502-2500-6600', 1);
END;

-- Verificar resultado
SELECT RestauranteId, Nombre, Ciudad, Activo
FROM Restaurantes
ORDER BY Nombre ASC;
