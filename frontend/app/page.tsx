'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, MessageCircle, AlertTriangle, Settings } from 'lucide-react'
import { useEffect } from 'react'


export default function Dashboard() {
  

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">WhisperNet</h1>
                <p className="text-sm text-muted-foreground">
                  Ultrasonic Device Communication
                </p>
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
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome to WhisperNet
          </h2>
          <p className="text-muted-foreground">
            Choose a module to get started with ultrasonic device communication
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* EDUCATION */}
          <Link href="/education">
            <Card className="h-full p-6 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/10 group">
              <div className="flex flex-col gap-4 h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Education</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Attendance tracking and student identification
                  </p>
                </div>
                <Button className="w-full mt-auto" variant="outline">
                  Get Started
                </Button>
              </div>
            </Card>
          </Link>

          {/* DISASTER */}
          <Link href="/disaster">
            <Card className="h-full p-6 hover:border-destructive/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-destructive/10 group">
              <div className="flex flex-col gap-4 h-full">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Disaster Mode</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    SOS and emergency communication
                  </p>
                </div>
                <Button className="w-full mt-auto" variant="outline">
                  Get Started
                </Button>
              </div>
            </Card>
          </Link>

          {/* CHAT */}
          <Link href="/chat">
            <Card className="h-full p-6 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/10 group">
              <div className="flex flex-col gap-4 h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Chat System</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Real-time one-to-one communication
                  </p>
                </div>
                <Button className="w-full mt-auto" variant="outline">
                  Get Started
                </Button>
              </div>
            </Card>
          </Link>

        </div>
      </div>
    </main>
  )
}