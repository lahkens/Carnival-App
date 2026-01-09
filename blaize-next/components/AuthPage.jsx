'use client'
import React, { useState, useEffect} from 'react'
import { User, Store } from 'lucide-react'
import { callAPI } from '../lib/api'
import styles from './AuthPage.module.css'

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [userType, setUserType] = useState('employee')
  const [formData, setFormData] = useState({
    employee_id: '',
    shop_id: '',
    name: '',
    shop_name: '',
    owner_employee_id: '',
    pin: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    let action = ''
    let payload = {}

    if (userType === 'employee') {
      if (mode === 'login') {
        action = 'employeeLogin'
        payload = {
          employee_id: formData.employee_id,
          pin: formData.pin
        }
      } else {
        action = 'employeeSignup'
        payload = {
          employee_id: formData.employee_id,
          name: formData.name,
          pin: formData.pin
        }
      }
    } else {
      if (mode === 'login') {
        action = 'shopLogin'
        payload = {
          shop_id: formData.shop_id,
          password: formData.password
        }
      } else {
        action = 'shopSignup'
        payload = {
          shop_name: formData.shop_name,
          owner_employee_id: formData.owner_employee_id,
          password: formData.password
        }
      }
    }

    const result = await callAPI(action, payload)
    setLoading(false)

    if (result.success) {
      const userData = {
        type: userType,
        typeId: userType === 'employee' ? '0' : '1',
        id:
          userType === 'employee'
            ? formData.employee_id
            : result.shop_id || formData.shop_id,
        session_id: result.session_id,
        name:
          result.name ||
          result.shop_name ||
          formData.shop_name ||
          formData.name,
        coins: result.coins || 0
      }

      localStorage.setItem('blaize_user', JSON.stringify(userData))
      onLogin(userData)
    } else {
      setError(result.message || 'Authentication failed')
    }
  }
//   useEffect(() => {
//   localStorage.removeItem('blaize_user');
// }, [])

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <div className={styles.logoCircle}></div>
            <h1 className={styles.logoText}>blaize</h1>
          </div>
          <h2 className={styles.subtitle}>Winter Carnival 2024</h2>
        </div>

        <div className={styles.tabContainer}>
          <button
            className={mode === 'login' ? styles.tabActive : styles.tab}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={mode === 'signup' ? styles.tabActive : styles.tab}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <div className={styles.userTypeContainer}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="utype"
              value="employee"
              checked={userType === 'employee'}
              onChange={() => setUserType('employee')}
              className={styles.radio}
            />
            <User size={18} className={styles.radioIcon} /> Employee
          </label>

          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="utype"
              value="shop"
              checked={userType === 'shop'}
              onChange={() => setUserType('shop')}
              className={styles.radio}
            />
            <Store size={18} className={styles.radioIcon} /> Shop Owner
          </label>
        </div>

        <div className={styles.formContainer}>
          {userType === 'employee' ? (
            <>
              <input
                className={styles.input}
                type="text"
                placeholder="Employee ID"
                value={formData.employee_id}
                onChange={(e) =>
                  setFormData({ ...formData, employee_id: e.target.value })
                }
              />

              {mode === 'signup' && (
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              )}

              <input
                className={styles.input}
                type="password"
                placeholder="4-Digit PIN"
                value={formData.pin}
                onChange={(e) =>
                  setFormData({ ...formData, pin: e.target.value })
                }
                maxLength={4}
              />
            </>
          ) : (
            <>
              {mode === 'login' ? (
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Shop ID"
                  value={formData.shop_id}
                  onChange={(e) =>
                    setFormData({ ...formData, shop_id: e.target.value })
                  }
                />
              ) : (
                <>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Shop Name"
                    value={formData.shop_name}
                    onChange={(e) =>
                      setFormData({ ...formData, shop_name: e.target.value })
                    }
                  />
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Owner Employee ID"
                    value={formData.owner_employee_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        owner_employee_id: e.target.value
                      })
                    }
                  />
                </>
              )}

              <input
                className={styles.input}
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </div>

        <div className={styles.carnival}>
          <div className={styles.tentLeft}></div>
          <div className={styles.tentCenter}></div>
          <div className={styles.tentRight}></div>
        </div>
      </div>
    </div>
  )
}
  