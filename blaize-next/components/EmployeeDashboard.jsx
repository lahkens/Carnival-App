'use client'
import React, { useState, useEffect } from 'react'
import { LogOut, Coins, Clock } from 'lucide-react'
import { callAPI } from '../lib/api'
import styles from './EmployeeDashboard.module.css'

export default function EmployeeDashboard({ user, onLogout }) {
  const [transactions, setTransactions] = useState([])
  const [shops, setShops] = useState([])
  const [selectedShop, setSelectedShop] = useState('')
  const [amount, setAmount] = useState('')
  const [pinMode, setPinMode] = useState(false)
  const [pin, setPin] = useState('')
  const [balance, setBalance] = useState(Number(user.coins || 0))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentError, setPaymentError] = useState('')

  useEffect(() => {
    refreshBalance()
    loadTransactions()
    loadShops()
  }, [])

  async function refreshBalance() {
    const res = await callAPI('getEmployee', {
      employee_id: user.id,
      session_id: user.session_id
    })
    if (res.success) setBalance(Number(res.coins || 0))
  }

  async function loadShops() {
    const res = await callAPI('getAllShops', {})
    if (res.success) {
      setShops(res.shops || [])
    }
  }

  async function loadTransactions() {
    const res = await callAPI('getEmployeeTransactions', {
      employee_id: user.id,
      session_id: user.session_id
    })
    if (res.success) setTransactions(res.transactions || [])
  }

  function startPayment() {
    setPaymentError('')
    if (!selectedShop) return setPaymentError('Select a shop')
    if (!amount || Number(amount) <= 0) return setPaymentError('Enter valid amount')
    setPinMode(true)
  }

  async function confirmPayment() {
    setPaymentError('')

    const res = await callAPI('makePayment', {
      employee_id: user.id,
      employee_session_id: user.session_id,
      shop_id: selectedShop,
      amount: Number(amount),
      pin: pin
    })

    if (res.success) {
      setPinMode(false)
      setPin('')
      setAmount('')
      await refreshBalance()
      await loadTransactions()
    } else {
      setPaymentError(res.message || 'Payment failed')
    }
  }

  async function handleLogout() {
    await callAPI('employeeLogout', { employee_id: user.id, session_id: user.session_id })
    localStorage.removeItem('blaize_user')
    onLogout()
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.userName}>{user.name}</h2>
          <p className={styles.userId}>ID: {user.id}</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={20} />
        </button>
      </div>

      <div className={styles.balanceCard}>
        <div className={styles.balanceIcon}><Coins size={32} /></div>
        <div>
          <p className={styles.balanceLabel}>Carnival Coins</p>
          <h1 className={styles.balanceAmount}>{balance}</h1>
        </div>
      </div>

      {/* Payment Section */}
      <div className={styles.paymentBox}>
        <h3 className={styles.sectionTitle}>Make Payment</h3>

        <select
          className={styles.input}
          value={selectedShop}
          onChange={(e) => setSelectedShop(e.target.value)}
        >
          <option value="">Select Shop</option>
          {shops.map(s => (
            <option key={s.shop_id} value={s.shop_id}>
              {s.shop_name} ({s.shop_id})
            </option>
          ))}
        </select>

        <input
          className={styles.input}
          type="number"
          placeholder="Amount in coins"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {paymentError && <p className={styles.error}>{paymentError}</p>}

        <button className={styles.payButton} onClick={startPayment}>
          Pay
        </button>
      </div>

      {/* PIN Popup */}
      {pinMode && (
        <div className={styles.pinOverlay}>
          <div className={styles.pinModal}>
            <h3>Enter PIN</h3>
            <input
              className={styles.input}
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            {paymentError && <p className={styles.error}>{paymentError}</p>}
            <button className={styles.confirmBtn} onClick={confirmPayment}>Confirm</button>
            <button className={styles.cancelBtn} onClick={() => setPinMode(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}><Clock size={20} /> Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className={styles.emptyText}>No transactions yet</p>
        ) : (
          <div className={styles.transactionsList}>
            {transactions.map((tx, idx) => (
              <div key={idx} className={styles.transactionItem}>
                <div>
                  <p className={styles.shopName}>{tx.shop_name}</p>
                  <p className={styles.txTime}>{tx.timestamp}</p>
                </div>
                <p className={styles.txAmount}>-{tx.amount} coins</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
