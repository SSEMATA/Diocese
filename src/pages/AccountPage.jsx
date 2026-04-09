import { useState } from 'react'
import { FiUser, FiMail, FiLock, FiUserPlus, FiLogIn, FiX } from 'react-icons/fi'

function AccountPage({ currentUser, onLogin, onLogout, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User'
  })
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSignUp = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) {
      setMessage('Please fill all fields')
      return
    }
    // Simple validation
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    if (users.find(u => u.email === formData.email)) {
      setMessage('User already exists')
      return
    }
    const newUser = { ...formData, id: Date.now() }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    localStorage.setItem('currentUser', JSON.stringify(newUser))
    onLogin(newUser)
    setMessage('Account created successfully!')
  }

  const handleSignIn = (e) => {
    e.preventDefault()
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => u.email === formData.email && u.password === formData.password)
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user))
      onLogin(user)
      setMessage('Logged in successfully!')
    } else {
      setMessage('Invalid credentials')
    }
  }

  if (currentUser) {
    return (
      <div className="account-page">
        <div className="account-container">
          <h1>Welcome, {currentUser.name}!</h1>
          <div className="user-info">
            <p><strong>Name:</strong> {currentUser.name}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> {currentUser.role}</p>
          </div>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </div>
    )
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <button className="btn-close" onClick={onClose}>
          <FiX />
        </button>
        <div className="account-toggle">
          <button
            className={isSignUp ? '' : 'active'}
            onClick={() => setIsSignUp(false)}
          >
            <FiLogIn /> Sign In
          </button>
          <button
            className={isSignUp ? 'active' : ''}
            onClick={() => setIsSignUp(true)}
          >
            <FiUserPlus /> Sign Up
          </button>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="account-form">
          <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>

          {isSignUp && (
            <div className="form-group">
              <label>
                <FiUser /> Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>
              <FiMail /> Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FiLock /> Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-submit">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>

          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  )
}

export default AccountPage