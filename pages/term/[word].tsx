import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase, Term, Definition } from '../../lib/supabaseClient'
import Link from 'next/link'
import Image from 'next/image'

export default function TermPage() {
  const router = useRouter()
  const { word } = router.query
  const [term, setTerm] = useState<Term | null>(null)
  const [definitions, setDefinitions] = useState<Definition[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (word && typeof word === 'string') {
      fetchTerm(word)
    }
  }, [word])

  const fetchTerm = async (word: string) => {
    try {
      const { data: termData, error: termError } = await supabase
        .from('terms')
        .select('*')
        .eq('word', word.toLowerCase())
        .single()

      if (termError) {
        console.error('Error fetching term:', termError)
        setError('Term not found')
        return
      }

      setTerm(termData)

      const { data: definitionsData, error: definitionsError } = await supabase
        .from('definitions')
        .select('*')
        .eq('term_id', termData.id)
        .order('upvotes', { ascending: false })

      if (definitionsError) {
        console.error('Error fetching definitions:', definitionsError)
        setError('Error loading definitions')
        return
      }

      setDefinitions(definitionsData || [])
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
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

      // Refresh the definitions to show updated vote count
      if (term) {
        fetchTerm(term.word)
      }
    } catch (err) {
      console.error('Error voting:', err)
    }
  }

  if (!term && !error) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-blue-900 via-blue-600 to-blue-300">
        <div className="relative z-10 min-h-screen bg-white/80">
          <main className="container mx-auto px-4 py-8">
            <div className="text-center">Loading...</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
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
          <div className="max-w-2xl mx-auto">
            <Link
              href="/"
              className="inline-block mb-6 text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dictionary
            </Link>

            {error ? (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold text-blue-900 mb-8">{term?.word}</h1>
                
                <div className="space-y-6">
                  {definitions.map((def) => (
                    <div key={def.id} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 transition-all hover:bg-white">
                      <p className="text-gray-700 whitespace-pre-line">{def.content}</p>
                      <div className="mt-4 flex items-center text-sm text-gray-600">
                        <button 
                          onClick={() => handleVote(def.id, 'up')}
                          className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                        >
                          <span className="text-lg">↑</span>
                          <span>{def.upvotes || 0}</span>
                        </button>
                        <button 
                          onClick={() => handleVote(def.id, 'down')}
                          className="flex items-center space-x-1 ml-4 hover:text-red-600 transition-colors"
                        >
                          <span className="text-lg">↓</span>
                          <span>{def.downvotes || 0}</span>
                        </button>
                        <span className="ml-4">• {new Date(def.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <Link
                    href="/submit"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Definition
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 