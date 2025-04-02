import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Gishmak Urban Dictionary</title>
        <meta name="description" content="A community-driven urban dictionary for Gishmak terms" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/favicon/icon-192.png" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <Component {...pageProps} />
    </>
  )
} 