import React from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
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
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Chat
            </Link>
            <Link 
              to="/upload" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Upload File
            </Link>
            <Link 
              to="/query" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Search Docs
            </Link>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              New Chat
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
