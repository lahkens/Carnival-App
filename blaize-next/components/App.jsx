'use client'
import React, { useState, useEffect } from 'react'
import AuthPage from './AuthPage'
import EmployeeDashboard from './EmployeeDashboard'
import ShopDashboard from './ShopDashboard'
import styles from './App.module.css'

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('blaize_user')
      if (stored) setUser(JSON.parse(stored))
    } catch (e) {}
  }, [])

  if (!user) return <div className={styles.full}><AuthPage onLogin={setUser} /></div>

  if (user.type === 'employee') {
    return <EmployeeDashboard user={user} onLogout={() => setUser(null)} />
  }

  return <ShopDashboard user={user} onLogout={() => setUser(null)} />
}
