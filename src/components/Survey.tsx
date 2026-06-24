import { useState } from 'react'
import styles from './Survey.module.css'

const QUESTIONS = [
  {
    id: '1',
    text: '¿Has visitado alguna vez un parque natural o área protegida en Chile?',
    ctx: null,
    type: 'binary',
  },
  {
    id: '2',
    text: '¿Realizas o realizarías visitas guiadas en parques o espacios naturales?',
    ctx: null,
    type: 'binary',
  },
  {
    id: '3',
    text: '¿Crees que una aplicación móvil mejoraría la experiencia de visita en un parque como las Dunas de Concón?',
    ctx: 'Las Dunas de Concón son un área de preservación ambiental. Una aplicación podría guiarte por senderos, darte información de flora y fauna y facilitar tu experiencia.',
    type: 'binary',
  },
  {
    id: '4',
    text: 'Si un parque natural ofreciera una aplicación oficial para visitantes, ¿la descargarías antes de ir?',
    ctx: null,
    type: 'binary',
  },
  {
    id: '5',
    text: '¿Usarías los códigos QR distribuidos por el parque para informarte sobre cada zona durante tu visita?',
    ctx: 'La app incluye códigos QR en puntos estratégicos del parque. Al escanearlos obtienes información del sector, flora/fauna local y recomendaciones de conducta.',
    type: 'binary',
  },
  {
    id: '6',
    text: '¿Te parece que el sistema de QR en distintos puntos del parque es una forma cómoda de acceder a información sin guía presencial?',
    ctx: null,
    type: 'binary',
  },
  {
    id: '7',
    text: '¿Estarías dispuesto/a a registrar tu visita mediante la aplicación al ingresar al parque?',
    ctx: 'La app permite registrar tu visita al ingresar al parque — útil para emergencias y control de afluencia.',
    type: 'binary',
  },
  {
    id: '8',
    text: 'Si presenciaras un incidente dentro del parque, ¿utilizarías la función de reporte de incidentes de la app?',
    ctx: 'La app tiene un módulo para reportar incidentes: daño ambiental, accidentes, conductas inadecuadas. Incluye descripción, foto opcional y ubicación automática.',
    type: 'binary',
  },
  {
    id: '9',
    text: '¿Crees que el módulo de reporte de incidentes contribuiría al cuidado del parque y la seguridad de los visitantes?',
    ctx: null,
    type: 'binary',
  },
  {
    id: '10',
    text: '¿Por qué usarías o no usarías esta aplicación en una visita a las Dunas de Concón? ¿Qué función te parece más útil o qué te generaría dudas?',
    ctx: null,
    type: 'open',
  },
]

export default function Survey() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [savedId, setSavedId] = useState('')

  const q = QUESTIONS[current]
  const total = QUESTIONS.length
  const progress = ((current + 1) / total) * 100

  function select(val: string) {
    setAnswers(prev => ({ ...prev, [q.id]: val }))
  }

  function next() {
    if (current < total - 1) setCurrent(c => c + 1)
  }

  function prev() {
    if (current > 0) setCurrent(c => c - 1)
  }

  async function submit() {
    setStatus('saving')
    const id = Math.random().toString(36).slice(2, 9)
    const entry = { id, ts: Date.now(), answers }
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
      if (!res.ok) throw new Error('Error al guardar')
      setSavedId(id)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const canAdvance = q.type === 'binary' ? !!answers[q.id] : true
  const isLast = current === total - 1

  if (status === 'done') {
    return (
      <div className={styles.done}>
        <div className={styles.doneIcon}>✓</div>
        <h2>¡Respuestas guardadas!</h2>
        <p>Gracias por participar. Tus respuestas están disponibles en el dashboard.</p>
        <p className={styles.doneId}>ID: {savedId}</p>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1>Encuesta · App parques nacionales</h1>
        <p>Dunas de Concón</p>
      </div>

      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.progressLabel}>
          Pregunta {current + 1} de {total}
        </span>
      </div>

      <div className={styles.card}>
        <div className={styles.qNum}>Pregunta {current + 1}</div>

        {q.ctx && <div className={styles.ctx}>{q.ctx}</div>}

        <div className={styles.qText}>{q.text}</div>

        {q.type === 'binary' && (
          <div className={styles.opts}>
            {['Sí', 'No'].map(v => (
              <button
                key={v}
                className={`${styles.opt} ${answers[q.id] === v ? styles.optSel : ''}`}
                onClick={() => select(v)}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        {q.type === 'open' && (
          <textarea
            className={styles.textarea}
            placeholder="Escribe tu respuesta aquí..."
            value={answers[q.id] || ''}
            onChange={e => select(e.target.value)}
            rows={4}
          />
        )}

        <div className={styles.nav}>
          {current > 0 ? (
            <button className={styles.btnPrev} onClick={prev}>← Atrás</button>
          ) : <span />}

          {isLast ? (
            <button
              className={styles.btnSubmit}
              onClick={submit}
              disabled={status === 'saving'}
            >
              {status === 'saving' ? 'Guardando...' : 'Finalizar y guardar'}
            </button>
          ) : (
            <button
              className={styles.btnNext}
              onClick={next}
              disabled={!canAdvance}
            >
              Siguiente →
            </button>
          )}
        </div>

        {status === 'error' && (
          <p className={styles.errMsg}>Error al guardar. Intenta de nuevo.</p>
        )}
      </div>
    </div>
  )
}
