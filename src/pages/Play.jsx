// src/pages/Play.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

export default function Play() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const sessionId = params.get('session')
  const API = import.meta.env.VITE_API_URL
  const ROUND_DURATION = 25

  // — component state
  const [session,   setSession]   = useState(null)
  const [now,       setNow]       = useState(Date.now())
  const [usedHints, setUsedHints] = useState([])
  const [guess,     setGuess]     = useState('')
  const [totalScore, setTotalScore] = useState(0)
  const [submitted,  setSubmitted]  = useState(false)

  // 1) load session once
  useEffect(() => {
    if (!sessionId) {
      navigate('/')
      return
    }
    axios
      .get(`${API}/api/session/${sessionId}`)
      .then(({ data }) => setSession(data))
      .catch(() => {
        alert('Failed to load session')
        navigate('/')
      })
  }, [sessionId])

  // 2) tick the clock every second
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])

  // 3) compute elapsed, idx, round, timeLeft
  // (we do it unconditionally, guarding session with a default)
  const startMs = session ? new Date(session.startedAt).getTime() : now
  const elapsed = Math.floor((now - startMs) / 1000)
  // figure out which round (0–4) we’re in, never past 4
  const idx   = Math.min(Math.floor(elapsed / ROUND_DURATION), 4)
  const round = idx + 1
  // if elapsed ≥ 5×ROUND_DURATION → we’re done and timeLeft should be 0
  const timeLeft = elapsed >= ROUND_DURATION * 5
    ? 0
    : ROUND_DURATION - (elapsed % ROUND_DURATION)
  const flag = session ? session.flags[idx] : null

  // 4) reset hints & guess internally whenever we actually move to a new flag
  useEffect(() => {
    if (!session) return
    setUsedHints([])
    setGuess('')
    setSubmitted(false)
  }, [session, idx])

  // — handlers
  const handleUseHint = () => {
    if (!flag) return
    if (usedHints.length >= 3) return
    const available = flag.hints.filter(h => !usedHints.includes(h))
    if (!available.length) return
    const pick = available[Math.floor(Math.random() * available.length)]
    setUsedHints(prev => [...prev, pick])
  }

  // scoring
  const hintPenalty = usedHints.reduce((sum,_,i)=>
    sum + [150, 300, 750][i]||0, 0)
  const base = Math.max(1500 - hintPenalty, 0)

  const handleSubmit = () => {
    if (submitted) return
    if (!guess.trim()) {
      alert('Please enter a guess!')
      return
    }
    // compute round points
    const pts = base * (timeLeft/ROUND_DURATION)
    setTotalScore(s => s + pts)
    setSubmitted(true)
  }

  // once we’ve fully elapsed all 5 rounds, redirect to results
  useEffect(() => {
    if (elapsed >= ROUND_DURATION * 5) {
      // tiny delay to let UI update to timeLeft=0
      setTimeout(() => {
        navigate('/results', {
          state: {
            you: {
              name: session.username || 'You',
              score: totalScore
            },
            opponent: {
              name: session.opponentName || 'Opponent',
              score: session.opponentScore || 0
            }
          }
        })
      }, 300)
    }
  }, [elapsed])

  // — early loading state
  if (!session || !flag) {
    return <div style={{ textAlign:'center', color:'#fff' }}>Loading game…</div>
  }

  // — render
  return (
    <div className="app-container" style={{ justifyContent:'flex-start', paddingTop:'2rem' }}>
      <h2 style={{ color:'#fff', marginBottom:'0.5rem' }}>Flag #{round}</h2>

      {/* Flag image */}
      <div style={{ textAlign:'center', margin:'0.5rem 0' }}>
        <img
          src={`${API}${flag.imagePath}`}
          alt="Flag"
          style={{
            maxWidth:'80%',
            maxHeight:'50vh',
            border:'4px solid #fff',
            borderRadius:'8px'
          }}
        />
      </div>

      {/* Timer */}
      <div style={{ color:'#fff', fontSize:'1.5rem', marginBottom:'1rem' }}>
        Time Remaining: {timeLeft}s
      </div>

      {/* Use Hint Button */}
      <div style={{ marginBottom:'1rem' }}>
        <button
          onClick={handleUseHint}
          disabled={usedHints.length >= 3 || submitted}
          style={{
            padding:'0.5rem 1rem',
            background: usedHints.length < 3 ? '#007bff' : '#555',
            color:'#fff',
            border:'none',
            borderRadius:'0.25rem',
            cursor: usedHints.length < 3 ? 'pointer' : 'not-allowed'
          }}
        >
          Use Hint ({usedHints.length}/3)
        </button>
      </div>

      {/* Display Used Hints */}
      <div style={{ color:'#fff', marginBottom:'1.5rem' }}>
        {usedHints.map((h, i) => (
          <p key={i} style={{ margin:'0.25rem 0' }}>{h}</p>
        ))}
      </div>

      {/* Guess Input */}
      <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem', marginBottom:'2rem' }}>
        <input
          type="text"
          value={guess}
          disabled={submitted}
          onChange={e => setGuess(e.target.value)}
          placeholder="Enter your guess"
          maxLength={60}
          style={{
            padding:'0.5rem',
            fontSize:'16px',
            width:'300px',
            boxSizing:'border-box'
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={submitted}
          style={{
            padding:'0.5rem 1rem',
            background: submitted?'#555':'#28a745',
            color:'#fff',
            border:'none',
            borderRadius:'0.25rem',
            cursor:submitted?'not-allowed':'pointer'
          }}
        >
          {submitted ? 'Submitted' : 'Submit'}
        </button>
      </div>
      <div style={{ color:'#fff' }}>Your total so far: {Math.round(totalScore)}</div>
    </div>
  )
}
