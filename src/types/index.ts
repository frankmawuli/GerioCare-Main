export interface User {
  id: string;
  email: string;
  role: 'older_adult' | 'caregiver' | 'therapist' | 'admin';
  first_name: string;
  last_name: string;
  phone?: string;
  is_subscribed?: boolean;
  subscription_expires_at?: string;
  assigned_caregiver_id?: string;
  assigned_therapist_id?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'therapy' | 'assistive_tools' | 'supplements';
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'medication' | 'journal' | 'therapy' | 'payment' | 'admin' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  mood: number;
  pain_level: number;
  sleep_hours: number;
  notes: string;
  date: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  older_adult_id: string;
  caregiver_id?: string;
  therapist_id?: string;
  created_at: string;
}