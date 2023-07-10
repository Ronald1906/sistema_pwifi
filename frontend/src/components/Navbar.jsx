import React, { useState } from 'react'
import styles from '@/styles/Home.module.css'
import Link from 'next/link';

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => {
    setOpen(!open);
  };

  return (
    <div className={styles.navbar}>
      <Link href='/'>
        <img className={styles.logo} src={process.env.NEXT_PUBLIC_LOGO_ICON}  />
      </Link>
      <div className={`${styles.navToggle} ${open ? styles.open : ''}`} onClick={toggleMenu}>
        <div className={styles.bar}></div>
      </div>
      <div className={`${styles.navItems} ${open ? styles.open : ''}`}>
        <Link href="/">Inicio</Link>
        <Link href="/mapas">Mapas</Link>
      </div>
    </div>
  )
}

export default Navbar
