// src/pages/Play.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSocket } from '../contexts/SocketContext'
import axios from 'axios'

export default function Play() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const params    = new URLSearchParams(search)
  const sessionId = params.get('session')
  const API       = import.meta.env.VITE_API_URL
  const ROUND_DURATION = 25

  const { socket } = useSocket()

  // component state
  const [session,   setSession]   = useState(null)
  const [now,       setNow]       = useState(Date.now())
  const [usedHints, setUsedHints] = useState([])
  const [guess,     setGuess]     = useState('')
  const [totalScore, setTotalScore] = useState(0)
  const [submitted,  setSubmitted]  = useState(false)

  // 1) fetch the session (flags + startedAt)
  useEffect(() => {
    if (!sessionId) return navigate('/')
    axios.get(`${API}/api/session/${sessionId}`)
      .then(({ data }) => setSession(data))
      .catch(() => { alert('Failed to load session'); navigate('/') })
  }, [sessionId])

  // 2) advance clock
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])

  // 3) derive round + timeLeft
  const startMs = session ? new Date(session.startedAt).getTime() : now
  const elapsed = Math.floor((now - startMs)/1000)
  const idx     = Math.min(Math.floor(elapsed/ROUND_DURATION), 4)
  const round   = idx + 1
  const timeLeft = elapsed >= ROUND_DURATION*5
    ? 0
    : ROUND_DURATION - (elapsed % ROUND_DURATION)
  const flag = session?.flags[idx]

  // 4) when the round index changes, clear in‐round state
  useEffect(() => {
    setUsedHints([])
    setGuess('')
    setSubmitted(false)
  }, [idx])

  // 5) handle hint‐use
  const handleUseHint = () => {
    if (usedHints.length >= 3) return
    const avail = flag.hints.filter(h => !usedHints.includes(h))
    if (!avail.length) return
    setUsedHints(prev => [...prev, avail[Math.floor(Math.random()*avail.length)]])
  }

  // 6) submit guess to server
  const handleSubmit = () => {
    if (submitted) return
    if (!guess.trim()) {
      alert('Please enter a guess!')
      return
    }
    socket.emit('submit-guess', {
      sessionId,
      round,
      guess,
      hintsUsed: usedHints.length,
      timeLeft
    })
    setSubmitted(true)
  }

  // 7) listen for score updates & game-over
  useEffect(() => {
    if (!socket) return
    const onScore = ({ socketId, totalScore }) => {
      if (socketId === socket.id) {
        setTotalScore(totalScore)
      }
    }
    const onOver = ({ you, opponent }) => {
      navigate('/results', { state: { you, opponent } })
    }
    socket.on('score-update', onScore)
    socket.on('game-over',   onOver)

    return () => {
      socket.off('score-update', onScore)
      socket.off('game-over',   onOver)
    }
  }, [socket])

  // loading guard
  if (!session || !flag) {
    return <div style={{ textAlign:'center', color:'#fff' }}>Loading game…</div>
  }

  return (
    <div className="app-container" style={{ justifyContent:'flex-start', paddingTop:'2rem' }}>
      <h2 style={{ color:'#fff', marginBottom:'0.5rem' }}>Flag #{round}</h2>

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

      <div style={{ color:'#fff', fontSize:'1.5rem', marginBottom:'1rem' }}>
        Time Remaining: {timeLeft}s
      </div>

      <div style={{ marginBottom:'1rem' }}>
        <button
          onClick={handleUseHint}
          disabled={usedHints.length>=3 || submitted}
          style={{
            padding:'0.5rem 1rem',
            background: usedHints.length<3 ? '#007bff':'#555',
            color:'#fff',
            border:'none',
            borderRadius:'0.25rem',
            cursor: usedHints.length<3 ? 'pointer':'not-allowed'
          }}
        >
          Use Hint ({usedHints.length}/3)
        </button>
      </div>

      <div style={{ color:'#fff', marginBottom:'1.5rem' }}>
        {usedHints.map((h,i)=>(
          <p key={i} style={{ margin:'0.25rem 0' }}>{h}</p>
        ))}
      </div>

      <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem', marginBottom:'2rem' }}>
        <input
          type="text"
          value={guess}
          disabled={submitted}
          onChange={e=>setGuess(e.target.value)}
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
            cursor: submitted?'not-allowed':'pointer'
          }}
        >
          {submitted ? 'Submitted' : 'Submit'}
        </button>
      </div>

      <div style={{ color:'#fff' }}>
        Your total so far: {Math.round(totalScore)}
      </div>
    </div>
  )
}
