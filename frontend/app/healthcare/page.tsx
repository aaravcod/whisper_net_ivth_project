'use client'

import { useState } from 'react'
import type { DecodedPayload } from '@/lib/audio-engine'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PatientCard } from '@/components/patient-card'
import { HealthDataForm } from '@/components/health-data-form'
import { HealthDataReceiver } from '@/components/health-data-receiver'
import { UltrasonicTransmitter } from '@/components/ultrasonic-transmitter'
import { usePatientRecords } from '@/hooks/use-patient-records'
import { PatientRecord } from '@/lib/types'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import Link from 'next/link'

export default function HealthcarePage() {
  const {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    encodePatientData,
    searchPatients,
  } = usePatientRecords()

  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<PatientRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  const filteredPatients = searchTerm ? searchPatients(searchTerm) : patients

  const handleAddPatient = (data: Omit<PatientRecord, 'id' | 'lastUpdated'>) => {
    addPatient(data)
    setShowForm(false)
  }

  const handleUpdatePatient = (data: Omit<PatientRecord, 'id' | 'lastUpdated'>) => {
    if (editingPatient) {
      updatePatient(editingPatient.id, data)
      setEditingPatient(null)
      setShowForm(false)
    }
  }

  const handleDataReceived = (payload: DecodedPayload) => {
    const body = payload.packet?.body ?? payload.raw
    console.log('Processing received health data:', body, payload)
  }

  const selectedPatient = selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null
  const dataToTransmit = selectedPatient ? encodePatientData(selectedPatient.id) : ''

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
              <h1 className="text-3xl font-bold text-foreground">Healthcare Module</h1>
              <p className="text-muted-foreground mt-2">Manage patient records and share health data securely</p>
            </div>
            <Button
              onClick={() => {
                setEditingPatient(null)
                setShowForm(!showForm)
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Patient
            </Button>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Patient Management */}
            <div className="lg:col-span-2 space-y-6">
              {/* Form */}
              {showForm && (
                <HealthDataForm
                  onSubmit={editingPatient ? handleUpdatePatient : handleAddPatient}
                  onCancel={() => {
                    setShowForm(false)
                    setEditingPatient(null)
                  }}
                  initialData={editingPatient || undefined}
                />
              )}

              {/* Search Bar */}
              {!showForm && patients.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search patients by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Patient List */}
              {!showForm && (
                <>
                  {filteredPatients.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        {patients.length === 0 ? 'No patients yet. Add your first patient!' : 'No matching patients found.'}
                      </p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => setSelectedPatientId(patient.id)}
                          className="cursor-pointer"
                        >
                          <PatientCard
                            patient={patient}
                            onEdit={(p) => {
                              setEditingPatient(p)
                              setShowForm(true)
                            }}
                            onShare={(id) => setSelectedPatientId(id)}
                            onDelete={deletePatient}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Column - Data Transfer */}
            <div className="space-y-6">
              {/* Patient Transmitter */}
              {selectedPatient && (
                <>
                  <Card className="p-4 bg-accent/10 border border-accent/30">
                    <p className="text-sm text-muted-foreground mb-1">Selected Patient</p>
                    <p className="font-bold text-foreground">{selectedPatient.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">ID: {selectedPatient.patientId}</p>
                  </Card>

                  <UltrasonicTransmitter
                    data={dataToTransmit}
                    onTransmitStart={() => console.log('Transmitting patient data')}
                  />
                </>
              )}

              {/* Health Data Receiver */}
              <HealthDataReceiver onDataReceived={handleDataReceived} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
