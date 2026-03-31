-- Add role to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller'));

-- Seller products table (products listed by sellers)
CREATE TABLE IF NOT EXISTS public.seller_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image_url TEXT,
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.seller_products ENABLE ROW LEVEL SECURITY;

-- Sellers can manage their own products
CREATE POLICY "Sellers can view own products" ON public.seller_products FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can insert own products" ON public.seller_products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own products" ON public.seller_products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own products" ON public.seller_products FOR DELETE USING (auth.uid() = seller_id);

-- Public can view active seller products
CREATE POLICY "Active seller products are viewable" ON public.seller_products FOR SELECT USING (is_active = true);
