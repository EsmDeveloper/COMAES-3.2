-- Migration: Add bloco_id column to questoes table
-- This allows questions to be associated with question blocks

-- Check if column already exists (PostgreSQL)
-- If using MySQL, use: ALTER TABLE questoes ADD COLUMN IF NOT EXISTS bloco_id

-- For PostgreSQL:
ALTER TABLE questoes
ADD COLUMN IF NOT EXISTS bloco_id INTEGER;

-- Add foreign key constraint
ALTER TABLE questoes
ADD CONSTRAINT fk_questoes_bloco_id 
FOREIGN KEY (bloco_id) 
REFERENCES blocos_questoes(id) 
ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_questoes_bloco_id 
ON questoes(bloco_id);

-- For MySQL, if you need to migrate instead:
/*
ALTER TABLE questoes 
ADD COLUMN bloco_id INT NULL;

ALTER TABLE questoes 
ADD CONSTRAINT fk_questoes_bloco_id 
FOREIGN KEY (bloco_id) 
REFERENCES blocos_questoes(id) 
ON DELETE CASCADE;

CREATE INDEX idx_questoes_bloco_id ON questoes(bloco_id);
*/
