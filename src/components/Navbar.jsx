import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>.M</div>
      <a
        href="https://wa.me/971509653957"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.btn}
      >
        Work with us
      </a>
    </nav>
  )
}
