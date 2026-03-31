-- SQL for Supabase SQL Editor
-- Filename: 005_rbac_schema_setup.sql

-- 1. Create user_roles ENUM type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_roles') THEN
        CREATE TYPE public.user_roles AS ENUM ('buyer', 'seller', 'admin');
    END IF;
END
$$ LANGUAGE plpgsql;

-- 2. Update public.profiles table to include role
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role public.user_roles NOT NULL DEFAULT 'buyer';

-- 3. Create public.sellers table
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- e.g., 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Update public.products table to include seller_id
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL;

-- 5. Update public.orders table to include seller_id (for seller dashboard visibility)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL;

-- 6. Update handle_new_user function to set default role and handle new profile fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone',
    'buyer' -- Default role for new users
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is set up correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Enable Row Level Security for new/updated tables
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for public.profiles
DROP POLICY IF EXISTS "Profiles: Users can view own profile" ON public.profiles;
CREATE POLICY "Profiles: Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Profiles: Users can insert own profile" ON public.profiles;
CREATE POLICY "Profiles: Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Profiles: Users can update own profile" ON public.profiles;
CREATE POLICY "Profiles: Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 9. RLS Policies for public.sellers
DROP POLICY IF EXISTS "Sellers: Authenticated users can view approved sellers" ON public.sellers;
CREATE POLICY "Sellers: Authenticated users can view approved sellers" ON public.sellers FOR SELECT USING (auth.role() = 'authenticated' AND status = 'approved');
DROP POLICY IF EXISTS "Sellers: Sellers can view/update their own seller profile" ON public.sellers;
CREATE POLICY "Sellers: Sellers can view/update their own seller profile" ON public.sellers FOR SELECT USING (auth.uid() = id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'seller'));
CREATE POLICY "Sellers: Sellers can insert their own seller profile" ON public.sellers FOR INSERT WITH CHECK (auth.uid() = id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'seller'));
CREATE POLICY "Sellers: Sellers can update their own seller profile" ON public.sellers FOR UPDATE USING (auth.uid() = id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'seller'));

-- 10. RLS Policies for public.products (updated for seller_id)
DROP POLICY IF EXISTS "Products: Viewable by everyone" ON public.products;
CREATE POLICY "Products: Viewable by everyone" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Products: Sellers can manage their own products" ON public.products;
CREATE POLICY "Products: Sellers can manage their own products" ON public.products FOR ALL USING (auth.uid() = seller_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'seller'));

-- 11. RLS Policies for public.orders (updated for seller_id)
DROP POLICY IF EXISTS "Orders: Users can view own orders" ON public.orders;
CREATE POLICY "Orders: Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Orders: Sellers can view orders for their products" ON public.orders;
CREATE POLICY "Orders: Sellers can view orders for their products" ON public.orders FOR SELECT USING (auth.uid() = seller_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'seller'));

-- 12. RLS Policies for public.order_items (updated for seller_id visibility)
DROP POLICY IF EXISTS "Order Items: Users can view own order items" ON public.order_items;
CREATE POLICY "Order Items: Users can view own order items" ON public.order_items 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Order Items: Sellers can view order items for their products" ON public.order_items;
CREATE POLICY "Order Items: Sellers can view order items for their products" ON public.order_items 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.seller_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'seller'))
  );

-- 13. RLS Policies for public.cart_items (no change, but re-asserting)
DROP POLICY IF EXISTS "Cart Items: Users can view own cart" ON public.cart_items;
CREATE POLICY "Cart Items: Users can view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Cart Items: Users can insert to own cart" ON public.cart_items;
CREATE POLICY "Cart Items: Users can insert to own cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Cart Items: Users can update own cart" ON public.cart_items;
CREATE POLICY "Cart Items: Users can update own cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Cart Items: Users can delete from own cart" ON public.cart_items;
CREATE POLICY "Cart Items: Users can delete from own cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- 14. RLS Policies for public.wishlist_items (no change, but re-asserting)
DROP POLICY IF EXISTS "Wishlist Items: Users can view own wishlist" ON public.wishlist_items;
CREATE POLICY "Wishlist Items: Users can view own wishlist" ON public.wishlist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Wishlist Items: Users can insert to own wishlist" ON public.wishlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Wishlist Items: Users can delete from own wishlist" ON public.wishlist_items FOR DELETE USING (auth.uid() = user_id);

-- 15. Grant usage on schema and sequences to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 16. Grant specific permissions for anon role if needed (e.g., for public product viewing)
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.profiles TO anon; -- Only for public profile data if exposed
GRANT SELECT ON public.sellers TO anon; -- Only for public seller data if exposed

-- 17. Update the create_order_atomic function to include seller_id
CREATE OR REPLACE FUNCTION create_order_atomic(
  p_user_id UUID,
  p_shipping_address TEXT,
  p_shipping_city TEXT,
  p_phone TEXT,
  p_payment_method TEXT
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_total DECIMAL(10, 2) := 0;
  v_product_id UUID;
  v_quantity INTEGER;
  v_product_price DECIMAL(10, 2);
  v_product_stock INTEGER;
  v_seller_id UUID;
  cart_item RECORD;
BEGIN
  -- Ensure RLS is enforced for products table during this function call
  SET LOCAL row_security.force_enable = TRUE;

  -- 1. Calculate total and validate stock within a single transaction
  FOR cart_item IN
    SELECT ci.product_id, ci.quantity, p.price, p.stock, p.name, p.seller_id
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = p_user_id
  LOOP
    -- Validate stock
    IF cart_item.stock < cart_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %', cart_item.name;
    END IF;
    v_total := v_total + (cart_item.price * cart_item.quantity);
    v_seller_id := cart_item.seller_id; -- Assuming all items in cart are from one seller for simplicity, or need more complex logic
  END LOOP;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'Cart is empty or all items have zero price';
  END IF;

  -- 2. Create Order
  INSERT INTO public.orders (user_id, total, shipping_address, shipping_city, phone, payment_method, seller_id)
  VALUES (p_user_id, v_total, p_shipping_address, p_shipping_city, p_phone, p_payment_method, v_seller_id)
  RETURNING id INTO v_order_id;

  -- 3. Add Cart Items to order_items and update stock
  FOR cart_item IN
    SELECT ci.product_id, ci.quantity, p.price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = p_user_id
  LOOP
    INSERT INTO public.order_items (order_id, product_id, quantity, price)
    VALUES (v_order_id, cart_item.product_id, cart_item.quantity, cart_item.price);

    UPDATE public.products
    SET stock = stock - cart_item.quantity, updated_at = NOW()
    WHERE id = cart_item.product_id;
  END LOOP;

  -- 4. Clear Cart
  DELETE FROM public.cart_items WHERE user_id = p_user_id;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION create_order_atomic(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
