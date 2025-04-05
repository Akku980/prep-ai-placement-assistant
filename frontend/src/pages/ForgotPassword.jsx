import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { forgotPassword } = useAuth()

  const submit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🧠</span>
          <span className="auth-logo-name">PrepAI</span>
        </div>
        <Link to="/login" className="back-link">← Back to sign in</Link>
        <h2 className="auth-heading">Reset password</h2>
        <p className="auth-sub">Enter your email and we'll send a reset link</p>

        {sent ? (
          <div className="auth-success">
            ✓ If that email is registered, a reset link has been sent.
          </div>
        ) : (
          <>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={submit}>
              <div className="field-group">
                <label>Email</label>
                <input type="email" required placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? <span className="spinner" /> : 'Send reset link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
