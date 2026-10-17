import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'

function Footer() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubscribe = async () => {
    try {
      const response = await fetch('http://localhost:3000/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const result = await response.json()
      setMessage(result.message)

      if (response.ok) {
        setEmail('')
      }
    } catch (error) {
      setMessage('Unable to subscribe. Please try again.')
    }
  }

  return (
    <footer className="footer">
      <div className="subscribe">
        <h3>SIGN UP FOR OUR DAILY INSIDER</h3>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <button onClick={handleSubscribe}>Subscribe</button>

        {message && <p>{message}</p>}
      </div>

      <div className="footer-content">
        <div>
          <h3>Explore</h3>
          <p>Home</p>
          <p>Questions</p>
          <p>Articles</p>
          <p>Tutorials</p>
        </div>

        <div>
          <h3>Support</h3>
          <p>FAQs</p>
          <p>Help</p>
          <p>Contact Us</p>
        </div>

        <div>
          <h3>Stay connected</h3>
          <div className="social-icons">
            <Link to="https://www.facebook.com/" aria-label="Facebook">
              <FaFacebook />
            </Link>

            <Link to="https://twitter.com/" aria-label="Twitter">
              <FaTwitter />
            </Link>

            <Link to="https://www.instagram.com/" aria-label="Instagram">
              <FaInstagram />
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <strong>DEV@Deakin 2026</strong>

        <div>
          <span>Privacy Policy</span>
          <span>Terms</span>
          <span>Code of Conduct</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer