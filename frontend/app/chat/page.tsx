'use client'

import { useEffect, useState, useRef } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Message = {
  from: string
  to: string
  message: string
}

export default function ChatPage() {
  const [username, setUsername] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [inputName, setInputName] = useState('')
  const [users, setUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [signalStatus, setSignalStatus] = useState('Idle')

  const chatRef = useRef<HTMLDivElement>(null)

  // LOAD USER
  useEffect(() => {
    const id = sessionStorage.getItem('deviceId')
    const user = sessionStorage.getItem('username')

    if (id && user) {
      setDeviceId(id)
      setUsername(user)
    }
  }, [])

  // LOGIN
  const handleLogin = () => {
    if (!inputName.trim()) return

    const id = 'device-' + Math.random().toString(36).substring(2, 9)

    sessionStorage.setItem('username', inputName)
    sessionStorage.setItem('deviceId', id)

    setUsername(inputName)
    setDeviceId(id)
  }

  // REGISTER
  useEffect(() => {
    if (!username || !deviceId) return

    fetch('http://localhost:4000/whisper/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, deviceId })
    })
  }, [username, deviceId])

  // FETCH USERS
  useEffect(() => {
  if (!username) return

  const interval = setInterval(async () => {
    try {
      const res = await fetch('http://localhost:4000/whisper/users')
      const data = await res.json()

      const filtered = data.users.filter((u: string) => u !== username)

      setUsers(prev => {
        // prevent unnecessary re-renders
        if (JSON.stringify(prev) === JSON.stringify(filtered)) {
          return prev
        }
        return filtered
      })

      // auto select ONLY if not already selected
      setSelectedUser(prev => {
        if (prev) return prev
        return filtered.length > 0 ? filtered[0] : ''
      })

    } catch (err) {
      console.error("User polling error:", err)
    }
  }, 1500)

  return () => clearInterval(interval)
}, [username])
  // POLLING
  useEffect(() => {
    if (!username) return

    const interval = setInterval(async () => {
      const res = await fetch(`http://localhost:4000/whisper/listen?user=${username}`)
      const data = await res.json()

      if (data.messages.length > 0) {
        const newMsgs = data.messages.map((m: any) => m.decoded)
        setMessages(prev => [...prev, ...newMsgs])
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [username])

  // AUTO SCROLL
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }, [messages])

  // SEND MESSAGE (WITH MATLAB SIMULATION)
  const sendMessage = async () => {
    if (!input || !selectedUser) {
      alert("Select a user first")
      return
    }

    const payload = {
      from: username,
      to: selectedUser,
      message: input
    }

    // 🔥 SIGNAL FLOW
    setSignalStatus("🔐 Encoding signal...")
    await new Promise(res => setTimeout(res, 300))

    setSignalStatus("📡 Transmitting via MATLAB...")
    await new Promise(res => setTimeout(res, 500))

    await fetch('http://localhost:4000/whisper/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'chat', payload })
    })

    setSignalStatus("🔓 Decoding signal...")
    await new Promise(res => setTimeout(res, 300))

    setSignalStatus("✅ Delivered")

    setMessages(prev => [...prev, payload])
    setInput('')

    setTimeout(() => setSignalStatus("Idle"), 2000)
  }

  // LOGIN UI
  if (!username) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <Card className="p-6 w-80 space-y-4">
          <h2 className="text-xl font-bold">Enter your name</h2>

          <input
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Your name"
          />

          <Button onClick={handleLogin} className="w-full">
            Start Chat
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* HEADER */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Link href="/">
                <Button variant="ghost" className="mb-4 gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>

              <h1 className="text-3xl font-bold">Chat System</h1>
              <p className="text-muted-foreground">
                Logged in as {username}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                sessionStorage.clear()
                window.location.reload()
              }}
            >
              Switch User
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* CHAT AREA */}
            <div className="lg:col-span-2">
              <Card className="p-3 h-[70vh] flex flex-col justify-between">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-3 px-2">
                  <p className="font-semibold">
                    {selectedUser ? `Chat with ${selectedUser}` : 'Select a user'}
                  </p>

                  <span className="text-xs text-muted-foreground animate-pulse">
                    📡 Listening...
                  </span>
                </div>

                {/* MESSAGES */}
                <div
                  ref={chatRef}
                  className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-muted/30 rounded-lg"
                >
                  {messages
                    .filter(m => m.from === selectedUser || m.to === selectedUser)
                    .map((msg, i) => {
                      const isMe = msg.from === username

                      return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow ${
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-white text-black rounded-bl-sm border'
                          }`}>
                            {!isMe && (
                              <div className="text-xs font-semibold mb-1 text-muted-foreground">
                                {msg.from}
                              </div>
                            )}
                            {msg.message}
                          </div>
                        </div>
                      )
                    })}
                </div>

                {/* INPUT */}
                <div className="mt-3 flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendMessage()
                    }}
                    placeholder="Type message..."
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none"
                  />

                  <Button onClick={sendMessage}>
                    Send
                  </Button>
                </div>

              </Card>
            </div>

            {/* RIGHT PANEL */}
            <div className="space-y-6">

              {/* USERS */}
              <Card className="p-4 space-y-3">
                <p className="font-semibold">Active Users</p>

                {users.map(user => (
                  <div
                    key={user}
                    onClick={() => setSelectedUser(user)}
                    className={`p-2 rounded cursor-pointer flex items-center justify-between ${
                      selectedUser === user
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span>{user}</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                ))}
              </Card>

              {/* SIGNAL PANEL */}
              <Card className="p-4 space-y-2">
                <p className="font-semibold">Signal Processing</p>

                <div className="text-sm text-muted-foreground">
                  {signalStatus}
                </div>

                <div className="text-xs text-muted-foreground">
                  Frontend → Backend → MATLAB → Backend → Receiver
                </div>
              </Card>

            </div>

          </div>
        </div>
      </main>
    </div>
  )
}