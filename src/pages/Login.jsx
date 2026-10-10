import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import bcrypt from 'bcryptjs'
import {
    db,
    loginwithemailandpassword,
    signinwithGoogle,
    createUserDoc
} from '../firebase'

// Displays both login options and opens home after a successful check.
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

    // Checks the Firebase account and the saved Firestore details.
    async function loginuser(event) {
        event.preventDefault()
        setError('')
        setLoading(true)

        const email = contact.email.trim().toLowerCase()
        const password = contact.password

        try {
            const { user } = await loginwithemailandpassword(
                email,
                password
            )

            const userDocRef = doc(db, 'users', user.uid)
            const userSnapshot = await getDoc(userDocRef)

            if (!userSnapshot.exists()) {
                setError('Your Firestore profile could not be found.')
            } else {
                const userDetails = userSnapshot.data()

                // Google-only profiles do not have a website password hash.
                if (!userDetails.passwordHash) {
                    setError('Please use Continue with Google for this account.')
                } else {
                    const passwordMatches = await bcrypt.compare(
                        password,
                        userDetails.passwordHash
                    )

                    // Opens home only when the saved email and password match.
                    if (
                        userDetails.email === email &&
                        passwordMatches
                    ) {
                        navigate('/')
                    } else {
                        setError(
                            'Incorrect email or password. Please try again or sign up for a free account.'
                        )
                    }
                }
            }
        } catch (error) {
            if (error.code === 'permission-denied') {
                setError('Could not read your profile. Check the Firestore rules.')
            } else {
                setError(
                    'Unable to log in. Check your details, try again, or sign up for a free account. Google users should use Continue with Google.'
                )
            }
        }

        setLoading(false)
    }

    // Signs in through Google and creates a profile if this is the first visit.
    async function googleLogin() {
        setError('')
        setLoading(true)

        try {
            const { user } = await signinwithGoogle()

            await createUserDoc(user, {})

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