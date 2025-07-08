import React, { createContext, useContext, useEffect, useState } from 'react'

const UserContext = createContext()

export const useUser = () => useContext(UserContext)

export default function UserProvider({ children }) {
  const [user, setUser] = useState({
    userId: null,
    username: '',
    token: '',
    guest: false,
  })

  // load from localStorage on mount
  useEffect(() => {
    const storedUser = {
      userId: localStorage.getItem('userId'),
      username: localStorage.getItem('displayName'),
      token: localStorage.getItem('token'),
      guest: localStorage.getItem('guest') === 'true'
    }
    setUser(storedUser)
  }, [])

  const login = ({ userId, username, token, guest }) => {
    localStorage.setItem('userId', userId)
    localStorage.setItem('displayName', username)
    localStorage.setItem('token', token)
    localStorage.setItem('guest', guest)
    setUser({ userId, username, token, guest })
  }

  const logout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('displayName')
    localStorage.removeItem('token')
    localStorage.removeItem('guest')
    setUser({ userId: null, username: '', token: '', guest: false })
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}
