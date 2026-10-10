import { Link } from 'react-router-dom'

// Displays the shared navigation bar.
function Header() {
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
        <button type="button" className="post-button">
          Post
        </button>

        <Link to="/login" className="nav-link">
          Login
        </Link>
      </nav>
    </header>
  )
}

export default Header