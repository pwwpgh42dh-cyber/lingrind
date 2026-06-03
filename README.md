# LinGrind 🎙️

**Practice Real English Speaking — Free, Browser-Based, No API Keys**

A beautiful web app for B1-level English speaking practice using immersive scenarios with lifelike characters. Powered entirely by the browser's Web Speech API — no paid services, no sign-up, no backend.

---

## ✨ Features

- **Two immersive scenarios**: Café (Emma the barista) and Airport (Daniel the check-in agent)
- **Voice recognition** via Web Speech API (Chrome/Edge)
- **Spoken responses** via browser SpeechSynthesis API
- **Branching dialogue logic** — dynamic, non-repetitive conversations
- **Pronunciation scoring** — feedback on answer length and quality
- **Ambient background sounds** — café or airport atmosphere
- **Progress tracking** — sessions, speaking time, scenarios played (localStorage)
- **Fully responsive** — mobile & desktop
- **100% free** — no API keys, no subscriptions

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in **Chrome or Edge** (required for Web Speech API).

---

## 🎵 Adding Ambient Sounds

Place your audio files in `/public/sounds/`:

```
public/
  sounds/
    cafe.mp3      ← café ambient sound (coffee shop background noise)
    airport.mp3   ← airport ambient sound (terminal background noise)
```

Free sources:
- [Freesound.org](https://freesound.org) — search "coffee shop ambience" or "airport terminal ambience"
- [Pixabay](https://pixabay.com/sound-effects/) — free ambient sounds

The app works fine without these files — ambient audio is optional.

---

## 🧠 How the Dialogue Engine Works

No external AI is used. The conversation logic is in `app/lib/conversation.ts`:

- **Stage-based progression** — each scenario has 6–8 stages
- **Keyword detection** — user speech is scanned for relevant words to advance the conversation
- **Randomized responses** — multiple variants per stage prevent repetition
- **Graceful fallbacks** — if no keywords match, the character asks for clarification

---

## 📁 Project Structure

```
lingrind/
├── app/
│   ├── components/
│   │   ├── LinGrindApp.tsx      ← Main app (home + session views)
│   │   ├── StatsDashboard.tsx   ← Progress stats
│   │   └── ScoreBadge.tsx       ← Pronunciation feedback badge
│   ├── lib/
│   │   ├── conversation.ts      ← Dialogue engine + stats helpers
│   │   └── useSpeech.ts         ← Web Speech API hooks
│   ├── globals.css              ← Tailwind + custom animations
│   ├── layout.tsx               ← Root layout with fonts
│   └── page.tsx                 ← Entry point
├── public/
│   └── sounds/                  ← ambient audio (add your own .mp3s)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🌐 Browser Support

| Browser | Speech Recognition | Speech Synthesis |
|---------|-------------------|-----------------|
| Chrome  | ✅ Full support    | ✅ Full support  |
| Edge    | ✅ Full support    | ✅ Full support  |
| Firefox | ❌ Not supported   | ✅ Partial       |
| Safari  | ⚠️ Partial         | ✅ Full support  |

**Recommended: Google Chrome on desktop or Android**

---

## 🎨 Design System

- **Font**: Playfair Display (headings) + DM Sans (body)
- **Primary**: `#D4A0A0` dusty pink
- **Background**: `#FDFAFA` warm white
- **Muted text**: `#8A8080` soft gray
- **Cards**: white with `#E8E2E2` borders and soft shadows

---

## 📈 Extending the App

To add a new scenario:
1. Add stages array in `conversation.ts`
2. Add keyword rules for stage progression
3. Add entry in `SCENARIO_INFO` in `LinGrindApp.tsx`
4. Add ambient sound file in `/public/sounds/`

---

## License

MIT — free to use, modify, and distribute.
