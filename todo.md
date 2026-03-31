# Gikomba Shop Restoration & Backend Improvement TODO

## Frontend Restoration (Design Preserved)
- [x] Extract backup files and analyze structure
- [x] Copy Next.js app directory with pages and layout
- [x] Copy components (header, footer, hero, products, etc.)
- [x] Copy hooks (use-products, use-orders, use-debounce, etc.)
- [x] Copy lib utilities and types
- [x] Copy styles and public assets
- [x] Verify frontend builds without errors
- [x] Test frontend UI rendering

## Backend Architecture Migration (Express + tRPC)
- [ ] Migrate cart API routes to tRPC procedures
- [ ] Migrate products API routes to tRPC procedures
- [ ] Migrate orders API routes to tRPC procedures
- [ ] Migrate M-Pesa payment routes to tRPC procedures
- [ ] Migrate seller/profile API routes to tRPC procedures
- [ ] Migrate seller/products API routes to tRPC procedures
- [ ] Migrate seller/orders API routes to tRPC procedures
- [ ] Migrate wishlist API routes to tRPC procedures
- [ ] Migrate authentication routes to tRPC procedures
- [ ] Create comprehensive database schema in drizzle/schema.ts
- [ ] Set up database migrations

## Database & Supabase Integration
- [ ] Configure Supabase connection string
- [ ] Create users table schema
- [ ] Create products table schema
- [ ] Create cart_items table schema
- [ ] Create orders table schema
- [ ] Create order_items table schema
- [ ] Create wishlist table schema
- [ ] Create seller_profiles table schema
- [ ] Create payment_transactions table schema
- [ ] Set up database relationships and constraints
- [ ] Execute SQL migrations

## Environment Variables & Secrets
- [ ] Configure SUPABASE_URL
- [ ] Configure SUPABASE_ANON_KEY
- [ ] Configure SUPABASE_SERVICE_ROLE_KEY
- [ ] Configure M-Pesa API credentials
- [ ] Configure JWT_SECRET
- [ ] Configure OAUTH_SERVER_URL
- [ ] Configure VITE_APP_ID
- [ ] Configure VITE_OAUTH_PORTAL_URL
- [ ] Configure VERCEL_ANALYTICS
- [ ] Configure NEXT_PUBLIC_SUPABASE_URL
- [ ] Configure NEXT_PUBLIC_SUPABASE_ANON_KEY

## API Routes & Services
- [ ] Implement cart service with tRPC
- [ ] Implement products service with tRPC
- [ ] Implement orders service with tRPC
- [ ] Implement M-Pesa payment integration
- [ ] Implement seller management service
- [ ] Implement wishlist service
- [ ] Implement authentication service
- [ ] Add input validation with Zod
- [ ] Add error handling and logging
- [ ] Add type safety across all procedures

## Testing & Validation
- [ ] Test cart operations (add, update, delete, get)
- [ ] Test product listing and filtering
- [ ] Test order creation and retrieval
- [ ] Test M-Pesa payment initiation
- [ ] Test seller operations
- [ ] Test wishlist operations
- [ ] Test authentication flows
- [ ] Verify all API responses are properly typed
- [ ] Test error handling and edge cases

## Deployment
- [ ] Push code to GitHub (samgachara/v0-gikomba-shop)
- [ ] Configure Vercel deployment
- [ ] Set up environment variables in Vercel
- [ ] Deploy to Vercel
- [ ] Verify Supabase connection in production
- [ ] Test payment processing in production
- [ ] Monitor deployment logs

## Post-Deployment
- [ ] Verify all features work end-to-end
- [ ] Test user authentication flow
- [ ] Test shopping cart functionality
- [ ] Test checkout and payment processing
- [ ] Test seller dashboard
- [ ] Verify analytics integration
- [ ] Check performance metrics
- [ ] Create deployment checkpoint
