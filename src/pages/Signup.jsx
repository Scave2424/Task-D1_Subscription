import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import bcrypt from 'bcryptjs'
import {
  signupwithemailandpassword,
  signinwithGoogle,
  createUserDoc
} from '../firebase'

// Displays the signup form and returns the user to login after registration.
function Signup() {
  const [contact, setcontact] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  // Updates the field being edited while keeping the other values.
  function handleChange(event) {
    const { name, value } = event.target

    setcontact({
      ...contact,
      [name]: value
    })
  }

  // Validates the form, creates the account and saves its details.
  async function usersignup(event) {
    event.preventDefault()
    setError('')

    const displayName = contact.displayName.trim()
    const email = contact.email.trim().toLowerCase()
    const { password, confirmPassword } = contact

    // Checks for a first and last name in the single Name field.
    if (!displayName.includes(' ')) {
      setError('Please enter your first and last name.')
      return
    }

    if (password.length < 6 || password.trim() === '') {
      setError('Please enter a password with at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      // Creates the hash before saving the user's Firestore record.
      const passwordHash = await bcrypt.hash(password, 10)

      const { user } = await signupwithemailandpassword(
        email,
        password
      )

      await createUserDoc(user, {
        displayName,
        email,
        passwordHash
      })

      navigate('/login')
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('This email already has an account. Please log in.')
      } else {
        setError('Could not complete registration: ' + error.message)
      }
    }

    setLoading(false)
  }

  // Registers through Google and saves the profile without a password.
  async function googleSignup() {
    setError('')
    setLoading(true)

    try {
      const { user } = await signinwithGoogle()

      await createUserDoc(user, {})

      navigate('/login')
    } catch (error) {
      setError('Could not continue with Google: ' + error.message)
    }

    setLoading(false)
  }

  return (
    <main className="auth-page">
      <section className="auth-box signup-box">
        <h2>Create a DEV@Deakin Account</h2>

        <form className="signup-form" onSubmit={usersignup}>
          <label htmlFor="signup-name">Name*</label>
          <input
            id="signup-name"
            name="displayName"
            type="text"
            value={contact.displayName}
            onChange={handleChange}
            autoComplete="name"
            required
          />

          <label htmlFor="signup-email">Email*</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            value={contact.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="signup-password">Password*</label>
          <input
            id="signup-password"
            name="password"
            type="password"
            value={contact.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={6}
            required
          />

          <label htmlFor="signup-confirm">Confirm password*</label>
          <input
            id="signup-confirm"
            name="confirmPassword"
            type="password"
            value={contact.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={6}
            required
          />

          <p className="form-error" role="alert">
            {error}
          </p>

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            Create
          </button>

          <button
            className="auth-button google-button"
            type="button"
            onClick={googleSignup}
            disabled={loading}
          >
            Continue with Google
          </button>
        </form>
      </section>
    </main>
  )
}

export default Signup