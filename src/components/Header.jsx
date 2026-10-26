import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

// Displays the shared navigation bar and handles logout.
function Header() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem('token'))
  )

  const navigate = useNavigate()
  const location = useLocation()

  // Updates the navigation when the route changes.
  useEffect(() => {
    setLoggedIn(Boolean(localStorage.getItem('token')))
  }, [location.pathname])

  // Clears the application session and signs out of Firebase.
  async function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setLoggedIn(false)

    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error.message)
    }

    navigate('/')
  }

  return (
    <header className="header">
      <Link to="/" className="brand">
        DEV@Deakin
      </Link>

      <input
        className="header-search"
        type="search"
        placeholder="🔍 Search..."
        aria-label="Search"
      />

      <nav>
        <Link to="/post" className="post-button">
          Post
        </Link>

        <Link to="/pricing" className="nav-link">
          Pricing
        </Link>

        {loggedIn ? (
          <button
            type="button"
            className="nav-link"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="nav-link">
            Login
          </Link>
        )}
      </nav>
    </header>
  )
}

export default Header