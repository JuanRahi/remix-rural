import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient('https://sgiqwxjomydeuzhkhtsk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODU2Mjg3OCwiZXhwIjoxOTU0MTM4ODc4fQ.0ZPtdmbYmEbUFZCldqzBhMhvyqNcOw_5NWQHxqJ6KG8')