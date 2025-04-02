import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Submit() {
  const router = useRouter()
  const [word, setWord] = useState('')
  const [definition, setDefinition] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Insert term
      const { data: termData, error: termError } = await supabase
        .from('terms')
        .insert([{ word }])
        .select()
        .single()

      if (termError) throw termError

      // Insert definition
      const { error: defError } = await supabase
        .from('definitions')
        .insert([
          {
            term_id: termData.id,
            content: definition,
            upvotes: 0,
            downvotes: 0,
          },
        ])

      if (defError) throw defError

      router.push('/')
    } catch (error) {
      console.error('Error submitting term:', error)
      alert('Error submitting term. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Submit New Term</h1>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label htmlFor="word" className="block text-sm font-medium text-gray-700 mb-1">
              Term
            </label>
            <input
              type="text"
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="definition" className="block text-sm font-medium text-gray-700 mb-1">
              Definition
            </label>
            <textarea
              id="definition"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary h-32"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Term'}
          </button>
        </form>
      </main>
    </div>
  )
} 