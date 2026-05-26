import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>🌸</div>
      <button className={styles.btn}>dotMaxine Waitlist</button>
    </nav>
  )
}
