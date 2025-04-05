import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🧠</span>
          <span className="auth-logo-name">PrepAI</span>
        </div>
        <h2 className="auth-heading">Welcome back</h2>
        <p className="auth-sub">Sign in to continue your placement prep</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field-group">
            <label>Email</label>
            <input type="email" required autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input type="password" required autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          No account? <Link to="/signup">Sign up free</Link>
        </p>
        <div className="demo-hint">
          Demo: <code>demo@prepai.dev</code> / <code>demo1234</code>
        </div>
      </div>
    </div>
  )
}
