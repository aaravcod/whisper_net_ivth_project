'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SecuritySettings } from '@/components/security-settings'
import { PrivacySettings } from '@/components/privacy-settings'
import { useSettings } from '@/hooks/use-settings'
import { ArrowLeft, Shield, Lock, Palette } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'security' | 'privacy' | 'appearance'>('security')
  const { settings, updateSetting } = useSettings()

  const tabs = [
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ] as const

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2">Configure your WhisperNet preferences and security</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-border">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                    isActive
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'privacy' && <PrivacySettings />}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Theme</h3>
                <div className="space-y-3">
                  {(['light', 'dark', 'auto'] as const).map(theme => (
                    <label
                      key={theme}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-card/30 cursor-pointer border border-border/50"
                    >
                      <input
                        type="radio"
                        name="theme"
                        value={theme}
                        checked={settings.theme === theme}
                        onChange={() => updateSetting('theme', theme)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="font-medium text-foreground capitalize">{theme}</span>
                      {theme === 'auto' && <span className="text-xs text-muted-foreground ml-auto">System preference</span>}
                    </label>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Language</h3>
                <select
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                </select>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Sound</h3>
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-card/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundAlerts}
                    onChange={() => updateSetting('soundAlerts', !settings.soundAlerts)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="font-medium text-foreground">Enable sound alerts</span>
                </label>
              </Card>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-border">
            <Card className="p-6 bg-card/30">
              <p className="text-sm text-muted-foreground mb-4">WhisperNet v1.0 • © 2025</p>
              <div className="flex gap-4">
                <Link href="#" className="text-sm text-primary hover:underline">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Terms of Service
                </Link>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Help & Support
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
