import { useSearchParams } from 'react-router-dom'

export default function Play() {
  const [qs] = useSearchParams()
  const sessionId = qs.get('sessionId')

  return (
    <div style={{ padding: 20 }}>
      <h2>Game session: {sessionId || 'Not started'}</h2>
      {/* TODO: fetch `/session/${sessionId}` and render flag / hints */}
    </div>
  )
}
