import React from 'react'
import Layout from '@/components/Layout'
import {Card} from 'primereact/card'
import Link from 'next/link'
import styles from '@/styles/Home.module.css'

const Index = () => {
  return (
    <Layout>
      <Link href='puntos_wifi' className={styles.cartaInicio}>
        <Card title='Puntos WiFi'>
        <img className={styles.imgMapas} src={process.env.NEXT_PUBLIC_LOGO_PWIFI}  />
        </Card>
      </Link>
    </Layout>
  )
}

export default Index

