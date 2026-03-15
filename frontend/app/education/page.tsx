'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ClassRoster } from '@/components/class-roster'
import { UltrasonicTransmitter } from '@/components/ultrasonic-transmitter'
import { StudentIdDecoder } from '@/components/student-id-decoder'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAttendance } from '@/hooks/use-attendance'
import { Student, Class } from '@/lib/types'
import { ArrowLeft, Download, Upload } from 'lucide-react'
import Link from 'next/link'

export default function EducationPage() {
  const { recordAttendance, presentStudents, attendance } = useAttendance()
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [students, setStudents] = useState<Student[]>([])

  // Mock data
  useEffect(() => {
    const mockClass: Class = {
      id: 'class-001',
      name: 'Introduction to Computer Science',
      code: 'CS101',
      instructor: 'Dr. Sarah Johnson',
      students: [
        { id: '1', name: 'Alice Chen', studentId: 'A001', email: 'alice@school.edu', enrolled: true },
        { id: '2', name: 'Bob Martinez', studentId: 'B002', email: 'bob@school.edu', enrolled: true },
        { id: '3', name: 'Carol Williams', studentId: 'C003', email: 'carol@school.edu', enrolled: true },
        { id: '4', name: 'David Lee', studentId: 'D004', email: 'david@school.edu', enrolled: true },
        { id: '5', name: 'Eva Rodriguez', studentId: 'E005', email: 'eva@school.edu', enrolled: true },
      ],
      schedule: 'MWF 10:00 AM - 11:30 AM',
    }
    setSelectedClass(mockClass)
    setStudents(mockClass.students)
  }, [])

  const handleStudentDetected = (studentId: string) => {
    const student = students.find(s => s.studentId === studentId)
    if (student && selectedClass) {
      recordAttendance(student.id, selectedClass.id, 'ultrasonic')
    }
  }

  const handleBroadcastAttendance = () => {
    if (selectedClass) {
      const classData = `CLASS:${selectedClass.code}|TIME:${new Date().toISOString()}`
      console.log('Broadcasting:', classData)
    }
  }

  if (!selectedClass) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <p className="text-muted-foreground">Loading class data...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/">
                <Button variant="ghost" className="mb-4 gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-foreground">{selectedClass.name}</h1>
              <p className="text-muted-foreground mt-2">{selectedClass.code} • {selectedClass.instructor}</p>
              <p className="text-sm text-muted-foreground mt-1">{selectedClass.schedule}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Import Roster
              </Button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Attendance Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Today's Attendance</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                    <p className="text-2xl font-bold text-primary">{students.length}</p>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Present</p>
                    <p className="text-2xl font-bold text-accent">{presentStudents.size}</p>
                  </div>
                  <div className="bg-muted/10 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
                    <p className="text-2xl font-bold text-foreground">
                      {students.length > 0 ? Math.round((presentStudents.size / students.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </Card>

              {/* Class Roster */}
              <ClassRoster
                students={students}
                presentStudents={presentStudents}
                onMarkAttendance={(studentId) => {
                  if (selectedClass) {
                    recordAttendance(studentId, selectedClass.id, 'manual')
                  }
                }}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Ultrasonic Broadcast */}
              <UltrasonicTransmitter
                data={`CLASS:${selectedClass.code}`}
                onTransmitStart={handleBroadcastAttendance}
              />

              {/* Student ID Decoder */}
              <StudentIdDecoder onStudentDetected={handleStudentDetected} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
