'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Music, Stethoscope, AlertTriangle, Settings } from 'lucide-react'

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Music className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">WhisperNet</h1>
                <p className="text-sm text-muted-foreground">Ultrasonic Device Communication</p>
              </div>
            </div>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome to WhisperNet</h2>
          <p className="text-muted-foreground">Choose a module to get started with ultrasonic device communication</p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Education Module */}
          <Link href="/education">
            <Card className="h-full p-6 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/10 group">
              <div className="flex items-start gap-4 h-full flex-col">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">Education</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Attendance tracking and student identification via ultrasonic codes
                  </p>
                </div>
                <Button className="w-full mt-auto" variant="outline">
                  Get Started
                </Button>
              </div>
            </Card>
          </Link>

          {/* Healthcare Module */}
          <Link href="/healthcare">
            <Card className="h-full p-6 hover:border-accent/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-accent/10 group">
              <div className="flex items-start gap-4 h-full flex-col">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Stethoscope className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">Healthcare</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Patient code transfer and secure health data sharing via sound
                  </p>
                </div>
                <Button className="w-full mt-auto" variant="outline">
                  Get Started
                </Button>
              </div>
            </Card>
          </Link>

          {/* Disaster Mode */}
          <Link href="/disaster">
            <Card className="h-full p-6 hover:border-destructive/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-destructive/10 group">
              <div className="flex items-start gap-4 h-full flex-col">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">Disaster Mode</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    SOS distress signals and emergency location sharing
                  </p>
                </div>
                <Button className="w-full mt-auto" variant="outline">
                  Get Started
                </Button>
              </div>
            </Card>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card/50 rounded-lg p-6 border border-border">
            <div className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">Secure</div>
            <h4 className="text-lg font-bold text-foreground mb-2">End-to-End Encryption</h4>
            <p className="text-sm text-muted-foreground">All ultrasonic transmissions are encrypted for maximum security</p>
          </div>
          <div className="bg-card/50 rounded-lg p-6 border border-border">
            <div className="text-sm font-semibold text-accent mb-2 uppercase tracking-wide">Fast</div>
            <h4 className="text-lg font-bold text-foreground mb-2">Real-Time Transfer</h4>
            <p className="text-sm text-muted-foreground">Near-instantaneous device-to-device communication</p>
          </div>
          <div className="bg-card/50 rounded-lg p-6 border border-border">
            <div className="text-sm font-semibold text-primary mb-2 uppercase tracking-wide">Reliable</div>
            <h4 className="text-lg font-bold text-foreground mb-2">Error Correction</h4>
            <p className="text-sm text-muted-foreground">Advanced algorithms ensure reliable data transmission</p>
          </div>
        </div>
      </div>
    </main>
  )
}
