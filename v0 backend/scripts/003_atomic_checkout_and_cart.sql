-- Atomic cart upsert to prevent race conditions.
CREATE OR REPLACE FUNCTION public.upsert_cart_item(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cart_id UUID;
BEGIN
  INSERT INTO public.cart_items (user_id, product_id, quantity)
  VALUES (p_user_id, p_product_id, p_quantity)
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET
    quantity = public.cart_items.quantity + EXCLUDED.quantity,
    updated_at = NOW()
  RETURNING id INTO v_cart_id;

  RETURN v_cart_id;
END;
$$;

-- Atomic checkout:
-- 1) lock cart rows
-- 2) validate stock
-- 3) create order + order_items
-- 4) deduct stock
-- 5) clear cart
CREATE OR REPLACE FUNCTION public.create_order_from_cart(
  p_user_id UUID,
  p_shipping_address TEXT,
  p_shipping_city TEXT,
  p_phone TEXT,
  p_payment_method TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_total NUMERIC(10, 2) := 0;
  v_shortage_count INTEGER;
BEGIN
  PERFORM 1 FROM public.cart_items WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  SELECT COUNT(*)
  INTO v_shortage_count
  FROM public.cart_items c
  JOIN public.products p ON p.id = c.product_id
  WHERE c.user_id = p_user_id
    AND p.stock < c.quantity;

  IF v_shortage_count > 0 THEN
    RAISE EXCEPTION 'Insufficient stock for one or more items';
  END IF;

  SELECT COALESCE(SUM(p.price * c.quantity), 0)
  INTO v_total
  FROM public.cart_items c
  JOIN public.products p ON p.id = c.product_id
  WHERE c.user_id = p_user_id;

  INSERT INTO public.orders (
    user_id,
    total,
    shipping_address,
    shipping_city,
    phone,
    payment_method,
    status,
    payment_status
  )
  VALUES (
    p_user_id,
    v_total,
    p_shipping_address,
    p_shipping_city,
    p_phone,
    p_payment_method,
    'pending',
    'pending'
  )
  RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (order_id, product_id, quantity, price)
  SELECT v_order_id, c.product_id, c.quantity, p.price
  FROM public.cart_items c
  JOIN public.products p ON p.id = c.product_id
  WHERE c.user_id = p_user_id;

  UPDATE public.products p
  SET stock = p.stock - c.quantity,
      updated_at = NOW()
  FROM public.cart_items c
  WHERE c.user_id = p_user_id
    AND p.id = c.product_id;

  DELETE FROM public.cart_items WHERE user_id = p_user_id;

  RETURN jsonb_build_object('id', v_order_id, 'total', v_total);
END;
$$;
