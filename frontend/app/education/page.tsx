'use client'

import { useEffect, useState, useRef } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Student = {
  id: string
  name: string
  studentId: string
}

export default function EducationPage() {
  const [role, setRole] = useState<'teacher' | 'student' | null>(null)

  const [students, setStudents] = useState<Student[]>([])
  const [markedPresent, setMarkedPresent] = useState<string[]>([])
  const [lastDetected, setLastDetected] = useState<string | null>(null)
  const [unknownStudent, setUnknownStudent] = useState<string | null>(null)

  const [inputId, setInputId] = useState('')
  const [newName, setNewName] = useState('')
  const [newId, setNewId] = useState('')

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // LOAD ROLE
  useEffect(() => {
    const saved = sessionStorage.getItem('role')
    if (saved) setRole(saved as any)
  }, [])

  // ADD STUDENT
  const handleAddStudent = () => {
    if (!newName || !newId) return

    setStudents(prev => [
      ...prev,
      { id: Date.now().toString(), name: newName, studentId: newId }
    ])

    setNewName('')
    setNewId('')
  }

  // IMPORT CSV
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(l => l.trim() !== '')

      const data = lines.slice(1).map((line, i) => {
        const [name, studentId] = line.split(',').map(v => v.trim())
        return {
          id: `${Date.now()}-${i}`,
          name,
          studentId
        }
      })

      setStudents(data)
      setMarkedPresent([])
      setUnknownStudent(null)
    }

    reader.readAsText(file)
  }

  // EXPORT CSV WITH TIMESTAMP
  const exportCSV = () => {
    const header = "Name,StudentID,Status"

    const rows = students.map(s => {
      const status = markedPresent.includes(s.studentId)
        ? "Present"
        : "Absent"

      return `${s.name},${s.studentId},${status}`
    })

    const blob = new Blob([header + '\n' + rows.join('\n')])
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')

    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-')

    link.href = url
    link.download = `Attendance_${date}_${time}.csv`
    link.click()
  }

  // STUDENT SEND
  const sendStudent = async () => {
    if (role !== 'student' || !inputId) return

    await fetch('http://127.0.0.1:4000/whisper/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'education',
        payload: { to: 'all', studentId: inputId }
      })
    })

    setInputId('')
  }

  // TEACHER LISTEN
  useEffect(() => {
    if (role !== 'teacher') return

    const interval = setInterval(async () => {
      const res = await fetch('http://127.0.0.1:4000/whisper/listen?user=all')
      const data = await res.json()

      if (!Array.isArray(data.messages)) return

      data.messages.forEach((msg: any) => {
        if (msg.type === 'education') {
          const id = msg.decoded.studentId

          setLastDetected(id)

          const student = students.find(s => s.studentId === id)

          if (student) {
            setUnknownStudent(null)

            setMarkedPresent(prev =>
              prev.includes(id) ? prev : [...prev, id]
            )
          } else {
            setUnknownStudent(id)
          }
        }
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [students, role])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6">

        {/* ROLE SELECT */}
        {!role ? (
          <div className="flex h-full items-center justify-center">
            <Card className="p-6 space-y-4">
              <h2 className="font-bold">Select Role</h2>

              <Button onClick={() => {
                sessionStorage.setItem('role', 'teacher')
                setRole('teacher')
              }}>
                Teacher
              </Button>

              <Button onClick={() => {
                sessionStorage.setItem('role', 'student')
                setRole('student')
              }}>
                Student
              </Button>
            </Card>
          </div>
        ) : (
          <>
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>

            <h1 className="text-2xl font-bold">Attendance System</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* LEFT */}
              <div className="lg:col-span-2 space-y-4">

                {role === 'teacher' && (
                  <>
                    <Card className="p-4 space-y-3">
                      <p className="font-semibold">Manage Students</p>

                      <input
                        placeholder="Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border p-2 w-full"
                      />

                      <input
                        placeholder="Roll No"
                        value={newId}
                        onChange={(e) => setNewId(e.target.value)}
                        className="border p-2 w-full"
                      />

                      <div className="flex gap-2">
                        <Button onClick={handleAddStudent}>
                          Add Student
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Import Student List
                        </Button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleCSVImport}
                        className="hidden"
                      />

                      <Button onClick={exportCSV}>
                        Export Attendance
                      </Button>
                    </Card>

                    {unknownStudent && (
                      <Card className="p-3 border-red-500">
                        ⚠️ Unknown Student: {unknownStudent}
                      </Card>
                    )}

                    <Card className="p-4">
                      <p className="font-semibold mb-2">Student List</p>

                      {students.map(s => {
                        const present = markedPresent.includes(s.studentId)

                        return (
                          <div key={s.id} className="flex justify-between text-sm">
                            <span>{s.name} ({s.studentId})</span>
                            <span className={present ? 'text-green-500' : 'text-muted-foreground'}>
                              {present ? 'Present' : 'Absent'}
                            </span>
                          </div>
                        )
                      })}
                    </Card>
                  </>
                )}

              </div>

              {/* RIGHT */}
              <div>

                {role === 'student' && (
                  <Card className="p-6 space-y-4 max-w-md mx-auto mt-10">

                    <div>
                      <p className="text-lg font-bold">📱 Student Device</p>
                      <p className="text-sm text-muted-foreground">
                        Send your Roll Number to mark attendance
                      </p>
                    </div>

                    <input
                      value={inputId}
                      onChange={(e) => setInputId(e.target.value)}
                      placeholder="Enter Roll No (e.g., P001)"
                      className="border p-3 w-full rounded bg-background text-foreground"
                    />

                    <Button onClick={sendStudent} className="w-full">
                      📡 Send Roll No
                    </Button>

                    <div className="text-sm text-center text-muted-foreground">
                      {inputId ? "Ready to send" : "Waiting for input..."}
                    </div>

                  </Card>
                )}

                {role === 'teacher' && (
                  <Card className="p-4">
                    <p className="font-semibold">Listening...</p>
                    <p className="text-sm text-muted-foreground">
                      Last Detected: {lastDetected || 'None'}
                    </p>
                  </Card>
                )}

              </div>

            </div>
          </>
        )}

      </main>
    </div>
  )
}