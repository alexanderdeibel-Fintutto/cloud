-- Migration: Add show_in_blog column to fw_knowledge_articles
-- Allows articles to be shown in the Blog section independently of category

ALTER TABLE public.fw_knowledge_articles
  ADD COLUMN IF NOT EXISTS show_in_blog boolean NOT NULL DEFAULT false;

-- Update existing blog-category articles to show in blog by default
UPDATE public.fw_knowledge_articles
  SET show_in_blog = true
  WHERE category = 'blog';

-- Comment for documentation
COMMENT ON COLUMN public.fw_knowledge_articles.show_in_blog
  IS 'When true, this article also appears in the Blog section (in addition to Docs). Independent of the category field.';
