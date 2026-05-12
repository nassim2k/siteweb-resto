-- Images du slideshow hero
ALTER TABLE themes ADD COLUMN IF NOT EXISTS hero_images JSONB DEFAULT '[]'::jsonb;
