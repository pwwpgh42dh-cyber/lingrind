'use client'

interface ScoreBadgeProps {
  score: 'good' | 'short'
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  if (score === 'good') {
    return (
      <span className="badge-good">
        <svg viewBox="0 0 10 8" width="10" height="8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Good answer
      </span>
    )
  }
  return (
    <span className="badge-short">
      <svg viewBox="0 0 10 10" width="10" height="10" fill="none">
        <path d="M5 2v4M5 8v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
      Try longer
    </span>
  )
}
