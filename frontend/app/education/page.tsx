'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { ClassRoster } from '@/components/class-roster'
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
  const [signalStatus, setSignalStatus] = useState('Idle')

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

  // ✅ ADD STUDENT
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

  // ✅ SEND (LIKE CHAT)
  const sendStudent = async () => {
    if (!inputId) return

    setSignalStatus("🔐 Encoding student ID...")
    await new Promise(res => setTimeout(res, 300))

    setSignalStatus("📡 Transmitting via MATLAB...")
    await new Promise(res => setTimeout(res, 500))

    await fetch('http://localhost:4000/whisper/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'education',
        payload: {
          to: 'all',
          studentId: inputId
        }
      })
    })

    setSignalStatus("🔓 Awaiting decode...")
  }

  // ✅ LISTEN (FIXED)
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('http://localhost:4000/whisper/listen?user=all')
      const data = await res.json()

      if (Array.isArray(data.messages) && data.messages.length > 0) {
        data.messages.forEach((msg: any) => {

          if (msg.type === 'education' && msg.decoded) {

            const studentId = msg.decoded.studentId // 🔥 FIX HERE

            setSignalStatus("🔓 Decoding signal...")
            setLastDetected(studentId)

            const student = students.find(s => s.studentId === studentId)

            if (student) {
              recordAttendance(student.id, selectedClass.id, 'ultrasonic')
              setSignalStatus("✅ Attendance Marked")
            } else {
              setSignalStatus("⚠️ Unknown Student")
            }

            setTimeout(() => setSignalStatus("Idle"), 2000)
          }

        })
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [students])

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

            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">

              <Card className="p-4 space-y-3">
                <p className="font-semibold">Add Student</p>

                <input
                  placeholder="Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />

                <input
                  placeholder="Student ID"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />

                <Button onClick={handleAddStudent}>
                  Add Student
                </Button>
              </Card>

              <ClassRoster
                students={students}
                presentStudents={presentStudents}
                lastDetected={lastDetected || undefined}
                onMarkAttendance={(id) => {
                  recordAttendance(id, selectedClass.id, 'manual')
                }}
              />
            </div>

            {/* RIGHT */}
            <div className="space-y-6">

              <Card className="p-4 space-y-3">
                <p className="text-sm font-semibold">Broadcast Student ID</p>

                <input
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  placeholder="STU001"
                  className="w-full px-3 py-2 border rounded"
                />

                <Button onClick={sendStudent} className="w-full">
                  Send Ultrasonic Signal
                </Button>
              </Card>

              <Card className="p-4 space-y-2">
                <p className="font-semibold">Signal Processing</p>

                <div className="text-sm text-muted-foreground">
                  {signalStatus}
                </div>

                <div className="text-xs text-muted-foreground">
                  Frontend → Backend → MATLAB → Backend → Attendance
                </div>
              </Card>

              {lastDetected && (
                <Card className="p-4">
                  <p className="text-sm">
                    Last Detected ID:
                    <span className="font-bold ml-2">{lastDetected}</span>
                  </p>
                </Card>
              )}

            </div>

          </div>
        </div>
      </main>
    </div>
  )
}