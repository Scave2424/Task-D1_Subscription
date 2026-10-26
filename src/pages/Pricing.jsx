import { useState } from 'react'
import { Link } from 'react-router-dom'

// Displays the Free and Paid plans and handles the upgrade process.
function Pricing() {
    const [showPayment, setShowPayment] = useState(false)
    const [cardName, setCardName] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvv, setCvv] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const savedUser = localStorage.getItem('user')
    const user = savedUser ? JSON.parse(savedUser) : null
    const token = localStorage.getItem('token')
    const currentPlan = user?.plan || 'Free'

    // Opens the payment form for a logged-in Free user.
    function openPayment() {
        setError('')
        setMessage('')

        if (!token || !user) {
            setError('Please log in before upgrading.')
            return
        }

        if (currentPlan === 'Paid') {
            setMessage('You are already on the Paid plan.')
            return
        }

        setShowPayment(true)
    }

    // Validates the payment form and requests the plan upgrade.
    async function handleUpgrade(event) {
        event.preventDefault()
        setError('')
        setMessage('')

        const cleanedCardNumber = cardNumber.replace(/\s/g, '')

        if (!cardName.trim()) {
            setError('Enter the name on the card.')
            return
        }

        if (!/^\d{16}$/.test(cleanedCardNumber)) {
            setError('Enter a valid 16-digit card number.')
            return
        }

        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            setError('Enter the expiry date in MM/YY format.')
            return
        }

        const [month, year] = expiry.split('/').map(Number)
        const expiryYear = 2000 + year
        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()

        if (month < 1 || month > 12) {
            setError('Enter a valid expiry month between 01 and 12.')
            return
        }

        if (
            expiryYear < currentYear ||
            (expiryYear === currentYear && month < currentMonth)
        ) {
            setError('Your card has expired. Enter a future expiry date.')
            return
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            setError('Enter a valid 3 or 4-digit CVV.')
            return
        }

        if (!token || !user) {
            setError('Please log in before upgrading.')
            return
        }

        if (currentPlan === 'Paid') {
            setError('You are already on the Paid plan.')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('http://localhost:3000/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || 'Could not upgrade your plan.')
            }

            const updatedUser = {
                ...user,
                plan: result.plan
            }

            localStorage.setItem('user', JSON.stringify(updatedUser))
            setMessage('Your plan has been upgraded to Paid.')
            setShowPayment(false)
        } catch (error) {
            setError(error.message || 'Could not upgrade your plan.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="pricing-page">
            <h2>Choose Your Plan</h2>
            <p className="pricing-intro">
                Select the plan that suits you.
            </p>

            <div className="pricing-container">
                <section
                    className={`pricing-card ${currentPlan === 'Free' && token ? 'selected-plan' : ''}`}
                >
                    <div className="pricing-card-heading">
                        <h3>Free</h3>
                        {currentPlan === 'Free' && token && (
                            <span className="plan-badge">Current plan</span>
                        )}
                    </div>

                    <p>Access to free posts.</p>
                    <p>Up to 5 posts per month.</p>
                    <p>Standard image upload limit.</p>

                    {currentPlan === 'Free' && token && (
                        <p className="current-plan">Your current plan</p>
                    )}
                </section>

                <section
                    className={`pricing-card ${currentPlan === 'Paid' && token ? 'selected-plan' : ''}`}
                >
                    <div className="pricing-card-heading">
                        <h3>Paid</h3>
                        {currentPlan === 'Paid' && token && (
                            <span className="plan-badge">Current plan</span>
                        )}
                    </div>

                    <p>Access to free and paid posts.</p>
                    <p>Increased monthly post limit.</p>
                    <p>Larger image upload limit.</p>

                    {currentPlan === 'Paid' && token ? (
                        <p className="current-plan">Your current plan</p>
                    ) : (
                        <button
                            className="auth-button"
                            type="button"
                            onClick={openPayment}
                        >
                            Upgrade Plan
                        </button>
                    )}
                </section>
            </div>

            {!token && (
                <p className="pricing-message">
                    Please <Link to="/login">log in</Link> to upgrade your plan.
                </p>
            )}

            {error && (
                <p className="form-error pricing-message" role="alert">
                    {error}
                </p>
            )}

            {message && (
                <p className="pricing-message" role="status">
                    {message}
                </p>
            )}

            {showPayment && (
                <div className="payment-overlay">
                    <section
                        className="payment-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="payment-title"
                    >
                        <h3 id="payment-title">Payment Details</h3>

                        <form onSubmit={handleUpgrade}>
                            <label htmlFor="card-name">Name on card</label>
                            <input
                                id="card-name"
                                type="text"
                                value={cardName}
                                onChange={(event) => setCardName(event.target.value)}
                                autoComplete="cc-name"
                                required
                            />

                            <label htmlFor="card-number">Card number</label>
                            <input
                                id="card-number"
                                type="text"
                                inputMode="numeric"
                                value={cardNumber}
                                onChange={(event) => setCardNumber(event.target.value)}
                                autoComplete="cc-number"
                                placeholder="16-digit test number"
                                maxLength={19}
                                required
                            />

                            <label htmlFor="card-expiry">Expiry (MM/YY)</label>
                            <input
                                id="card-expiry"
                                type="text"
                                value={expiry}
                                onChange={(event) => setExpiry(event.target.value)}
                                autoComplete="cc-exp"
                                placeholder="MM/YY"
                                maxLength={5}
                                required
                            />

                            <label htmlFor="card-cvv">CVV</label>
                            <input
                                id="card-cvv"
                                type="password"
                                inputMode="numeric"
                                value={cvv}
                                onChange={(event) => setCvv(event.target.value)}
                                autoComplete="cc-csc"
                                maxLength={4}
                                required
                            />

                            {error && (
                                <p className="form-error" role="alert">
                                    {error}
                                </p>
                            )}

                            <button
                                className="auth-button"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Confirm Upgrade'}
                            </button>

                            <button
                                className="auth-button google-button payment-cancel"
                                type="button"
                                onClick={() => {
                                    setShowPayment(false)
                                    setError('')
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </main>
    )
}

export default Pricing