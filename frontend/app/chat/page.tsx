'use client'

import { useEffect, useState, useRef } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Message = {
  from: string
  to: string
  message: string
  time?: string
}

export default function ChatPage() {
  const [username, setUsername] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [users, setUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [signalStatus, setSignalStatus] = useState('Idle')

  const chatRef = useRef<HTMLDivElement>(null)

  // AUTO DEVICE GENERATION
  useEffect(() => {
    let user = sessionStorage.getItem('username')
    let id = sessionStorage.getItem('deviceId')

    if (!user || !id) {
      const random = Math.floor(Math.random() * 1000)
      user = `Device-${random}`
      id = `device-${random}`

      sessionStorage.setItem('username', user)
      sessionStorage.setItem('deviceId', id)
    }

    setUsername(user)
    setDeviceId(id)
  }, [])

  // REGISTER DEVICE
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
      const res = await fetch('http://localhost:4000/whisper/users')
      const data = await res.json()

      const filtered = data.users.filter((u: string) => u !== username)
      setUsers(filtered)

      if (!selectedUser && filtered.length > 0) {
        setSelectedUser(filtered[0])
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [username])

  // LISTEN FOR MESSAGES
  useEffect(() => {
    if (!username) return

    const interval = setInterval(async () => {
      const res = await fetch(`http://localhost:4000/whisper/listen?user=${username}`)
      const data = await res.json()

      if (data.messages.length > 0) {
        const newMsgs = data.messages.map((m: any) => ({
          ...m.decoded,
          time: new Date().toLocaleTimeString()
        }))
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

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!input || !selectedUser) return

    const payload: Message = {
      from: username,
      to: selectedUser,
      message: input,
      time: new Date().toLocaleTimeString()
    }

    setSignalStatus("📡 Transmitting...")

    await fetch('http://localhost:4000/whisper/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'chat', payload })
    })

    setMessages(prev => [...prev, payload])
    setInput('')
    setSignalStatus("Idle")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-2 text-foreground">Chat System</h1>

        <p className="text-sm text-muted-foreground mb-4">
          Device: <b>{username}</b>
        </p>

        {/* USERS */}
        <Card className="p-4 mb-4">
          <p className="font-semibold mb-2">Active Devices</p>

          {users.length === 0 && (
            <p className="text-sm text-muted-foreground">No other devices found</p>
          )}

          {users.map(u => (
            <div
              key={u}
              onClick={() => setSelectedUser(u)}
              className={`p-2 rounded cursor-pointer ${
                selectedUser === u
                  ? 'bg-primary/20'
                  : 'hover:bg-muted'
              }`}
            >
              {u}
            </div>
          ))}
        </Card>

        {/* CHAT */}
        <Card className="p-4 h-[60vh] flex flex-col">

          {/* HEADER */}
          <div className="flex justify-between mb-2">
            <p className="font-semibold text-foreground">
              {selectedUser ? `Chat with ${selectedUser}` : 'Select a device'}
            </p>
            <p className="text-xs text-muted-foreground">{signalStatus}</p>
          </div>

          {/* MESSAGES */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto space-y-3 bg-muted/30 p-3 rounded"
          >
            {messages
              .filter(m => m.from === selectedUser || m.to === selectedUser)
              .map((msg, i) => {
                const isMe = msg.from === username

                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-xl text-sm max-w-xs ${
                        isMe
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground border'
                      }`}
                    >
                      {!isMe && (
                        <div className="text-xs font-semibold mb-1 text-muted-foreground">
                          {msg.from}
                        </div>
                      )}

                      {msg.message}

                      {msg.time && (
                        <div className="text-[10px] text-right mt-1 opacity-70">
                          {msg.time}
                        </div>
                      )}
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
              className="flex-1 px-3 py-2 border rounded bg-background text-foreground"
            />

            <Button onClick={sendMessage}>
              Send
            </Button>
          </div>

        </Card>

      </main>
    </div>
  )
}