# Encuesta · App Parques Nacionales

App Next.js con formulario de encuesta y dashboard de análisis en tiempo real.
Persistencia con **Vercel KV** (Redis).

## Rutas

- `/` → formulario (10 preguntas, sin datos personales)
- `/dashboard-admin-2024` → análisis en tiempo real (ruta secreta, sin login)

## Setup local

```bash
npm install
```

Copia `.env.local.example` a `.env.local` y llena las variables (ver abajo).

```bash
npm run dev
```

## Deploy en Vercel (paso a paso)

### 1. Sube el proyecto a GitHub

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/tu-usuario/encuesta-parques.git
git push -u origin main
```

### 2. Crea el proyecto en Vercel

- Ve a vercel.com → New Project → importa el repo
- Haz click en Deploy (sin variables por ahora)

### 3. Crea la base de datos KV

- En tu proyecto de Vercel: pestaña **Storage** → **Create Database** → **KV**
- Nombre: `encuesta-parques-kv` (o cualquiera)
- Click en **Connect Project** → selecciona tu proyecto

Vercel agrega automáticamente las variables de entorno al proyecto.

### 4. Para desarrollo local

- En la pestaña KV → botón `.env.local` → copia el contenido
- Pégalo en tu archivo `.env.local`

### 5. Redeploy

Después de conectar KV, haz un redeploy para que tome las variables:

```
Vercel Dashboard → Deployments → ... → Redeploy
```

## Variables de entorno necesarias

```
KV_URL
KV_REST_API_URL
KV_REST_API_TOKEN
KV_REST_API_READ_ONLY_TOKEN
```

Vercel las agrega solo al conectar el KV. Para local las copias desde el dashboard.

## Estructura

```
src/
├── pages/
│   ├── index.tsx                  → formulario
│   ├── dashboard-admin-2024.tsx   → dashboard (ruta secreta)
│   └── api/responses.ts           → API GET + POST con Vercel KV
├── components/
│   ├── Survey.tsx + .module.css
│   └── Dashboard.tsx + .module.css
├── styles/globals.css
└── types.ts
```
