'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ClassRoster } from '@/components/class-roster'
import { UltrasonicTransmitter } from '@/components/ultrasonic-transmitter'
import { StudentIdDecoder } from '@/components/student-id-decoder'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAttendance } from '@/hooks/use-attendance'
import { Student, Class } from '@/lib/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EducationPage() {
  const { recordAttendance, presentStudents } = useAttendance()

  const [students, setStudents] = useState<Student[]>([])
  const [lastDetected, setLastDetected] = useState<string | null>(null)

  const [inputId, setInputId] = useState('')
  const [newName, setNewName] = useState('')
  const [newId, setNewId] = useState('')

  const selectedClass: Class = {
    id: "class-001",
    name: "Computer Science",
    code: "CS101",
    instructor: "Dr. Sharma",
    schedule: "Mon-Wed-Fri",
    students: []
  }

  // ✅ Add student dynamically
  const handleAddStudent = () => {
    if (!newName || !newId) return

    const newStudent: Student = {
      id: Date.now().toString(),
      name: newName,
      studentId: newId,
      email: `${newId.toLowerCase()}@demo.com`,
      enrolled: true
    }

    setStudents(prev => [...prev, newStudent])
    setNewName('')
    setNewId('')
  }

  // ✅ When decoder receives message
  const handleStudentDetected = (raw: string) => {
    if (!raw.includes("STUDENT:")) return

    const studentId = raw.split("STUDENT:")[1]
    setLastDetected(studentId)

    const student = students.find(s => s.studentId === studentId)

    if (student) {
      recordAttendance(student.id, selectedClass.id, 'ultrasonic')
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* HEADER */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>

            <h1 className="text-3xl font-bold">
              {selectedClass.name}
            </h1>

            <p className="text-muted-foreground">
              {selectedClass.code} • {selectedClass.instructor}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT SIDE */}
            <div className="lg:col-span-2 space-y-6">

              {/* ADD STUDENT */}
              <Card className="p-4 space-y-3">
                <p className="font-semibold">Add Student</p>

                <input
                  placeholder="Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />

                <input
                  placeholder="Student ID (e.g. STU001)"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />

                <Button onClick={handleAddStudent}>
                  Add Student
                </Button>
              </Card>

              {/* ROSTER */}
              <ClassRoster
                students={students}
                presentStudents={presentStudents}
                lastDetected={lastDetected || undefined}
                onMarkAttendance={(id) => {
                  recordAttendance(id, selectedClass.id, 'manual')
                }}
              />
            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-6">

              {/* INPUT */}
              <Card className="p-4 space-y-3">
                <p className="text-sm">Broadcast Student ID</p>

                <input
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  placeholder="STU001"
                  className="w-full px-3 py-2 border rounded"
                />
              </Card>

              {/* 🔥 TRANSMITTER (CALLS BACKEND) */}
              <UltrasonicTransmitter
                data={`STUDENT:${inputId}`}
              />

              {/* 🔥 DECODER (POLLING BACKEND) */}
              <StudentIdDecoder
                onStudentDetected={handleStudentDetected}
              />

            </div>

          </div>
        </div>
      </main>
    </div>
  )
}