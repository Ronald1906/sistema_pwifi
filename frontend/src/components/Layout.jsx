import React from 'react'
import styles from '@/styles/Home.module.css'
import Navbar from './Navbar'

const Layout = ({ children }) => {
  return (
    <div className={styles.cuerpo}>
      <Navbar/>
      <div className={styles.contenido}>
        {children}
      </div>    
    </div>
  )
}

export default Layout
