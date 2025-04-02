import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

console.log('Initializing Supabase client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
)

// Test the connection
supabase.from('terms').select('count').limit(1).then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error)
  } else {
    console.log('Supabase connection successful')
  }
})

export type Term = {
  id: string
  word: string
  created_at: string
}

export type Definition = {
  id: string
  term_id: string
  user_id: string | null
  content: string
  upvotes: number
  downvotes: number
  created_at: string
} 