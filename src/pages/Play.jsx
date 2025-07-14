import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Play() {
  const { search } = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(search)
  const mode = params.get('mode') // solo or duel
  const sessionId = params.get('session')
  const API = import.meta.env.VITE_API_URL

  const [flagData, setFlagData] = useState(null)
  const [timeLeft, setTimeLeft] = useState(8) // Number of seconds given to guess the flag

  // Fetch session (flag info)
  useEffect(() => {
    if (!sessionId) return navigate('/')
    axios
      .get(`${API}/api/session/${sessionId}`)
      .then(({ data }) => {
        setFlagData(data)
      })
      .catch(() => {
        alert('Failed to load session')
        navigate('/')
      })
  }, [sessionId])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  if (!flagData) {
    return <div style={{ textAlign: 'center', color: '#fff' }}>Loading game...</div>
  }

  return (
    <div className="app-container">
      <h2 style={{ color: '#fff' }}>Mode: {mode === 'duel' ? 'Duel' : 'Solo'}</h2>
      <div style={{ margin: '2rem 0', textAlign: 'center' }}>
        <img
          src={`${API}${flagData.imagePath}`}
          alt="Flag to guess"
          style={{ maxWidth: '80%', height: 'auto', border: '4px solid #fff', borderRadius: '8px' }}
        />
      </div>
      <div style={{ color: '#fff', fontSize: '1.5rem' }}>
        Time Remaining: {timeLeft}s
      </div>
      {/* Placeholder for input and submission (to be implemented later) */}
    </div>
  )
}
