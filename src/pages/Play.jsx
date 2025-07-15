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
  const [timeLeft, setTimeLeft] = useState(90)
  const [hints, setHints] = useState([])
  const [usedHints, setUsedHints] = useState([])
  const [guess, setGuess] = useState('')

  // Fetch session (flag info)
  useEffect(() => {
    if (!sessionId) return navigate('/')
    axios
      .get(`${API}/api/session/${sessionId}`)
      .then(({ data }) => {
        setFlagData(data)
        // convert hints object to array of formatted strings
        const raw = data.hints || {}
        const arr = []
        if (raw.population)   arr.push(`Population: ${raw.population}`)
        if (raw.last_letter)  arr.push(`Last letter: ${raw.last_letter}`)
        if (raw.word_count !== undefined) arr.push(`Word count: ${raw.word_count}`)
        if (raw.capital)      arr.push(`Capital: ${raw.capital}`)
        if (raw.word_size)    arr.push(`Word size: ${raw.word_size}`)
        setHints(arr)
        // synchronize timer based on session start time
        if (data.startedAt) {
          const startMs = new Date(data.startedAt).getTime()
          const nowMs = Date.now()
          const elapsedSec = Math.floor((nowMs - startMs) / 1000)
          setTimeLeft(Math.max(90 - elapsedSec, 0))
        }
      })
      .catch(() => {
        alert('Failed to load session')
        navigate('/')
      })
  }, [sessionId])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  // use a hint (max 3)
  const handleUseHint = () => {
    if (usedHints.length >= 3 || hints.length === 0) return
    const available = hints.filter(h => !usedHints.includes(h))
    if (!available.length) return
    const pick = available[Math.floor(Math.random() * available.length)]
    setUsedHints([...usedHints, pick])
  }

  // submit guess placeholder
  const handleSubmit = () => {
    alert(`You guessed: ${guess}`)
  }

  if (!flagData) {
    return <div style={{ textAlign: 'center', color: '#fff' }}>Loading game...</div>
  }

  return (
    <div
      className="app-container"
      style={{ justifyContent: 'flex-start', paddingTop: '2rem' }}
    >
      <h2 style={{ color: '#fff' }}>
        Mode: {mode === 'duel' ? 'Duel' : 'Solo'}
      </h2>

      {/* Flag */}
      <div style={{ margin: '1rem 0', textAlign: 'center' }}>
        <img
          src={`${API}${flagData.imagePath}`}
          alt="Flag to guess"
          style={{
            maxWidth: '80%',
            maxHeight: '50vh',
            width: 'auto',
            height: 'auto',
            border: '4px solid #fff',
            borderRadius: '8px'
          }}
        />
      </div>

      {/* Timer */}
      <div style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>
        Time Remaining: {timeLeft}s
      </div>

      {/* Hint Section */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={handleUseHint}
          disabled={usedHints.length >= 3}
          style={{
            padding: '0.5rem 1rem',
            background: usedHints.length < 3 ? '#007bff' : '#555',
            color: '#fff',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: usedHints.length < 3 ? 'pointer' : 'not-allowed'
          }}
        >
          Use Hint ({usedHints.length}/3)
        </button>
      </div>

      {/* Display used hints */}
      <div style={{ color: '#fff', marginBottom: '1.5rem' }}>
        {usedHints.map((h, idx) => (
          <p key={idx} style={{ margin: '0.25rem 0' }}>{h}</p>
        ))}
      </div>

      {/* Guess Input */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <input
          type="text"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          placeholder="Enter your guess"
          maxLength={60}
          style={{
            padding: '0.5rem',
            fontSize: '16px',        // fixed font size
            width: '300px',          // fixed width
            boxSizing: 'border-box'
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            padding: '0.5rem 1rem',
            background: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Submit
        </button>
      </div>
    </div>
  )
}
