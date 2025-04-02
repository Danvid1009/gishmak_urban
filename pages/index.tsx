import { useState, useEffect } from 'react'
import { supabase, Term, Definition } from '../lib/supabaseClient'
import Link from 'next/link'
import Image from 'next/image'

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

  const handleVote = async (definitionId: string, voteType: 'up' | 'down') => {
    try {
      const field = voteType === 'up' ? 'upvotes' : 'downvotes'
      
      // Get current definition
      const { data: currentDef, error: fetchError } = await supabase
        .from('definitions')
        .select('*')
        .eq('id', definitionId)
        .single()

      if (fetchError) {
        console.error('Error fetching current votes:', fetchError)
        return
      }

      if (!currentDef) {
        console.error('Definition not found')
        return
      }

      // Update the vote count
      const { error: updateError } = await supabase
        .from('definitions')
        .update({
          [field]: ((currentDef as Definition)[field] || 0) + 1
        })
        .eq('id', definitionId)

      if (updateError) {
        console.error('Error updating votes:', updateError)
        return
      }

      // Refresh the terms to show updated vote count
      fetchTerms()
    } catch (err) {
      console.error('Error voting:', err)
    }
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-900 via-blue-600 to-blue-300">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/background.png"
          alt="Gishmak Dictionary Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />
      </div>

      {/* Content with semi-transparent overlay */}
      <div className="relative z-10 min-h-screen bg-white/80">
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold text-center mb-8 text-blue-900">Gishmak Dictionary</h1>
          
          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
              Error: {error}
            </div>
          )}

          <div className="max-w-2xl mx-auto mb-8">
            <input
              type="text"
              placeholder="Search terms..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid gap-6">
            {terms.map((term) => (
              <div key={term.id} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 transition-all hover:bg-white">
                <Link href={`/term/${term.word}`}>
                  <h2 className="text-2xl font-bold text-blue-900 hover:text-blue-700 hover:underline">{term.word}</h2>
                </Link>
                {term.definitions[0] && (
                  <>
                    <p className="mt-2 text-gray-700 whitespace-pre-line">{term.definitions[0].content}</p>
                    <div className="mt-4 flex items-center text-sm text-gray-600">
                      <button 
                        onClick={() => handleVote(term.definitions[0].id, 'up')}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <span className="text-lg">↑</span>
                        <span>{term.definitions[0].upvotes || 0}</span>
                      </button>
                      <button 
                        onClick={() => handleVote(term.definitions[0].id, 'down')}
                        className="flex items-center space-x-1 ml-4 hover:text-red-600 transition-colors"
                      >
                        <span className="text-lg">↓</span>
                        <span>{term.definitions[0].downvotes || 0}</span>
                      </button>
                      <span className="ml-4">• {new Date(term.created_at).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="fixed bottom-8 right-8">
            <Link
              href="/submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            >
              Submit New Term
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
} 