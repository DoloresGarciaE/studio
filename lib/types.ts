export type TipoProfesor = "TITULAR" | "PORCENTAJE" | "ALQUILER"

export interface Studio {
  id: string
  nombre: string
}

export interface Alumno {
  id: string
  studio_id: string
  nombre: string
  telefono: string | null
  email: string | null
  created_at?: string
}

export interface Profesor {
  id: string
  studio_id: string
  nombre: string
  tipo: TipoProfesor
  comision_pct: number | null
  tarifa_hora: number | null
  created_at?: string
}

export interface Salon {
  id: string
  studio_id: string
  nombre: string
  created_at?: string
}

export interface Clase {
  id: string
  studio_id: string
  nombre: string
  dia_horario: string | null
  arancel_mensual: number
  profesor_id: string | null
  salon_id: string | null
  created_at?: string
  // Relaciones embebidas (Supabase): clases.select("*, profesores(nombre), salones(nombre)")
  profesores?: { nombre: string } | null
  salones?: { nombre: string } | null
}
