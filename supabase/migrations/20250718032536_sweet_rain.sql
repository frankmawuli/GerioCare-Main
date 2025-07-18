/*
  # Create orders and cart functionality

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `total_amount` (decimal)
      - `status` (enum: pending, processing, completed, cancelled)
      - `payment_reference` (text, for Paystack)
      - `created_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price` (decimal, price at time of order)
      - `created_at` (timestamp)

    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own orders and cart items
    - Admins can view all orders for management
*/

-- Create enum for order status
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  payment_reference text,
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Order items policies
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Cart items policies
CREATE POLICY "Users can manage own cart items"
  ON cart_items
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());