import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { getSessionId, createNewSession } from '../utils/session'
import { getErrorMessage, validateInput, shouldRetry } from '../utils/errorHandling'

function ChatUI() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState('')
  const [canRetry, setCanRetry] = useState(false)
  const [lastMessage, setLastMessage] = useState('')
  const messagesEndRef = useRef(null)

  // Initialize or retrieve session ID on mount
  useEffect(() => {
    const currentSessionId = getSessionId()
    setSessionId(currentSessionId)
    console.log('Current session ID:', currentSessionId)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleNewChat = () => {
    const newSessionId = createNewSession()
    setSessionId(newSessionId)
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you today?'
      }
    ])
    setError(null)
    console.log('Started new chat session:', newSessionId)
  }

  const handleSend = async (messageToSend = null) => {
    const currentInput = messageToSend || input
    
    if (!currentInput || !currentInput.trim()) {
      setError('Please enter a message')
      return
    }

    // Validate input
    const validation = validateInput(currentInput)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: currentInput
    }

    setMessages(prev => [...prev, userMessage])
    if (!messageToSend) {
      setInput('')
    }
    setLastMessage(currentInput)
    setIsLoading(true)
    setError(null)
    setCanRetry(false)

    try {
      // Make actual API call to backend with session ID
      const response = await axios.post(API_ENDPOINTS.CHAT, { 
        message: currentInput,
        session_id: sessionId
      }, {
        timeout: 30000 // 30 second timeout
      })
      
      // Add assistant response to messages
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.response || response.data.message || 'No response from assistant'
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      setCanRetry(shouldRetry(error))
      
      // Add error message to chat
      const errorChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `⚠️ ${errorMessage}`
      }
      setMessages(prev => [...prev, errorChatMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    if (lastMessage) {
      handleSend(lastMessage)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Modern Header */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Chat Assistant</h1>
        <p className="text-sm text-gray-600">Have a conversation with your AI agent</p>
      </div>

      {/* Session Info Bar */}
      <div className="mb-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3 shadow-md">
        <div className="flex items-center">
          <div className="bg-blue-600 rounded-full p-0.5 mr-1.5">
            <svg
              style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <span className="text-xs text-gray-500 block font-medium">Current Session</span>
            <span className="font-mono text-xs text-gray-800">{sessionId.slice(0, 20)}...</span>
          </div>
        </div>
        <button
          onClick={handleNewChat}
          className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center font-medium"
        >
          <svg
            style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Chat
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-xl h-[calc(100vh-16rem)] flex flex-col border border-gray-200">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[75%] rounded-xl p-2 shadow-md ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center mb-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1 mr-2">
                      <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">AI Assistant</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-white rounded-xl p-2 shadow-md border border-gray-200">
                <div className="flex items-center mb-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1 mr-2">
                    <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">AI Assistant</span>
                </div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-1.5 bg-gray-50">
          {error && (
            <div className="mb-1 p-1.5 bg-red-50 border-l-2 border-red-500 text-red-700 rounded text-[10px]">
              <div className="flex items-start">
                <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold">Error</p>
                  <p>{error}</p>
                  {canRetry && lastMessage && (
                    <button
                      onClick={handleRetry}
                      className="mt-1 px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium flex items-center"
                    >
                      <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retry
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex space-x-1.5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 resize-none border border-gray-300 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white shadow-md text-xs"
              rows="1"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-3 py-1 text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium flex items-center"
            >
              {isLoading ? (
                <>Sending...</>
              ) : (
                <>
                  <span>Send</span>
                  <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatUI



