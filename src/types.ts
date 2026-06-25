export interface SurveyResponse {
  id: string
  ts: number
  answers: Record<string, string>
}

// Lo que el cliente envía — sin id ni ts
export interface SurveyPayload {
  answers: Record<string, string>
}