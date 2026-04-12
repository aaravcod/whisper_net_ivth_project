'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PatientCard } from '@/components/patient-card'
import { HealthDataForm } from '@/components/health-data-form'
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

  const [signalStatus, setSignalStatus] = useState('Idle')
  const [lastReceivedId, setLastReceivedId] = useState<string | null>(null)

  const filteredPatients = searchTerm ? searchPatients(searchTerm) : patients

  const selectedPatient = selectedPatientId
    ? patients.find(p => p.id === selectedPatientId)
    : null

  // ✅ SEND
  const sendPatient = async () => {
    if (!selectedPatient) return

    const encoded = encodePatientData(selectedPatient.id)

    setSignalStatus("🔐 Encoding patient data...")
    await new Promise(res => setTimeout(res, 300))

    setSignalStatus("📡 Transmitting via MATLAB...")
    await new Promise(res => setTimeout(res, 500))

    await fetch('http://localhost:4000/whisper/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'healthcare',
        payload: {
          to: 'all',
          data: encoded
        }
      })
    })

    setSignalStatus("🔓 Awaiting decode...")
  }

  // ✅ LISTEN + FULL PARSER FIX
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('http://localhost:4000/whisper/listen?user=all')
      const data = await res.json()

      if (Array.isArray(data.messages) && data.messages.length > 0) {
        data.messages.forEach((msg: any) => {

          if (msg.type === 'healthcare' && msg.decoded) {

            setSignalStatus("🔓 Decoding health data...")

            try {
              let decodedData: any = {}
              const raw = msg.decoded.data

              if (typeof raw === "string") {

                if (raw.includes("|")) {
                  const parts = raw.split("|")

                  let patientId = ""
                  let name = "Received Patient"
                  let healthData: any = {}
                  let isHealthSection = false

                  parts.forEach(part => {

                    if (part.startsWith("P")) {
                      patientId = part
                    }

                    else if (part.startsWith("NAME:")) {
                      name = part.replace("NAME:", "")
                    }

                    else if (part.startsWith("DATA:")) {
                      isHealthSection = true

                      const clean = part.replace("DATA:", "")
                      const [key, value] = clean.split(":")
                      if (key && value) healthData[key] = value
                    }

                    else if (isHealthSection) {
                      const [key, value] = part.split(":")
                      if (key && value) healthData[key] = value
                    }

                  })

                  decodedData = { name, patientId, healthData }
                }

                else if (raw.startsWith("{")) {
                  decodedData = JSON.parse(raw)
                }

                else if (raw.startsWith("PATIENT:")) {
                  const patientId = raw.split("PATIENT:")[1]
                  decodedData = {
                    name: "Received Patient",
                    patientId,
                    healthData: {}
                  }
                }

              } else {
                decodedData = raw
              }

              addPatient({
                name: decodedData.name ?? "Received Patient",
                patientId: decodedData.patientId ?? `RX-${Date.now()}`,
                healthData: decodedData.healthData ?? {},
              })

              setLastReceivedId(decodedData.patientId)
              setSignalStatus("✅ Patient Data Received")

            } catch (err) {
              console.error("❌ Decode failed:", err)
              setSignalStatus("❌ Decode Failed")
            }

            setTimeout(() => setSignalStatus("Idle"), 2000)
          }

        })
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [])

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

              <h1 className="text-3xl font-bold">Healthcare Module</h1>
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
                    <Card className="p-10 text-center border-dashed">
                      <p className="text-muted-foreground text-sm">
                        No patient records yet
                      </p>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {filteredPatients.map((patient) => {
                        const isReceived = patient.patientId === lastReceivedId

                        return (
                          <div
                            key={patient.id}
                            onClick={() => setSelectedPatientId(patient.id)}
                            className={`cursor-pointer transition-all ${
                              isReceived ? 'ring-2 ring-green-500 rounded-xl animate-pulse' : ''
                            }`}
                          >
                            <div className="relative">
                              <PatientCard
                                patient={patient}
                                onEdit={(p) => {
                                  setEditingPatient(p)
                                  setShowForm(true)
                                }}
                                onDelete={deletePatient}
                                onShare={(id) => setSelectedPatientId(id)}
                              />

                              {isReceived && (
                                <div className="absolute top-2 right-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                  📡 Received
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* RIGHT */}
            <div className="space-y-6">

              {selectedPatient && (
                <>
                  <Card className="p-4 border border-primary/30 bg-primary/5">
                    <p className="text-xs text-muted-foreground mb-1">
                      Active Transmission Target
                    </p>
                    <p className="font-bold text-lg">{selectedPatient.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {selectedPatient.patientId}
                    </p>
                  </Card>

                  <Button className="w-full gap-2" onClick={sendPatient}>
                    🚀 Broadcast via Ultrasonic
                  </Button>
                </>
              )}

              <Card className="p-4 space-y-3">
                <p className="font-semibold">Signal Processing</p>

                <div className="text-sm font-medium">
                  {signalStatus}
                </div>

                <div className="text-xs text-muted-foreground">
                  📡 Ultrasonic channel active
                </div>

                <div className="text-xs text-muted-foreground">
                  Device → Backend → MATLAB → Decode → UI
                </div>
              </Card>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}