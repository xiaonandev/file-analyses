UPDATE "Analysis"
SET "status" = 'completed'
WHERE "status" IN ('ready', 'confirmed');
