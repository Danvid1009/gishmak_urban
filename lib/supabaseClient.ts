import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Validate anon key format
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('eyJ')) {
  throw new Error('Invalid Supabase anon key format. Key should start with "eyJ"')
}

console.log('Initializing Supabase client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

// Test the connection
supabase.from('terms').select('count').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection test failed:', error)
      if (error.code === '401') {
        console.error('Authentication failed. Please check your anon key.')
      }
    } else {
      console.log('Supabase connection test successful')
    }
  })
  .catch(err => {
    console.error('Unexpected error during Supabase connection test:', err)
  })

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