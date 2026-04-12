'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Music, Stethoscope, AlertTriangle, Settings, Home,MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const routes = [
  {
    label: 'Home',
    icon: Home,
    href: '/',
  },
  {
    label: 'Education',
    icon: Music,
    href: '/education',
  },
  {
    label: 'Healthcare',
    icon: Stethoscope,
    href: '/healthcare',
  },
  {
    label: 'Disaster',
    icon: AlertTriangle,
    href: '/disaster',
  },
    {
  label: 'Chat',
  icon: MessageCircle,
  href: '/chat',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },

  
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-sidebar min-h-screen">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Music className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-sidebar-foreground">WhisperNet</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {routes.map((route) => {
            const Icon = route.icon
            const isActive = pathname === route.href
            return (
              <Link key={route.href} href={route.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md transition-all',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{route.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <p className="text-xs text-sidebar-foreground/60">WhisperNet v1.0</p>
        </div>
      </div>
    </aside>
  )
}
