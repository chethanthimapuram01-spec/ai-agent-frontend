import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { getSessionId } from '../utils/session'
import { validateFile, validateInput, getErrorMessage, shouldRetry } from '../utils/errorHandling'

function WorkflowDashboard() {
  // State management
  const [activeTab, setActiveTab] = useState('workflow')
  const [taskInput, setTaskInput] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [executionTraces, setExecutionTraces] = useState([])
  const [result, setResult] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [selectedTrace, setSelectedTrace] = useState(null)
  const [error, setError] = useState(null)
  const [canRetry, setCanRetry] = useState(false)
  const [lastTask, setLastTask] = useState('')
  const [uploadRetryCount, setUploadRetryCount] = useState(0)
  const fileInputRef = useRef(null)

  // Fetch execution traces
  const fetchTraces = async (taskId = null) => {
    try {
      const response = await axios.get(API_ENDPOINTS.WORKFLOW_TRACE(taskId))
      const traceData = response.data.traces || response.data.steps || response.data
      setExecutionTraces(Array.isArray(traceData) ? traceData : [])
    } catch (err) {
      console.error('Error fetching traces:', err)
    }
  }

  useEffect(() => {
    fetchTraces()
    const interval = setInterval(fetchTraces, 5000) // Auto-refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error)
      setUploadStatus('failed')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setUploadStatus('uploading')
    setError(null)

    try {
      const response = await axios.post(API_ENDPOINTS.UPLOAD_DOC, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      })

      setUploadedFiles(prev => [...prev, {
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        status: 'success'
      }])
      setUploadStatus('success')
      setUploadRetryCount(0)
      setTimeout(() => setUploadStatus(null), 3000) // Clear status after 3 seconds
    } catch (err) {
      console.error('Upload error:', err)
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      setUploadStatus('failed')
    }
  }

  // Execute workflow task
  const handleExecuteTask = async () => {
    if (!taskInput || !taskInput.trim()) {
      setError('Please enter a task')
      return
    }

    // Validate input
    const validation = validateInput(taskInput)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    setProcessing(true)
    setError(null)
    setResult(null)
    setCanRetry(false)
    setLastTask(taskInput)

    try {
      const response = await axios.post(API_ENDPOINTS.WORKFLOW, {
        task: taskInput,
        session_id: getSessionId()
      }, {
        timeout: 30000
      })

      const taskId = response.data.task_id || response.data.taskId
      
      setResult({
        type: 'success',
        content: response.data.response || response.data.message || response.data.result,
        taskId: taskId,
        timestamp: new Date()
      })
      
      // Refresh traces with task_id if available
      if (taskId) {
        await fetchTraces(taskId)
      } else {
        await fetchTraces()
      }
    } catch (err) {
      console.error('Execution error:', err)
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      setCanRetry(shouldRetry(err))
      setResult({
        type: 'error',
        content: 'Task execution failed',
        timestamp: new Date()
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleRetry = () => {
    if (lastTask) {
      setTaskInput(lastTask)
      handleExecuteTask()
    }
  }

  const getStatusColor = (status) => {
    if (typeof status === 'boolean') return status ? 'green' : 'red'
    const statusLower = String(status).toLowerCase()
    if (statusLower === 'success' || statusLower === 'completed') return 'green'
    if (statusLower === 'failure' || statusLower === 'failed') return 'red'
    if (statusLower === 'running') return 'blue'
    return 'gray'
  }

  const getStatusClasses = (color) => {
    const classMap = {
      green: {
        badge: 'bg-green-50 text-green-600',
        circle: 'bg-green-50 text-green-600'
      },
      red: {
        badge: 'bg-red-50 text-red-600',
        circle: 'bg-red-50 text-red-600'
      },
      blue: {
        badge: 'bg-blue-50 text-blue-600',
        circle: 'bg-blue-50 text-blue-600'
      },
      gray: {
        badge: 'bg-gray-50 text-gray-600',
        circle: 'bg-gray-50 text-gray-600'
      }
    }
    return classMap[color] || classMap.gray
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom, #f8fafc, #eef2ff)', position: 'relative', overflow: 'hidden'}}>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section with Glassmorphism */}
        <div className="mb-8 p-12 text-center" style={{
          background: 'white',
          border: '1px solid #e0e7ff',
          borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
        }}>
          <h1 className="text-4xl font-bold mb-3" style={{color: '#1e1b4b'}}>
            AI Workflow Dashboard
          </h1>
          <p className="text-lg mb-6" style={{color: '#64748b'}}>Intelligent task automation and document management</p>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div>
              <div className="text-3xl font-bold" style={{color: '#4f46e5'}}>10K+</div>
              <div className="text-sm" style={{color: '#64748b'}}>Documents</div>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{color: '#4f46e5'}}>99%</div>
              <div className="text-sm" style={{color: '#64748b'}}>Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{color: '#4f46e5'}}>24/7</div>
              <div className="text-sm" style={{color: '#64748b'}}>Available</div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="p-6 hover:scale-105 transition-transform cursor-pointer" style={{
            background: 'white',
            border: '1px solid #e0e7ff',
            borderRadius: '20px',
            boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
          }}>
            <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{background: '#fce7f3'}}>
              <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#ec4899'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{color: '#1e1b4b'}}>Fast Processing</h3>
            <p className="text-sm" style={{color: '#64748b'}}>Lightning-fast task execution with real-time updates</p>
          </div>
          
          <div className="p-6 hover:scale-105 transition-transform cursor-pointer" style={{
            background: 'white',
            border: '1px solid #e0e7ff',
            borderRadius: '20px',
            boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
          }}>
            <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{background: '#dbeafe'}}>
              <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#3b82f6'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{color: '#1e1b4b'}}>Secure Storage</h3>
            <p className="text-sm" style={{color: '#64748b'}}>Enterprise-grade security for your documents</p>
          </div>
          
          <div className="p-6 hover:scale-105 transition-transform cursor-pointer" style={{
            background: 'white',
            border: '1px solid #e0e7ff',
            borderRadius: '20px',
            boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
          }}>
            <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{background: '#dcfce7'}}>
              <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#22c55e'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{color: '#1e1b4b'}}>Smart Analytics</h3>
            <p className="text-sm" style={{color: '#64748b'}}>Detailed execution traces and performance insights</p>
          </div>
        </div>

        {/* Tabs with Glassmorphism */}
        <div className="mb-6 p-2" style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
        }}>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-all flex items-center justify-center ${
                activeTab === 'workflow' ? 'shadow-lg' : ''
              }`}
              style={{
                borderRadius: '16px',
                background: activeTab === 'workflow' ? '#4f46e5' : 'transparent',
                color: activeTab === 'workflow' ? '#ffffff' : '#64748b'
              }}
            >
            <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Workflow
          </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-all flex items-center justify-center ${
                activeTab === 'documents' ? 'shadow-lg' : ''
              }`}
              style={{
                borderRadius: '16px',
                background: activeTab === 'documents' ? '#4f46e5' : 'transparent',
                color: activeTab === 'documents' ? '#ffffff' : '#64748b'
              }}
            >
            <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Documents
          </button>
            <button
              onClick={() => setActiveTab('trace')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-all flex items-center justify-center ${
                activeTab === 'trace' ? 'shadow-lg' : ''
              }`}
              style={{
                borderRadius: '16px',
                background: activeTab === 'trace' ? '#4f46e5' : 'transparent',
                color: activeTab === 'trace' ? '#ffffff' : '#64748b'
              }}
            >
            <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
              Trace
            </button>
          </div>
        </div>

        {/* Main Content with Glassmorphism */}
        <div className="p-8" style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
        }}>
        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Task Input & Files */}
            <div className="lg:col-span-1 space-y-6">
              {/* Task Input */}
              <div className="p-6" style={{
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
              }}>
                <h3 className="text-sm font-semibold mb-4 flex items-center" style={{color: '#1e1b4b'}}>
                  <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#4f46e5'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Task Input
                </h3>
                <textarea
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="Enter your task description..."
                  className="w-full h-24 p-4 text-sm resize-none focus:outline-none focus:ring-2"
                  style={{border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', background: '#f8fafc'}}
                  onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  onClick={handleExecuteTask}
                  disabled={processing || !taskInput.trim()}
                  className="mt-4 w-full px-4 py-3 text-sm text-white font-bold flex items-center justify-center transition-all disabled:cursor-not-allowed"
                  style={{
                    borderRadius: '9999px',
                    background: (processing || !taskInput.trim()) ? '#cbd5e1' : '#4f46e5'
                  }}
                  onMouseEnter={(e) => { if (!processing && taskInput.trim()) e.target.style.background = '#4338ca' }}
                  onMouseLeave={(e) => { if (!processing && taskInput.trim()) e.target.style.background = '#4f46e5' }}
                >
                  {processing ? (
                    <>
                      <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="animate-spin mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Execute
                    </>
                  )}
                </button>
              </div>

              {/* File Upload */}
              <div className="p-6" style={{
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
              }}>
                <h3 className="text-sm font-semibold mb-4 flex items-center" style={{color: '#1e1b4b'}}>
                  <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#4f46e5'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.txt,.doc,.docx"
                />
                <div className="flex justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-8 py-3 text-sm font-bold flex items-center justify-center transition-all"
                    style={{
                      borderRadius: '9999px',
                      background: '#4f46e5',
                      color: '#ffffff'
                    }}
                    onMouseEnter={(e) => { e.target.style.background = '#4338ca' }}
                    onMouseLeave={(e) => { e.target.style.background = '#4f46e5' }}
                  >
                    <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload File
                  </button>
                </div>
                
                {uploadStatus && (
                  <div className="mt-3 px-4 py-2 text-sm font-medium"
                    style={{
                      borderRadius: '12px',
                      background: uploadStatus === 'success' ? '#dcfce7' : uploadStatus === 'uploading' ? '#dbeafe' : '#fee2e2',
                      color: uploadStatus === 'success' ? '#16a34a' : uploadStatus === 'uploading' ? '#2563eb' : '#dc2626',
                      border: '1px solid ' + (uploadStatus === 'success' ? '#bbf7d0' : uploadStatus === 'uploading' ? '#bfdbfe' : '#fecaca')
                    }}>  
                    {uploadStatus === 'success' && '✓ Uploaded'}
                    {uploadStatus === 'uploading' && '⟳ Uploading...'}
                    {uploadStatus === 'failed' && '✗ Failed'}
                  </div>
                )}

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium" style={{color: '#1e1b4b'}}>Uploaded Files:</p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 hover:scale-105 transition-transform" style={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px'
                      }}>
                        <div className="flex items-center flex-1 min-w-0">
                          <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#4f46e5'}} className="mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm truncate font-medium" style={{color: '#1e1b4b'}}>{file.name}</span>
                        </div>
                        <span className="text-xs ml-2" style={{color: '#64748b'}}>{(file.size / 1024).toFixed(1)}KB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Execution & Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Banner */}
              {(processing || result || error) && (
                <div className="p-4" style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid ' + (processing ? '#4f46e5' : error ? '#ef4444' : result?.type === 'success' ? '#22c55e' : '#e2e8f0'),
                  boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
                }}>
                  <div className="flex items-start">
                    {processing && (
                      <>
                        <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#4f46e5'}} className="animate-spin mr-3 flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-sm font-medium" style={{color: '#1e1b4b'}}>Processing your request...</span>
                      </>
                    )}
                    {error && (
                      <div className="flex-1">
                        <div className="flex items-start">
                          <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#ef4444'}} className="mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold" style={{color: '#1e1b4b'}}>Task Failed</h4>
                            <p className="text-sm mt-1" style={{color: '#64748b'}}>{error}</p>
                            {canRetry && lastTask && (
                              <button
                                onClick={handleRetry}
                                className="mt-3 px-4 py-2 text-white text-sm font-bold flex items-center transition-all"
                                style={{
                                  borderRadius: '9999px',
                                  background: '#4f46e5'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#4338ca'}
                                onMouseLeave={(e) => e.target.style.background = '#4f46e5'}
                              >
                                <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Retry
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {result?.type === 'success' && (
                      <>
                        <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#22c55e'}} className="mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium" style={{color: '#1e1b4b'}}>Task Completed Successfully</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Execution Trace */}
              <div className="p-6" style={{
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
              }}>
                <h3 className="text-base font-semibold mb-4 flex items-center justify-between" style={{color: '#1e1b4b'}}>
                  <span className="flex items-center">
                    <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#4f46e5'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Execution Steps
                  </span>
                  <span className="text-sm px-3 py-1 font-medium" style={{borderRadius: '12px', background: '#f8fafc', color: '#4f46e5', border: '1px solid #e2e8f0'}}>{executionTraces.length}</span>
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {executionTraces.length === 0 ? (
                    <p className="text-sm text-center py-8" style={{color: '#64748b'}}>No execution steps yet</p>
                  ) : (
                    executionTraces.slice(0, 5).map((trace, index) => {
                      const color = getStatusColor(trace.status || trace.success)
                      const classes = getStatusClasses(color)
                      return (
                        <div key={index} className="flex items-center p-4 hover:scale-105 transition-all cursor-pointer" 
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px'
                          }}
                          onClick={() => setSelectedTrace(selectedTrace === index ? null : index)}>
                          <div className={`flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0`} 
                            style={{width: '12px', height: '12px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5'}}>
                            {trace.step || index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{color: '#1e1b4b'}}>{trace.tool || trace.action || 'Step'}</p>
                          </div>
                          <span className={`ml-2 px-3 py-1 text-xs font-medium`} style={{borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5'}}>
                            {typeof trace.status === 'boolean' ? (trace.status ? '✓' : '✗') : String(trace.status || '•')}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Result Section */}
              <div className="p-6" style={{
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
              }}>
                <h3 className="text-base font-semibold mb-4 flex items-center" style={{color: '#1e1b4b'}}>
                  <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#4f46e5'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Result
                </h3>
                {result ? (
                  <div className="p-4" style={{borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc'}}>
                    <pre className="text-sm whitespace-pre-wrap font-sans" style={{color: '#1e1b4b'}}>{result.content}</pre>
                    <p className="text-xs mt-3 text-right font-medium" style={{color: '#64748b'}}>
                      {result.timestamp?.toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm font-medium flex items-center justify-center" style={{color: '#64748b'}}>
                      <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#94a3b8'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      Execute a task to see results
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <h2 className="text-sm font-semibold mb-4" style={{color: '#1e1b4b'}}>Document Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-sm mb-4 flex items-center justify-center" style={{color: '#64748b'}}>
                    <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#94a3b8'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    No documents uploaded yet
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 text-sm text-white font-bold flex items-center mx-auto transition-all"
                    style={{
                      borderRadius: '9999px',
                      background: '#4f46e5'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#4338ca'}
                    onMouseLeave={(e) => e.target.style.background = '#4f46e5'}
                  >
                    <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Document
                  </button>
                </div>
              ) : (
                uploadedFiles.map((file, index) => (
                  <div key={index} className="p-4 hover:scale-105 transition-transform" style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
                  }}>
                    <div className="flex items-start">
                      <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#4f46e5'}} className="mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{color: '#1e1b4b'}}>{file.name}</p>
                        <p className="text-xs" style={{color: '#64748b'}}>{(file.size / 1024).toFixed(2)} KB</p>
                        <p className="text-xs" style={{color: '#94a3b8'}}>{file.uploadedAt.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Trace Tab */}
        {activeTab === 'trace' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{color: '#1e1b4b'}}>Execution Trace</h2>
              <button
                onClick={fetchTraces}
                className="px-6 py-3 text-sm text-white font-bold flex items-center transition-all"
                style={{
                  borderRadius: '9999px',
                  background: '#4f46e5'
                }}
                onMouseEnter={(e) => e.target.style.background = '#4338ca'}
                onMouseLeave={(e) => e.target.style.background = '#4f46e5'}
              >
                <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="space-y-2">
              {executionTraces.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm flex items-center justify-center" style={{color: '#64748b'}}>
                    <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#94a3b8'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    No execution traces available
                  </p>
                </div>
              ) : (
                executionTraces.map((trace, index) => {
                  const color = getStatusColor(trace.status || trace.success)
                  const classes = getStatusClasses(color)
                  return (
                    <div key={index} className="hover:scale-105 transition-all cursor-pointer" 
                      style={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
                      }}
                      onClick={() => setSelectedTrace(selectedTrace === index ? null : index)}>
                      <div className="flex items-center p-4">
                        <div className="flex items-center justify-center font-bold text-xs mr-2 flex-shrink-0" 
                          style={{width: '12px', height: '12px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5'}}>
                          {trace.step || index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold" style={{color: '#1e1b4b'}}>{trace.tool || trace.action || 'Unknown Tool'}</h3>
                          {trace.description && <p className="text-xs" style={{color: '#64748b'}}>{trace.description}</p>}
                        </div>
                        <span className="px-3 py-1 text-xs font-medium" style={{borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5'}}>
                          {typeof trace.status === 'boolean' ? (trace.status ? 'Success' : 'Failed') : String(trace.status || 'Unknown')}
                        </span>
                        <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#94a3b8'}} className={`ml-2 transition-transform ${selectedTrace === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {selectedTrace === index && (
                        <div className="p-4" style={{borderTop: '1px solid #e2e8f0'}}>
                          <h4 className="text-xs font-semibold mb-2" style={{color: '#1e1b4b'}}>Result:</h4>
                          <div className="p-3" style={{
                            borderRadius: '12px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0'
                          }}>
                            <pre className="text-xs whitespace-pre-wrap font-mono" style={{color: '#1e1b4b'}}>
                              {trace.result || trace.output || trace.message || 'No result available'}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}

export default WorkflowDashboard



