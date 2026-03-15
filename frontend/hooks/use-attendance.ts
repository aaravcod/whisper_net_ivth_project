'use client'

import { useState, useCallback } from 'react'
import { AttendanceRecord, Student } from '@/lib/types'

export function useAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [presentStudents, setPresentStudents] = useState<Set<string>>(new Set())

  const recordAttendance = useCallback((studentId: string, classId: string, method: 'ultrasonic' | 'manual' = 'manual') => {
    const record: AttendanceRecord = {
      id: Date.now().toString(),
      studentId,
      classId,
      timestamp: new Date(),
      method,
      verified: true,
    }
    
    setAttendance(prev => [...prev, record])
    setPresentStudents(prev => new Set([...prev, studentId]))
  }, [])

  const getAttendanceForClass = useCallback((classId: string): AttendanceRecord[] => {
    return attendance.filter(record => record.classId === classId)
  }, [attendance])

  const getAttendancePercentage = useCallback((studentId: string, classId: string): number => {
    const total = attendance.filter(record => record.classId === classId).length
    const present = attendance.filter(record => record.studentId === studentId && record.classId === classId).length
    return total > 0 ? (present / total) * 100 : 0
  }, [attendance])

  return {
    attendance,
    presentStudents,
    recordAttendance,
    getAttendanceForClass,
    getAttendancePercentage,
  }
}
