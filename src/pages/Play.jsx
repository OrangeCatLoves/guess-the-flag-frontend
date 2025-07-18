import React, { useState, useEffect }   from 'react'
import { useNavigate, useLocation }     from 'react-router-dom'
import axios                            from 'axios'
import { useSocket }                    from '../contexts/SocketContext'

// generate a stable client ID
function getClientId() {
  let cid = localStorage.getItem('gtfClientId')
  if (!cid) {
    cid = crypto.randomUUID()
    localStorage.setItem('gtfClientId', cid)
  }
  return cid
}

export default function Play() {
  const navigate      = useNavigate()
  const sessionId     = new URLSearchParams(useLocation().search).get('session')
  const API           = import.meta.env.VITE_API_URL
  const ROUND_DURATION = 25 // seconds

  const { socket }    = useSocket()
  const [clientId]    = useState(getClientId)

  // component state
  const [session,    setSession]     = useState(null)
  const [round,      setRound]       = useState(1)
  const [timeLeft,   setTimeLeft]    = useState(ROUND_DURATION)
  const [usedHints,  setUsedHints]   = useState([])
  const [guess,      setGuess]       = useState('')
  const [totalScore, setTotalScore]  = useState(0)
  const [submitted,  setSubmitted]   = useState(false)
  const [rehydrated, setRehydrated]  = useState(false)

  // fetch session & initial timer
  useEffect(() => {
    if (!sessionId) return navigate('/')
    axios.get(`${API}/api/session/${sessionId}`)
      .then(({ data }) => {
        setSession(data)
        const startMs    = new Date(data.startedAt).getTime()
        const elapsedSec = Math.floor((Date.now() - startMs)/1000)
        const idx        = Math.min(Math.floor(elapsedSec / ROUND_DURATION), 4)
        const secInto    = elapsedSec % ROUND_DURATION
        setRound(idx + 1)
        setTimeLeft(Math.max(ROUND_DURATION - secInto, 0))
      })
      .catch(() => {
        alert('Failed to load session')
        navigate('/')
      })
  }, [sessionId, navigate])

  // reset per‑round UI
  useEffect(() => {
    setUsedHints([])
    setGuess('')
    setSubmitted(false)
    setRehydrated(false)
  }, [round])

  // re‑join & rehydrate hints, score & submit‑status
  useEffect(() => {
    if (socket && session && !rehydrated) {
      socket.emit('join-session', { sessionId, clientId })
      setRehydrated(true)
    }
  }, [socket, session, sessionId, clientId, rehydrated])

  // listen for timer ticks
  useEffect(() => {
    if (!socket) return
    const onTimer = ({ round: r, timeLeft: t }) => {
      setRound(r)
      setTimeLeft(t)
    }
    socket.on('timer', onTimer)
    return () => { socket.off('timer', onTimer) }
  }, [socket])

  // rehydrate state (score & submittedRounds)
  useEffect(() => {
    if (!socket) return
    const onRehydrate = ({ totalScore: ts, submittedRounds }) => {
      setTotalScore(ts)
      if (submittedRounds.includes(round)) {
        setSubmitted(true)
      }
    }
    socket.on('rehydrate-state', onRehydrate)
    return () => { socket.off('rehydrate-state', onRehydrate) }
  }, [socket, round])

  // request a hint
  const handleUseHint = () => {
    if (submitted || usedHints.length >= 3) return
    socket.emit('use-hint', { sessionId, round, clientId })
  }

  // receive hint(s)
  useEffect(() => {
    if (!socket) return
    const onHint = ({ hint, error }) => {
      if (error) alert(error)
      else      setUsedHints(h => [...h, hint])
    }
    socket.on('hint-selected', onHint)
    return () => { socket.off('hint-selected', onHint) }
  }, [socket])

  // submit guess (now includes round)
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
      timeLeft,
      clientId
    })
    setSubmitted(true)
  }

  // listen for score updates & game over
  useEffect(() => {
    if (!socket) return
    const onScore = ({ socketId, totalScore }) => {
      if (socketId === socket.id) setTotalScore(totalScore)
    }
    const onOver  = data => navigate('/results', { state: data })
    socket.on('score-update', onScore)
    socket.on('game-over',    onOver)
    return () => {
      socket.off('score-update', onScore)
      socket.off('game-over',    onOver)
    }
  }, [socket, navigate])

  if (!session || !session.flags || !session.flags[round - 1]) {
    return <div style={{ textAlign:'center', color:'#fff' }}>Loading game…</div>
  }

  const flag = session.flags[round - 1]
  return (
    <div className="app-container" style={{ justifyContent:'flex-start', paddingTop:'2rem' }}>
      <h2 style={{ color:'#fff', marginBottom:'.5rem' }}>Flag #{round}</h2>
      <div style={{ textAlign:'center', margin:'1rem 0' }}>
        <img
          src={`${API}${flag.imagePath}`}
          alt="Flag"
          style={{ maxWidth:'80%', maxHeight:'50vh', border:'4px solid #fff', borderRadius:8 }}
        />
      </div>
      <div style={{ color:'#fff', fontSize:18, marginBottom:'1rem' }}>
        Time Remaining: {timeLeft}s
      </div>
      <button
        onClick={handleUseHint}
        disabled={usedHints.length >= 3 || submitted}
        style={{
          margin:'1rem 0',
          padding:'0.5rem 1rem',
          background: usedHints.length < 3 ? '#007bff' : '#555',
          color:'#fff', border:'none', borderRadius:4,
          cursor: usedHints.length < 3 ? 'pointer' : 'not-allowed'
        }}
      >
        Use Hint ({usedHints.length}/3)
      </button>
      <div style={{ color:'#fff', marginBottom:'1.5rem' }}>
        {usedHints.map((h,i) => (
          <p key={i} style={{ margin:'4px 0' }}>{h}</p>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:'2rem' }}>
        <input
          type="text"
          value={guess}
          disabled={submitted}
          onChange={e => setGuess(e.target.value)}
          placeholder="Enter your guess"
          maxLength={60}
          style={{ padding:8, fontSize:16, width:300, boxSizing:'border-box' }}
        />
        <button
          onClick={handleSubmit}
          disabled={submitted}
          style={{
            padding:'0.5rem 1rem',
            background: submitted ? '#555' : '#28a745',
            color:'#fff', border:'none', borderRadius:4,
            cursor: submitted ? 'not-allowed' : 'pointer'
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
