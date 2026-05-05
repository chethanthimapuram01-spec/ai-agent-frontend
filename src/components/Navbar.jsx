import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createNewSession } from '../utils/session'

function Navbar() {
  const navigate = useNavigate()

  const handleNewChat = () => {
    createNewSession()
    navigate('/')
    // Reload the page to ensure the new session is picked up
    window.location.reload()
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">
              🤖 AI Agent
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Dashboard
            </Link>
            <Link 
              to="/chat" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Chat
            </Link>
            <Link 
              to="/upload" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Upload
            </Link>
            <Link 
              to="/query" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Search
            </Link>
            <Link 
              to="/trace" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Trace
            </Link>
            <button 
              onClick={handleNewChat}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
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
