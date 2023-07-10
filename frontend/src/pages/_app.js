import '@/styles/globals.css'
import Head from 'next/head';
import 'primereact/resources/themes/nova-alt/theme.css'
import "primereact/resources/primereact.min.css";
// import "primeicons/primeicons.css"; 

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>GEOPORTAL GAD SANTO DOMINGO</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="./img/logo_prefectura.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
