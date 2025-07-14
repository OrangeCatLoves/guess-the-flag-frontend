import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../index.css'   // ensure you import your global CSS
import { useUser } from '../contexts/UserContext'
import { useSocket } from '../contexts/SocketContext'
import DuelModal from '../components/DuelModal'
import InviteModal from '../components/InviteModal'

export default function Home() {
  const { user } = useUser() // get user info from context
  const navigate = useNavigate()
  const { socket } = useSocket() // get socket from context
  const displayName = user.username || 'Player'
  const [onlineCount, setOnlineCount] = React.useState(0)
  const [onlineUsersList, setOnlineUsersList] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedOpponent, setSelectedOpponent] = useState(null)
  const [invitation, setInvitation] = useState(null);

  useEffect(() => {
    if (!socket) return
    socket.on('start-duel', ({ sessionId }) => {
      navigate(`/play?mode=duel&session=${sessionId}`)
    })
    return () => { socket.off('start-duel') }
  }, [socket])

  useEffect(() => {
    if (!socket) return;
    socket.on('invite-received', data => {
      setInvitation(data);
    });
    return () => socket.off('invite-received');
  }, [socket]);

  // Register with the socket server as soon as we have both socket & user
  useEffect(() => {
    if (!socket || !user.username) return
    socket.emit('register', {
      userId:   user.userId,
      username: user.username,
      guest: user.guest
    })
  }, [socket, user.userId, user.username, user.guest])

  // ← your existing listener for live updates
  useEffect(() => {
    if (!socket) return
    const handler = (users) => {
      setOnlineCount(users.length)
      setOnlineUsersList(users)
    }
    socket.on('online-users', handler)
    return () => {
      socket.off('online-users', handler)
    }
  }, [socket])
  
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

      {/* Show live online count */}
      <p style={{ color: '#fff', marginBottom: '2rem', fontSize: '1.25rem' }}>
        Online Users: {onlineCount}
      </p>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/play?mode=solo')}
          style={buttonStyle}
        >
          <span role="img" aria-label="solo">👤</span> Solo
        </button>
        <button
          onClick={() => {
            setSelectedOpponent(null)
            setShowModal(true)
          }}
          style={buttonStyle}
        >
          <span role="img" aria-label="duel">👥</span> Duel
        </button>
      </div>

      {showModal && (
        <DuelModal
          users={onlineUsersList.filter(u => u.socketId !== socket.id)}
          selectedId={selectedOpponent}
          onSelect={setSelectedOpponent}
          onSend={() => {
            socket.emit('invite', {
              toSocketId: selectedOpponent,
              from:     { userId: user.userId, username: user.username }
            })
            setShowModal(false)
          }}
          onClose={() => setShowModal(false)}
        />
      )}
      {invitation && (
        <InviteModal
          invitation={invitation}
          onAccept={() => {
            socket.emit('accept-invite', {
              inviterSocketId: invitation.socketId
            })
            setInvitation(null);
          }}
          onReject={() => setInvitation(null)}
        />
      )}

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
