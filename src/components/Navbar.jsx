import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createNewSession } from '../utils/session'

function Navbar() {
  const navigate = useNavigate()

  const handleNewChat = () => {
    createNewSession()
    navigate('/chat')
    // Reload the page to ensure the new session is picked up
    window.location.reload()
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-10">
          <Link to="/" className="flex items-center space-x-1.5">
            <div className="text-sm font-bold text-blue-600">
              🤖 AI Agent
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-xs text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Dashboard
            </Link>
            <Link 
              to="/chat" 
              className="text-xs text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Chat
            </Link>
            <Link 
              to="/upload" 
              className="text-xs text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Upload
            </Link>
            <Link 
              to="/query" 
              className="text-xs text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Search
            </Link>
            <Link 
              to="/trace" 
              className="text-xs text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Trace
            </Link>
            <button 
              onClick={handleNewChat}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-all shadow-sm"
            >
              New Chat
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
