import React, { useState, useRef } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { validateFile, getErrorMessage, shouldRetry } from '../utils/errorHandling'

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const [error, setError] = useState(null)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [canRetry, setCanRetry] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file
      const validation = validateFile(file)
      if (!validation.valid) {
        setError(validation.error)
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      setUploadSuccess(false)
      setError(null)
      setExtractedText('')
      setUploadedFileName('')
      setCanRetry(false)
    }
  }

  const handleUpload = async (isRetry = false) => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    // Validate again before upload
    const validation = validateFile(selectedFile)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    setUploading(true)
    setError(null)
    setUploadSuccess(false)
    setCanRetry(false)

    try {
      const response = await axios.post(API_ENDPOINTS.UPLOAD_DOC, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout
      })

      // Handle successful upload
      setUploadSuccess(true)
      setUploadedFileName(selectedFile.name)
      setRetryCount(0)
      
      // Extract text from response (adjust based on your backend response structure)
      if (response.data.text || response.data.extractedText) {
        setExtractedText(response.data.text || response.data.extractedText)
      }
      
      // Clear file input
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error('Upload error:', err)
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      setUploadSuccess(false)
      
      // Determine if retry is possible
      const retry = shouldRetry(err)
      setCanRetry(retry)
      
      if (isRetry) {
        setRetryCount(prev => prev + 1)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleRetry = () => {
    if (retryCount < 3) { // Max 3 retries
      handleUpload(true)
    } else {
      setError('Maximum retry attempts reached. Please check your file and try again later.')
      setCanRetry(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      
      // Validate file
      const validation = validateFile(file)
      if (!validation.valid) {
        setError(validation.error)
        setSelectedFile(null)
        return
      }
      
      setSelectedFile(file)
      setUploadSuccess(false)
      setError(null)
      setExtractedText('')
      setUploadedFileName('')
      setCanRetry(false)
    }
  }

  return (
    <div className="min-h-screen p-8" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="max-w-4xl mx-auto">
        <div className="p-8" style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
        }}>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-3 flex items-center justify-center" style={{color: '#ffffff'}}>
              <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#ffffff'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              File Upload
            </h2>
            <p className="text-base" style={{color: 'rgba(255,255,255,0.9)'}}>Upload your documents for processing</p>
          </div>
        
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="p-12 text-center cursor-pointer transition-all duration-200"
            style={{
              border: '2px dashed rgba(255,255,255,0.4)',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center">
              <p className="text-base font-medium mb-3 flex items-center" style={{color: '#ffffff'}}>
                <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#ffffff'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="font-bold">Click to upload</span>
                <span>&nbsp;or drag and drop</span>
              </p>
              <p className="text-sm" style={{color: 'rgba(255,255,255,0.8)'}}>
                PDF, TXT, DOC, or DOCX files (Max 10MB)
              </p>
            </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.txt,.doc,.docx"
          />
        </div>

          {/* Selected File Display */}
          {selectedFile && (
            <div className="mt-6 p-5 flex items-center justify-between" style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '16px'
            }}>
              <div className="flex items-center">
                <div className="p-2 mr-3" style={{background: 'rgba(255,255,255,0.25)', borderRadius: '12px'}}>
                  <svg
                    style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#ffffff'}}
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
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{color: '#ffffff'}}>{selectedFile.name}</p>
                  <p className="text-xs mt-0.5" style={{color: 'rgba(255,255,255,0.8)'}}>
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
                className="rounded-full p-2 transition-all"
                style={{color: '#ff4444'}}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,68,68,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                title="Remove file"
              >
                <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="mt-6 w-full px-8 py-4 text-base font-bold text-white transition-all flex items-center justify-center"
            style={{
              background: (!selectedFile || uploading) ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '9999px',
              cursor: (!selectedFile || uploading) ? 'not-allowed' : 'pointer',
              boxShadow: (!selectedFile || uploading) ? 'none' : '0 4px 15px 0 rgba(245, 87, 108, 0.5)'
            }}
            onMouseEnter={(e) => { if (selectedFile && !uploading) e.target.style.boxShadow = '0 6px 20px 0 rgba(245, 87, 108, 0.7)' }}
            onMouseLeave={(e) => { if (selectedFile && !uploading) e.target.style.boxShadow = '0 4px 15px 0 rgba(245, 87, 108, 0.5)' }}
          >
          {uploading ? (
            <span className="flex items-center">
              <svg
                style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="animate-spin mr-2"
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
              Uploading...
            </span>
          ) : (
            <>
              <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload File
            </>
          )}
        </button>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-5" style={{
              background: 'rgba(255,68,68,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,68,68,0.3)',
              borderRadius: '16px'
            }}>
              <div className="flex items-start">
                <div className="p-2 mr-3 flex-shrink-0" style={{background: '#ff4444', borderRadius: '12px'}}>
                  <svg
                    style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#ffffff'}}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold mb-1" style={{color: '#ffffff'}}>Upload Failed</h4>
                  <p className="text-sm" style={{color: 'rgba(255,255,255,0.9)'}}>{error}</p>
                  {retryCount > 0 && retryCount < 3 && (
                    <p className="text-xs mt-1" style={{color: '#ff4444'}}>Retry attempt {retryCount} of 3</p>
                  )}
                  {canRetry && retryCount < 3 && (
                    <button
                      onClick={handleRetry}
                      className="mt-3 px-5 py-2 text-white text-sm font-bold flex items-center transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        borderRadius: '9999px',
                        boxShadow: '0 4px 15px 0 rgba(245, 87, 108, 0.5)'
                      }}
                      onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 20px 0 rgba(245, 87, 108, 0.7)'}
                      onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 15px 0 rgba(245, 87, 108, 0.5)'}
                    >
                    <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry Upload
                  </button>
                )}
                  {retryCount >= 3 && (
                    <div className="mt-3 p-3" style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px'}}>
                      <p className="text-xs" style={{color: '#ffffff'}}>
                      <strong>Troubleshooting tips:</strong><br/>
                      • Check your internet connection<br/>
                      • Ensure the file is not corrupted<br/>
                      • Try a smaller file<br/>
                      • Contact support if the issue persists
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {/* Success Message */}
          {uploadSuccess && (
            <div className="mt-6 p-5" style={{
              background: 'rgba(67,233,123,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(67,233,123,0.3)',
              borderRadius: '16px'
            }}>
              <div className="flex items-center">
                <div className="p-2 mr-3 flex-shrink-0" style={{background: '#43e97b', borderRadius: '12px'}}>
                  <svg
                    style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px', color: '#ffffff'}}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{color: '#ffffff'}}>Upload Successful!</p>
                  <p className="text-sm mt-1" style={{color: 'rgba(255,255,255,0.9)'}}>
                    File: <span className="font-semibold">{uploadedFileName}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Extracted Text Display */}
          {extractedText && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3" style={{color: '#ffffff'}}>Extracted Text:</h3>
              <div className="p-5 max-h-64 overflow-y-auto" style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '16px'
              }}>
                <p className="text-sm whitespace-pre-wrap" style={{color: 'rgba(255,255,255,0.95)'}}>{extractedText}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileUpload



