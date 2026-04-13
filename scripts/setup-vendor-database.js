import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    console.log('Starting database setup...')

    // 1. Add columns to profiles
    console.log('Adding role and vendor_id to profiles...')
    const { error: profileError } = await supabase.rpc('execute_sql', {
      sql: `
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin'));
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vendor_id UUID;
      `
    })
    if (profileError) console.log('Profiles update (expected if columns exist):', profileError.message)

    // 2. Create vendors table
    console.log('Creating vendors table...')
    const { error: vendorsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS vendors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
          shop_name TEXT NOT NULL,
          shop_description TEXT,
          shop_image_url TEXT,
          bank_account TEXT,
          bank_name TEXT,
          mpesa_phone TEXT,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
          approval_reason TEXT,
          total_earnings DECIMAL(10, 2) DEFAULT 0,
          total_orders INTEGER DEFAULT 0,
          rating DECIMAL(3, 2) DEFAULT 0,
          review_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    })
    if (vendorsError) console.log('Vendors table setup (expected if exists):', vendorsError.message)

    // 3. Add vendor_id to products
    console.log('Adding vendor_id to products...')
    const { error: productsError } = await supabase.rpc('execute_sql', {
      sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE;`
    })
    if (productsError) console.log('Products update (expected if column exists):', productsError.message)

    // 4. Create seller_earnings table
    console.log('Creating seller_earnings table...')
    const { error: earningsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS seller_earnings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
          order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
          amount DECIMAL(10, 2) NOT NULL,
          platform_fee DECIMAL(10, 2) DEFAULT 0,
          net_earnings DECIMAL(10, 2) NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'payout_pending', 'paid')),
          payout_date TIMESTAMP,
          transaction_id TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    })
    if (earningsError) console.log('Seller earnings setup (expected if exists):', earningsError.message)

    // 5. Add vendor_id to orders
    console.log('Adding vendor_id to orders...')
    const { error: ordersError } = await supabase.rpc('execute_sql', {
      sql: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;`
    })
    if (ordersError) console.log('Orders update (expected if column exists):', ordersError.message)

    console.log('✓ Database setup complete!')
  } catch (error) {
    console.error('Setup failed:', error)
    process.exit(1)
  }
}

setupDatabase()
