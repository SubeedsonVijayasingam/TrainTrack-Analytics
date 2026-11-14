import { useState } from 'react'
import {
  GoogleOAuthProvider,
  GoogleLogin,
} from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'

import './App.css'

interface User {
  id: string
  name: string
  username: string
  email: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    try {
      setError('')

      const response = await fetch(
        'http://localhost:5000/api/users/google',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Google login failed')
      }

      localStorage.setItem('token', data.token)
      setUser(data.user)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong',
      )
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a file first.')
      return
    }

    const token = localStorage.getItem('token')

    if (!token) {
      setUploadMessage('Please sign in before uploading a file.')
      return
    }

    try {
      setUploading(true)
      setUploadMessage('')

      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(
        'http://localhost:5000/api/uploads',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'File upload failed')
      }

      setUploadMessage(
        `Successfully uploaded: ${data.file.originalName}`,
      )

      setSelectedFile(null)
    } catch (err) {
      setUploadMessage(
        err instanceof Error ? err.message : 'Upload failed',
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>TrainTrack</h1>
          <p>Learning Outcome Evaluation System</p>
        </div>

        {user ? (
          <div className="profile">{user.name}</div>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed')}
          />
        )}
      </header>

      {error && (
        <p role="alert" style={{ color: 'red', textAlign: 'center' }}>
          {error}
        </p>
      )}

      {user && (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Welcome, {user.name}! Google login successful.
        </p>
      )}

      <main className="dashboard">
        <section className="welcome">
          <h2>Training Effectiveness Dashboard</h2>
          <p>
            Monitor employee training, assessments, and workplace skill
            application.
          </p>
        </section>

        <section
          style={{
            background: 'white',
            padding: '25px',
            margin: '25px 0',
            borderRadius: '10px',
          }}
        >
          <h2>File Upload</h2>
          <p>Upload your training documents and files.</p>

          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.docx"
            onChange={(event) => {
              setSelectedFile(event.target.files?.[0] || null)
              setUploadMessage('')
            }}
          />

          {selectedFile && (
            <p>Selected file: {selectedFile.name}</p>
          )}

          <button
            onClick={handleFileUpload}
            disabled={uploading}
            style={{
              padding: '10px 20px',
              marginTop: '15px',
              cursor: 'pointer',
            }}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>

          {uploadMessage && (
            <p role="status" style={{ marginTop: '15px' }}>
              {uploadMessage}
            </p>
          )}
        </section>

        <section className="stats">
          <div className="card">
            <h3>Total Trainings</h3>
            <strong>12</strong>
            <p>Active training programs</p>
          </div>

          <div className="card">
            <h3>Employees Trained</h3>
            <strong>186</strong>
            <p>Employees participating</p>
          </div>

          <div className="card">
            <h3>Completion Rate</h3>
            <strong>78%</strong>
            <p>Training completion</p>
          </div>

          <div className="card">
            <h3>Effectiveness</h3>
            <strong>82%</strong>
            <p>Overall effectiveness</p>
          </div>
        </section>

        <section className="roles">
          <h2>System Users</h2>

          <div className="role-grid">
            <div className="role-card">
              <h3>HR / Admin</h3>
              <p>
                Create training programs, assign employees, monitor progress,
                and view effectiveness analytics.
              </p>
            </div>

            <div className="role-card">
              <h3>Employee</h3>
              <p>
                Complete training, take assessments, and submit self-evaluation
                about workplace skill application.
              </p>
            </div>

            <div className="role-card">
              <h3>Manager</h3>
              <p>
                Evaluate employee workplace performance and provide feedback on
                skill application.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function AppWithGoogleAuth() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    return <p>Google Client ID is missing. Check frontend/.env.local</p>
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  )
}

export default AppWithGoogleAuth