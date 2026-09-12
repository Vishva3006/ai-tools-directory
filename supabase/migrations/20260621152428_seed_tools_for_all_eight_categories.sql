
-- Helper: fetch category IDs into variables for clarity
DO $$
DECLARE
  v_writing    uuid := (SELECT id FROM categories WHERE slug = 'text-writing');
  v_image      uuid := (SELECT id FROM categories WHERE slug = 'image-generation');
  v_video      uuid := (SELECT id FROM categories WHERE slug = 'video-animation');
  v_coding     uuid := (SELECT id FROM categories WHERE slug = 'code-development');
  v_prod       uuid := (SELECT id FROM categories WHERE slug = 'productivity');
  v_marketing  uuid := (SELECT id FROM categories WHERE slug = 'marketing-seo');
  v_education  uuid := (SELECT id FROM categories WHERE slug = 'education');
  v_research   uuid := (SELECT id FROM categories WHERE slug = 'research-search');
BEGIN

-- ── Writing ──────────────────────────────────────────────────────────────────
INSERT INTO tools (name, slug, description, long_description, website_url, pricing_type, starting_price,
                   category_id, tags, features, is_featured, is_approved, status,
                   views_count, clicks_count, average_rating, reviews_count)
VALUES
  ('Grammarly', 'grammarly',
   'AI-powered writing assistant that checks grammar, spelling, style, and tone',
   'Grammarly uses advanced AI to help you write clearly and correctly across any platform.',
   'https://grammarly.com', 'freemium', 12,
   v_writing, ARRAY['writing','grammar','editing'], ARRAY['Grammar check','Tone detector','Plagiarism check'],
   true, true, 'active', 98000, 34000, 4.6, 2100),

  ('Hemingway Editor', 'hemingway-editor',
   'Highlights complex sentences and common errors to make your writing bold and clear',
   'Hemingway Editor helps writers produce clear, concise prose by highlighting readability issues.',
   'https://hemingwayapp.com', 'freemium', 10,
   v_writing, ARRAY['writing','editing','readability'], ARRAY['Readability score','Sentence highlighting','Export to Word/PDF'],
   false, true, 'active', 22000, 7800, 4.2, 390),

  ('Sudowrite', 'sudowrite',
   'AI writing partner for fiction authors — brainstorm, draft, and rewrite with ease',
   'Sudowrite is built for creative writers, offering story generation, character development, and revision tools.',
   'https://sudowrite.com', 'paid', 19,
   v_writing, ARRAY['fiction','creative writing','storytelling'], ARRAY['Story Bible','Describe tool','Brainstorm'],
   false, true, 'active', 18000, 6200, 4.3, 280)
ON CONFLICT (slug) DO NOTHING;

-- ── Image Generation ─────────────────────────────────────────────────────────
INSERT INTO tools (name, slug, description, long_description, website_url, pricing_type, starting_price,
                   category_id, tags, features, is_featured, is_approved, status,
                   views_count, clicks_count, average_rating, reviews_count)
VALUES
  ('Stable Diffusion', 'stable-diffusion',
   'Open-source AI image generator capable of producing photorealistic images from text',
   'Stable Diffusion is a powerful open-source model you can run locally or via hosted services.',
   'https://stability.ai', 'free', NULL,
   v_image, ARRAY['image','open-source','text-to-image'], ARRAY['Text-to-image','Image-to-image','Inpainting','ControlNet'],
   true, true, 'active', 75000, 28000, 4.5, 1400),

  ('Adobe Firefly', 'adobe-firefly',
   'Adobe''s generative AI for images, text effects, and creative content — trained on licensed content',
   'Firefly integrates directly into Adobe Creative Cloud apps for a seamless creative workflow.',
   'https://firefly.adobe.com', 'freemium', 5,
   v_image, ARRAY['image','adobe','design'], ARRAY['Text to Image','Generative Fill','Text Effects','Color Match'],
   true, true, 'active', 52000, 19000, 4.4, 870),

  ('Leonardo AI', 'leonardo-ai',
   'AI image generation platform with fine-tuned models for game assets and concept art',
   'Leonardo AI offers a suite of AI-powered tools tailored for game developers and concept artists.',
   'https://leonardo.ai', 'freemium', 12,
   v_image, ARRAY['image','game art','concept art'], ARRAY['Real-Time Canvas','AI Canvas','Custom Models'],
   false, true, 'active', 31000, 11000, 4.3, 540)
ON CONFLICT (slug) DO NOTHING;

-- ── Video ─────────────────────────────────────────────────────────────────────
INSERT INTO tools (name, slug, description, long_description, website_url, pricing_type, starting_price,
                   category_id, tags, features, is_featured, is_approved, status,
                   views_count, clicks_count, average_rating, reviews_count)
VALUES
  ('Synthesia', 'synthesia',
   'Create professional AI videos with realistic avatars — no camera or microphone needed',
   'Synthesia lets you generate studio-quality videos from text scripts using AI avatars.',
   'https://synthesia.io', 'paid', 22,
   v_video, ARRAY['video','avatar','presentations'], ARRAY['160+ AI Avatars','50+ Languages','Custom Avatar','Screen Recording'],
   true, true, 'active', 47000, 17000, 4.5, 920),

  ('Pika Labs', 'pika-labs',
   'Turn text, images, and video clips into expressive AI-generated videos',
   'Pika Labs is a fast-growing text-to-video platform delivering high-quality short-form video generation.',
   'https://pika.art', 'freemium', 8,
   v_video, ARRAY['video','text-to-video','animation'], ARRAY['Text to Video','Image to Video','Lip Sync','Extend Video'],
   true, true, 'active', 38000, 14000, 4.3, 610),

  ('HeyGen', 'heygen',
   'AI video generator with talking avatars for marketing, training, and social media',
   'HeyGen makes creating personalized video messages at scale fast, simple, and cost-effective.',
   'https://heygen.com', 'freemium', 29,
   v_video, ARRAY['video','avatar','marketing'], ARRAY['Talking Photos','Video Translation','Streaming Avatar','API Access'],
   false, true, 'active', 29000, 10500, 4.4, 480)
ON CONFLICT (slug) DO NOTHING;

-- ── Coding ────────────────────────────────────────────────────────────────────
INSERT INTO tools (name, slug, description, long_description, website_url, pricing_type, starting_price,
                   category_id, tags, features, is_featured, is_approved, status,
                   views_count, clicks_count, average_rating, reviews_count)
VALUES
  ('Cursor', 'cursor',
   'AI-first code editor built on VS Code with deep codebase understanding and chat',
   'Cursor is a fork of VS Code that embeds powerful AI models directly into your development workflow.',
   'https://cursor.com', 'freemium', 20,
   v_coding, ARRAY['coding','IDE','AI editor'], ARRAY['Tab autocomplete','Codebase chat','Multi-file edit','Debug with AI'],
   true, true, 'active', 64000, 24000, 4.8, 1100),

  ('Tabnine', 'tabnine',
   'AI code completion tool that learns your codebase and coding style',
   'Tabnine offers privacy-first AI code completion that works inside your existing IDE.',
   'https://tabnine.com', 'freemium', 12,
   v_coding, ARRAY['coding','autocomplete','IDE'], ARRAY['IDE integrations','Team training','Private model','Code review'],
   false, true, 'active', 28000, 9400, 4.1, 560),

  ('Replit AI', 'replit-ai',
   'Browser-based coding environment with built-in AI coding assistance',
   'Replit AI combines a cloud IDE with an AI pair programmer so you can build and deploy from anywhere.',
   'https://replit.com', 'freemium', 0,
   v_coding, ARRAY['coding','cloud IDE','deployment'], ARRAY['Complete Code','Explain Code','Generate','Deploy instantly'],
   false, true, 'active', 33000, 12000, 4.2, 490)
ON CONFLICT (slug) DO NOTHING;

-- ── Productivity ──────────────────────────────────────────────────────────────
INSERT INTO tools (name, slug, description, long_description, website_url, pricing_type, starting_price,
                   category_id, tags, features, is_featured, is_approved, status,
                   views_count, clicks_count, average_rating, reviews_count)
VALUES
  ('Zapier AI', 'zapier-ai',
   'Automate workflows across 6,000+ apps with AI-powered zap creation',
   'Zapier''s AI features let you describe automations in plain English and deploy them instantly.',
   'https://zapier.com', 'freemium', 19,
   v_prod, ARRAY['automation','workflows','integration'], ARRAY['6,000+ app integrations','AI Zap builder','Multi-step zaps','Filters'],
   false, true, 'active', 41000, 15000, 4.3, 680),

  ('Mem.ai', 'mem-ai',
   'AI-powered personal knowledge base that organizes notes and surfaces insights automatically',
   'Mem uses AI to connect your notes, highlight important information, and answer questions about your knowledge base.',
   'https://mem.ai', 'freemium', 10,
   v_prod, ARRAY['notes','knowledge base','PKM'], ARRAY['Smart search','AI chat','Auto-organize','Team spaces'],
   false, true, 'active', 17000, 5900, 4.0, 230)
ON CONFLICT (slug) DO NOTHING;

-- ── Marketing ─────────────────────────────────────────────────────────────────
INSERT INTO tools (name, slug, description, long_description, website_url, pricing_type, starting_price,
                   category_id, tags, features, is_featured, is_approved, status,
                   views_count, clicks_count, average_rating, reviews_count)
VALUES
  ('Surfer SEO', 'surfer-seo',
   'AI-driven content optimization tool that helps you rank higher on Google',
   'Surfer SEO analyzes top-ranking pages and gives you data-driven guidelines to optimize your content.',
   'https://surferseo.com', 'paid', 89,
   v_marketing, ARRAY['SEO','content','marketing'], ARRAY['Content Editor','Keyword Research','Audit','SERP Analyzer'],
   true, true, 'active', 39000, 14000, 4.5, 760),

  ('AdCreative.ai', 'adcreative-ai',
   'Generate high-converting ad creatives and social media visuals in seconds using AI',
   'AdCreative.ai uses machine learning to generate and score ad creatives, saving hours of design work.',
   'https://adcreative.ai', 'paid', 29,
   v_marketing, ARRAY['ads','creatives','social media'], ARRAY['Ad generation','Creative scoring','Brand kit','Competitor analysis'],
   false, true, 'active', 21000, 7700, 4.2, 380),

  ('Brandwatch', 'brandwatch',
   'AI-powered consumer intelligence and social media analytics platform',
   'Brandwatch helps brands monitor conversations, analyze sentiment, and uncover insights at scale.',
   'https://brandwatch.com', 'paid', 800,
   v_marketing, ARRAY['analytics','social listening','brand'], ARRAY['Social listening','Sentiment analysis','Audience insights','API'],
   false, true, 'active', 14000, 4800, 4.1, 190)
ON CONFLICT (slug) DO NOTHING;

-- ── Education ─────────────────────────────────────────────────────────────────
INSERT INTO tools (name, slug, description, long_description, website_url, pricing_type, starting_price,
                   category_id, tags, features, is_featured, is_approved, status,
                   views_count, clicks_count, average_rating, reviews_count)
VALUES
  ('Khan Academy Khanmigo', 'khanmigo',
   'AI-powered tutor by Khan Academy for students and teachers',
   'Khanmigo is Khan Academy''s Socratic AI tutor that guides learners with questions rather than giving direct answers.',
   'https://khanacademy.org/khan-labs', 'freemium', 4,
   v_education, ARRAY['education','tutoring','K-12'], ARRAY['Socratic tutoring','Lesson plans','Writing coach','Debate practice'],
   true, true, 'active', 27000, 9800, 4.6, 540),

  ('Duolingo Max', 'duolingo-max',
   'AI-enhanced language learning with GPT-4 powered conversation practice',
   'Duolingo Max adds Explain My Answer and Roleplay features powered by GPT-4 for immersive language learning.',
   'https://duolingo.com', 'freemium', 7,
   v_education, ARRAY['language learning','education','AI'], ARRAY['Roleplay','Explain My Answer','Streak repair','Leaderboards'],
   true, true, 'active', 61000, 22000, 4.7, 1800),

  ('Coursera Coach', 'coursera-coach',
   'AI learning assistant embedded in Coursera that personalizes your learning journey',
   'Coursera Coach uses AI to answer questions, summarize content, and recommend next steps in your courses.',
   'https://coursera.org', 'freemium', 49,
   v_education, ARRAY['courses','learning','upskilling'], ARRAY['Q&A assistant','Course summaries','Learning path','Certificates'],
   false, true, 'active', 35000, 12500, 4.4, 680),

  ('Socratic by Google', 'socratic',
   'Snap a photo of any question and get step-by-step explanations powered by Google AI',
   'Socratic by Google helps students understand homework by using visual AI to break down problems.',
   'https://socratic.org', 'free', NULL,
   v_education, ARRAY['homework','students','visual AI'], ARRAY['Photo scan','Step-by-step','Subjects: Math/Science/History','Free forever'],
   false, true, 'active', 19000, 7100, 4.5, 320)
ON CONFLICT (slug) DO NOTHING;

-- ── Research ──────────────────────────────────────────────────────────────────
INSERT INTO tools (name, slug, description, long_description, website_url, pricing_type, starting_price,
                   category_id, tags, features, is_featured, is_approved, status,
                   views_count, clicks_count, average_rating, reviews_count)
VALUES
  ('Elicit', 'elicit',
   'AI research assistant that automates literature reviews and evidence synthesis',
   'Elicit uses language models to search, summarize, and organize academic papers for researchers.',
   'https://elicit.com', 'freemium', 10,
   v_research, ARRAY['research','academic','literature'], ARRAY['Paper search','Concept extraction','Summary tables','Citation export'],
   true, true, 'active', 23000, 8300, 4.5, 430),

  ('Consensus', 'consensus',
   'AI search engine that extracts findings directly from scientific research papers',
   'Consensus helps you search millions of research papers and get concise AI-generated answers backed by evidence.',
   'https://consensus.app', 'freemium', 9,
   v_research, ARRAY['research','science','academic'], ARRAY['Evidence synthesis','Consensus meter','Copilot','Citation export'],
   true, true, 'active', 18000, 6500, 4.4, 350),

  ('Semantic Scholar', 'semantic-scholar',
   'Free AI-powered research tool for exploring over 200 million academic papers',
   'Built by the Allen Institute for AI, Semantic Scholar uses NLP to surface the most relevant research.',
   'https://semanticscholar.org', 'free', NULL,
   v_research, ARRAY['research','papers','academic'], ARRAY['200M+ papers','TLDR summaries','Citation graph','Author profiles'],
   false, true, 'active', 31000, 10800, 4.3, 580),

  ('ChatPDF', 'chatpdf',
   'Chat with any PDF — ask questions and get instant answers from documents',
   'ChatPDF lets you upload any PDF and have a conversation with it, making research and studying faster.',
   'https://chatpdf.com', 'freemium', 5,
   v_research, ARRAY['PDF','documents','research'], ARRAY['PDF chat','Source citations','Multi-language','API access'],
   false, true, 'active', 26000, 9600, 4.2, 470)
ON CONFLICT (slug) DO NOTHING;

END $$;
