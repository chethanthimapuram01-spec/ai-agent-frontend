import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

function ExecutionTrace() {
  const [traces, setTraces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTrace, setSelectedTrace] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchTraces = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(API_ENDPOINTS.TRACE)
      
      // Handle different response structures
      const traceData = response.data.traces || response.data.steps || response.data
      setTraces(Array.isArray(traceData) ? traceData : [])
    } catch (err) {
      console.error('Error fetching traces:', err)
      setError(err.response?.data?.error || 'Failed to fetch execution traces')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTraces()
  }, [])

  useEffect(() => {
    let interval
    if (autoRefresh) {
      interval = setInterval(fetchTraces, 3000) // Refresh every 3 seconds
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

  const getStatusColor = (status) => {
    if (typeof status === 'boolean') {
      return status ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'
    }
    
    const statusLower = String(status).toLowerCase()
    if (statusLower === 'success' || statusLower === 'completed' || statusLower === 'done') {
      return 'text-green-600 bg-green-50 border-green-200'
    } else if (statusLower === 'failure' || statusLower === 'failed' || statusLower === 'error') {
      return 'text-red-600 bg-red-50 border-red-200'
    } else if (statusLower === 'running' || statusLower === 'in_progress') {
      return 'text-blue-600 bg-blue-50 border-blue-200'
    }
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getStatusIcon = (status) => {
    if (typeof status === 'boolean') {
      return status ? '✓' : '✗'
    }
    
    const statusLower = String(status).toLowerCase()
    if (statusLower === 'success' || statusLower === 'completed' || statusLower === 'done') {
      return '✓'
    } else if (statusLower === 'failure' || statusLower === 'failed' || statusLower === 'error') {
      return '✗'
    } else if (statusLower === 'running' || statusLower === 'in_progress') {
      return '⟳'
    }
    return '•'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Execution Trace</h2>
            <p className="text-sm text-gray-600 mt-1">Step-by-step execution history</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Auto-refresh</span>
            </label>
            <button
              onClick={fetchTraces}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center"
            >
              <svg
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
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

        {/* Execution Steps */}
        {loading && traces.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Loading execution traces...</p>
          </div>
        ) : traces.length === 0 ? (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="mt-4 text-gray-600">No execution traces available</p>
            <p className="text-sm text-gray-500 mt-2">Run an agent task to see execution history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {traces.map((trace, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg hover:border-blue-300 transition-all cursor-pointer"
                onClick={() => setSelectedTrace(selectedTrace === index ? null : index)}
              >
                {/* Step Header */}
                <div className="flex items-center p-4 bg-gray-50">
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                    {trace.step || trace.step_number || index + 1}
                  </div>

                  {/* Tool/Action */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {trace.tool || trace.action || trace.name || 'Unknown Tool'}
                      </h3>
                    </div>
                    {trace.description && (
                      <p className="text-sm text-gray-600 mt-1 truncate">{trace.description}</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className={`ml-4 px-4 py-2 rounded-full border-2 font-semibold text-sm ${getStatusColor(trace.status || trace.success)}`}>
                    <span className="mr-1">{getStatusIcon(trace.status || trace.success)}</span>
                    {typeof trace.status === 'boolean' 
                      ? (trace.status ? 'Success' : 'Failed')
                      : String(trace.status || (trace.success ? 'Success' : 'Failed')).toUpperCase()
                    }
                  </div>

                  {/* Expand Icon */}
                  <svg
                    className={`ml-4 h-5 w-5 text-gray-400 transition-transform ${selectedTrace === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Expanded Details */}
                {selectedTrace === index && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <h4 className="font-semibold text-gray-800 mb-2">Result:</h4>
                    <div className="bg-gray-50 rounded p-3 border border-gray-200">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                        {trace.result || trace.output || trace.message || 'No result available'}
                      </pre>
                    </div>

                    {/* Additional Metadata */}
                    {(trace.duration || trace.timestamp || trace.input) && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {trace.timestamp && (
                          <div>
                            <span className="text-xs font-semibold text-gray-600">Timestamp:</span>
                            <p className="text-sm text-gray-800">{new Date(trace.timestamp).toLocaleString()}</p>
                          </div>
                        )}
                        {trace.duration && (
                          <div>
                            <span className="text-xs font-semibold text-gray-600">Duration:</span>
                            <p className="text-sm text-gray-800">{trace.duration}ms</p>
                          </div>
                        )}
                        {trace.input && (
                          <div>
                            <span className="text-xs font-semibold text-gray-600">Input:</span>
                            <p className="text-sm text-gray-800 truncate">{String(trace.input)}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info Panel */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Execution Trace Features</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• View step-by-step execution history of agent tasks</li>
                <li>• Click on any step to see detailed results and metadata</li>
                <li>• Green = Success, Red = Failure, Blue = In Progress</li>
                <li>• Enable auto-refresh to monitor running tasks in real-time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExecutionTrace
