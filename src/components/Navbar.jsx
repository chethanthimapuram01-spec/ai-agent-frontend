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
    <nav className="sticky top-0 z-50" style={{
      background: '#1e1b4b',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div className="container mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-xl font-bold" style={{
              color: '#f8fafc'
            }}>
              🤖 AI Agent
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-sm font-medium flex items-center relative group transition-colors hover:text-white"
              style={{color: '#cbd5e1'}}
            >
              <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/chat" 
              className="text-sm font-medium flex items-center relative group transition-colors hover:text-white"
              style={{color: '#cbd5e1'}}
            >
              <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/upload" 
              className="text-sm font-medium flex items-center relative group transition-colors hover:text-white"
              style={{color: '#cbd5e1'}}
            >
              <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/query" 
              className="text-sm font-medium flex items-center relative group transition-colors hover:text-white"
              style={{color: '#cbd5e1'}}
            >
              <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/trace" 
              className="text-sm font-medium flex items-center relative group transition-colors hover:text-white"
              style={{color: '#cbd5e1'}}
            >
              <svg style={{width: '10px', height: '10px', minWidth: '10px', minHeight: '10px', maxWidth: '10px', maxHeight: '10px'}} className="mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Trace
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <button 
              onClick={handleNewChat}
              className="px-4 py-2 text-sm text-white font-medium transition-all hover:opacity-90"
              style={{
                borderRadius: '9999px',
                background: '#4f46e5'
              }}
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



