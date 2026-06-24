import Head from 'next/head'
import Survey from '@/components/Survey'

export default function Home() {
  return (
    <>
      <Head>
        <title>Encuesta · App Parques Nacionales</title>
        <meta name="description" content="Encuesta de aceptación de app para visitas guiadas en parques nacionales" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Survey />
    </>
  )
}
