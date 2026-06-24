import { useState } from 'react'
import Head from 'next/head'
import styles from '@/styles/mockups.module.css'

interface Mockup {
  url: string
  name: string
}

export async function getServerSideProps() {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/mockups`)
    const data = await res.json()
    return { props: { mockups: data.mockups || [] } }
  } catch {
    return { props: { mockups: [] } }
  }
}

export default function MockupsPage({ mockups }: { mockups: Mockup[] }) {
  const [selected, setSelected] = useState<Mockup | null>(null)

  return (
    <>
      <Head>
        <title>Mockups · App Parques Nacionales</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.wrap}>
        <div className={styles.header}>
          <h1>Mockups</h1>
          <p>Interfaz de la aplicación de visitas guiadas · Dunas de Concón</p>
        </div>

        {mockups.length === 0 ? (
          <div className={styles.empty}>
            <span>No hay mockups subidos aún.</span>
          </div>
        ) : (
          <div className={styles.grid}>
            {mockups.map((m) => (
              <button
                key={m.url}
                className={styles.card}
                onClick={() => setSelected(m)}
              >
                <div className={styles.imgWrap}>
                  <img src={m.url} alt={m.name} className={styles.img} />
                </div>
                <div className={styles.cardLabel}>{m.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.lightbox} onClick={e => e.stopPropagation()}>
            <button className={styles.close} onClick={() => setSelected(null)}>✕</button>
            <img src={selected.url} alt={selected.name} className={styles.lightboxImg} />
            <div className={styles.lightboxLabel}>{selected.name}</div>
          </div>
        </div>
      )}
    </>
  )
}