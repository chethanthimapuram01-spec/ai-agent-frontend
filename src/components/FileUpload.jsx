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
      const response = await axios.post(API_ENDPOINTS.UPLOAD, formData, {
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">File Upload</h2>
        
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF, TXT, DOCX, or other document files
          </p>
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
          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="h-8 w-8 text-blue-500 mr-3"
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
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
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
              className="text-red-500 hover:text-red-700"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
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
          className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-3"
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
            'Upload File'
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800 mb-1">Upload Failed</h4>
                <p className="text-sm text-red-700">{error}</p>
                {retryCount > 0 && retryCount < 3 && (
                  <p className="text-xs text-red-600 mt-1">Retry attempt {retryCount} of 3</p>
                )}
                {canRetry && retryCount < 3 && (
                  <button
                    onClick={handleRetry}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry Upload
                  </button>
                )}
                {retryCount >= 3 && (
                  <div className="mt-3 p-3 bg-red-100 rounded border border-red-300">
                    <p className="text-xs text-red-800">
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
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <svg
                className="h-5 w-5 text-green-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Upload Successful!</p>
                <p className="text-sm text-green-700 mt-1">
                  File: <span className="font-semibold">{uploadedFileName}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Text Display */}
        {extractedText && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Extracted Text:</h3>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{extractedText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUpload
