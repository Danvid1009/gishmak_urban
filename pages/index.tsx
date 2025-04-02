import { useState, useEffect } from 'react'
import { supabase, Term, Definition } from '../lib/supabaseClient'
import Link from 'next/link'

export default function Home() {
  const [terms, setTerms] = useState<(Term & { definitions: Definition[] })[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('Fetching terms...')
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    try {
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Starting terms fetch...')
      
      const { data, error } = await supabase
        .from('terms')
        .select(`
          *,
          definitions (*)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching terms:', error)
        setError(error.message)
        return
      }

      console.log('Terms fetched successfully:', data)
      setTerms(data || [])
    } catch (err) {
      console.error('Unexpected error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Urban Dictionary Clone</h1>
        
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
            Error: {error}
          </div>
        )}

        <div className="max-w-2xl mx-auto mb-8">
          <input
            type="text"
            placeholder="Search terms..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid gap-6">
          {terms.map((term) => (
            <div key={term.id} className="bg-white rounded-lg shadow-md p-6">
              <Link href={`/term/${term.word}`}>
                <h2 className="text-2xl font-bold text-primary hover:underline">{term.word}</h2>
              </Link>
              {term.definitions[0] && (
                <p className="mt-2 text-gray-600">{term.definitions[0].content}</p>
              )}
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span>↑ {term.definitions[0]?.upvotes || 0}</span>
                <span className="mx-2">↓ {term.definitions[0]?.downvotes || 0}</span>
                <span>• {new Date(term.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-8 right-8">
          <Link
            href="/submit"
            className="bg-primary text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            Submit New Term
          </Link>
        </div>
      </main>
    </div>
  )
} 