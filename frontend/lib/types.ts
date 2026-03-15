export interface Student {
  id: string
  name: string
  studentId: string
  email: string
  enrolled: boolean
}

export interface Class {
  id: string
  name: string
  code: string
  instructor: string
  students: Student[]
  schedule: string
}

export interface AttendanceRecord {
  id: string
  studentId: string
  classId: string
  timestamp: Date
  method: 'ultrasonic' | 'manual'
  verified: boolean
}

export interface PatientRecord {
  id: string
  name: string
  patientId: string
  healthData: Record<string, string | number>
  lastUpdated: Date
}

export interface SOSSignal {
  id: string
  senderId: string
  latitude: number
  longitude: number
  timestamp: Date
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}
