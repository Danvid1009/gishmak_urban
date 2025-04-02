import { useState, useEffect } from 'react'
import { supabase, Term, Definition } from '../lib/supabaseClient'
import Link from 'next/link'

export default function Home() {
  const [terms, setTerms] = useState<(Term & { definitions: Definition[] })[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
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
      return
    }

    setTerms(data || [])
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Urban Dictionary Clone</h1>
        
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