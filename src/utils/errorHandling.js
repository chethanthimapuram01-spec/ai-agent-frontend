// Error handling utilities

export const ERROR_MESSAGES = {
  NETWORK: 'Unable to connect to the server. Please check your internet connection and try again.',
  SERVER: 'The server encountered an error. Please try again later.',
  TIMEOUT: 'Request timed out. The server is taking too long to respond.',
  FILE_TOO_LARGE: 'File is too large. Maximum file size is 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload PDF, TXT, DOC, or DOCX files.',
  EMPTY_INPUT: 'Please enter a message or query.',
  SESSION_EXPIRED: 'Your session has expired. Please refresh the page.',
  UPLOAD_FAILED: 'Failed to upload file. Please check the file and try again.',
  QUERY_FAILED: 'Failed to search documents. Please try again.',
  CHAT_FAILED: 'Failed to send message. Please check your connection and try again.',
  TRACE_FAILED: 'Failed to load execution traces. Please refresh to try again.',
  GENERIC: 'Something went wrong. Please try again.'
}

export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.GENERIC

  // Network errors
  if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
    return ERROR_MESSAGES.NETWORK
  }

  // Timeout errors
  if (error.code === 'ETIMEDOUT') {
    return ERROR_MESSAGES.TIMEOUT
  }

  // Server errors
  if (error.response) {
    const status = error.response.status
    
    if (status >= 500) {
      return ERROR_MESSAGES.SERVER
    }
    
    if (status === 401 || status === 403) {
      return ERROR_MESSAGES.SESSION_EXPIRED
    }
    
    if (status === 413) {
      return ERROR_MESSAGES.FILE_TOO_LARGE
    }
    
    // Return server error message if available
    if (error.response.data?.error) {
      return error.response.data.error
    }
    
    if (error.response.data?.message) {
      return error.response.data.message
    }
  }

  // Custom error messages
  if (error.message) {
    return error.message
  }

  return ERROR_MESSAGES.GENERIC
}

export const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  
  const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx']

  if (!file) {
    return { valid: false, error: 'No file selected' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE }
  }

  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  
  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE }
  }

  return { valid: true }
}

export const validateInput = (input, minLength = 1, maxLength = 10000) => {
  if (!input || !input.trim()) {
    return { valid: false, error: ERROR_MESSAGES.EMPTY_INPUT }
  }

  if (input.length > maxLength) {
    return { valid: false, error: `Input is too long. Maximum ${maxLength} characters allowed.` }
  }

  if (input.trim().length < minLength) {
    return { valid: false, error: `Input is too short. Minimum ${minLength} characters required.` }
  }

  return { valid: true }
}

export const isNetworkError = (error) => {
  return error.code === 'ECONNABORTED' || 
         error.message === 'Network Error' ||
         !error.response
}

export const shouldRetry = (error) => {
  // Retry on network errors or server errors (5xx)
  if (isNetworkError(error)) return true
  
  if (error.response && error.response.status >= 500) return true
  
  return false
}
