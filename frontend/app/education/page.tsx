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
  const { recordAttendance } = useAttendance()

  const [students, setStudents] = useState<Student[]>([])
  const [markedPresent, setMarkedPresent] = useState<string[]>([])
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

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim() !== '')

      const dataLines = lines.slice(1)

      const newStudents: Student[] = dataLines.map((line, index) => {
        const [name, studentId] = line.split(',').map(v => v.trim())

        return {
          id: `${Date.now()}-${index}`,
          name,
          studentId,
          email: `${studentId.toLowerCase()}@demo.com`,
          enrolled: true
        }
      })

      setStudents(prev => {
        const existingIds = new Set(prev.map(s => s.studentId))
        const filtered = newStudents.filter(s => !existingIds.has(s.studentId))
        return [...prev, ...filtered]
      })
    }

    reader.readAsText(file)
  }

  const exportAttendanceCSV = () => {
    if (!students.length) return

    const header = "Name,StudentID,Status"

    const rows = students.map(student => {
      const isPresent = markedPresent.includes(student.studentId)
      const status = isPresent ? "Present" : "Absent"
      return `${student.name},${student.studentId},${status}`
    })

    const csvContent = [header, ...rows].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'attendance-report.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  const sendStudent = async () => {
    if (!inputId) return

    setSignalStatus("🔐 Encoding student ID...")
    await new Promise(res => setTimeout(res, 300))

    setSignalStatus("📡 Transmitting via MATLAB...")
    await new Promise(res => setTimeout(res, 500))

    await fetch('http://127.0.0.1:4000/whisper/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'education',
        payload: { to: 'all', studentId: inputId }
      })
    })

    setSignalStatus("🔓 Awaiting decode...")
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://127.0.0.1:4000/whisper/listen?user=all')
        if (!res.ok) return

        const data = await res.json()

        if (Array.isArray(data.messages)) {
          data.messages.forEach((msg: any) => {
            if (msg.type === 'education' && msg.decoded) {

              const studentId = msg.decoded.studentId

              setSignalStatus("🔓 Decoding signal...")
              setLastDetected(studentId)

              const student = students.find(s => s.studentId === studentId)

              if (student) {
                recordAttendance(student.id, selectedClass.id, 'ultrasonic')

                setMarkedPresent(prev =>
                  prev.includes(student.studentId)
                    ? prev
                    : [...prev, student.studentId]
                )

                setSignalStatus("✅ Attendance Marked")
              } else {
                setSignalStatus("⚠️ Unknown Student")
              }

              setTimeout(() => setSignalStatus("Idle"), 2000)
            }
          })
        }
      } catch {
        setSignalStatus("⚠️ Backend Offline")
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [students])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">

          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>

            <h1 className="text-3xl font-bold">{selectedClass.name}</h1>
            <p className="text-muted-foreground">
              {selectedClass.code} • {selectedClass.instructor}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

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

                <label className="cursor-pointer">
                  <div className="border rounded p-2 text-sm text-center hover:bg-muted">
                    Upload CSV File
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="hidden"
                  />
                </label>

                <Button onClick={exportAttendanceCSV} variant="outline">
                  Export Attendance CSV
                </Button>
              </Card>

              <ClassRoster
                students={students}
                presentStudents={new Set(
                  students
                    .filter(s => markedPresent.includes(s.studentId))
                    .map(s => s.id)
                )}
                lastDetected={lastDetected || undefined}
                onMarkAttendance={(id) => {
                  recordAttendance(id, selectedClass.id, 'manual')

                  const student = students.find(s => s.id === id)
                  if (student) {
                    setMarkedPresent(prev =>
                      prev.includes(student.studentId)
                        ? prev
                        : [...prev, student.studentId]
                    )
                  }
                }}
              />
            </div>

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