import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Results() {
  const { state } = useLocation()
  const nav       = useNavigate()

  if (!state?.you || !state?.opponent) {
    nav('/', { replace: true })
    return null
  }

  const { you, opponent } = state
  const resultText =
    you.score >  opponent.score ? 'You Won!' :
    you.score <  opponent.score ? 'You Lost!' :
                                  "It's a Tie!"

  return (
    <div className="app-container" style={{ textAlign:'center', padding:24 }}>
      <h1 style={{ color:'#fff', marginBottom:16 }}>Game Over</h1>
      <p style={{ color:'#fff', fontSize:18 }}>
        <strong>You:</strong>     {you.score.toFixed(0)}
      </p>
      <p style={{ color:'#fff', fontSize:18 }}>
        <strong>Opponent:</strong> {opponent.score.toFixed(0)}
      </p>
      <h2 style={{ color:'#fff', margin:'24px 0' }}>{resultText}</h2>
      <button
        onClick={()=>nav('/home')}
        style={{
          padding:'0.75rem 1.5rem',
          background:'#28a745',
          color:'#fff',
          border:'none',
          borderRadius:8,
          cursor:'pointer'
        }}
      >
        Back to Home
      </button>
    </div>
  )
}
