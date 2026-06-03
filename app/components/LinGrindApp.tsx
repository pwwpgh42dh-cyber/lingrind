'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getCharacterReply,
  getOpeningMessage,
  scorePronunciation,
  incrementSession,
  type Scenario,
  type Message,
  type ConversationState,
} from '../lib/conversation'
import { useSpeechSynthesis } from '../lib/useSpeech'
import StatsDashboard from './StatsDashboard'
import ScoreBadge from './ScoreBadge'

type View = 'home' | 'session'

const SCENARIO_INFO = {
  cafe: {
    label: 'Café',
    character: 'Emma',
    role: 'Friendly barista',
    description: 'Order coffee, choose your milk and size, and chat naturally at the counter.',
  },
  airport: {
    label: 'Airport',
    character: 'Daniel',
    role: 'Check-in agent',
    description: 'Check in for your flight, handle baggage, and collect your boarding pass.',
  },
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function CafeIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7" style={{ color: 'var(--accent-3)' }}>
      <path d="M10 14h20v16a4 4 0 01-4 4H14a4 4 0 01-4-4V14z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M30 18h3a3 3 0 010 6h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M15 8c0-2 2-3 2-5M20 8c0-2 2-3 2-5M25 8c0-2 2-3 2-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function AirportIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7" style={{ color: 'var(--accent-3)' }}>
      <path d="M6 28l8-4 14-14 4-4c1.5-1.5 4-1 5 .5s.5 3.5-1 5l-4 4-14 8-4 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 32h32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
      <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor"/>
      <path d="M5 10a7 7 0 0014 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="12" y1="20" x2="12" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9" y1="22" x2="15" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function Waveform() {
  return (
    <div className="flex items-center gap-1 h-7">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="wave-bar w-1 rounded-full" style={{ height: '6px', background: 'var(--accent-1)' }}/>
      ))}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="bubble-ai inline-flex items-center">
      <div className="dot-typing"><span/><span/><span/></div>
    </div>
  )
}

function FloralBackground() {
  return (
    <div className="floral-bg" aria-hidden="true">
      <svg viewBox="0 0 320 380" fill="none" style={{ position:'absolute', top:'-30px', right:'-40px', width:'340px', opacity:0.11, transform:'rotate(8deg)' }}>
        <g stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M160 210 C160 230 155 255 152 275 C149 295 145 305 140 320 C136 332 130 340 125 350 C120 358 118 365 122 370"/>
          <path d="M152 265 C145 258 135 255 128 260 C122 265 122 275 130 278 C140 281 150 272 152 265"/>
          <path d="M160 205 C158 185 148 165 152 145 C156 128 168 122 175 130 C182 140 178 162 168 178 C163 186 160 197 160 205"/>
          <path d="M164 203 C178 188 198 180 212 186 C224 192 228 205 220 214 C210 224 190 220 176 210 C169 205 164 203 164 203"/>
          <path d="M163 210 C180 208 200 215 210 228 C218 240 214 255 204 258 C192 261 178 250 172 236 C167 224 163 213 163 210"/>
          <path d="M158 215 C168 230 168 252 160 264 C153 275 142 278 136 270 C130 262 134 248 144 238 C151 229 157 218 158 215"/>
          <path d="M155 208 C140 205 122 210 114 222 C108 232 112 246 122 248 C134 251 148 238 153 224 C156 216 155 209 155 208"/>
          <path d="M157 204 C148 190 136 178 128 168 C122 160 122 148 130 144 C140 139 154 148 158 162 C162 175 160 192 157 204"/>
          <circle cx="160" cy="210" r="14"/>
        </g>
      </svg>
      <svg viewBox="0 0 280 420" fill="none" style={{ position:'absolute', bottom:'-20px', left:'-30px', width:'300px', opacity:0.09, transform:'rotate(-12deg)' }}>
        <g stroke="white" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M130 170 C128 195 120 220 118 245 C115 268 116 285 120 305 C124 322 122 340 115 358 C109 372 100 382 96 392 C92 400 93 408 98 412"/>
          <path d="M118 255 C108 248 96 250 90 260 C85 270 90 282 102 283 C114 284 122 272 118 258"/>
          <path d="M98 405 C88 400 80 392 82 382 C84 372 95 370 102 378 C108 385 105 396 98 405"/>
          <path d="M130 168 C128 150 120 132 108 122 C98 113 86 115 82 126 C78 138 88 154 102 160 C114 165 126 165 130 168"/>
          <path d="M133 166 C135 148 148 132 160 124 C170 118 180 120 182 131 C184 143 174 157 162 162 C152 166 136 167 133 166"/>
          <path d="M128 172 C112 172 96 180 88 192 C81 203 84 216 94 218 C106 221 120 208 124 195 C127 184 128 174 128 172"/>
          <path d="M135 175 C150 178 166 190 170 204 C173 216 167 228 156 228 C145 228 135 216 133 202 C131 190 134 178 135 175"/>
          <circle cx="131" cy="172" r="11"/>
        </g>
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFETTI + COMPLETION OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = [
  'rgba(255,255,255,0.9)', 'rgba(183,212,255,0.85)', 'rgba(126,179,255,0.8)',
  'rgba(255,255,255,0.75)', 'rgba(210,230,255,0.9)',
]

function Confetti() {
  const pieces = useRef(
    Array.from({ length: 38 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 2.2 + Math.random() * 1.8,
      size: 5 + Math.floor(Math.random() * 7),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 60,
      circle: Math.random() > 0.5,
    }))
  ).current

  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:5 }}>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) translateX(0) rotate(0deg); opacity:1 }
          80%  { opacity:1 }
          100% { transform: translateY(110vh) translateX(var(--cdrift)) rotate(var(--crot)); opacity:0 }
        }
      `}</style>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:`${p.x}%`, top:'-10px',
          width: p.size, height: p.circle ? p.size : p.size * 0.5,
          borderRadius: p.circle ? '50%' : '1px',
          background: p.color,
          ['--cdrift' as string]: `${p.drift}px`,
          ['--crot' as string]: `${p.rotate + 360}deg`,
          animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s both`,
        }}/>
      ))}
    </div>
  )
}

type OverlayView = 'complete' | 'review'

interface OverlayProps {
  scenario: Scenario
  character: string
  messages: Message[]
  onRestart: () => void
  onHome: () => void
}

function SessionCompleteOverlay({ scenario, character, messages, onRestart, onHome }: OverlayProps) {
  const [screen, setScreen] = useState<OverlayView>('complete')

  const farewell = {
    cafe: { icon: '☕', line: 'Come back and see us anytime!', sub: 'Your order is on its way.' },
    airport: { icon: '✈️', line: 'Have a wonderful flight!', sub: 'Safe travels — it was a pleasure.' },
  }[scenario]

  if (screen === 'review') {
    return (
      <div style={{
        position:'fixed', inset:0, zIndex:50,
        background:'rgba(215,230,245,0.82)',
        backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
        display:'flex', flexDirection:'column',
      }}>
        {/* Header */}
        <div style={{
          padding:'16px 20px',
          background:'rgba(255,255,255,0.6)',
          borderBottom:'1px solid rgba(255,255,255,0.7)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        }}>
          <button
            onClick={() => setScreen('complete')}
            style={{
              background:'rgba(255,255,255,0.5)', border:'1.5px solid rgba(255,255,255,0.7)',
              borderRadius:'50%', width:36, height:36, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'var(--text-muted)',
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span style={{ fontWeight:600, fontSize:15, color:'var(--text-main)' }}>
            Conversation Review
          </span>
          <div style={{ width:36 }}/>
        </div>

        {/* Messages scroll */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 16px' }}>
          <div style={{ maxWidth:600, margin:'0 auto', display:'flex', flexDirection:'column', gap:12 }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                display:'flex', flexDirection:'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                {msg.role === 'character' && (
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4, marginLeft:4 }}>
                    <div style={{
                      width:22, height:22, borderRadius:'50%',
                      background:'linear-gradient(135deg, rgba(126,179,255,0.8), rgba(90,155,245,0.9))',
                      border:'1px solid rgba(255,255,255,0.7)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:10, fontWeight:700, color:'white',
                    }}>
                      {character[0]}
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)' }}>
                      {character}
                    </span>
                  </div>
                )}
                <div style={{
                  padding:'10px 16px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, rgba(126,179,255,0.75), rgba(90,155,245,0.8))'
                    : 'rgba(255,255,255,0.65)',
                  border:'1px solid rgba(255,255,255,0.6)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-main)',
                  fontSize:13, lineHeight:1.5,
                  maxWidth:'80%',
                  boxShadow:'0 2px 10px rgba(94,147,220,0.1)',
                }}>
                  {msg.text}
                </div>
                {msg.role === 'user' && msg.score && (
                  <div style={{ marginTop:4, marginRight:4 }}>
                    <ScoreBadge score={msg.score} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          padding:'16px 20px',
          background:'rgba(255,255,255,0.55)',
          borderTop:'1px solid rgba(255,255,255,0.65)',
          display:'flex', gap:10, justifyContent:'center',
          backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        }}>
          <button onClick={onHome} style={btnSecStyle}>← Home</button>
          <button onClick={onRestart} style={btnPrimaryStyle}>Start Again →</button>
        </div>
      </div>
    )
  }

  // Complete screen
  return (
    <div className="fade-in-up" style={{
      position:'fixed', inset:0, zIndex:50,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'rgba(215,230,245,0.72)',
      backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
    }}>
      <Confetti />
      <div style={{
        position:'relative', zIndex:10,
        background:'rgba(255,255,255,0.65)',
        border:'1.5px solid rgba(255,255,255,0.8)',
        borderRadius:28,
        boxShadow:'0 12px 48px rgba(94,147,220,0.22), 0 1.5px 0 rgba(255,255,255,0.7) inset',
        padding:'40px 36px', maxWidth:360, width:'90%',
        textAlign:'center',
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
      }}>
        <div style={{
          width:64, height:64, borderRadius:'50%', margin:'0 auto 16px',
          background:'linear-gradient(135deg, rgba(126,179,255,0.8), rgba(90,155,245,0.9))',
          border:'2px solid rgba(255,255,255,0.7)',
          boxShadow:'0 4px 20px rgba(94,147,220,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:28,
        }}>
          {farewell.icon}
        </div>
        <p style={{ fontSize:22, fontWeight:700, color:'var(--text-main)', marginBottom:8, lineHeight:1.3 }}>
          {farewell.line}
        </p>
        <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:28 }}>
          {farewell.sub}
        </p>
        <div style={{
          background:'rgba(183,212,255,0.2)',
          border:'1px solid rgba(126,179,255,0.25)',
          borderRadius:16, padding:'10px 20px', marginBottom:28,
        }}>
          <p style={{ fontSize:12, fontWeight:600, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'0.05em' }}>
            Session complete ✓
          </p>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={onHome} style={btnSecStyle}>← Home</button>
          <button onClick={() => setScreen('review')} style={btnSecStyle}>Review 💬</button>
          <button onClick={onRestart} style={btnPrimaryStyle}>Again →</button>
        </div>
      </div>
    </div>
  )
}

const btnSecStyle: React.CSSProperties = {
  padding:'11px 20px', borderRadius:9999,
  background:'rgba(255,255,255,0.55)',
  border:'1.5px solid rgba(255,255,255,0.75)',
  color:'var(--text-muted)', fontWeight:600, fontSize:13,
  cursor:'pointer', boxShadow:'0 3px 12px rgba(94,147,220,0.12)',
}

const btnPrimaryStyle: React.CSSProperties = {
  padding:'11px 20px', borderRadius:9999,
  background:'linear-gradient(135deg, rgba(126,179,255,0.85), rgba(90,155,245,0.9))',
  border:'1.5px solid rgba(255,255,255,0.6)',
  color:'#fff', fontWeight:600, fontSize:13,
  cursor:'pointer', boxShadow:'0 6px 20px rgba(94,147,220,0.35)',
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function LinGrindApp() {
  const [view, setView]                         = useState<View>('home')
  const [selectedScenario, setSelectedScenario] = useState<Scenario>('cafe')
  const [messages, setMessages]                 = useState<Message[]>([])
  const [convState, setConvState]               = useState<ConversationState>({
    scenario: 'cafe', stage: 0, history: [], memory: {},
  })
  // ref always holds latest convState — fixes stale closure (root cause of double greeting)
  const convStateRef   = useRef<ConversationState>({ scenario: 'cafe', stage: 0, history: [], memory: {} })
  const [isListening, setIsListening]   = useState(false)
  const [isThinking, setIsThinking]     = useState(false)
  const [isSpeaking, setIsSpeaking]     = useState(false)
  const [sessionDone, setSessionDone]   = useState(false)
  // Guard: prevents React StrictMode double-invoke of startSession
  const sessionStartedRef  = useRef(false)
  const [liveTranscript, setLiveTranscript]     = useState('')
  const liveTranscriptRef  = useRef('')
  const isButtonHeldRef    = useRef(false)
  const isSpeakingRef      = useRef(false)
  const characterNameRef   = useRef<string>('Emma')
  const [speechError, setSpeechError]           = useState<string | null>(null)
  const [ambientMuted, setAmbientMuted]         = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [statsRefresh, setStatsRefresh]         = useState(0)

  const audioRef       = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { speak, cancel: cancelSpeech } = useSpeechSynthesis()

  useEffect(() => { isSpeakingRef.current = isSpeaking }, [isSpeaking])
  // Keep ref in sync with state
  useEffect(() => { convStateRef.current = convState }, [convState])

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [])

  useEffect(() => {
    if (view === 'session' && audioRef.current) {
      if (ambientMuted) audioRef.current.pause()
      else audioRef.current.play().catch(() => {})
    }
  }, [ambientMuted, view])

  // ── Start session ─────────────────────────────────────────────────────────
  const startSession = useCallback(() => {
    // StrictMode guard — prevents double invocation in dev
    if (sessionStartedRef.current) return
    sessionStartedRef.current = true

    cancelSpeech()
    const scenario = selectedScenario
    const info     = SCENARIO_INFO[scenario]
    const opening  = getOpeningMessage(scenario)

    characterNameRef.current = info.character

    const firstMsg: Message = {
      id: Date.now().toString(),
      role: 'character',
      text: opening.reply,
      timestamp: new Date(),
    }

    // stage 2 — skips BOTH stage 0 (greeting) AND stage 1 (drink/destination)
    // Stage 1 is the first real question branch (what drink / where flying)
    // which is already asked via the opening message above.
    // Without this, the first user reply re-triggers stage 1 → greeting again.
    const initState: ConversationState = {
      scenario, stage: 2, history: [opening.reply], memory: {},
    }
    setMessages([firstMsg])
    setConvState(initState)
    convStateRef.current = initState   // sync immediately, no React async lag
    setSessionDone(false)
    setView('session')
    setSessionStartTime(new Date())
    setSpeechError(null)
    setLiveTranscript('')
    liveTranscriptRef.current = ''

    setTimeout(() => {
      setIsSpeaking(true)
      speak(opening.reply, info.character, () => {
        setIsSpeaking(false)
        // Reset guard only after speak completes so StrictMode re-run is blocked
        sessionStartedRef.current = false
      })
    }, 500)
  }, [selectedScenario, speak, cancelSpeech])

  // ── End session ───────────────────────────────────────────────────────────
  const endSession = useCallback(() => {
    cancelSpeech()
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    isButtonHeldRef.current = false
    setIsListening(false)
    if (sessionStartTime) {
      const seconds = Math.round((Date.now() - sessionStartTime.getTime()) / 1000)
      incrementSession(convState.scenario, seconds)
      setStatsRefresh(r => r + 1)
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
    setSessionDone(false)
    setView('home')
  }, [cancelSpeech, sessionStartTime, convState.scenario])

  // ── Handle speech ─────────────────────────────────────────────────────────
  const handleUserSpeech = useCallback((transcript: string) => {
    if (!transcript.trim()) { setSpeechError('No speech detected. Please try again.'); return }

    let cleaned = transcript.trim()
    cleaned = cleaned.replace(/^(play\s+|okay\s+|ok\s+|hey\s+siri\s+|alexa\s+|hey\s+google\s+)/i, '')
    const fixes: [RegExp, string][] = [
      [/\btrain\b/gi, 'drink'], [/\blatter\b/gi, 'latte'],
      [/\bice\s+latte\b/gi, 'iced latte'], [/\bice\s+coffee\b/gi, 'iced coffee'],
      [/\bi'll\s+seat\b/gi, 'aisle seat'], [/\boat\s+milk\b/gi, 'oat milk'],
      [/\btake\s+away\b/gi, 'takeaway'],
    ]
    for (const [p, r] of fixes) cleaned = cleaned.replace(p, r)
    const displayText = cleaned || transcript
    const score = scorePronunciation(displayText)

    const userMsg: Message = {
      id: Date.now().toString(), role: 'user',
      text: displayText, timestamp: new Date(), score,
    }
    setMessages(prev => [...prev, userMsg])
    setLiveTranscript('')
    liveTranscriptRef.current = ''
    scrollToBottom()

    setIsThinking(true)
    setTimeout(() => {
      // Always read from ref — never from stale closure
      const current = convStateRef.current
      const { reply, newStage, newMemory } = getCharacterReply(displayText, current)
      const charName = characterNameRef.current

      const next: ConversationState = {
        ...current, stage: newStage,
        history: [...current.history, displayText, reply],
        memory: newMemory,
      }
      setConvState(next)
      convStateRef.current = next

      const charMsg: Message = {
        id: (Date.now()+1).toString(), role: 'character',
        text: reply, timestamp: new Date(),
      }
      setIsThinking(false)
      setMessages(prev => [...prev, charMsg])
      scrollToBottom()
      setIsSpeaking(true)

      // Stage 10+ = session naturally complete
      const isComplete = newStage >= 10

      speak(reply, charName, () => {
        setIsSpeaking(false)
        if (isComplete) {
          setTimeout(() => setSessionDone(true), 1000)
        }
      })
    }, 700 + Math.random() * 400)
  }, [speak, scrollToBottom])  // no convState in deps — use ref instead

  // ── Speech recognition ────────────────────────────────────────────────────
  const createRecognition = useCallback(() => {
    const SR = (window as typeof window & {
      SpeechRecognition?: typeof SpeechRecognition
      webkitSpeechRecognition?: typeof SpeechRecognition
    }).SpeechRecognition || (window as typeof window & {
      webkitSpeechRecognition?: typeof SpeechRecognition
    }).webkitSpeechRecognition
    if (!SR) return null
    const r = new SR()
    r.lang = 'en-US'
    r.interimResults = true
    r.maxAlternatives = 3
    r.continuous = true
    return r
  }, [])

  const startListening = useCallback(() => {
    setSpeechError(null)
    if (isSpeakingRef.current) {
      cancelSpeech(); setIsSpeaking(false); isSpeakingRef.current = false
    }
    isButtonHeldRef.current = true

    const begin = () => {
      const recognition = createRecognition()
      if (!recognition) {
        setSpeechError('Speech recognition not supported. Please use Chrome or Edge.')
        return
      }
      liveTranscriptRef.current = ''
      setLiveTranscript('')

      recognition.onstart = () => setIsListening(true)

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (!isButtonHeldRef.current) return
        let acc = ''
        for (let i = 0; i < event.results.length; i++) {
          let best = event.results[i][0].transcript
          let bestConf = event.results[i][0].confidence || 0
          for (let j = 1; j < event.results[i].length; j++) {
            const c = event.results[i][j].confidence || 0
            if (c > bestConf) { best = event.results[i][j].transcript; bestConf = c }
          }
          acc += best + ' '
        }
        const text = acc.trim()
        liveTranscriptRef.current = text
        setLiveTranscript(text)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech') return
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setSpeechError('Microphone access denied. Allow microphone in browser settings.')
          isButtonHeldRef.current = false; setIsListening(false)
        }
      }

      recognition.onend = () => {
        if (isButtonHeldRef.current) {
          const newR = createRecognition()
          if (!newR) return
          newR.onstart   = recognition.onstart
          newR.onresult  = recognition.onresult
          newR.onerror   = recognition.onerror
          newR.onend     = recognition.onend
          recognitionRef.current = newR
          setTimeout(() => { try { newR.start() } catch {} }, 80)
          return
        }
        setIsListening(false)
        const text = liveTranscriptRef.current.trim()
        liveTranscriptRef.current = ''
        setLiveTranscript('')
        if (text) handleUserSpeech(text)
      }

      recognitionRef.current = recognition
      try { recognition.start() } catch {
        setSpeechError('Could not start microphone. Please try again.')
      }
    }

    setTimeout(begin, isSpeakingRef.current ? 350 : 50)
  }, [cancelSpeech, createRecognition, handleUserSpeech])

  const stopListening = useCallback(() => {
    isButtonHeldRef.current = false
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
  }, [])

  // ── Ambient audio ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'session') return
    const src = selectedScenario === 'cafe' ? '/sounds/cafe.mp3' : '/sounds/airport.mp3'
    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.loop = true
      audioRef.current.volume = 0.22
    } else {
      audioRef.current.src = src
    }
    if (!ambientMuted) {
      audioRef.current.play().catch(() => {
        const unlock = () => { audioRef.current?.play().catch(() => {}) }
        document.addEventListener('click', unlock, { once: true })
        document.addEventListener('touchstart', unlock, { once: true })
      })
    }
    return () => { audioRef.current?.pause() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedScenario])

  // ═══════════════════════════════════════════════════
  // HOME VIEW
  // ═══════════════════════════════════════════════════
  if (view === 'home') {
    return (
      <div className="min-h-screen glass-bg relative">
        <FloralBackground />
        <nav className="nav-glass relative z-10 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <span className="logo-title text-2xl" style={{ color: 'var(--text-main)' }}>LinGrind</span>
            <span className="pill-tag">B1 English</span>
          </div>
        </nav>
        <main className="relative z-10 max-w-3xl mx-auto px-5 pb-16">
          <div className="text-center pt-10 pb-2 fade-in-up">
            <h1 className="logo-title" style={{
              fontSize: 'clamp(3.5rem, 12vw, 7rem)',
              color: 'var(--text-main)', lineHeight: 1.05, opacity: 0.88,
            }}>LinGrind</h1>
            <p className="text-sm font-medium mt-2 mb-8" style={{ color: 'var(--text-light)' }}>
              Speak · Listen · Improve
            </p>
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: 'var(--text-light)' }}>Your Progress</p>
            <StatsDashboard key={statsRefresh} />
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-center" style={{ color: 'var(--text-light)' }}>Choose a Scenario</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.entries(SCENARIO_INFO) as [Scenario, typeof SCENARIO_INFO.cafe][]).map(([key, info]) => (
                <button key={key} onClick={() => setSelectedScenario(key)}
                  className={`scenario-glass text-left p-6 ${selectedScenario === key ? 'selected' : ''}`}>
                  <div className="icon-glass mb-4">
                    {key === 'cafe' ? <CafeIcon /> : <AirportIcon />}
                  </div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-main)' }}>{info.label}</h3>
                    {selectedScenario === key && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--accent-1)', border: '1.5px solid rgba(255,255,255,0.6)' }}>
                        <svg viewBox="0 0 10 8" className="w-3 h-3 text-white" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-3)' }}>{info.character} · {info.role}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{info.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center mb-12">
            <button onClick={startSession} className="btn-glass-primary text-base font-semibold px-12 py-4 cursor-pointer">
              Start Speaking →
            </button>
            <p className="text-xs mt-3" style={{ color: 'var(--text-light)' }}>Microphone permission will be requested when you start.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" style={{color:'var(--accent-3)'}}><rect x="8" y="3" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 10a5 5 0 0010 0M10 15v2M8 17h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>, label: 'Speak', desc: 'Hold mic and talk naturally' },
              { icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" style={{color:'var(--accent-3)'}}><path d="M4 14v-4a6 6 0 1112 0v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><rect x="2" y="13" width="4" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="14" y="13" width="4" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>, label: 'Listen', desc: 'Character replies in audio' },
              { icon: <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" style={{color:'var(--accent-3)'}}><path d="M4 14l4-4 3 3 5-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.4"/></svg>, label: 'Track', desc: 'Sessions and speaking time' },
            ].map(step => (
              <div key={step.label} className="p-3">
                <div className="step-icon">{step.icon}</div>
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-main)' }}>{step.label}</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-light)' }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════
  // SESSION VIEW
  // ═══════════════════════════════════════════════════
  const scenarioInfo = SCENARIO_INFO[selectedScenario]

  return (
    <div className="min-h-screen glass-bg flex flex-col relative">
      <FloralBackground />

      <nav className="nav-glass relative z-10 px-5 py-3 sticky top-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={endSession} className="btn-circle-glass">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M5 12l7-7M5 12l7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                {scenarioInfo.label} with {scenarioInfo.character}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-light)' }}>{scenarioInfo.role}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSpeaking && <Waveform />}
            <button onClick={() => setAmbientMuted(m => !m)} className="btn-circle-glass">
              {ambientMuted ? (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`fade-in-up flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.role === 'character' && (
                <div className="flex items-center gap-2 mb-1.5 ml-1">
                  <div className="char-avatar">{scenarioInfo.character[0]}</div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{scenarioInfo.character}</span>
                </div>
              )}
              <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              {msg.role === 'user' && msg.score && (
                <div className="mt-1.5 mr-1"><ScoreBadge score={msg.score} /></div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="fade-in-up flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1.5 ml-1">
                <div className="char-avatar">{scenarioInfo.character[0]}</div>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{scenarioInfo.character}</span>
              </div>
              <TypingDots />
            </div>
          )}

          {liveTranscript && (
            <div className="fade-in-up flex justify-end">
              <div className="bubble-live">
                <p id="live-transcript" className="text-sm italic leading-relaxed">{liveTranscript}…</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {speechError && (
        <div className="relative z-10 px-4 mb-2 max-w-2xl mx-auto w-full">
          <div className="error-glass flex items-center justify-between">
            <span>{speechError}</span>
            <button onClick={() => setSpeechError(null)} className="ml-3 opacity-60 hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="mic-panel relative z-10 px-6 py-5 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
          <p className="text-xs font-medium" style={{ color: 'var(--text-light)' }}>
            {isListening ? 'Listening — speak clearly'
            : isThinking ? `${scenarioInfo.character} is thinking…`
            : isSpeaking ? `${scenarioInfo.character} is speaking…`
            : 'Hold mic to speak · Release to send'}
          </p>
          <div className="relative flex items-center justify-center">
            {isListening && (
              <div style={{
                position:'absolute', inset:'-14px', borderRadius:'50%',
                background:'radial-gradient(circle, rgba(126,179,255,0.18) 0%, transparent 70%)',
                animation:'micGlow 1.6s ease-in-out infinite',
              }}/>
            )}
            <button
              onMouseDown={(e) => { e.preventDefault(); if (!isListening) startListening() }}
              onMouseUp={(e)   => { e.preventDefault(); if (isListening)  stopListening()  }}
              onMouseLeave={(e)=> { e.preventDefault(); if (isListening)  stopListening()  }}
              onTouchStart={(e)=> { e.preventDefault(); if (!isListening) startListening() }}
              onTouchEnd={(e)  => { e.preventDefault(); if (isListening)  stopListening()  }}
              onTouchCancel={(e)=>{ e.preventDefault(); if (isListening)  stopListening()  }}
              disabled={isThinking || isSpeaking}
              className={`mic-btn ${isListening ? 'listening' : isThinking || isSpeaking ? 'disabled-mic' : ''}`}
            >
              <MicIcon />
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-light)', opacity: 0.7 }}>
            Hold or tap to record · Release to send
          </p>
        </div>
      </div>

      {/* Session complete overlay */}
      {sessionDone && (
        <SessionCompleteOverlay
          scenario={selectedScenario}
          character={scenarioInfo.character}
          messages={messages}
          onRestart={() => { setSessionDone(false); sessionStartedRef.current = false; startSession() }}
          onHome={endSession}
        />
      )}
    </div>
  )
}
