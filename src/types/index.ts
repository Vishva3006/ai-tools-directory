export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string | null;
  website_url: string;
  affiliate_url: string | null;
  logo_url: string | null;
  screenshot_url: string | null;
  pricing_type: 'free' | 'freemium' | 'paid' | 'enterprise';
  starting_price: number | null;
  category_id: string | null;
  tags: string[];
  features: string[];
  is_featured: boolean;
  is_approved: boolean;
  status: string;
  views_count: number;
  clicks_count: number;
  average_rating: number;
  reviews_count: number;
  created_at: string;
  category?: Category;
}

export interface Review {
  id: string;
  tool_id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string | null;
  pros: string[];
  cons: string[];
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  user?: Profile;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_id: string | null;
  category: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  views_count: number;
  reading_time: number;
  created_at: string;
  author?: Profile;
}

export interface ToolSubmission {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string | null;
  website_url: string;
  affiliate_url: string | null;
  logo_url: string | null;
  pricing_type: string;
  starting_price: number | null;
  category_id: string | null;
  tags: string[];
  features: string[];
  submitter_email: string;
  submitter_name: string | null;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  category?: Category;
}

export interface Favorite {
  id: string;
  user_id: string;
  tool_id: string;
  created_at: string;
}
