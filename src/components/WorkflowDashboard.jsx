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
  const fetchTraces = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.TRACE)
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
      const response = await axios.post(API_ENDPOINTS.UPLOAD, formData, {
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
      const response = await axios.post(API_ENDPOINTS.CHAT, {
        message: taskInput,
        session_id: getSessionId()
      }, {
        timeout: 30000
      })

      setResult({
        type: 'success',
        content: response.data.response || response.data.message,
        timestamp: new Date()
      })
      
      // Refresh traces
      await fetchTraces()
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
        badge: 'bg-green-100 text-green-600',
        circle: 'bg-green-100 text-green-600'
      },
      red: {
        badge: 'bg-red-100 text-red-600',
        circle: 'bg-red-100 text-red-600'
      },
      blue: {
        badge: 'bg-blue-100 text-blue-600',
        circle: 'bg-blue-100 text-blue-600'
      },
      gray: {
        badge: 'bg-gray-100 text-gray-600',
        circle: 'bg-gray-100 text-gray-600'
      }
    }
    return classMap[color] || classMap.gray
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-1.5">
        <h1 className="text-base font-bold text-gray-900">Workflow Dashboard</h1>
        <p className="text-[10px] text-gray-600">Manage tasks, upload documents, and monitor execution</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-lg shadow-md border-b border-gray-200">
        <div className="flex space-x-1 p-0.5">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-2 py-1 text-[10px] rounded-lg font-medium transition-all ${
              activeTab === 'workflow'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-2 h-2 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Workflow
            </span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-2 py-1 text-[10px] rounded-lg font-medium transition-all ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-2 h-2 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Documents
            </span>
          </button>
          <button
            onClick={() => setActiveTab('trace')}
            className={`px-2 py-1 text-[10px] rounded-lg font-medium transition-all ${
              activeTab === 'trace'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-2 h-2 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Trace
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-b-lg shadow-lg p-1.5">
        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5">
            {/* Left Column - Task Input & Files */}
            <div className="lg:col-span-1 space-y-1.5">
              {/* Task Input */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded p-1 border border-blue-200">
                <h3 className="text-[10px] font-semibold text-gray-900 mb-0.5 flex items-center">
                  <svg className="w-1.5 h-1.5 mr-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Task Input
                </h3>
                <textarea
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="Enter your task..."
                  className="w-full h-8 p-1 text-[10px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={handleExecuteTask}
                  disabled={processing || !taskInput.trim()}
                  className="mt-0.5 w-full px-2 py-0.5 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-2 w-2 mr-0.5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-1.5 h-1.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Execute
                    </>
                  )}
                </button>
              </div>

              {/* File Upload */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded p-1 border border-green-200">
                <h3 className="text-[10px] font-semibold text-gray-900 mb-0.5 flex items-center">
                  <svg className="w-1.5 h-1.5 mr-0.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-2 py-0.5 text-[10px] border border-dashed border-green-300 rounded hover:border-green-500 hover:bg-green-50 transition-all text-gray-700 font-medium"
                >
                  Upload File
                </button>
                
                {uploadStatus && (
                  <div className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium ${
                    uploadStatus === 'success' ? 'bg-green-100 text-green-800' :
                    uploadStatus === 'uploading' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {uploadStatus === 'success' && '✓ Uploaded'}
                    {uploadStatus === 'uploading' && '⟳ Uploading...'}
                    {uploadStatus === 'failed' && '✗ Failed'}
                  </div>
                )}

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    <p className="text-[10px] font-medium text-gray-700">Uploaded:</p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-1 bg-white rounded border border-green-200">
                        <div className="flex items-center flex-1 min-w-0">
                          <svg className="w-2 h-2 text-green-600 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-[10px] text-gray-800 truncate">{file.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 ml-1">{(file.size / 1024).toFixed(1)}KB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Execution & Results */}
            <div className="lg:col-span-2 space-y-2">
              {/* Status Banner */}
              {(processing || result || error) && (
                <div className={`p-1.5 rounded border-l-4 ${
                  processing ? 'bg-blue-50 border-blue-500' :
                  error ? 'bg-red-50 border-red-500' :
                  result?.type === 'success' ? 'bg-green-50 border-green-500' :
                  'bg-gray-50 border-gray-500'
                }`}>
                  <div className="flex items-start">
                    {processing && (
                      <>
                        <svg className="animate-spin h-2 w-2 text-blue-600 mr-1 flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-sm font-medium text-blue-800">Processing...</span>
                      </>
                    )}
                    {error && (
                      <div className="flex-1">
                        <div className="flex items-start">
                          <svg className="h-2 w-2 text-red-500 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1">
                            <h4 className="text-[10px] font-semibold text-red-800">Failed</h4>
                            <p className="text-[10px] text-red-700">{error}</p>
                            {canRetry && lastTask && (
                              <button
                                onClick={handleRetry}
                                className="mt-1 px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-[10px] font-medium flex items-center"
                              >
                                <svg className="w-2 h-2 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <svg className="h-2 w-2 text-green-600 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">Success</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Execution Trace */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded p-1.5 border border-purple-200">
                <h3 className="text-xs font-semibold text-gray-900 mb-0.5 flex items-center justify-between">
                  <span className="flex items-center">
                    <svg className="w-2 h-2 mr-0.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Steps
                  </span>
                  <span className="text-xs text-gray-600">{executionTraces.length}</span>
                </h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {executionTraces.length === 0 ? (
                    <p className="text-xs text-gray-600 text-center py-2">No steps yet</p>
                  ) : (
                    executionTraces.slice(0, 5).map((trace, index) => {
                      const color = getStatusColor(trace.status || trace.success)
                      const classes = getStatusClasses(color)
                      return (
                        <div key={index} className="flex items-center p-1.5 bg-white rounded border border-purple-200 hover:border-purple-400 transition-all cursor-pointer"
                          onClick={() => setSelectedTrace(selectedTrace === index ? null : index)}>
                          <div className={`w-3 h-3 rounded-full ${classes.circle} flex items-center justify-center font-bold text-[10px] mr-1 flex-shrink-0`}>
                            {trace.step || index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{trace.tool || trace.action || 'Step'}</p>
                          </div>
                          <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-semibold ${classes.badge}`}>
                            {typeof trace.status === 'boolean' ? (trace.status ? '✓' : '✗') : String(trace.status || '•')}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Result Section */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded p-1.5 border border-yellow-200">
                <h3 className="text-[10px] font-semibold text-gray-900 mb-0.5 flex items-center">
                  <svg className="w-1.5 h-1.5 mr-0.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Result
                </h3>
                {result ? (
                  <div className="bg-white rounded p-2 border border-yellow-200">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap font-sans">{result.content}</pre>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {result.timestamp?.toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-3 text-gray-500">
                    <svg className="w-2.5 h-2.5 mx-auto mb-0.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-xs">Execute a task</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-2">Document Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {uploadedFiles.length === 0 ? (
                <div className="col-span-full text-center py-6 text-gray-500">
                  <svg className="w-4 h-4 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-500 mb-2">No documents uploaded yet</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Upload Document
                  </button>
                </div>
              ) : (
                uploadedFiles.map((file, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded p-2 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <svg className="w-3 h-3 text-blue-500 mr-1.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        <p className="text-[10px] text-gray-400">{file.uploadedAt.toLocaleString()}</p>
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
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-900">Execution Trace</h2>
              <button
                onClick={fetchTraces}
                className="px-2 py-0.5 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              >
                <svg className="w-2 h-2 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="space-y-1">
              {executionTraces.length === 0 ? (
                <div className="text-center py-6">
                  <svg className="w-4 h-4 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-xs text-gray-500">No execution traces available</p>
                </div>
              ) : (
                executionTraces.map((trace, index) => {
                  const color = getStatusColor(trace.status || trace.success)
                  const classes = getStatusClasses(color)
                  return (
                    <div key={index} className="border border-gray-200 rounded hover:border-blue-300 transition-all cursor-pointer"
                      onClick={() => setSelectedTrace(selectedTrace === index ? null : index)}>
                      <div className="flex items-center p-2 bg-gray-50">
                        <div className={`w-4 h-4 rounded-full ${classes.circle} flex items-center justify-center font-bold text-[10px] mr-1.5 flex-shrink-0`}>
                          {trace.step || index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xs font-semibold text-gray-900">{trace.tool || trace.action || 'Unknown Tool'}</h3>
                          {trace.description && <p className="text-[10px] text-gray-500">{trace.description}</p>}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${classes.badge}`}>
                          {typeof trace.status === 'boolean' ? (trace.status ? 'Success' : 'Failed') : String(trace.status || 'Unknown')}
                        </span>
                        <svg className={`ml-2 h-2 w-2 text-gray-400 transition-transform ${selectedTrace === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {selectedTrace === index && (
                        <div className="p-2 border-t border-gray-200 bg-white">
                          <h4 className="text-[10px] font-semibold text-gray-800 mb-1">Result:</h4>
                          <div className="bg-gray-50 rounded p-2 border border-gray-200">
                            <pre className="text-[10px] text-gray-800 whitespace-pre-wrap font-mono">
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
  )
}

export default WorkflowDashboard
