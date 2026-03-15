'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PatientRecord } from '@/lib/types'

interface HealthDataFormProps {
  onSubmit: (data: Omit<PatientRecord, 'id' | 'lastUpdated'>) => void
  onCancel?: () => void
  initialData?: PatientRecord
  isLoading?: boolean
}

export function HealthDataForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}: HealthDataFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    patientId: initialData?.patientId || '',
    bloodType: initialData?.healthData?.bloodType || '',
    temperature: initialData?.healthData?.temperature || '',
    bloodPressure: initialData?.healthData?.bloodPressure || '',
    heartRate: initialData?.healthData?.heartRate || '',
    allergies: initialData?.healthData?.allergies || '',
    medications: initialData?.healthData?.medications || '',
    notes: initialData?.healthData?.notes || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const { name, patientId, ...healthData } = formData
    onSubmit({
      name,
      patientId,
      healthData,
    })

    if (!initialData) {
      setFormData({
        name: '',
        patientId: '',
        bloodType: '',
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        allergies: '',
        medications: '',
        notes: '',
      })
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-foreground mb-6">
        {initialData ? 'Edit Patient' : 'Add New Patient'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Patient Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Patient ID
            </label>
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., P12345"
            />
          </div>
        </div>

        {/* Health Metrics */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4">Health Metrics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Blood Type</label>
              <input
                type="text"
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., O+"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Temperature (°C)</label>
              <input
                type="text"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., 37.2"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Blood Pressure</label>
              <input
                type="text"
                name="bloodPressure"
                value={formData.bloodPressure}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., 120/80"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Heart Rate (bpm)</label>
              <input
                type="text"
                name="heartRate"
                value={formData.heartRate}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., 72"
              />
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-4">Medical History</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Allergies</label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Penicillin, Shellfish"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Current Medications</label>
              <textarea
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Aspirin, Metformin"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Any other relevant medical information..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Patient' : 'Add Patient'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
