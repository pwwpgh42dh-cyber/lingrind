'use client'

import { useRef, useCallback, useEffect } from 'react'

const FEMALE_VOICES = [
  'Samantha', 'Karen', 'Moira', 'Serena', 'Tessa', 'Victoria', 'Fiona',
  'Google US English', 'Google UK English Female',
  'Microsoft Aria Online (Natural)', 'Microsoft Jenny Online (Natural)',
  'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Zira',
]

const MALE_VOICES = [
  'Daniel', 'Alex', 'Fred', 'Tom', 'Gordon', 'Oliver',
  'Google UK English Male',
  'Microsoft Guy Online (Natural)', 'Microsoft Ryan Online (Natural)',
  'Microsoft Guy', 'Microsoft Ryan', 'Microsoft David',
]

// Keywords that suggest a female voice from name alone
const FEMALE_NAME_HINTS = [
  'female', 'woman', 'girl', 'samantha', 'karen', 'moira', 'serena', 'tessa',
  'aria', 'jenny', 'zira', 'victoria', 'fiona', 'alice', 'sophie', 'emily',
  'emma', 'amy', 'lisa', 'anna', 'kate', 'claire', 'nora', 'ava',
]

const MALE_NAME_HINTS = [
  'male', 'man', 'daniel', 'alex', 'fred', 'tom', 'gordon', 'oliver',
  'guy', 'ryan', 'david', 'mark', 'james', 'paul', 'george',
]

function selectVoice(
  voices: SpeechSynthesisVoice[],
  gender: 'female' | 'male'
): SpeechSynthesisVoice | null {
  const priorityList = gender === 'male' ? MALE_VOICES : FEMALE_VOICES

  // 1. Try priority list by name
  for (const name of priorityList) {
    const match = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()))
    if (match) return match
  }

  const enVoices = voices.filter(v => v.lang.startsWith('en'))

  // 2. Try to find by gender hints in voice name
  const nameHints = gender === 'female' ? FEMALE_NAME_HINTS : MALE_NAME_HINTS
  for (const hint of nameHints) {
    const match = enVoices.find(v => v.name.toLowerCase().includes(hint))
    if (match) return match
  }

  // 3. Try voices that explicitly say "female" or "male" in lang/name
  const genderMatch = enVoices.find(v =>
    v.name.toLowerCase().includes(gender)
  )
  if (genderMatch) return genderMatch

  // 4. For female: pick any en voice that is NOT in the male hints list
  //    For male: pick any en voice that is NOT in the female hints list
  if (gender === 'female') {
    const notMale = enVoices.find(v => {
      const lower = v.name.toLowerCase()
      return !MALE_NAME_HINTS.some(h => lower.includes(h))
    })
    if (notMale) return notMale
  }

  // 5. Final fallback — any English voice
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

  const speak = useCallback((text: string, character?: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      onEnd?.(); return
    }

    window.speechSynthesis.cancel()

    setTimeout(() => {
      const isMale = character === 'Daniel'
      const voiceRef = isMale ? maleVoiceRef : femaleVoiceRef

      if (!voiceRef.current) {
        const voices = window.speechSynthesis.getVoices()
        voiceRef.current = selectVoice(voices, isMale ? 'male' : 'female')
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang   = 'en-US'
      utterance.rate   = isMale ? 0.9 : 0.88
      utterance.pitch  = isMale ? 0.85 : 1.05
      utterance.volume = 1.0

      if (voiceRef.current) {
        utterance.voice = voiceRef.current
        utterance.lang  = voiceRef.current.lang || 'en-US'
      }

      if (onEnd) {
        const wordCount   = text.trim().split(/\s+/).length
        const estimatedMs = Math.max((wordCount / utterance.rate) * 420 + 800, 2500)
        const timer = setTimeout(onEnd, estimatedMs)
        utterance.onend   = () => { clearTimeout(timer); onEnd() }
        utterance.onerror = (e: Event) => {
          clearTimeout(timer)
          const se = e as SpeechSynthesisErrorEvent
          if (se.error !== 'interrupted') onEnd()
        }
      }

      window.speechSynthesis.speak(utterance)

      // Chrome stall fix
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
