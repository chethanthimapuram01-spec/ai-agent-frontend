import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { getSessionId } from '../utils/session'

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

    const formData = new FormData()
    formData.append('file', file)

    setUploadStatus('uploading')
    setError(null)

    try {
      const response = await axios.post(API_ENDPOINTS.UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setUploadedFiles(prev => [...prev, {
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        status: 'success'
      }])
      setUploadStatus('success')
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload file')
      setUploadStatus('failed')
    }
  }

  // Execute workflow task
  const handleExecuteTask = async () => {
    if (!taskInput.trim()) {
      setError('Please enter a task')
      return
    }

    setProcessing(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.post(API_ENDPOINTS.CHAT, {
        message: taskInput,
        session_id: getSessionId()
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
      setError(err.response?.data?.error || 'Failed to execute task')
      setResult({
        type: 'error',
        content: 'Task execution failed',
        timestamp: new Date()
      })
    } finally {
      setProcessing(false)
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Workflow Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage tasks, upload documents, and monitor execution</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-lg shadow-md border-b border-gray-200">
        <div className="flex space-x-1 p-2">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'workflow'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Workflow
            </span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Documents
            </span>
          </button>
          <button
            onClick={() => setActiveTab('trace')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'trace'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Execution Trace
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-b-lg shadow-lg p-6">
        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Task Input & Files */}
            <div className="lg:col-span-1 space-y-6">
              {/* Task Input */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Task Input
                </h3>
                <textarea
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="Enter your task or query here..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={handleExecuteTask}
                  disabled={processing || !taskInput.trim()}
                  className="mt-3 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Execute Task
                    </>
                  )}
                </button>
              </div>

              {/* File Upload */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Documents
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
                  className="w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-gray-700 font-medium"
                >
                  Click to Upload File
                </button>
                
                {uploadStatus && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    uploadStatus === 'success' ? 'bg-green-100 text-green-800' :
                    uploadStatus === 'uploading' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {uploadStatus === 'success' && '✓ Upload successful'}
                    {uploadStatus === 'uploading' && '⟳ Uploading...'}
                    {uploadStatus === 'failed' && '✗ Upload failed'}
                  </div>
                )}

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                        <div className="flex items-center flex-1 min-w-0">
                          <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm text-gray-800 truncate">{file.name}</span>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">{(file.size / 1024).toFixed(1)} KB</span>
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
                <div className={`p-4 rounded-lg border-l-4 ${
                  processing ? 'bg-blue-50 border-blue-500' :
                  error ? 'bg-red-50 border-red-500' :
                  result?.type === 'success' ? 'bg-green-50 border-green-500' :
                  'bg-gray-50 border-gray-500'
                }`}>
                  <div className="flex items-center">
                    {processing && (
                      <>
                        <svg className="animate-spin h-5 w-5 text-blue-600 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="font-medium text-blue-800">Processing your request...</span>
                      </>
                    )}
                    {error && (
                      <>
                        <svg className="h-5 w-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-red-800">{error}</span>
                      </>
                    )}
                    {result?.type === 'success' && (
                      <>
                        <svg className="h-5 w-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-green-800">Task completed successfully</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Execution Trace */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Execution Steps
                  </span>
                  <span className="text-sm text-gray-600">{executionTraces.length} steps</span>
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {executionTraces.length === 0 ? (
                    <p className="text-sm text-gray-600 text-center py-4">No execution steps yet</p>
                  ) : (
                    executionTraces.slice(0, 5).map((trace, index) => {
                      const color = getStatusColor(trace.status || trace.success)
                      return (
                        <div key={index} className="flex items-center p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-all cursor-pointer"
                          onClick={() => setSelectedTrace(selectedTrace === index ? null : index)}>
                          <div className={`w-8 h-8 rounded-full bg-${color}-100 text-${color}-600 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0`}>
                            {trace.step || index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{trace.tool || trace.action || 'Step'}</p>
                            <p className="text-xs text-gray-500 truncate">{trace.description || trace.result || ''}</p>
                          </div>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-${color}-100 text-${color}-600`}>
                            {typeof trace.status === 'boolean' ? (trace.status ? '✓' : '✗') : String(trace.status || '•')}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Result Section */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-5 border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Result
                </h3>
                {result ? (
                  <div className="bg-white rounded-lg p-4 border border-yellow-200">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">{result.content}</pre>
                    <p className="text-xs text-gray-500 mt-3 text-right">
                      {result.timestamp?.toLocaleTimeString()}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-sm">Execute a task to see results here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600">No documents uploaded yet</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Upload Document
                  </button>
                </div>
              ) : (
                uploadedFiles.map((file, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start">
                      <svg className="w-10 h-10 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        <p className="text-xs text-gray-400 mt-1">{file.uploadedAt.toLocaleString()}</p>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Execution Trace</h2>
              <button
                onClick={fetchTraces}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="space-y-3">
              {executionTraces.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-600">No execution traces available</p>
                </div>
              ) : (
                executionTraces.map((trace, index) => {
                  const color = getStatusColor(trace.status || trace.success)
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg hover:border-blue-300 transition-all cursor-pointer"
                      onClick={() => setSelectedTrace(selectedTrace === index ? null : index)}>
                      <div className="flex items-center p-4 bg-gray-50">
                        <div className={`w-12 h-12 rounded-full bg-${color}-100 text-${color}-600 flex items-center justify-center font-bold text-lg mr-4`}>
                          {trace.step || index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{trace.tool || trace.action || 'Unknown Tool'}</h3>
                          {trace.description && <p className="text-sm text-gray-600 mt-1">{trace.description}</p>}
                        </div>
                        <span className={`px-4 py-2 rounded-full font-semibold text-sm bg-${color}-100 text-${color}-600`}>
                          {typeof trace.status === 'boolean' ? (trace.status ? 'Success' : 'Failed') : String(trace.status || 'Unknown')}
                        </span>
                        <svg className={`ml-4 h-5 w-5 text-gray-400 transition-transform ${selectedTrace === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {selectedTrace === index && (
                        <div className="p-4 border-t border-gray-200 bg-white">
                          <h4 className="font-semibold text-gray-800 mb-2">Result:</h4>
                          <div className="bg-gray-50 rounded p-3 border border-gray-200">
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
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
