
-- Add missing Education category
INSERT INTO categories (name, slug, description, icon, color)
VALUES (
  'Education',
  'education',
  'AI tools for learning, tutoring, and educational content creation',
  'GraduationCap',
  '#0EA5E9'
)
ON CONFLICT (slug) DO NOTHING;

-- Fix icons for categories that had null icons
UPDATE categories SET icon = 'Search'    WHERE slug = 'research-search' AND (icon IS NULL OR icon = '');
UPDATE categories SET icon = 'BarChart2' WHERE slug = 'data-analytics'  AND (icon IS NULL OR icon = '');

-- Assign Perplexity AI to Research & Search
UPDATE tools
SET category_id = (SELECT id FROM categories WHERE slug = 'research-search')
WHERE slug = 'perplexity-ai';
