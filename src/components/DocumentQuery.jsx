import React, { useState } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

function DocumentQuery() {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a question')
      return
    }

    setSearching(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await axios.post(API_ENDPOINTS.QUERY, {
        query: query.trim()
      })

      // Handle response - adjust based on your backend structure
      if (response.data.results || response.data.chunks) {
        setResults(response.data.results || response.data.chunks)
      } else if (Array.isArray(response.data)) {
        setResults(response.data)
      } else {
        setResults([])
      }
    } catch (err) {
      console.error('Query error:', err)
      setError(err.response?.data?.error || 'Failed to search documents. Please try again.')
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Document Search</h2>
        
        {/* Search Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ask a question about your uploaded documents
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., What is the main topic of the document?"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={!query.trim() || searching}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium min-w-[120px]"
            >
              {searching ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </span>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && (
          <div>
            {results.length === 0 && !searching && !error && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 text-gray-600">No results found for your query.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Try rephrasing your question or upload relevant documents first.
                </p>
              </div>
            )}

            {results.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Found {results.length} relevant {results.length === 1 ? 'chunk' : 'chunks'}
                </h3>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-gray-50"
                    >
                      {/* Source Document Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <svg
                            className="h-5 w-5 text-blue-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {result.source || result.document || result.filename || `Document ${index + 1}`}
                            </p>
                            {result.page && (
                              <p className="text-xs text-gray-500">Page {result.page}</p>
                            )}
                          </div>
                        </div>
                        {result.score && (
                          <div className="flex items-center">
                            <span className="text-xs font-medium text-gray-600 mr-1">Relevance:</span>
                            <span className="text-xs font-bold text-blue-600">
                              {(result.score * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Chunk */}
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {result.content || result.text || result.chunk || 'No content available'}
                        </p>
                      </div>

                      {/* Metadata */}
                      {result.metadata && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(result.metadata).map(([key, value]) => (
                            <span
                              key={key}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                            >
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        {!hasSearched && (
          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <svg
                className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-2">How to use Document Search</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Upload documents using the File Upload page</li>
                  <li>• Enter your question about the uploaded documents</li>
                  <li>• View relevant text chunks with source document names</li>
                  <li>• Check the relevance score to see how well each chunk matches your query</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentQuery
