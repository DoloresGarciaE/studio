export type TipoProfesor = "TITULAR" | "PORCENTAJE" | "ALQUILER"
export type EstadoCuota = "PENDIENTE" | "PAGADA" | "VENCIDA" | "PARCIAL"
export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "MERCADOPAGO"

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

export interface Inscripcion {
  id: string
  studio_id: string
  alumno_id: string
  clase_id: string
  activa: boolean
  created_at?: string
  clases?: Pick<Clase, "id" | "nombre" | "arancel_mensual"> | null
  alumnos?: Pick<Alumno, "id" | "nombre" | "telefono"> | null
}

export interface Cuota {
  id: string
  studio_id: string
  inscripcion_id: string
  periodo: string // YYYY-MM-DD (primer día del mes)
  monto: number
  vencimiento: string // YYYY-MM-DD
  estado: EstadoCuota
  created_at?: string
  pagos?: Pago[] | null
  inscripciones?: Inscripcion | null
}

export interface Pago {
  id: string
  studio_id: string
  cuota_id: string
  monto: number
  metodo: MetodoPago
  fecha: string
  created_at?: string
  recibos?: Recibo | null
}

export interface Recibo {
  id: string
  studio_id: string
  pago_id: string
  numero: number
  created_at?: string
}
