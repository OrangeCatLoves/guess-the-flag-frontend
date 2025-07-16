// src/pages/Results.jsx
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Results() {
  const { state } = useLocation()
  const nav        = useNavigate()

  // If we weren’t passed any state, bounce home
  if (!state || !state.you || !state.opponent) {
    nav('/home', { replace: true })
    return null
  }

  const { you, opponent } = state
  const resultText =
    you.score >  opponent.score ? 'You Won!'  :
    you.score <  opponent.score ? 'You Lost!' :
                                  "It's a Tie!"

  return (
    <div className="app-container" style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ color: '#fff', marginBottom: '1rem' }}>Game Over</h1>

      <p style={{ color: '#fff', fontSize: '1.25rem' }}>
        <strong>You:</strong>     {Math.round(you.score)}
      </p>
      <p style={{ color: '#fff', fontSize: '1.25rem' }}>
        <strong>Opponent:</strong> {Math.round(opponent.score)}
      </p>

      <h2 style={{ color: '#fff', margin: '1.5rem 0' }}>
        {resultText}
      </h2>

      <button
        onClick={() => nav('/home')}
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          background: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}
      >
        Back to Home
      </button>
    </div>
  )
}
