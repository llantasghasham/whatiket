-- Verificar conexiones Facebook en DB
-- Ejecutar: psql -U user -d database -f verificar-conexiones-facebook.sql
-- O en MySQL: mysql -u user -p database < verificar-conexiones-facebook.sql

-- PostgreSQL:
SELECT
  id,
  name,
  channel,
  "facebookPageUserId" AS page_id,
  "companyId",
  status,
  CASE WHEN "facebookUserToken" IS NOT NULL AND LENGTH("facebookUserToken") > 10 THEN 'SI' ELSE 'NO' END AS token_ok,
  LEFT("facebookUserToken", 12) || '...' || RIGHT("facebookUserToken", 4) AS token_preview,
  "createdAt",
  "updatedAt"
FROM "Whatsapps"
WHERE channel IN ('facebook', 'instagram')
ORDER BY name;

-- Buscar duplicados por page_id (mismo facebookPageUserId):
-- SELECT "facebookPageUserId", COUNT(*) 
-- FROM "Whatsapps" 
-- WHERE channel = 'facebook' 
-- GROUP BY "facebookPageUserId" 
-- HAVING COUNT(*) > 1;
