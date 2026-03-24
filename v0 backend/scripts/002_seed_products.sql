-- Seed products for Gikomba Shop
INSERT INTO public.products (name, description, price, original_price, image_url, category, stock, rating, review_count, is_featured, is_new) VALUES
-- Women's Fashion
('Ankara Print Dress', 'Beautiful African print maxi dress, perfect for any occasion', 2500, 3500, '/products/ankara-dress.jpg', 'women', 50, 4.8, 124, true, false),
('Denim Jacket', 'Classic denim jacket with modern styling', 1800, 2500, '/products/denim-jacket.jpg', 'women', 35, 4.5, 89, false, true),
('Kitenge Blouse', 'Elegant kitenge print blouse for office or casual wear', 1200, 1800, '/products/kitenge-blouse.jpg', 'women', 60, 4.6, 156, true, false),
('Maxi Skirt', 'Flowing maxi skirt in vibrant colors', 1500, 2000, '/products/maxi-skirt.jpg', 'women', 45, 4.4, 78, false, false),

-- Men's Fashion
('Casual Polo Shirt', 'Premium cotton polo shirt, comfortable fit', 1200, 1800, '/products/polo-shirt.jpg', 'men', 80, 4.7, 203, true, false),
('Slim Fit Jeans', 'Modern slim fit jeans in dark wash', 2200, 3000, '/products/slim-jeans.jpg', 'men', 55, 4.5, 167, false, true),
('African Print Shirt', 'Stylish African print shirt for men', 1600, 2200, '/products/african-shirt.jpg', 'men', 40, 4.8, 98, true, false),
('Cargo Shorts', 'Durable cargo shorts for everyday wear', 1000, 1500, '/products/cargo-shorts.jpg', 'men', 70, 4.3, 145, false, false),

-- Electronics
('Bluetooth Earbuds', 'Wireless earbuds with premium sound quality', 2500, 3500, '/products/earbuds.jpg', 'electronics', 100, 4.6, 312, true, true),
('Smart Watch', 'Fitness tracker with heart rate monitor', 4500, 6000, '/products/smartwatch.jpg', 'electronics', 30, 4.4, 89, true, false),
('Phone Power Bank', '10000mAh portable charger', 1500, 2000, '/products/powerbank.jpg', 'electronics', 120, 4.7, 256, false, false),
('USB-C Cable', 'Fast charging USB-C cable, 2 meters', 500, 800, '/products/usb-cable.jpg', 'electronics', 200, 4.5, 178, false, false),

-- Home & Living
('Maasai Throw Blanket', 'Traditional Maasai pattern throw blanket', 3500, 4500, '/products/maasai-blanket.jpg', 'home', 25, 4.9, 67, true, false),
('Woven Storage Basket', 'Handwoven African storage basket', 1800, 2500, '/products/woven-basket.jpg', 'home', 40, 4.6, 92, false, true),
('Cushion Covers Set', 'Set of 4 African print cushion covers', 2000, 2800, '/products/cushion-covers.jpg', 'home', 35, 4.5, 84, false, false),
('Wall Art Canvas', 'Beautiful African wildlife canvas print', 2500, 3500, '/products/wall-art.jpg', 'home', 20, 4.7, 56, true, false),

-- Kids
('Kids T-Shirt Pack', 'Pack of 3 colorful cotton t-shirts', 1200, 1800, '/products/kids-tshirts.jpg', 'kids', 60, 4.6, 134, false, true),
('Baby Romper', 'Soft cotton baby romper with African print', 800, 1200, '/products/baby-romper.jpg', 'kids', 45, 4.8, 98, true, false),
('Kids Sneakers', 'Comfortable sneakers for active kids', 1800, 2500, '/products/kids-sneakers.jpg', 'kids', 50, 4.5, 112, false, false),
('School Backpack', 'Durable school backpack with multiple pockets', 1500, 2000, '/products/school-bag.jpg', 'kids', 70, 4.7, 189, true, false),

-- Accessories
('Beaded Necklace', 'Handcrafted Kenyan beaded necklace', 800, 1200, '/products/beaded-necklace.jpg', 'accessories', 80, 4.8, 167, true, false),
('Leather Belt', 'Genuine leather belt with brass buckle', 1200, 1800, '/products/leather-belt.jpg', 'accessories', 55, 4.5, 98, false, false),
('Sisal Handbag', 'Traditional woven sisal handbag', 2500, 3500, '/products/sisal-bag.jpg', 'accessories', 30, 4.9, 78, true, true),
('Sunglasses', 'UV protection sunglasses, stylish frames', 1000, 1500, '/products/sunglasses.jpg', 'accessories', 90, 4.4, 156, false, false);
