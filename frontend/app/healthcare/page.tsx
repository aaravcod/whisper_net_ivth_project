'use client'

import { useState } from 'react'
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

  const [triggerBroadcast, setTriggerBroadcast] = useState(false)
  const [signalStatus, setSignalStatus] = useState('Idle')

  const filteredPatients = searchTerm ? searchPatients(searchTerm) : patients

  // RECEIVE DATA
  const handleDataReceived = (data: any) => {
    setSignalStatus("🔓 Decoding health data...")

    const raw = data.parsed ?? data.raw

    try {
      const decoded = typeof raw === "string" ? JSON.parse(raw) : raw

      addPatient({
        name: decoded.name ?? "Received Patient",
        patientId: decoded.patientId ?? `RX-${Date.now()}`,
        healthData: decoded.healthData ?? {},
      })

      setSignalStatus("✅ Patient Data Received")

    } catch (err) {
      console.error("❌ Invalid health data:", err)
      setSignalStatus("❌ Decode Failed")
    }

    setTimeout(() => setSignalStatus("Idle"), 2000)
  }

  const selectedPatient = selectedPatientId
    ? patients.find(p => p.id === selectedPatientId)
    : null

  const dataToTransmit = selectedPatient
    ? `HEALTH:${encodePatientData(selectedPatient.id)}`
    : ''

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/">
                <Button variant="ghost" className="mb-4 gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>

              <h1 className="text-3xl font-bold">
                Healthcare Module
              </h1>

              <p className="text-muted-foreground mt-2">
                Patient data transmission via ultrasonic communication
              </p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">

              {showForm && (
                <HealthDataForm
                  onSubmit={(data) => {
                    if (editingPatient) {
                      updatePatient(editingPatient.id, data)
                    } else {
                      addPatient(data)
                    }
                    setShowForm(false)
                    setEditingPatient(null)
                  }}
                  onCancel={() => {
                    setShowForm(false)
                    setEditingPatient(null)
                  }}
                  initialData={editingPatient || undefined}
                />
              )}

              {!showForm && patients.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
              )}

              {!showForm && (
                <>
                  {filteredPatients.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No patients found
                      </p>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
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
                            onDelete={deletePatient}
                            onShare={(id) => setSelectedPatientId(id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* RIGHT */}
            <div className="space-y-6">

              {selectedPatient && (
                <>
                  <Card className="p-4 bg-accent/10 border border-accent/30">
                    <p className="text-sm text-muted-foreground">
                      Selected Patient
                    </p>
                    <p className="font-bold">{selectedPatient.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {selectedPatient.patientId}
                    </p>
                  </Card>

                  <Button
                    className="w-full"
                    onClick={async () => {
                      if (!dataToTransmit) return

                      setSignalStatus("🔐 Encoding patient data...")
                      await new Promise(res => setTimeout(res, 300))

                      setSignalStatus("📡 Transmitting via MATLAB...")
                      await new Promise(res => setTimeout(res, 500))

                      setTriggerBroadcast(true)

                      setSignalStatus("🔓 Awaiting decode...")
                    }}
                  >
                    🚀 Broadcast Patient Data
                  </Button>

                  {triggerBroadcast && (
                    <UltrasonicTransmitter
                      data={dataToTransmit}
                      onTransmitEnd={() => setTriggerBroadcast(false)}
                    />
                  )}
                </>
              )}

              <Card className="p-3 text-xs text-muted-foreground">
                📡 Receiver listens for HEALTH data
              </Card>

              <HealthDataReceiver onDataReceived={handleDataReceived} />

              {/* 🔥 SIGNAL PANEL */}
              <Card className="p-4 space-y-2">
                <p className="font-semibold">Signal Processing</p>

                <div className="text-sm text-muted-foreground">
                  {signalStatus}
                </div>

                <div className="text-xs text-muted-foreground">
                  Device → MATLAB Encoding → Ultrasonic Transfer → MATLAB Decoding → Patient Reconstruction
                </div>
              </Card>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}