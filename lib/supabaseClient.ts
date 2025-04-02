import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Validate anon key format
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()
if (!anonKey.startsWith('eyJ')) {
  throw new Error('Invalid Supabase anon key format. Key should start with "eyJ"')
}

// Validate anon key length (should be around 200-300 characters)
if (anonKey.length < 100 || anonKey.length > 500) {
  throw new Error('Invalid Supabase anon key length. Please check your key.')
}

console.log('Initializing Supabase client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    }
  }
)

export interface Term {
  id: string
  word: string
  created_at: string
}

export interface Definition {
  id: string
  term_id: string
  user_id: string | null
  content: string
  upvotes: number
  downvotes: number
  created_at: string
} 