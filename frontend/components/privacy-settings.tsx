'use client'

import { useSettings } from '@/hooks/use-settings'
import { Card } from '@/components/ui/card'
import { Eye, Mic, MapPin, Bell } from 'lucide-react'

export function PrivacySettings() {
  const { settings, updateSetting } = useSettings()

  const toggleSwitch = (key: keyof typeof settings) => {
    updateSetting(key, !settings[key])
  }

  const SettingToggle = ({
    icon: Icon,
    label,
    description,
    settingKey,
  }: {
    icon: React.ComponentType<{ className: string }>
    label: string
    description: string
    settingKey: keyof typeof settings
  }) => (
    <div className="flex items-start justify-between p-4 rounded-lg hover:bg-card/30 transition-colors cursor-pointer" onClick={() => toggleSwitch(settingKey)}>
      <div className="flex items-start gap-3 flex-1">
        <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className={`w-10 h-6 rounded-full transition-colors ${settings[settingKey] ? 'bg-primary' : 'bg-muted'}`}>
        <div
          className={`w-5 h-5 rounded-full bg-white transition-transform ${
            settings[settingKey] ? 'translate-x-4' : 'translate-x-0.5'
          }`}
          style={{ marginTop: '2px' }}
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Privacy & Permissions</h3>

        <div className="space-y-2">
          <SettingToggle
            icon={Mic}
            label="Microphone Access"
            description="Allow WhisperNet to access your microphone for ultrasonic communication"
            settingKey="microphoneEnabled"
          />
          <SettingToggle
            icon={MapPin}
            label="Location Sharing"
            description="Share your location for emergency services and nearby features"
            settingKey="locationSharing"
          />
          <SettingToggle
            icon={Eye}
            label="Public Device Discovery"
            description="Allow other devices to discover and pair with you"
            settingKey="allowPublicDiscovery"
          />
          <SettingToggle
            icon={Bell}
            label="Notifications"
            description="Receive alerts and notifications from WhisperNet"
            settingKey="notificationsEnabled"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Data Management</h3>

        <div className="space-y-4">
          <div>
            <p className="font-medium text-foreground mb-2">Auto-Encrypt Data</p>
            <p className="text-sm text-muted-foreground mb-3">Automatically encrypt sensitive information</p>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.autoEncrypt}
                onChange={() => updateSetting('autoEncrypt', !settings.autoEncrypt)}
                className="w-4 h-4 rounded border-border bg-input cursor-pointer"
              />
              <label className="text-sm text-foreground cursor-pointer">Enable automatic encryption</label>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="font-medium text-foreground mb-2">Data Retention</p>
            <p className="text-sm text-muted-foreground mb-3">Delete data older than specified days</p>
            <select
              value={settings.dataRetention}
              onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  )
}
