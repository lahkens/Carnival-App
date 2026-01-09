'use client'
import React, { useState, useEffect } from 'react'
import { LogOut, Clock, TrendingUp, RefreshCcw } from 'lucide-react'
import { callAPI } from '../lib/api'
import styles from './ShopDashboard.module.css'

export default function ShopDashboard({ user, onLogout }) {
  const [transactions, setTransactions] = useState([])
  const [balance, setBalance] = useState(Number(user.coins || 0))
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    refreshAll()
  }, [])

  async function refreshAll() {
    setRefreshing(true)
    setError('')
    try {
      await Promise.all([refreshBalance(), loadTransactions()])
    } catch (err) {
      console.error(err)
    } finally {
      setRefreshing(false)
    }
  }

  async function refreshBalance() {
    try {
      const res = await callAPI('getShop', {
        shop_id: user.id,
        session_id: user.session_id
      })
      if (res.success) {
        setBalance(Number(res.coins || 0))
      } else {
        setError(res.message || 'Failed to fetch balance')
      }
    } catch (err) {
      setError('Network error fetching balance')
    }
  }

  async function loadTransactions() {
    try {
      const res = await callAPI('getShopTransactions', {
        shop_id: user.id,
        session_id: user.session_id
      })
      if (res.success) {
        // sort by newest first (timestamp already formatted)
        const list = res.transactions || []
        setTransactions(list)
      } else {
        setError(res.message || 'Failed to load transactions')
      }
    } catch (err) {
      setError('Network error fetching transactions')
    }
  }

  async function handleLogout() {
    try {
      await callAPI('shopLogout', {
        shop_id: user.id,
        session_id: user.session_id
      })
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('blaize_user')
    onLogout()
  }

  return (
    <div className={styles.dashboard}>
      
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.userName}>{user.name}</h2>
          <p className={styles.userId}>ID: {user.id}</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={refreshAll} className={styles.refreshBtn}>
            <RefreshCcw size={18} />
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* BALANCE CARD */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceIcon}><TrendingUp size={32} /></div>
        <div>
          <p className={styles.balanceLabel}>Total Earnings</p>
          <h1 className={styles.balanceAmount}>
            {balance} coins
            {refreshing && ' · refreshing…'}
          </h1>
        </div>
      </div>

      {/* TRANSACTION SECTION */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}><Clock size={20} /> Transaction History</h3>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <p className={styles.loadingText}>Loading...</p>
        ) : transactions.length === 0 ? (
          <p className={styles.emptyText}>No transactions yet</p>
        ) : (
          <div className={styles.transactionsList}>
            {transactions.map((tx, idx) => (
              <div key={idx} className={styles.transactionItem}>
                <div>
                  <p className={styles.txEmployee}>Employee: {tx.employee_id}</p>
                  <p className={styles.txTime}>{tx.timestamp}</p>
                </div>
                <p className={styles.txAmount}>+{tx.amount} coins</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
