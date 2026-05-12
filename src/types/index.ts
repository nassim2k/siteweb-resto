export interface Profile {
  id: string
  email: string
  is_admin: boolean
  created_at: string
}

export interface Theme {
  id: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_image: string | null
  logo_url: string | null
  site_name: string
  updated_at: string
}

export interface Room {
  id: string
  name: string
  description: string | null
  image_url: string | null
  sort_order: number
  active: boolean
  created_at: string
}

export interface Table {
  id: string
  room_id: string
  name: string
  shape: 'circle' | 'rectangle' | 'square'
  capacity: number
  pos_x: number
  pos_y: number
  width: number
  height: number
  status: 'free' | 'occupied'
  created_at: string
}

export interface ProductFamily {
  id: string
  name: string
  description: string | null
  image_url: string | null
  sort_order: number
  active: boolean
  created_at: string
}

export interface Product {
  id: string
  family_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  active: boolean
  created_at: string
}

export interface Reservation {
  id: string
  table_id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  reservation_date: string
  reservation_time: string
  guest_count: number
  status: 'pending' | 'confirmed' | 'cancelled'
  confirmation_code: string | null
  created_at: string
}

export interface Order {
  id: string
  table_id: string | null
  customer_name: string
  customer_email: string
  customer_phone: string | null
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled'
  order_type: 'sur_place' | 'livraison'
  address: string | null
  delivery_status: string
  confirmation_code: string | null
  confirmed: boolean
  preparation_minutes: number
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  created_at: string
}

export interface AttributeDefinition {
  id: string
  name: string
  type: 'select' | 'text'
  sort_order: number
  created_at: string
}

export interface AttributeOption {
  id: string
  attribute_id: string
  value: string
  price_modifier: number
  sort_order: number
}

export interface AttributeDefinitionWithOptions extends AttributeDefinition {
  options: AttributeOption[]
}

export interface ProductAttribute {
  id: string
  product_id: string
  attribute_id: string
  value: string | null
}

export interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  attributes?: { attribute_name: string; option_value: string; price_modifier: number }[]
  text_values?: Record<string, string>
}
