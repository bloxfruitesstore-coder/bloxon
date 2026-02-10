
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwuunyrkouyhuoyryuig.supabase.co';
const supabaseAnonKey = 'sb_publishable_4tw8cgJEAApMr0a7oD173w_Vl7TYGMJ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * ==========================================
 * ⚠️ IMPORTANT: DATABASE SETUP & FIXES
 * ==========================================
 * 
 * IF YOU GET ERRORS like "Could not find the 'inStock' column" OR "Bucket not found",
 * COPY AND PASTE THE SQL BELOW INTO SUPABASE SQL EDITOR AND RUN IT.
 * 
 * ==========================================
 * SQL CODE TO RUN:
 * ==========================================

-- 1. Fix Missing Columns (Run this if you get schema errors)
ALTER TABLE products ADD COLUMN IF NOT EXISTS inStock boolean default true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stockQuantity integer default 1;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes text;

-- 2. Create Products Table (if not exists)
-- Updated Constraint for Type to include 'STYLE', 'SWORD', and 'LEVELING'
-- NOTE: If the table already exists, you may need to drop the constraint and re-add it:
-- ALTER TABLE products DROP CONSTRAINT products_type_check;
-- ALTER TABLE products ADD CONSTRAINT products_type_check CHECK (type in ('ACCOUNT', 'STYLE', 'SWORD', 'LEVELING'));

create table if not exists products (
  id text primary key,
  name text not null,
  description text,
  image text,
  price numeric not null,
  type text check (type in ('ACCOUNT', 'STYLE', 'SWORD', 'LEVELING')),
  level integer,
  fruits text[],
  rareItems text[],
  paymentMethods text[],
  inStock boolean default true,
  stockQuantity integer default 1
);

-- 3. Create Profiles Table (Users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  email text,
  role text check (role in ('USER', 'ADMIN')) default 'USER',
  isBanned boolean default false,
  cart_data jsonb default '[]'::jsonb,
  wishlist_data jsonb default '[]'::jsonb,
  createdAt timestamp with time zone default now()
);

-- 4. Create Orders Table
create table if not exists orders (
  id text primary key,
  userId uuid references profiles(id),
  userName text,
  userEmail text,
  productId text references products(id),
  productName text,
  productPrice numeric,
  paymentMethod text,
  status text,
  proofImage text,
  robloxUsername text,
  country text,
  notes text,
  createdAt timestamp with time zone default now()
);

-- 5. Create Site Settings Table
create table if not exists site_settings (
  id integer primary key default 1,
  binanceWallet text,
  binanceQR text,
  robloxGamePassUrl text,
  importantNote text,
  welcomeMessage text,
  serverStatus text default 'ONLINE',
  emailjsServiceId text,
  emailjsTemplateId text,
  emailjsPublicKey text,
  constraint singleton check (id = 1)
);

-- 6. Create Notifications Table
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  userId uuid references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  isRead boolean default false,
  createdAt timestamp with time zone default now()
);

-- 7. Insert Default Settings (to prevent errors)
insert into site_settings (id, welcomeMessage, robloxGamePassUrl, serverStatus)
values (1, 'Welcome to Blox Store', 'https://roblox.com', 'ONLINE')
on conflict (id) do nothing;

-- 8. Create Storage Bucket for Product Images
-- NOTE: Storage buckets must be created via the Storage extension in Supabase, 
-- but you can try running this if your project supports it, or use the Dashboard.
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 9. Storage Policies (Allow Public Read, Authenticated/Public Upload)
-- Replace "public" with "auth" if you only want logged-in users to upload
create policy "Public Access" on storage.objects for select using ( bucket_id = 'product-images' );
create policy "Public Upload" on storage.objects for insert with check ( bucket_id = 'product-images' );

 * ==========================================
 */
