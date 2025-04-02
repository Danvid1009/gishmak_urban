import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase, Term, Definition } from '../../lib/supabaseClient'
import Link from 'next/link'

export default function TermPage() {
  const router = useRouter()
  const { slug } = router.query
  const [term, setTerm] = useState<(Term & { definitions: Definition[] }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      fetchTerm()
    }
  }, [slug])

  const fetchTerm = async () => {
    const { data, error } = await supabase
      .from('terms')
      .select(`
        *,
        definitions (*)
      `)
      .eq('word', slug)
      .single()

    if (error) {
      console.error('Error fetching term:', error)
      return
    }

    setTerm(data)
    setLoading(false)
  }

  const handleVote = async (definitionId: string, type: 'up' | 'down') => {
    const { error } = await supabase
      .from('definitions')
      .update({
        [type === 'up' ? 'upvotes' : 'downvotes']: term?.definitions[0][type === 'up' ? 'upvotes' : 'downvotes'] + 1,
      })
      .eq('id', definitionId)

    if (error) {
      console.error('Error voting:', error)
      return
    }

    fetchTerm() // Refresh the term data
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!term) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Term not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="text-primary hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-4xl font-bold mb-4">{term.word}</h1>
          
          {term.definitions.map((def) => (
            <div key={def.id} className="mt-6">
              <p className="text-gray-600 text-lg">{def.content}</p>
              
              <div className="mt-4 flex items-center space-x-4">
                <button
                  onClick={() => handleVote(def.id, 'up')}
                  className="text-gray-500 hover:text-primary"
                >
                  ↑ {def.upvotes}
                </button>
                <button
                  onClick={() => handleVote(def.id, 'down')}
                  className="text-gray-500 hover:text-red-500"
                >
                  ↓ {def.downvotes}
                </button>
                <span className="text-sm text-gray-500">
                  Added on {new Date(def.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
} 