'use client'

import { useState, useCallback } from 'react'
import { PatientRecord } from '@/lib/types'

export function usePatientRecords() {
  const [patients, setPatients] = useState<PatientRecord[]>([])

  const addPatient = useCallback((patient: Omit<PatientRecord, 'id' | 'lastUpdated'>) => {
    const newPatient: PatientRecord = {
      ...patient,
      id: Date.now().toString(),
      lastUpdated: new Date(),
    }
    setPatients(prev => [...prev, newPatient])
    return newPatient
  }, [])

  const updatePatient = useCallback((id: string, updates: Partial<Omit<PatientRecord, 'id'>>) => {
    setPatients(prev =>
      prev.map(patient =>
        patient.id === id
          ? { ...patient, ...updates, lastUpdated: new Date() }
          : patient
      )
    )
  }, [])

  const deletePatient = useCallback((id: string) => {
    setPatients(prev => prev.filter(patient => patient.id !== id))
  }, [])

  const getPatient = useCallback((id: string): PatientRecord | undefined => {
    return patients.find(patient => patient.id === id)
  }, [patients])

  const searchPatients = useCallback((query: string): PatientRecord[] => {
    return patients.filter(
      patient =>
        patient.name.toLowerCase().includes(query.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(query.toLowerCase())
    )
  }, [patients])

  const encodePatientData = useCallback((patientId: string): string => {
    const patient = getPatient(patientId)
    if (!patient) return ''

    // Encode patient data in a compact format for transmission
    const healthData = Object.entries(patient.healthData)
      .map(([key, value]) => `${key}:${value}`)
      .join('|')

    return `PATIENT:${patient.patientId}|NAME:${patient.name}|DATA:${healthData}|TIME:${new Date().toISOString()}`
  }, [getPatient])

  return {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    getPatient,
    searchPatients,
    encodePatientData,
  }
}
