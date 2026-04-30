// Session management utilities
export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const getSessionId = () => {
  let sessionId = localStorage.getItem('chatSessionId')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('chatSessionId', sessionId)
  }
  return sessionId
}

export const createNewSession = () => {
  const sessionId = generateSessionId()
  localStorage.setItem('chatSessionId', sessionId)
  return sessionId
}

export const clearSession = () => {
  localStorage.removeItem('chatSessionId')
}
