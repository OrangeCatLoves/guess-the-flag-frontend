import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'

export default function LoginPage() {
  const { login } = useUser() // get login function from context
  const [mode, setMode] = useState('login')           // 'login' | 'register' | 'change'
  const [identifier, setIdentifier] = useState('')    // username/email for login
  const [username, setUsername] = useState('')        // for registration
  const [email, setEmail]         = useState('')      // for registration
  const [password, setPassword]   = useState('')
  const [oldPassword, setOld]     = useState('')      // for change
  const [newPassword, setNew]     = useState('')
  const nav = useNavigate()
  const API = import.meta.env.VITE_API_URL

  // Login with username OR email
  const handleLogin = async () => {
    try {
      const { data } = await axios.post(`${API}/auth/login`, {
        identifier,
        password
      })
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token
      login({
        userId: data.userId,
        username: data.displayName,
        token: data.token,
        guest: false
      })
      alert('Logged in!')
      nav('/home')
    } catch (e) {
      alert(e.response?.data?.error || 'Login failed')
    }
  }

  // Register needs username + email + password
  const handleRegister = async () => {
    try {
      await axios.post(`${API}/auth/register`, {
        username,
        email,
        password
      })
      alert('Account created! Please log in.')
      setMode('login')
    } catch (e) {
      alert(e.response?.data?.error || 'Registration failed')
    }
  }

  // Change password (JWT stored)
  const handleChange = async () => {
    const token = localStorage.getItem('token')
    if (!token) return alert('Please login first.')
    try {
      await axios.post(`${API}/auth/change-password`, {
        identifier,
        oldPassword,
        newPassword
      }, {
        headers: { Authorization: 'Bearer ' + token }
      })
      alert('Password changed!')
      setMode('login')
    } catch (e) {
      alert(e.response?.data?.error || 'Change failed')
    }
  }

  // — GUEST LOGIN
  const handleGuest = async () => {
    try {
        const { data } = await axios.post(`${API}/auth/guest`)
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.token
        login({
          userId: null,
          username: data.displayName,
          token: data.token,
          guest: true
        })
        alert(`Playing as ${data.displayName}`)
        nav('/home')
    } catch {
        alert('Could not start guest session')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '5rem auto', textAlign: 'center' }}>
      <h2>Account</h2>
      <div style={{ marginBottom: '1rem' }}>
        {['login','register','change'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              margin: '0 .5rem',
              padding: '.5rem 1rem',
              background: mode===m ? '#28a745' : '#ddd',
              color: mode===m ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            {m === 'login'
              ? 'Login'
              : m === 'register'
              ? 'Create Account'
              : 'Change Password'}
          </button>
        ))}
      </div>

      {/* Guest button always available */}
        <button onClick={handleGuest} style={guestBtn}>
        Play as Guest
        </button>

      {/* LOGIN */}
      {mode === 'login' && (
        <>
          <input
            style={inputStyle}
            placeholder="Username or Email"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
          /><br/>
          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          /><br/>
          <button style={submitStyle} onClick={handleLogin}>
            Login
          </button>
        </>
      )}

      {/* REGISTER */}
      {mode === 'register' && (
        <>
          <input
            style={inputStyle}
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          /><br/>
          <input
            style={inputStyle}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          /><br/>
          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          /><br/>
          <button style={submitStyle} onClick={handleRegister}>
            Create Account
          </button>
        </>
      )}

      {/* CHANGE PASSWORD */}
      {mode === 'change' && (
        <>
          <input
            style={inputStyle}
            placeholder="Username or Email"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
          /><br/>
          <input
            style={inputStyle}
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={e => setOld(e.target.value)}
          /><br/>
          <input
            style={inputStyle}
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={e => setNew(e.target.value)}
          /><br/>
          <button style={submitStyle} onClick={handleChange}>
            Change Password
          </button>
        </>
      )}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '.5rem',
  margin: '.5rem 0',
  fontSize: '1rem'
}

const submitStyle = {
  marginTop: '1rem',
  padding: '.5rem 1.5rem',
  fontSize: '1rem',
  background: '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer'
}

const guestBtn = { margin:'1rem 0', padding:'.5rem 1.5rem', background:'#007bff', color:'#fff', border:'none', borderRadius:4, cursor:'pointer' }
