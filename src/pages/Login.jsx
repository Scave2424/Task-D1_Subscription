import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signinwithGoogle } from '../firebase'

// Displays both login options and creates a session after successful login.
function Login() {
    const [contact, setcontact] = useState({
        email: '',
        password: ''
    })

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    // Updates the selected field without removing the other value.
    function handleChange(event) {
        const { name, value } = event.target

        setcontact({
            ...contact,
            [name]: value
        })
    }

    // Checks the credentials through the backend and saves the JWT session.
    async function loginuser(event) {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: contact.email.trim().toLowerCase(),
                    password: contact.password
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Unable to log in.')
            }

            localStorage.setItem('token', result.token)
            localStorage.setItem('user', JSON.stringify(result.user))

            navigate('/')
        } catch (error) {
            setError(error.message || 'Unable to log in. Please try again.')
        }

        setLoading(false)
    }

    // Verifies Google sign-in through the backend and saves the JWT session.
    async function googleLogin() {
        setError('')
        setLoading(true)

        try {
            const { user } = await signinwithGoogle()
            const idToken = await user.getIdToken()

            const response = await fetch('http://localhost:3000/google-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idToken })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Google sign-in failed.')
            }

            localStorage.setItem('token', result.token)
            localStorage.setItem('user', JSON.stringify(result.user))

            navigate('/')
        } catch (error) {
            setError('Could not continue with Google: ' + error.message)
        }

        setLoading(false)
    }

    return (
        <main className="auth-page">
            <section className="auth-box login-box">
                <div className="signup-link-row">
                    <Link to="/signup" className="signup-link">
                        Sign up
                    </Link>
                </div>

                <form className="login-form" onSubmit={loginuser}>
                    <label htmlFor="login-email">Your email</label>
                    <input
                        id="login-email"
                        name="email"
                        type="email"
                        value={contact.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                    />

                    <label htmlFor="login-password">Your password</label>
                    <input
                        id="login-password"
                        name="password"
                        type="password"
                        value={contact.password}
                        onChange={handleChange}
                        autoComplete="current-password"
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
                        Login
                    </button>

                    <button
                        className="auth-button google-button"
                        type="button"
                        onClick={googleLogin}
                        disabled={loading}
                    >
                        Continue with Google
                    </button>
                </form>
            </section>
        </main>
    )
}

export default Login