'use client'

import { useEffect, useState } from 'react'
import { loadStats, formatTime, type Stats } from '../lib/conversation'

export default function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => { setStats(loadStats()) }, [])

  if (!stats) return null

  const items = [
    {
      value: stats.sessionsCompleted,
      label: 'Sessions',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" style={{color:'var(--accent-3)'}}>
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 7v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      value: formatTime(stats.totalSpeakingSeconds),
      label: 'Speaking',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" style={{color:'var(--accent-3)'}}>
          <rect x="8" y="3" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 10a5 5 0 0010 0M10 15v2M8 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      value: (stats.scenariosPlayed.cafe || 0) + (stats.scenariosPlayed.airport || 0),
      label: 'Scenarios',
      icon: (
        <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" style={{color:'var(--accent-3)'}}>
          <path d="M3 10h14M3 6h14M3 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item, i) => (
        <div
          key={item.label}
          className="stat-glass fade-in-up"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <div className="flex justify-center mb-2">{item.icon}</div>
          <div
            className="lingrind-title text-2xl mb-0.5"
            style={{ color: 'var(--accent-3)' }}
          >
            {item.value}
          </div>
          <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}
