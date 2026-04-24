import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ChatUI from './components/ChatUI'
import FileUpload from './components/FileUpload'
import DocumentQuery from './components/DocumentQuery'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<ChatUI />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/query" element={<DocumentQuery />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
