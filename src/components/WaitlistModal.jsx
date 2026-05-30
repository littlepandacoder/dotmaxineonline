import { useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './WaitlistModal.module.css'

const NICHES = [
  'Fashion & Beauty',
  'Wellness & Fitness',
  'Food & Lifestyle',
  'Business & Finance',
  'Tech & Gaming',
  'Art & Design',
  'Travel & Adventure',
  'Other',
]

function WaitlistModalInner({ onClose }) {
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [niche, setNiche] = useState('')
  const [otherNiche, setOtherNiche] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email.'); return }
    setError('')
    setStep(1)
  }

  const handlePhoneSubmit = (e) => {
    e.preventDefault()
    if (phone.replace(/\D/g, '').length < 7) { setError('Please enter a valid phone number.'); return }
    setError('')
    setStep(2)
  }

  const submitNiche = async (selectedNiche) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, niche: selectedNiche }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
      return
    }
    setLoading(false)
    setStep(3)
  }

  const handleNicheSelect = (selected) => {
    setNiche(selected)
    if (selected !== 'Other') submitNiche(selected)
  }

  const onKeyDown = (e, handler) => { if (e.key === 'Enter') handler(e) }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">×</button>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${Math.min((step / 3) * 100, 100)}%` }} />
        </div>

        {step === 0 && (
          <form key="step-email" className={styles.step} onSubmit={handleEmailSubmit}>
            <p className={styles.stepCount}>01 — 03</p>
            <h2 className={styles.question}>What's your email?</h2>
            <input
              className={styles.textInput}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => onKeyDown(e, handleEmailSubmit)}
              autoFocus
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.ctaBtn}>
              Continue <span className={styles.arrow}>→</span>
            </button>
            <p className={styles.pressEnter}>Press Enter ↵</p>
          </form>
        )}

        {step === 1 && (
          <form key="step-phone" className={styles.step} onSubmit={handlePhoneSubmit}>
            <p className={styles.stepCount}>02 — 03</p>
            <h2 className={styles.question}>What's your phone number?</h2>
            <input
              className={styles.textInput}
              type="tel"
              placeholder="+971 50 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => onKeyDown(e, handlePhoneSubmit)}
              autoFocus
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.ctaBtn}>
              Continue <span className={styles.arrow}>→</span>
            </button>
            <p className={styles.pressEnter}>Press Enter ↵</p>
          </form>
        )}

        {step === 2 && (
          <div key="step-niche" className={styles.step}>
            <p className={styles.stepCount}>03 — 03</p>
            <h2 className={styles.question}>What niche are you in?</h2>
            <div className={styles.nicheGrid}>
              {NICHES.map((n) => (
                <button
                  key={n}
                  className={`${styles.nicheChip} ${niche === n ? styles.nicheChipActive : ''}`}
                  onClick={() => handleNicheSelect(n)}
                  disabled={loading}
                >
                  {n}
                </button>
              ))}
            </div>
            {niche === 'Other' && (
              <div className={styles.otherWrap}>
                <input
                  className={styles.textInput}
                  type="text"
                  placeholder="Tell us your niche"
                  value={otherNiche}
                  onChange={(e) => setOtherNiche(e.target.value)}
                  autoFocus
                />
                <button
                  className={styles.ctaBtn}
                  onClick={() => submitNiche(otherNiche || 'Other')}
                  disabled={loading}
                >
                  {loading ? 'Submitting…' : 'Submit'} <span className={styles.arrow}>→</span>
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div key="step-done" className={`${styles.step} ${styles.successStep}`}>
            <span className={styles.successGlyph}>✦</span>
            <h2 className={styles.question}>You're in.</h2>
            <p className={styles.successSub}>We'll reach out when we're ready for you.</p>
            <button className={styles.ctaBtn} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function WaitlistModal({ onClose }) {
  return createPortal(<WaitlistModalInner onClose={onClose} />, document.body)
}
