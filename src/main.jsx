import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import UserProvider from './contexts/UserContext'
import SocketProvider from './contexts/SocketContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
)

