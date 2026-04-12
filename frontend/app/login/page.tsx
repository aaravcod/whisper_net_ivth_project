'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const router = useRouter()

  const handleLogin = () => {
    if (!username.trim()) return

    const deviceId = 'device-' + Math.random().toString(36).substring(2, 9)

    sessionStorage.setItem('username', username)
    sessionStorage.setItem('deviceId', deviceId)

    router.push('/')
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Enter your name</h2>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Your name"
        />

        <Button onClick={handleLogin} className="w-full">
          Continue
        </Button>
      </Card>
    </main>
  )
}