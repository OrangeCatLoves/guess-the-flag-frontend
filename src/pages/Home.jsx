import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../index.css'   // ensure you import your global CSS

export default function Home() {
  const navigate = useNavigate()
  const displayName = localStorage.getItem('displayName') || 'Player'

  return (
    <div className="app-container">
      <h2 style={{ color:'#fff', marginBottom:'1rem' }}>
        Welcome, {displayName}!
      </h2>
      {/* Title + placeholder icon */}
      <h1 style={{ fontSize: '3rem', color: '#fff', marginBottom: '2rem' }}>
        <span role="img" aria-label="flag">🚩</span>{' '}
        GuessTheFlag
      </h1>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/play?mode=solo')}
          style={buttonStyle}
        >
          <span role="img" aria-label="solo">👤</span> Solo
        </button>
        <button
          onClick={() => navigate('/play?mode=duel')}
          style={buttonStyle}
        >
          <span role="img" aria-label="duel">👥</span> Duel
        </button>
      </div>

      {/* Description */}
      <div style={{ maxWidth: '600px', color: '#fff', lineHeight: 1.6 }}>
        <p><strong>Solo:</strong> You’re on your own—guess as many flags as you can within a time limit.</p>
        <p><strong>Duel:</strong> Challenge a friend! Pick an opponent and battle head-to-head: 90 seconds, up to 3 hints, and see who scores higher.</p>
        <p><em>The faster</em> you answer, the more points you earn. <em>The fewer hints</em> you use, the more bonus points you keep.</p>
        <p>Track your standing on the weekly leaderboard—become the next <strong>FlagMaster</strong>!</p>
      </div>
    </div>
  )
}

// shared button style
const buttonStyle = {
  backgroundColor: '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: '0.5rem',
  padding: '0.75rem 1.5rem',
  fontSize: '1.25rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  transition: 'background-color 0.2s',
}
