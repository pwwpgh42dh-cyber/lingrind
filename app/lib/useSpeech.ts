'use client'

import { useRef, useCallback, useEffect } from 'react'

// Female voices — for Emma (café)
const FEMALE_VOICES = [
  'Samantha', 'Karen', 'Moira', 'Serena', 'Tessa',
  'Google US English', 'Google UK English Female',
  'Microsoft Aria Online (Natural)', 'Microsoft Jenny Online (Natural)',
  'Microsoft Aria', 'Microsoft Jenny', 'Victoria', 'Fiona',
]

// Male voices — for Daniel (airport)
const MALE_VOICES = [
  'Daniel', 'Alex', 'Fred', 'Tom',
  'Google UK English Male',
  'Microsoft Guy Online (Natural)', 'Microsoft Ryan Online (Natural)',
  'Microsoft Guy', 'Microsoft Ryan', 'Microsoft David',
  'Gordon', 'Oliver',
]

function selectVoice(voices: SpeechSynthesisVoice[], gender: 'female' | 'male'): SpeechSynthesisVoice | null {
  const priorityList = gender === 'male' ? MALE_VOICES : FEMALE_VOICES

  for (const name of priorityList) {
    const match = voices.find(v => v.name.includes(name))
    if (match) return match
  }

  // Fallback: any en-* voice, try to guess gender from name
  const enVoices = voices.filter(v => v.lang.startsWith('en'))
  if (gender === 'male') {
    const maleGuess = enVoices.find(v =>
      v.name.toLowerCase().includes('male') ||
      /\b(david|james|mark|paul|richard|robert|thomas|william|george|henry)\b/i.test(v.name)
    )
    if (maleGuess) return maleGuess
  }

  return enVoices[0] || voices[0] || null
}

export function useSpeechSynthesis() {
  const femaleVoiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const maleVoiceRef   = useRef<SpeechSynthesisVoice | null>(null)
  const warmDoneRef    = useRef(false)

  const loadVoices = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const voices = window.speechSynthesis.getVoices()
    if (!voices.length) return

    femaleVoiceRef.current = selectVoice(voices, 'female')
    maleVoiceRef.current   = selectVoice(voices, 'male')

    // Warm-up: silent utterance to init Chrome audio pipeline
    // Prevents the "Springtrap glitch" on first real call
    if (!warmDoneRef.current) {
      warmDoneRef.current = true
      const warmup = new SpeechSynthesisUtterance('\u200B')
      warmup.volume = 0
      if (femaleVoiceRef.current) warmup.voice = femaleVoiceRef.current
      window.speechSynthesis.speak(warmup)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

    // Chrome sometimes needs polling
    let attempts = 0
    const poll = setInterval(() => {
      if ((femaleVoiceRef.current && maleVoiceRef.current) || attempts > 20) {
        clearInterval(poll); return
      }
      loadVoices(); attempts++
    }, 200)

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      clearInterval(poll)
    }
  }, [loadVoices])

  // character: 'Emma' = female, 'Daniel' = male, undefined = female fallback
  const speak = useCallback((text: string, character?: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      onEnd?.(); return
    }

    window.speechSynthesis.cancel()

    setTimeout(() => {
      const isMale = character === 'Daniel'
      const voiceRef = isMale ? maleVoiceRef : femaleVoiceRef

      // Re-attempt voice load if not ready yet
      if (!voiceRef.current) {
        const voices = window.speechSynthesis.getVoices()
        voiceRef.current = selectVoice(voices, isMale ? 'male' : 'female')
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang   = 'en-US'
      utterance.rate   = isMale ? 0.9 : 0.88   // Daniel slightly faster, more professional
      utterance.pitch  = isMale ? 0.9 : 1.05   // Daniel lower pitch, Emma slightly warmer
      utterance.volume = 1.0

      if (voiceRef.current) {
        utterance.voice = voiceRef.current
        utterance.lang  = voiceRef.current.lang || 'en-US'
      }

      if (onEnd) {
        const wordCount  = text.trim().split(/\s+/).length
        const estimatedMs = Math.max((wordCount / utterance.rate) * 420 + 800, 2500)
        const timer = setTimeout(onEnd, estimatedMs)
        utterance.onend  = () => { clearTimeout(timer); onEnd() }
        utterance.onerror = (e) => { clearTimeout(timer); if (e.error !== 'interrupted') onEnd() }
      }

      window.speechSynthesis.speak(utterance)

      // Chrome stall fix — resumes after ~15s pause bug
      const stallFix = setInterval(() => {
        if (!window.speechSynthesis.speaking) { clearInterval(stallFix); return }
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      }, 10000)

      const origOnEnd = utterance.onend as (() => void) | null
      utterance.onend = () => { clearInterval(stallFix); origOnEnd?.() }
    }, 100)
  }, [])

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  return { speak, cancel }
}
