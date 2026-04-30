import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { getSessionId, createNewSession } from '../utils/session'

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

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      // Make actual API call to backend with session ID
      const response = await axios.post(API_ENDPOINTS.CHAT, { 
        message: currentInput,
        session_id: sessionId
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
      setError('Failed to get response from the server. Please try again.')
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: error.response?.data?.error || 
                 'Sorry, I encountered an error. Please make sure the backend server is running and try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Session Info Bar */}
      <div className="mb-4 flex items-center justify-between bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-blue-500 mr-2"
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
          <span className="text-sm text-gray-600">
            Session: <span className="font-mono text-xs text-gray-800">{sessionId.slice(0, 20)}...</span>
          </span>
        </div>
        <button
          onClick={handleNewChat}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <svg
            className="h-4 w-4 mr-2"
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

      <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-12rem)] flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          {error && (
            <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="flex space-x-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 resize-none border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatUI
