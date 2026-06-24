import { useEffect, useState, useCallback } from 'react'
import type { SurveyResponse } from '@/types'
import styles from './Dashboard.module.css'

const Q_LABELS: Record<string, string> = {
  '1': '¿Has visitado parques naturales en Chile?',
  '2': '¿Realizas visitas guiadas en espacios naturales?',
  '3': '¿Una app mejoraría la experiencia de visita?',
  '4': '¿La descargarías antes de ir al parque?',
  '5': '¿Usarías los códigos QR del parque?',
  '6': '¿El sistema QR es cómodo sin guía presencial?',
  '7': '¿Registrarías tu visita al ingresar?',
  '8': '¿Reportarías un incidente desde la app?',
  '9': '¿El reporte de incidentes contribuye al cuidado del parque?',
}

function pct(n: number, total: number) {
  if (!total) return 0
  return Math.round((n / total) * 100)
}

function fmt(ts: number) {
  return new Date(ts).toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Dashboard() {
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/responses')
      const data: SurveyResponse[] = await res.json()
      setResponses(data)
      setLastUpdate(new Date())
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Auto-refresh cada 10 segundos
  useEffect(() => {
    if (!autoRefresh) return
    const iv = setInterval(load, 10000)
    return () => clearInterval(iv)
  }, [autoRefresh, load])

  const total = responses.length

  const siCount = (qId: string) =>
    responses.filter(r => r.answers[qId] === 'Sí').length

  const appPct = total
    ? pct(
        responses.filter(r => r.answers['3'] === 'Sí' && r.answers['4'] === 'Sí').length,
        total
      )
    : null

  const openAnswers = responses
    .filter(r => r.answers['10'] && r.answers['10'] !== '(Sin respuesta)')
    .slice()
    .reverse()

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <div>
          <h1>Dashboard · Encuesta app parques</h1>
          <p className={styles.sub}>
            {loading
              ? 'Cargando...'
              : lastUpdate
              ? `${total} respuesta${total !== 1 ? 's' : ''} · actualizado ${lastUpdate.toLocaleTimeString('es-CL')}`
              : ''}
          </p>
        </div>
        <div className={styles.actions}>
          <label className={styles.autoToggle}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (10s)
          </label>
          <button className={styles.btnRefresh} onClick={load}>
            ↻ Actualizar
          </button>
          <a href="/" className={styles.btnForm}>
            Ir al formulario →
          </a>
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}>Cargando respuestas...</div>
      ) : total === 0 ? (
        <div className={styles.empty}>
          Sin respuestas aún. Completa el{' '}
          <a href="/">formulario</a> para ver el análisis.
        </div>
      ) : (
        <>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <div className={styles.mLabel}>Respuestas totales</div>
              <div className={styles.mVal}>{total}</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.mLabel}>Usarían la app</div>
              <div className={styles.mVal}>{appPct ?? '—'}%</div>
              <div className={styles.mSub}>P3 + P4 ambas Sí</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.mLabel}>Usarían QR</div>
              <div className={styles.mVal}>{pct(siCount('5'), total)}%</div>
              <div className={styles.mSub}>P5 Sí</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.mLabel}>Reportarían incidente</div>
              <div className={styles.mVal}>{pct(siCount('8'), total)}%</div>
              <div className={styles.mSub}>P8 Sí</div>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Preguntas binarias (Sí / No)</h2>
          <div className={styles.qCards}>
            {Object.entries(Q_LABELS).map(([id, label]) => {
              const si = siCount(id)
              const no = total - si
              const pSi = pct(si, total)
              const pNo = pct(no, total)
              return (
                <div key={id} className={styles.qCard}>
                  <div className={styles.qCardLabel}>
                    <span className={styles.qId}>P{id}</span> {label}
                  </div>
                  <div className={styles.barRow}>
                    <span className={styles.barLblSi}>Sí</span>
                    <div className={styles.barTrack}>
                      <div className={styles.barFillSi} style={{ width: `${pSi}%` }} />
                    </div>
                    <span className={styles.barPct}>{pSi}%</span>
                    <span className={styles.barCount}>{si} resp.</span>
                  </div>
                  <div className={styles.barRow}>
                    <span className={styles.barLblNo}>No</span>
                    <div className={styles.barTrack}>
                      <div className={styles.barFillNo} style={{ width: `${pNo}%` }} />
                    </div>
                    <span className={styles.barPct}>{pNo}%</span>
                    <span className={styles.barCount}>{no} resp.</span>
                  </div>
                </div>
              )
            })}
          </div>

          <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>
            Respuestas abiertas · Pregunta 10
          </h2>
          {openAnswers.length === 0 ? (
            <div className={styles.empty}>Sin respuestas abiertas aún.</div>
          ) : (
            <div className={styles.openCard}>
              {openAnswers.map((r, i) => (
                <div key={r.id} className={`${styles.openItem} ${i === openAnswers.length - 1 ? styles.openItemLast : ''}`}>
                  <div className={styles.openMeta}>
                    <span className={styles.openTs}>{fmt(r.ts)}</span>
                    <span className={styles.openId}>ID {r.id}</span>
                  </div>
                  <div className={styles.badges}>
                    {Object.entries(r.answers)
                      .filter(([k]) => k !== '10')
                      .map(([k, v]) => (
                        <span
                          key={k}
                          className={v === 'Sí' ? styles.badgeSi : styles.badgeNo}
                        >
                          P{k}: {v}
                        </span>
                      ))}
                  </div>
                  <div className={styles.openText}>{r.answers['10']}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
