import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <h1>🎌 Guess the Flag</h1>
      <button onClick={() => navigate('/play')}>
        Click here to start
      </button>
    </div>
  )
}
