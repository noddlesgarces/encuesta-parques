import { useEffect, useState, useCallback } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts'
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

const COLOR_SI = '#1D9E75'
const COLOR_NO = '#D85A30'
const COLOR_IDEAL = '#185fa5'
const COLOR_SEC = '#7F77DD'
const COLOR_PAS = '#BA7517'
const COLOR_OUT = '#888780'

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

// ── Análisis avanzado ────────────────────────────────────────────────────────

function computeAdvanced(responses: SurveyResponse[]) {
  const total = responses.length
  console.log('computeAdvanced llamado con:', total, 'respuestas')
  if (!total) return null

  const si = (id: string) => (r: SurveyResponse) => r.answers[id] === 'Sí'
  const no = (id: string) => (r: SurveyResponse) => r.answers[id] === 'No'

  // Tasa de adopción real: P3 + P4 + P5 todas Sí
  const adopcion = responses.filter(r => si('3')(r) && si('4')(r) && si('5')(r)).length

  // Índice de fidelidad: promedio de P7 + P8 + P9
  const fidelidad = responses.filter(r => si('7')(r) && si('8')(r) && si('9')(r)).length

  // Rechazo a autonomía digital: acepta QR (P5=Sí) pero necesita guía (P6=No)
  const prefGuia = responses.filter(r => si('5')(r) && no('6')(r)).length

  // Usuario pasivo: le gusta la app (P3=Sí) pero no la usaría activamente
  const pasivo = responses.filter(r => si('3')(r) && no('7')(r) && no('8')(r)).length

  console.log('prefGuia raw:', prefGuia, '/ pasivo raw:', pasivo)

  // Perfiles de usuario (P1 × P2)
  const perfilIdeal = responses.filter(r => si('1')(r) && si('2')(r)).length  // visitante + guiado
  const perfilSolo = responses.filter(r => si('1')(r) && no('2')(r)).length  // visitante autónomo
  const perfilNovato = responses.filter(r => no('1')(r) && si('2')(r)).length  // no visita pero le gustan guías
  const perfilFuera = responses.filter(r => no('1')(r) && no('2')(r)).length  // fuera del target

  // Radar de dimensiones (0-100)
  const radarData = [
    { dimension: 'Adopción', valor: pct(adopcion, total) },
    { dimension: 'Fidelidad', valor: pct(fidelidad, total) },
    { dimension: 'QR', valor: pct(responses.filter(si('5')).length, total) },
    { dimension: 'Autonomía', valor: pct(responses.filter(si('6')).length, total) },
    { dimension: 'Registro', valor: pct(responses.filter(si('7')).length, total) },
    { dimension: 'Reporte', valor: pct(responses.filter(si('8')).length, total) },
  ]

  return {
    total,
    adopcion: pct(adopcion, total),
    fidelidad: pct(fidelidad, total),
    prefGuia: pct(prefGuia, total),
    pasivo: pct(pasivo, total),
    perfiles: [
      { name: 'Visitante guiado', value: perfilIdeal, color: COLOR_IDEAL, desc: 'Usuario ideal · P1+P2 Sí' },
      { name: 'Visitante autónomo', value: perfilSolo, color: COLOR_SEC, desc: 'Target secundario · P1 Sí, P2 No' },
      { name: 'Sin visitas', value: perfilNovato + perfilFuera, color: COLOR_OUT, desc: 'Fuera del target · P1 No' },
    ],
    radarData,
  }
}

// ── Componentes ──────────────────────────────────────────────────────────────

function QuestionDonut({ id, label, si, no }: { id: string; label: string; si: number; no: number }) {
  const total = si + no
  const pSi = pct(si, total)
  const data = [{ name: 'Sí', value: si }, { name: 'No', value: no }]

  return (
    <div className={styles.qCard}>
      <div className={styles.qCardLabel}>
        <span className={styles.qId}>P{id}</span>{label}
      </div>
      <div className={styles.donutRow}>
        <div className={styles.donutWrap}>
          <ResponsiveContainer width="100%" height={110}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={32} outerRadius={48}
                dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                <Cell fill={COLOR_SI} />
                <Cell fill={COLOR_NO} />
              </Pie>
              <Tooltip formatter={(v) => [`${String(v)} resp.`]}
                contentStyle={{ fontSize: 12, border: '0.5px solid #eee', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.donutCenter}>
            <span className={styles.donutPct}>{pSi}%</span>
            <span className={styles.donutSub}>Sí</span>
          </div>
        </div>
        <div className={styles.donutLegend}>
          <div className={styles.legendRow}>
            <span className={styles.legendDot} style={{ background: COLOR_SI }} />
            <span className={styles.legendLabel}>Sí</span>
            <span className={styles.legendVal}>{pSi}%</span>
            <span className={styles.legendCount}>({si})</span>
          </div>
          <div className={styles.legendRow}>
            <span className={styles.legendDot} style={{ background: COLOR_NO }} />
            <span className={styles.legendLabel}>No</span>
            <span className={styles.legendVal}>{100 - pSi}%</span>
            <span className={styles.legendCount}>({no})</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function OverviewChart({ responses, total }: { responses: SurveyResponse[]; total: number }) {
  const data = Object.entries(Q_LABELS).map(([id]) => {
    const si = responses.filter(r => r.answers[id] === 'Sí').length
    return { name: `P${id}`, Sí: si, No: total - si }
  })
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical"
        margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barCategoryGap="30%" barGap={2}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#888780' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#888780' }} axisLine={false} tickLine={false} width={28} />
        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ fontSize: 12, border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 8 }} />
        <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
        <Bar dataKey="Sí" fill={COLOR_SI} radius={[0, 3, 3, 0]} />
        <Bar dataKey="No" fill={COLOR_NO} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function AdvancedSection({ responses }: { responses: SurveyResponse[] }) {
  const adv = computeAdvanced(responses)
  if (!adv) return null

  const indexCards = [
    {
      label: 'Adopción real',
      val: `${adv.adopcion}%`,
      desc: 'P3 + P4 + P5 todas Sí',
      color: COLOR_SI,
      bg: '#e1f5ee',
    },
    {
      label: 'Fidelidad esperada',
      val: `${adv.fidelidad}%`,
      desc: 'P7 + P8 + P9 todas Sí',
      color: COLOR_IDEAL,
      bg: '#e8f4ff',
    },
    {
      label: 'Prefiere guía presencial',
      val: `${adv.prefGuia}%`,
      desc: 'P5 Sí pero P6 No',
      color: COLOR_PAS,
      bg: '#faeeda',
    },
    {
      label: 'Usuario pasivo',
      val: `${adv.pasivo}%`,
      desc: 'P3 Sí pero P7+P8 No',
      color: COLOR_NO,
      bg: '#faece7',
    },
  ]

  return (
    <>
      <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>
        Análisis avanzado
      </h2>

      {/* Índice cards */}
      <div className={styles.advCards}>
        {indexCards.map(c => (
          <div key={c.label} className={styles.advCard} style={{ borderTop: `3px solid ${c.color}` }}>
            <div className={styles.advLabel}>{c.label}</div>
            <div className={styles.advVal} style={{ color: c.color }}>{c.val}</div>
            <div className={styles.advDesc}>{c.desc}</div>
          </div>
        ))}
      </div>

      {/* Perfiles + Radar side by side */}
      <div className={styles.advCharts}>

        {/* Perfiles de usuario · Pie */}
        <div className={styles.overviewCard}>
          <div className={styles.advChartTitle}>Perfiles de usuario</div>
          <div className={styles.profileLayout}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={adv.perfiles} cx="50%" cy="50%"
                  innerRadius={46} outerRadius={72}
                  dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                  {adv.perfiles.map((p, i) => (
                    <Cell key={i} fill={p.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${String(v)} personas (${pct(Number(v), adv.total)}%)`]}
                  contentStyle={{ fontSize: 12, border: '0.5px solid #eee', borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.profileLegend}>
              {adv.perfiles.map((p, i) => (
                <div key={i} className={styles.profileRow}>
                  <span className={styles.legendDot} style={{ background: p.color }} />
                  <div>
                    <div className={styles.profileName}>{p.name}</div>
                    <div className={styles.profileDesc}>{p.desc}</div>
                  </div>
                  <span className={styles.profilePct} style={{ color: p.color }}>
                    {pct(p.value, adv.total)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Radar de dimensiones */}
        <div className={styles.overviewCard}>
          <div className={styles.advChartTitle}>Radar de dimensiones</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={adv.radarData} cx="50%" cy="50%" outerRadius="68%">
              <PolarGrid stroke="rgba(0,0,0,0.08)" />
              <PolarAngleAxis dataKey="dimension"
                tick={{ fontSize: 11, fill: '#888780' }} />
              <Radar name="Respuestas (%)" dataKey="valor"
                stroke={COLOR_IDEAL} fill={COLOR_IDEAL} fillOpacity={0.18} strokeWidth={2} />
              <Tooltip
                formatter={(v) => [`${String(v)}%`]}
                contentStyle={{ fontSize: 12, border: '0.5px solid #eee', borderRadius: 8 }}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className={styles.radarNote}>
            Cada dimensión muestra el % de encuestados que respondió Sí
          </div>
        </div>

      </div>
    </>
  )
}

// ── Dashboard principal ──────────────────────────────────────────────────────

export default function Dashboard() {
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [view, setView] = useState<'donuts' | 'overview'>('donuts')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/responses')
      const data: SurveyResponse[] = await res.json()

      // ← agrega esto
      console.log('Primera respuesta completa:', JSON.stringify(data[0], null, 2))
      console.log('Answers de la primera:', data[0]?.answers)
      console.log('P5 value:', data[0]?.answers['5'])
      console.log('P5 === Sí:', data[0]?.answers['5'] === 'Sí')

      setResponses(data)
      setLastUpdate(new Date())
    } catch { /* silencioso */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!autoRefresh) return
    const iv = setInterval(load, 10000)
    return () => clearInterval(iv)
  }, [autoRefresh, load])

  const total = responses.length
  const siCount = (qId: string) => responses.filter(r => r.answers[qId] === 'Sí').length
  const appPct = total
    ? pct(responses.filter(r => r.answers['3'] === 'Sí' && r.answers['4'] === 'Sí').length, total)
    : null

  const openAnswers = responses
    .filter(r => r.answers['10'] && r.answers['10'] !== '(Sin respuesta)')
    .slice().reverse()

  return (
    <div className={styles.wrap}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div>
          <h1>Dashboard · Encuesta app parques</h1>
          <p className={styles.sub}>
            {loading ? 'Cargando...'
              : lastUpdate
                ? `${total} respuesta${total !== 1 ? 's' : ''} · actualizado ${lastUpdate.toLocaleTimeString('es-CL')}`
                : ''}
          </p>
        </div>
        <div className={styles.actions}>
          <label className={styles.autoToggle}>
            <input type="checkbox" checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)} />
            Auto-refresh (10s)
          </label>
          <button className={styles.btnRefresh} onClick={load}>↻ Actualizar</button>
          <a href="/" className={styles.btnForm}>Ir al formulario →</a>
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}>Cargando respuestas...</div>
      ) : total === 0 ? (
        <div className={styles.empty}>
          Sin respuestas aún. Completa el <a href="/">formulario</a> para ver el análisis.
        </div>
      ) : (
        <>
          {/* KPIs */}
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

          {/* Toggle vista */}
          <div className={styles.viewToggle}>
            <button className={view === 'donuts' ? styles.toggleActive : styles.toggleBtn}
              onClick={() => setView('donuts')}>
              Detalle por pregunta
            </button>
            <button className={view === 'overview' ? styles.toggleActive : styles.toggleBtn}
              onClick={() => setView('overview')}>
              Vista general
            </button>
          </div>

          {view === 'donuts' && (
            <>
              <h2 className={styles.sectionTitle}>Preguntas binarias · P1–P9</h2>
              <div className={styles.qCards}>
                {Object.entries(Q_LABELS).map(([id, label]) => (
                  <QuestionDonut key={id} id={id} label={label}
                    si={siCount(id)} no={total - siCount(id)} />
                ))}
              </div>
            </>
          )}

          {view === 'overview' && (
            <>
              <h2 className={styles.sectionTitle}>Resumen general · P1–P9</h2>
              <div className={styles.overviewCard}>
                <OverviewChart responses={responses} total={total} />
              </div>
            </>
          )}

          {/* Análisis avanzado — siempre visible */}
          <AdvancedSection responses={responses} />

          {/* Respuestas abiertas */}
          <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>
            Respuestas abiertas · P10
          </h2>
          {openAnswers.length === 0 ? (
            <div className={styles.empty}>Sin respuestas abiertas aún.</div>
          ) : (
            <div className={styles.openCard}>
              {openAnswers.map((r, i) => (
                <div key={r.id}
                  className={`${styles.openItem} ${i === openAnswers.length - 1 ? styles.openItemLast : ''}`}>
                  <div className={styles.openMeta}>
                    <span className={styles.openTs}>{fmt(r.ts)}</span>
                    <span className={styles.openId}>ID {r.id}</span>
                  </div>
                  <div className={styles.badges}>
                    {Object.entries(r.answers).filter(([k]) => k !== '10').map(([k, v]) => (
                      <span key={k} className={v === 'Sí' ? styles.badgeSi : styles.badgeNo}>
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