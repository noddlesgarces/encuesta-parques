import Head from 'next/head'
import Dashboard from '@/components/Dashboard'

// Esta ruta es secreta — no está linkeada desde ningún lado.
// Acceso: /dashboard-admin-2024
export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Análisis · Encuesta Parques</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Dashboard />
    </>
  )
}
