import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

function ExecutionTrace() {
  const [traces, setTraces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTrace, setSelectedTrace] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchTraces = async (taskId = null) => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(API_ENDPOINTS.WORKFLOW_TRACE(taskId))
      
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
      return status ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    }
    
    const statusLower = String(status).toLowerCase()
    if (statusLower === 'success' || statusLower === 'completed' || statusLower === 'done') {
      return 'bg-green-50 border-green-200'
    } else if (statusLower === 'failure' || statusLower === 'failed' || statusLower === 'error') {
      return 'bg-red-50 border-red-200'
    } else if (statusLower === 'running' || statusLower === 'in_progress') {
      return 'bg-blue-50 border-blue-200'
    }
    return 'bg-gray-50 border-gray-200'
  }

  const getStatusTextColor = (status) => {
    if (typeof status === 'boolean') {
      return status ? '#16a34a' : '#ef4444'
    }
    
    const statusLower = String(status).toLowerCase()
    if (statusLower === 'success' || statusLower === 'completed' || statusLower === 'done') {
      return '#16a34a'
    } else if (statusLower === 'failure' || statusLower === 'failed' || statusLower === 'error') {
      return '#ef4444'
    } else if (statusLower === 'running' || statusLower === 'in_progress') {
      return '#4f46e5'
    }
    return '#64748b'
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
    <div className="max-w-7xl mx-auto" style={{background: 'linear-gradient(to bottom right, #eef2ff, #f8fafc)', padding: '24px', borderRadius: '12px'}}>
      <div className="bg-white shadow-md p-6" style={{borderRadius: '12px', border: '1px solid #e0e7ff'}}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold" style={{color: '#0f172a'}}>Execution Trace</h2>
            <p className="text-sm mt-1" style={{color: '#64748b'}}>Step-by-step execution history</p>
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
                style={{accentColor: '#4f46e5'}}
              />
              <span className="text-sm font-medium" style={{color: '#0f172a'}}>Auto-refresh</span>
            </label>
            <button
              onClick={fetchTraces}
              disabled={loading}
              className="px-4 py-2 text-sm text-white flex items-center font-medium transition-all"
              style={{
                background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.background = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
              onMouseLeave={(e) => { if (!loading) e.target.style.background = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
            >
              <svg
                style={{width: '14px', height: '14px', minWidth: '14px', minHeight: '14px', maxWidth: '14px', maxHeight: '14px', flexShrink: 0}}
                className={`mr-2 ${loading ? 'animate-spin' : ''}`}
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
          <div className="mb-6 p-4" style={{background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px'}}>
            <div className="flex items-center">
              <svg
                style={{width: '14px', height: '14px', minWidth: '14px', minHeight: '14px', maxWidth: '14px', maxHeight: '14px', flexShrink: 0, color: '#ef4444'}}
                className="mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm" style={{color: '#0f172a'}}>{error}</p>
            </div>
          </div>
        )}

        {/* Execution Steps */}
        {loading && traces.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin w-3 h-3 border-4 rounded-full" style={{borderColor: '#4f46e5', borderTopColor: 'transparent'}}></div>
            <p className="mt-4" style={{color: '#64748b'}}>Loading execution traces...</p>
          </div>
        ) : traces.length === 0 ? (
          <div className="py-8 px-4">
            <div className="flex items-center justify-center mb-3">
              <svg
                style={{width: '14px', height: '14px', minWidth: '14px', minHeight: '14px', maxWidth: '14px', maxHeight: '14px', flexShrink: 0, color: '#64748b'}}
                className="mr-2"
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
              <span className="font-medium" style={{color: '#64748b'}}>No execution traces available</span>
            </div>
            <p className="text-sm text-center" style={{color: '#64748b'}}>Run an agent task to see execution history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {traces.map((trace, index) => (
              <div
                key={index}
                className="cursor-pointer transition-all"
                style={{border: '1px solid #e0e7ff', borderRadius: '12px'}}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e0e7ff'}
                onClick={() => setSelectedTrace(selectedTrace === index ? null : index)}
              >
                {/* Step Header */}
                <div className="flex items-center p-4" style={{background: 'linear-gradient(to bottom right, #eef2ff, #f8fafc)', borderRadius: '12px 12px 0 0'}}>
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-3 h-3 text-white rounded-full flex items-center justify-center font-bold text-xs mr-3" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'}}>
                    {trace.step || trace.step_number || index + 1}
                  </div>

                  {/* Tool/Action */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <svg
                        style={{width: '14px', height: '14px', minWidth: '14px', minHeight: '14px', maxWidth: '14px', maxHeight: '14px', flexShrink: 0, color: '#64748b'}}
                        className="mr-2"
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
                      <h3 className="font-semibold truncate" style={{color: '#0f172a'}}>
                        {trace.tool || trace.action || trace.name || 'Unknown Tool'}
                      </h3>
                    </div>
                    {trace.description && (
                      <p className="text-sm mt-1 truncate" style={{color: '#64748b'}}>{trace.description}</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className={`ml-4 px-4 py-2 border-2 font-semibold text-sm ${getStatusColor(trace.status || trace.success)}`} style={{borderRadius: '12px', color: getStatusTextColor(trace.status || trace.success)}}>
                    <span className="mr-1">{getStatusIcon(trace.status || trace.success)}</span>
                    {typeof trace.status === 'boolean' 
                      ? (trace.status ? 'Success' : 'Failed')
                      : String(trace.status || (trace.success ? 'Success' : 'Failed')).toUpperCase()
                    }
                  </div>

                  {/* Expand Icon */}
                  <svg
                    style={{width: '14px', height: '14px', minWidth: '14px', minHeight: '14px', maxWidth: '14px', maxHeight: '14px', flexShrink: 0, color: '#64748b'}}
                    className={`ml-4 transition-transform ${selectedTrace === index ? 'rotate-180' : ''}`}
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
                  <div className="p-4 bg-white" style={{borderTop: '1px solid #e0e7ff'}}>
                    <h4 className="font-semibold mb-2" style={{color: '#0f172a'}}>Result:</h4>
                    <div className="p-3" style={{background: 'linear-gradient(to bottom right, #eef2ff, #f8fafc)', border: '1px solid #e0e7ff', borderRadius: '8px'}}>
                      <pre className="text-sm whitespace-pre-wrap font-mono" style={{color: '#475569'}}>
                        {trace.result || trace.output || trace.message || 'No result available'}
                      </pre>
                    </div>

                    {/* Additional Metadata */}
                    {(trace.duration || trace.timestamp || trace.input) && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {trace.timestamp && (
                          <div>
                            <span className="text-xs font-semibold" style={{color: '#64748b'}}>Timestamp:</span>
                            <p className="text-sm" style={{color: '#0f172a'}}>{new Date(trace.timestamp).toLocaleString()}</p>
                          </div>
                        )}
                        {trace.duration && (
                          <div>
                            <span className="text-xs font-semibold" style={{color: '#64748b'}}>Duration:</span>
                            <p className="text-sm" style={{color: '#0f172a'}}>{trace.duration}ms</p>
                          </div>
                        )}
                        {trace.input && (
                          <div>
                            <span className="text-xs font-semibold" style={{color: '#64748b'}}>Input:</span>
                            <p className="text-sm truncate" style={{color: '#0f172a'}}>{String(trace.input)}</p>
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
        <div className="mt-6 p-4" style={{background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px'}}>
          <div className="flex">
            <svg
              style={{width: '14px', height: '14px', minWidth: '14px', minHeight: '14px', maxWidth: '14px', maxHeight: '14px', flexShrink: 0, color: '#4f46e5'}}
              className="mr-3"
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
              <h4 className="text-sm font-semibold mb-1" style={{color: '#0f172a'}}>Execution Trace Features</h4>
              <ul className="text-sm space-y-1" style={{color: '#64748b'}}>
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



