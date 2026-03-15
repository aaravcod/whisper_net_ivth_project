'use client'

import { PatientRecord } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2, Share2, Trash2 } from 'lucide-react'

interface PatientCardProps {
  patient: PatientRecord
  onEdit?: (patient: PatientRecord) => void
  onShare?: (patientId: string) => void
  onDelete?: (patientId: string) => void
}

export function PatientCard({
  patient,
  onEdit,
  onShare,
  onDelete,
}: PatientCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className="p-6 hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">{patient.name}</h3>
          <p className="text-sm text-muted-foreground">ID: {patient.patientId}</p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(patient)}
              className="text-muted-foreground hover:text-primary"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(patient.id)}
              className="text-muted-foreground hover:text-accent"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(patient.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4 bg-card/50 rounded-lg p-4">
        {Object.entries(patient.healthData).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground capitalize">{key}</span>
            <span className="text-foreground font-medium">{value}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Last updated: {formatDate(patient.lastUpdated)}
      </p>
    </Card>
  )
}
