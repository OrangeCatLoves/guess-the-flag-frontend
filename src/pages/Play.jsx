import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation }   from 'react-router-dom'
import axios                          from 'axios'
import { useSocket }                  from '../contexts/SocketContext'

export default function Play() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const params    = new URLSearchParams(search)
  const sessionId = params.get('session')
  const API       = import.meta.env.VITE_API_URL
  const ROUND_DURATION = 25

  const { socket } = useSocket()

  // state
  const [session,   setSession]   = useState(null)
  const [now,       setNow]       = useState(Date.now())
  const [usedHints, setUsedHints] = useState([])
  const [guess,     setGuess]     = useState('')
  const [totalScore,setTotalScore]= useState(0)
  const [submitted, setSubmitted] = useState(false)

  // 1) fetch session
  useEffect(() => {
    if (!sessionId) return navigate('/')
    axios.get(`${API}/api/session/${sessionId}`)
      .then(({ data }) => setSession(data))
      .catch(() => { alert('Failed to load session'); navigate('/') })
  }, [sessionId])

  // 2) clock tick
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])

  // 3) compute round + timeLeft
  const startMs = session ? new Date(session.startedAt).getTime() : now
  const elapsed = Math.floor((now - startMs)/1000)
  const idx     = Math.min(Math.floor(elapsed/ROUND_DURATION), 4)
  const round   = idx + 1
  const timeLeft= elapsed >= ROUND_DURATION*5
    ? 0
    : ROUND_DURATION - (elapsed % ROUND_DURATION)
  const flag    = session?.flags[idx]

  // 4) clear per‐round state
  useEffect(() => {
    setUsedHints([])
    setGuess('')
    setSubmitted(false)
  }, [idx])

  // 5) hint
  const handleUseHint = () => {
    if (submitted || usedHints.length >= 3) return
    socket.emit('use-hint', { sessionId, round })
  }

  // 6) listen for the server’s hint response
  useEffect(() => {
    if (!socket) return
    const onHint = ({ hint, error }) => {
      if (error) {
        alert(error)
      } else {
        setUsedHints(h => [...h, hint])
      }
    }
    socket.on('hint-selected', onHint)
    return () => { socket.off('hint-selected', onHint) }
  }, [socket])

  // 6) submit
  const handleSubmit = () => {
    if (submitted) return
    if (!guess.trim()) { alert('Enter a guess!'); return }
    socket.emit('submit-guess', {
      sessionId,
      guess,
      hintsUsed: usedHints.length,
      timeLeft
    })
    setSubmitted(true)
  }

  // 7) listen for updates & game-over
  useEffect(() => {
    if (!socket) return
    const onScore = ({ socketId, totalScore }) => {
      if (socketId === socket.id) setTotalScore(totalScore)
    }
    const onOver  = data => {
      navigate('/results', { state: data })
    }
    socket.on('score-update', onScore)
    socket.on('game-over',    onOver)
    return () => {
      socket.off('score-update', onScore)
      socket.off('game-over',    onOver)
    }
  }, [socket])

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
            borderRadius:8
          }}
        />
      </div>

      <div style={{ color:'#fff', fontSize:18, marginBottom:'1rem' }}>
        Time Remaining: {timeLeft}s
      </div>

      <button
        onClick={handleUseHint}
        disabled={usedHints.length >= 3 || submitted }
        style={{
          marginBottom:'1rem',
          padding:'0.5rem 1rem',
          background: usedHints.length<3?'#007bff':'#555',
          color:'#fff', border:'none', borderRadius:4,
          cursor: usedHints.length<3?'pointer':'not-allowed'
        }}
      >
        Use Hint ({usedHints.length}/3)
      </button>

      <div style={{ color:'#fff', marginBottom:'1.5rem' }}>
        {usedHints.map((h,i)=>(
          <p key={i} style={{ margin:'4px 0' }}>{h}</p>
        ))}
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:'2rem', justifyContent:'center' }}>
        <input
          type="text"
          value={guess}
          disabled={submitted}
          onChange={e=>setGuess(e.target.value)}
          placeholder="Enter your guess"
          maxLength={60}
          style={{
            padding:8, fontSize:16,
            width:300, boxSizing:'border-box'
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={submitted}
          style={{
            padding:'0.5rem 1rem',
            background: submitted?'#555':'#28a745',
            color:'#fff', border:'none', borderRadius:4,
            cursor: submitted?'not-allowed':'pointer'
          }}
        >
          {submitted?'Submitted':'Submit'}
        </button>
      </div>

      <div style={{ color:'#fff' }}>
        Your total so far: {Math.round(totalScore)}
      </div>
    </div>
  )
}
