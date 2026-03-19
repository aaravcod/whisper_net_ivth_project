'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Student } from '@/lib/types'
import { CheckCircle, Circle, Edit2, Trash2 } from 'lucide-react'

interface ClassRosterProps {
  students: Student[]
  presentStudents: Set<string>
  onMarkAttendance: (studentId: string) => void
  onRemoveStudent?: (studentId: string) => void
  onEditStudent?: (student: Student) => void
  lastDetected?: string   // 🔥 NEW
}

export function ClassRoster({
  students,
  presentStudents,
  onMarkAttendance,
  onRemoveStudent,
  onEditStudent,
  lastDetected,   // 🔥 NEW
}: ClassRosterProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStudents = students.filter(
    student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className="p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-4">
          Class Roster
        </h3>

        <input
          type="text"
          placeholder="Search by name or student ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* STUDENT LIST */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredStudents.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No students found
          </p>
        ) : (
          filteredStudents.map((student) => {
            const isPresent = presentStudents.has(student.id)
            const isDetected = lastDetected === student.studentId   // 🔥 NEW

            return (
              <div
                key={student.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all
                  ${isDetected
                    ? 'border-green-500 bg-green-500/10 scale-[1.02]'
                    : 'border-border/50 hover:bg-card/50'
                  }`}
              >
                {/* LEFT SIDE */}
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => onMarkAttendance(student.id)}
                    className="flex-shrink-0 transition-colors hover:text-primary"
                  >
                    {isPresent ? (
                      <CheckCircle className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`font-medium flex items-center gap-2 ${
                        isPresent ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {student.name}

                      {/* 🔥 DETECTED BADGE */}
                      {isDetected && (
                        <span className="text-green-500 text-xs animate-pulse">
                          🆕 Detected
                        </span>
                      )}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {student.studentId}
                    </p>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2">
                  {onEditStudent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditStudent(student)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}

                  {onRemoveStudent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveStudent(student.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
        <span className="text-muted-foreground">
          Total: {filteredStudents.length}
        </span>
        <span className="text-primary font-medium">
          Present: {presentStudents.size}
        </span>
      </div>
    </Card>
  )
}