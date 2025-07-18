/*
  # Insert sample data for testing

  1. Sample Products
    - Therapy sessions
    - Assistive tools
    - Supplements

  2. Sample Notifications
    - Various notification types for testing

  3. Notes
    - This data is for development/testing purposes
    - In production, real data would be added through the application
*/

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url) VALUES
  ('Physical Therapy Session', 'One-on-one physical therapy session with certified therapist', 75.00, 'therapy', 'https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg'),
  ('Occupational Therapy Session', 'Personalized occupational therapy to improve daily living skills', 80.00, 'therapy', 'https://images.pexels.com/photos/7176319/pexels-photo-7176319.jpeg'),
  ('Wellness Consultation', 'Comprehensive wellness assessment and planning session', 60.00, 'therapy', 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg'),
  ('Walking Frame with Wheels', 'Lightweight aluminum walking frame with hand brakes', 120.00, 'assistive_tools', 'https://images.pexels.com/photos/6823567/pexels-photo-6823567.jpeg'),
  ('Ergonomic Shower Chair', 'Non-slip shower chair with adjustable height', 85.00, 'assistive_tools', 'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg'),
  ('Grab Bar Set', 'Stainless steel grab bars for bathroom safety', 45.00, 'assistive_tools', 'https://images.pexels.com/photos/6823569/pexels-photo-6823569.jpeg'),
  ('Daily Multivitamin', 'Complete multivitamin specially formulated for seniors', 25.00, 'supplements', 'https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg'),
  ('Omega-3 Fish Oil', 'High-quality omega-3 supplement for heart and brain health', 30.00, 'supplements', 'https://images.pexels.com/photos/3985164/pexels-photo-3985164.jpeg'),
  ('Calcium + Vitamin D', 'Bone health support with calcium and vitamin D3', 20.00, 'supplements', 'https://images.pexels.com/photos/3985165/pexels-photo-3985165.jpeg'),
  ('Memory Support Formula', 'Natural supplement to support cognitive function', 35.00, 'supplements', 'https://images.pexels.com/photos/3985166/pexels-photo-3985166.jpeg')
ON CONFLICT DO NOTHING;

-- Function to create sample notifications (will be called after users are created)
CREATE OR REPLACE FUNCTION create_sample_notifications()
RETURNS void AS $$
DECLARE
  sample_user_id uuid;
BEGIN
  -- Get a sample user ID (first older adult)
  SELECT id INTO sample_user_id 
  FROM users 
  WHERE role = 'older_adult' 
  LIMIT 1;
  
  -- Only create notifications if we have a user
  IF sample_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type) VALUES
      (sample_user_id, 'Welcome to UnifiedCare!', 'Your account has been successfully created. Start exploring your personalized care dashboard.', 'system'),
      (sample_user_id, 'Daily Journal Reminder', 'Don''t forget to log your mood, pain level, and sleep hours for today.', 'journal'),
      (sample_user_id, 'Medication Reminder', 'Time to take your evening medication. Please check your medication schedule.', 'medication')
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;