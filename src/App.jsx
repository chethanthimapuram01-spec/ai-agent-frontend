import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ChatUI from './components/ChatUI'
import FileUpload from './components/FileUpload'
import DocumentQuery from './components/DocumentQuery'
import ExecutionTrace from './components/ExecutionTrace'
import WorkflowDashboard from './components/WorkflowDashboard'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-8 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            AI Document Assistant
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Intelligent document processing, chat assistance, and workflow automation powered by advanced AI agents
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Routes>
          <Route path="/" element={<WorkflowDashboard />} />
          <Route path="/chat" element={<ChatUI />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/query" element={<DocumentQuery />} />
          <Route path="/trace" element={<ExecutionTrace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
