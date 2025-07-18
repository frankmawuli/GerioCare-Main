/*
  # Create products table for shop functionality

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `category` (enum: therapy, assistive_tools, supplements)
      - `image_url` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policy for all authenticated users to read active products
    - Add policy for admins to manage products
*/

-- Create enum for product categories
CREATE TYPE product_category AS ENUM ('therapy', 'assistive_tools', 'supplements');

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  category product_category NOT NULL,
  image_url text DEFAULT 'https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read active products
CREATE POLICY "All users can read active products"
  ON products
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Admins can manage all products
CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );