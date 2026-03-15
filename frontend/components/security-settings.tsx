'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DevicePairingManager } from '@/lib/device-pairing'
import { EncryptionManager } from '@/lib/encryption'
import { Lock, Copy, Trash2, Check, X } from 'lucide-react'

export function SecuritySettings() {
  const [pairingManager] = useState(() => new DevicePairingManager())
  const [encryptionManager] = useState(() => new EncryptionManager())
  const [pairedDevices, setPairedDevices] = useState(pairingManager.getPairedDevices())
  const [showPairingForm, setShowPairingForm] = useState(false)
  const [pairingName, setPairingName] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pairingName.trim()) return

    const publicKey = Math.random().toString(36).substring(2, 15)
    pairingManager.pairDevice(pairingName, publicKey)
    setPairedDevices(pairingManager.getPairedDevices())
    setPairingName('')
    setShowPairingForm(false)
  }

  const handleRemoveDevice = (deviceId: string) => {
    pairingManager.unpairDevice(deviceId)
    setPairedDevices(pairingManager.getPairedDevices())
  }

  const handleTrustDevice = (deviceId: string) => {
    pairingManager.trustDevice(deviceId)
    setPairedDevices(pairingManager.getPairedDevices())
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const localDeviceId = pairingManager.getLocalDeviceId()
  const encryptionKeyHash = encryptionManager.getKeyHash()

  return (
    <div className="space-y-6">
      {/* Device Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Your Device</h3>
        </div>

        <div className="space-y-3 bg-card/50 rounded-lg p-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Device ID</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-input rounded border border-border text-foreground text-sm font-mono">
                {localDeviceId}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyKey(localDeviceId)}
                className="text-muted-foreground hover:text-primary"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Encryption Key Hash</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-input rounded border border-border text-foreground text-sm font-mono">
                {encryptionKeyHash}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyKey(encryptionKeyHash)}
                className="text-muted-foreground hover:text-primary"
              >
                {copiedKey === encryptionKeyHash ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Paired Devices */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Paired Devices</h3>
          <Button onClick={() => setShowPairingForm(!showPairingForm)} size="sm">
            {showPairingForm ? 'Cancel' : 'Add Device'}
          </Button>
        </div>

        {showPairingForm && (
          <form onSubmit={handleAddDevice} className="mb-6 p-4 bg-card/50 rounded-lg border border-border">
            <input
              type="text"
              placeholder="Device name"
              value={pairingName}
              onChange={(e) => setPairingName(e.target.value)}
              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-3"
              required
            />
            <Button type="submit" className="w-full">
              Pair Device
            </Button>
          </form>
        )}

        {pairedDevices.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No paired devices</p>
        ) : (
          <div className="space-y-3">
            {pairedDevices.map(device => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{device.name}</p>
                  <p className="text-xs text-muted-foreground">{device.deviceId}</p>
                </div>
                <div className="flex items-center gap-2">
                  {device.trusted ? (
                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">Trusted</span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTrustDevice(device.id)}
                      className="text-xs"
                    >
                      Trust
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDevice(device.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Security Tips */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="text-lg font-bold text-foreground mb-3">Security Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Only pair with devices you trust</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Enable encryption for sensitive data</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Regularly review paired devices and remove unused ones</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Keep your device ID and encryption key private</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
