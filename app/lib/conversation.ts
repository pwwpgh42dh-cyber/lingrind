// LinGrind Conversation Engine v5
// Fixes: multi-item extras, cash payment, Daniel electronics security

export type Scenario = 'cafe' | 'airport'

export interface Message {
  id: string
  role: 'user' | 'character'
  text: string
  timestamp: Date
  score?: 'good' | 'short' | null
}

export interface ConversationState {
  scenario: Scenario
  stage: number
  history: string[]
  memory: Record<string, string>
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function has(text: string, words: string[]): boolean {
  const t = text.toLowerCase()
  return words.some(w => t.includes(w))
}

function cap(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : ''
}

// ══════════════════════════════════════════════════════════════════
// CAFÉ — Emma
// ══════════════════════════════════════════════════════════════════

function getCafeReply(
  text: string,
  stage: number,
  memory: Record<string, string>
): { reply: string; newStage: number; newMemory: Record<string, string> } {
  const t = text.toLowerCase()
  const mem = { ...memory }

  // ── Global: allergy ───────────────────────────────────────────────────────
  if (has(t, ['allerg', 'intoleran', 'gluten', 'nut allergy', 'lactose', 'dairy free', 'vegan']) && stage >= 1) {
    if (has(t, ['gluten'])) return { reply: "Good to know! All our drinks are gluten-free. Our oat milk is certified GF too. For food, skip the croissants and muffins — the fruit cup and yogurt parfait are safe.", newStage: stage, newMemory: mem }
    if (has(t, ['lactose', 'dairy'])) return { reply: "No problem! Oat, almond, and soy milk are all dairy-free. I'll make sure nothing dairy touches your drink.", newStage: stage, newMemory: mem }
    if (has(t, ['vegan'])) return { reply: "We've got you! Any drink with oat, almond, or soy milk is vegan. Banana bread and granola are vegan-friendly food options.", newStage: stage, newMemory: mem }
    return { reply: "Of course — what's the allergy? I want to make sure everything is safe.", newStage: stage, newMemory: mem }
  }

  // ── Global: wifi ──────────────────────────────────────────────────────────
  if (has(t, ['wifi', 'wi-fi', 'password', 'internet', 'connect']) && stage >= 1) {
    return { reply: "Sure! Network is BloomCafe_Guest, password is bloom2024. Also written on the card at each table!", newStage: stage, newMemory: mem }
  }

  // ── Global: toilet ────────────────────────────────────────────────────────
  if (has(t, ['toilet', 'bathroom', 'restroom', 'loo']) && stage >= 1) {
    return { reply: "Of course! Past the counter on the left — door code is 4821.", newStage: stage, newMemory: mem }
  }

  // ── Global: charging ──────────────────────────────────────────────────────
  if (has(t, ['charge', 'charger', 'plug', 'socket']) && stage >= 1) {
    return { reply: "Yes! Sockets under the tables along the window wall — great for working. USB port at the counter too if you need a quick charge.", newStage: stage, newMemory: mem }
  }

  // ── Global: how long / queue ──────────────────────────────────────────────
  if (has(t, ['how long', 'wait', 'queue', 'busy']) && stage >= 1 && stage <= 8) {
    return { reply: pick(["About 4–5 minutes right now — I'll get yours in the queue straight away!", "Shouldn't be more than 5 minutes. We're moving quickly today!"]), newStage: stage, newMemory: mem }
  }

  // ── Global: spill ─────────────────────────────────────────────────────────
  if (has(t, ['spill', 'spilled', 'knocked over', 'dropped', 'accident'])) {
    return { reply: "Oh don't worry — accidents happen! Let me grab a cloth. And if the drink went with it I'll make you a fresh one, no charge.", newStage: stage, newMemory: mem }
  }

  // ── Global: wrong order ───────────────────────────────────────────────────
  if (has(t, ['wrong', 'mistake', 'not what i ordered', 'not mine', 'incorrect', 'this is wrong', 'wrong drink', 'wrong order'])) {
    return { reply: pick(["Oh, I'm so sorry — completely my fault! What should it have been? I'll remake it right away, no charge.", "I apologise! Tell me what you ordered and I'll fix it immediately."]), newStage: 98, newMemory: mem }
  }

  // ── Stage 98: re-order ────────────────────────────────────────────────────
  if (stage === 98) {
    const drinkWords = ['latte', 'cappuccino', 'flat white', 'americano', 'espresso', 'mocha', 'matcha', 'chai', 'tea', 'hot chocolate']
    const found = drinkWords.find(d => t.includes(d)) || 'drink'
    const size = has(t, ['large']) ? 'large' : has(t, ['small']) ? 'small' : 'medium'
    const iced = has(t, ['iced', 'cold', 'ice']) ? 'iced ' : ''
    return { reply: pick([`${iced}${size} ${found} — of course, I'm so sorry about the mix-up! Coming right up.`, `Got it — ${iced}${size} ${found}. On its way, no charge. Really sorry about that!`]), newStage: 10, newMemory: mem }
  }

  // ── Global: temperature complaint ────────────────────────────────────────
  if (has(t, ['too cold', 'not hot enough', 'lukewarm', 'cold coffee']) && stage >= 9) {
    return { reply: "I'm sorry about that! Let me heat it up or remake it completely — whichever you prefer. That shouldn't happen at all.", newStage: stage, newMemory: mem }
  }

  // ── Global: too sweet/strong ──────────────────────────────────────────────
  if (has(t, ['too sweet', 'too strong', 'too bitter', 'too weak', 'watery']) && stage >= 9) {
    return { reply: "I'm sorry! I'll remake it — just tell me what to adjust and I'll get it right.", newStage: stage, newMemory: mem }
  }

  // ── Global: compliment ────────────────────────────────────────────────────
  if (has(t, ['delicious', 'amazing', 'love it', 'so good', 'best coffee', 'wonderful']) && stage >= 9) {
    return { reply: pick(["Aw, that makes my day! Come back soon.", "That's so lovely to hear — thank you! Enjoy every sip."]), newStage: stage, newMemory: mem }
  }

  // ── Global: tip ───────────────────────────────────────────────────────────
  if (has(t, ['keep the change', 'tip', 'for you', 'for the team', 'gratuity'])) {
    return { reply: pick(["Oh, that's so kind — thank you! The team will really appreciate it.", "That's incredibly generous, thank you so much! Have a wonderful day!"]), newStage: stage, newMemory: mem }
  }

  // ── Global: recommendation ────────────────────────────────────────────────
  if (has(t, ['recommend', 'popular', 'best', 'what\'s good', 'specials', 'favourite', 'trending']) && stage <= 2) {
    return { reply: pick(["Our most popular right now is the oat milk flat white — silky and not too strong. If you want something sweet, the brown sugar oat latte is incredible!", "The caramel cortado is our hidden gem. For something cold, the iced matcha latte is flying out this week!"]), newStage: stage, newMemory: mem }
  }

  // ── Global: change of mind ────────────────────────────────────────────────
  if (has(t, ['actually', 'wait', 'change my mind', 'instead', 'no wait', 'can i change']) && stage >= 2 && stage <= 8) {
    return { reply: pick(["Of course — no problem! What would you like to change?", "Absolutely — what would you prefer instead?"]), newStage: Math.max(1, stage - 1), newMemory: mem }
  }

  // ════════════════════════
  // MAIN FLOW
  // ════════════════════════

  // ── Stage 0 & 1: Greeting ────────────────────────────────────────────────
  if (stage === 0 || stage === 1) {
    return {
      reply: pick(["Hi there, welcome to Bloom Café! What can I get started for you today?", "Hey! Good to see you. What are you in the mood for?", "Hello! Welcome in — what can I get you today?"]),
      newStage: 2,
      newMemory: mem,
    }
  }

  // ── Stage 2: Drink ───────────────────────────────────────────────────────
  if (stage === 2) {
    const drinkMap: Record<string, string> = {
      'flat white': 'flat white', 'cold brew': 'cold brew', 'hot chocolate': 'hot chocolate',
      'green tea': 'green tea', 'iced latte': 'latte', 'oat latte': 'latte',
      'iced coffee': 'iced coffee', 'matcha latte': 'matcha latte', 'chai latte': 'chai latte',
      cappuccino: 'cappuccino', americano: 'americano', espresso: 'espresso',
      mocha: 'mocha', macchiato: 'macchiato', cortado: 'cortado', latte: 'latte',
      chai: 'chai latte', matcha: 'matcha latte', chocolate: 'hot chocolate',
      tea: 'tea', coffee: 'latte', juice: 'juice', smoothie: 'smoothie', frappe: 'frappe',
    }
    let drink = ''
    const keys = Object.keys(drinkMap).sort((a, b) => b.length - a.length)
    for (const k of keys) { if (t.includes(k)) { drink = drinkMap[k]; break } }

    if (!drink) {
      if (has(t, ['strong', 'caffeine', 'wake me'])) return { reply: "Need a kick? I'd go for a double espresso, americano, or strong flat white. Which sounds right?", newStage: 2, newMemory: mem }
      if (has(t, ['sweet', 'indulge', 'dessert'])) return { reply: "Something sweet — our mocha, hot chocolate, or vanilla latte are all gorgeous. Or the caramel cortado?", newStage: 2, newMemory: mem }
      if (has(t, ['cold', 'iced', 'refresh'])) return { reply: "Something cold — we have iced latte, cold brew, iced matcha, or iced chai. What takes your fancy?", newStage: 2, newMemory: mem }
      if (has(t, ['just water', 'water please', 'tap water'])) { mem.drink = 'water'; return { reply: "Of course — tap water is on the house! Still or sparkling bottled water is also available.", newStage: 9, newMemory: mem } }
      return { reply: pick(["We have lattes, flat whites, americanos, espresso, cold brew, matcha, chai, teas... What sounds good?", "Can I tempt you with a flat white, oat latte, or maybe a chai latte?"]), newStage: 2, newMemory: mem }
    }

    mem.drink = drink
    if (drink === 'espresso') return { reply: pick(["A straight espresso — respect! Single or double?", "Espresso, going classic! Single or double shot?"]), newStage: 3, newMemory: mem }
    if (drink === 'tea') return { reply: pick(["Tea — lovely! We have English Breakfast, Earl Grey, green, chamomile, and peppermint. Which one?", "Great! English Breakfast, Earl Grey, green, chamomile, or peppermint?"]), newStage: 3, newMemory: mem }
    if (drink === 'cold brew') { mem.temp = 'iced'; return { reply: pick(["Cold brew — great taste! Black over ice, or with a splash of milk?", "Ooh, cold brew! Straight black, or with milk?"]), newStage: 4, newMemory: mem } }
    if (drink === 'hot chocolate') return { reply: pick(["Hot chocolate — such a treat! Small, medium, or large? We can add whipped cream too.", "Ooh, hot chocolate! Small, medium, or large?"]), newStage: 3, newMemory: mem }
    return { reply: pick([`A ${drink} — great! Small, medium, or large?`, `${cap(drink)} it is! Small, medium, or large?`, `Nice! Small, medium, or large for the ${drink}?`]), newStage: 3, newMemory: mem }
  }

  // ── Stage 3: Size / variant ──────────────────────────────────────────────
  if (stage === 3) {
    const drink = mem.drink || 'drink'
    if (drink === 'espresso') {
      mem.size = has(t, ['double', 'two', '2', 'doppio']) ? 'double' : 'single'
      return { reply: pick([`${cap(mem.size)} shot — perfect. Any sugar?`, `${mem.size === 'double' ? 'A double' : 'One shot'}, great. Sugar?`]), newStage: 9, newMemory: mem }
    }
    if (drink === 'tea') {
      if (has(t, ['earl'])) mem.teaType = 'Earl Grey'
      else if (has(t, ['chamomile'])) mem.teaType = 'chamomile'
      else if (has(t, ['peppermint', 'mint'])) mem.teaType = 'peppermint'
      else if (has(t, ['green'])) mem.teaType = 'green tea'
      else mem.teaType = 'English Breakfast'
      mem.size = 'medium'
      if (mem.teaType === 'chamomile' || mem.teaType === 'peppermint' || mem.teaType === 'green tea') {
        mem.milk = 'no milk'
        return { reply: `${mem.teaType} straight up — lovely! Hot or iced?`, newStage: 5, newMemory: mem }
      }
      return { reply: `${mem.teaType} — lovely! Milk, lemon, or just as it is?`, newStage: 4, newMemory: mem }
    }
    if (has(t, ['small', 'little', 'short'])) mem.size = 'small'
    else if (has(t, ['large', 'big', 'grande', 'venti'])) mem.size = 'large'
    else if (has(t, ['medium', 'standard', 'normal', 'regular'])) mem.size = 'medium'
    else return { reply: "Sorry — small, medium, or large?", newStage: 3, newMemory: mem }

    if (drink === 'hot chocolate') { mem.milk = 'whole milk'; mem.temp = 'hot'; return { reply: pick([`${cap(mem.size)} hot chocolate — gorgeous! Whipped cream on top?`, `A ${mem.size} hot chocolate! Whipped cream?`]), newStage: 6, newMemory: mem } }
    return { reply: pick([`${cap(mem.size)}, perfect! Milk — whole, oat, almond, or soy?`, `A ${mem.size} ${drink} — nice! Whole, oat, almond, or soy milk?`]), newStage: 4, newMemory: mem }
  }

  // ── Stage 4: Milk ────────────────────────────────────────────────────────
  if (stage === 4) {
    if (has(t, ['oat'])) mem.milk = 'oat milk'
    else if (has(t, ['almond'])) mem.milk = 'almond milk'
    else if (has(t, ['soy', 'soya'])) mem.milk = 'soy milk'
    else if (has(t, ['coconut'])) return { reply: "No coconut milk unfortunately! We have oat, almond, soy, and whole. Which?", newStage: 4, newMemory: mem }
    else if (has(t, ['no milk', 'without', 'black', 'none'])) mem.milk = 'no milk'
    else if (has(t, ['whole', 'full fat', 'regular', 'normal', 'standard'])) mem.milk = 'whole milk'
    else if (has(t, ['lemon'])) { mem.milk = 'lemon'; return { reply: "A slice of lemon — classic! Hot or iced?", newStage: 5, newMemory: mem } }
    else if (has(t, ['just as', 'as it is', 'plain'])) { mem.milk = 'no milk'; return { reply: "Just as it is — lovely! Hot or iced?", newStage: 5, newMemory: mem } }
    else return { reply: "Which milk — whole, oat, almond, or soy?", newStage: 4, newMemory: mem }

    const reactions: Record<string, string> = {
      'oat milk': pick(["Oat milk — our most popular! Hot or iced?", "Oat milk, great pick! Hot or iced?"]),
      'almond milk': pick(["Almond milk — lovely! Hot or iced?", "Almond milk, nice. Hot or over ice?"]),
      'soy milk': pick(["Soy milk — good choice! Hot or iced?", "Soy milk, sure! Hot or iced?"]),
      'no milk': pick(["Black — I respect that! Hot or iced?", "No milk, strong and clean! Hot or over ice?"]),
      'whole milk': pick(["Whole milk — classic and creamy! Hot or iced?", "Whole milk, perfect. Hot or iced?"]),
    }
    return { reply: reactions[mem.milk] || `${cap(mem.milk)}, lovely. Hot or iced?`, newStage: 5, newMemory: mem }
  }

  // ── Stage 5: Temp ────────────────────────────────────────────────────────
  if (stage === 5) {
    const wantsIced = has(t, ['iced', 'cold', 'ice', 'chilled', 'over ice'])
    const wantsHot  = has(t, ['hot', 'warm', 'heated', 'normal', 'regular'])
    if (!wantsIced && !wantsHot) return { reply: "Hot or iced?", newStage: 5, newMemory: mem }
    mem.temp = wantsIced ? 'iced' : 'hot'
    return {
      reply: pick(wantsIced
        ? ["Iced — perfect! Anything to add? A syrup, pastry, or whipped cream?", "Iced, refreshing! Any extras — syrup, a snack, or extra shot?"]
        : ["Hot, lovely! Can I add anything? A pastry, syrup, or whipped cream?", "Perfect, hot! Anything extra — a muffin, croissant, or syrup?"]),
      newStage: 6,
      newMemory: mem,
    }
  }

  // ── Stage 6: Extras — handles multiple items in one answer ───────────────
  if (stage === 6) {
    const extras: string[] = []

    // Syrups — all checked independently (not else-if) so "vanilla syrup and a croissant" works
    if (has(t, ['brown sugar']))                                                  extras.push('brown sugar syrup')
    else if (has(t, ['lavender']))                                                extras.push('lavender syrup')
    else if (has(t, ['hazelnut syrup', 'hazelnut']))                             extras.push('hazelnut syrup')
    else if (has(t, ['caramel syrup', 'caramel']))                               extras.push('caramel syrup')
    else if (has(t, ['vanilla syrup', 'vanilla']))                               extras.push('vanilla syrup')
    else if (has(t, ['syrup']) && !has(t, ['no syrup', 'without syrup'])) {
      return { reply: "We have vanilla, caramel, hazelnut, lavender, and brown sugar syrups. Which one?", newStage: 6, newMemory: mem }
    }

    // Food — all checked independently so multiple items in one sentence all register
    if (has(t, ['croissant']))                                                    extras.push('croissant')
    if (has(t, ['blueberry muffin']))                                             extras.push('blueberry muffin')
    else if (has(t, ['chocolate muffin', 'choc muffin']))                        extras.push('chocolate muffin')
    else if (has(t, ['muffin']))                                                  extras.push('muffin')
    if (has(t, ['banana bread']))                                                 extras.push('banana bread')
    if (has(t, ['brownie']))                                                      extras.push('brownie')
    if (has(t, ['cookie', 'biscuit']))                                            extras.push('cookie')
    if (has(t, ['scone']))                                                        extras.push('scone')
    if (has(t, ['whipped cream', 'whipped', 'cream on top', 'cream please']))    extras.push('whipped cream')
    if (has(t, ['extra shot', 'double shot', 'another shot', 'stronger']))       { extras.push('extra shot'); mem.extraShot = 'yes' }

    // Location jump-ahead
    const toGoWords = ['to go', 'takeout', 'take out', 'takeaway', 'take away', 'away', 'leaving']
    const hereWords = ['here', 'sit', 'window', 'table', 'stay', 'dine', 'inside', 'corner']
    const isToGo = has(t, toGoWords)
    const isHere = has(t, hereWords)

    if (isToGo || isHere) {
      mem.extra = extras.join(', ') || 'none'
      mem.location = (isToGo && !isHere) ? 'to go' : 'for here'
      const atWindow = t.includes('window') || t.includes('by the')
      if (extras.length > 0) {
        const extrasStr = extras.join(' and ')
        return {
          reply: isHere
            ? (atWindow ? `${extrasStr} — lovely, and great window spot! What name for the order?` : `${extrasStr} — perfect! Name for the order?`)
            : `${extrasStr} — sure thing! Name for the cup?`,
          newStage: 8,
          newMemory: mem,
        }
      }
      return {
        reply: isHere
          ? (atWindow ? "Window seat — perfect! Name for the order?" : pick(["Staying in — great! Name for the order?", "Perfect! Any table you like. Name?"]))
          : pick(["To go — I'll pop a lid on that! Name for the cup?", "Taking it away! Name for the cup?"]),
        newStage: 8,
        newMemory: mem,
      }
    }

    if (extras.length > 1) {
      // Multiple extras detected — confirm them all
      const extrasStr = extras.join(' and ')
      mem.extra = extras.join(', ')
      return {
        reply: pick([
          `${cap(extrasStr)} — great combo! For here or to go?`,
          `${cap(extrasStr)}, love it! Will you be staying in or taking away?`,
          `Perfect, ${extrasStr} it is! For here or to go?`,
        ]),
        newStage: 7,
        newMemory: mem,
      }
    }

    if (extras.length === 1) {
      mem.extra = extras[0]
      const reactions: Record<string, string> = {
        'vanilla syrup': "Vanilla syrup — so good! For here or to go?",
        'caramel syrup': "Caramel — gorgeous! For here or to go?",
        'hazelnut syrup': "Hazelnut — great combo! For here or to go?",
        'lavender syrup': "Lavender syrup — such a lovely flavour! For here or to go?",
        'brown sugar syrup': "Brown sugar — yes, so good! For here or to go?",
        'croissant': "A croissant — perfect pairing! For here or to go?",
        'muffin': "A muffin — great choice! For here or to go?",
        'blueberry muffin': "Blueberry muffin — lovely! For here or to go?",
        'chocolate muffin': "Chocolate muffin — treat yourself! For here or to go?",
        'banana bread': "Banana bread — one of our best sellers! For here or to go?",
        'brownie': "A brownie — indulgent choice! For here or to go?",
        'cookie': "A cookie — great call! For here or to go?",
        'scone': "A scone — very traditional! For here or to go?",
        'whipped cream': "Whipped cream on top — absolutely! For here or to go?",
        'extra shot': "Extra shot — love the dedication! For here or to go?",
      }
      return { reply: reactions[extras[0]] || "Great! For here or to go?", newStage: 7, newMemory: mem }
    }

    // Nothing / negative
    if (has(t, ['no', 'nothing', 'just the drink', "that's all", "that's it", 'nope', 'no thanks'])) {
      mem.extra = 'none'
      return { reply: pick(["No problem! For here or to go?", "Sure! Staying in or taking away?", "Of course — for here or to go?"]), newStage: 7, newMemory: mem }
    }

    return { reply: pick(["Anything to add, or shall I go ahead? For here or to go?", "Did you want to add anything, or all good? For here or to go?"]), newStage: 6, newMemory: mem }
  }

  // ── Stage 7: Here or to go ───────────────────────────────────────────────
  if (stage === 7) {
    const toGoWords = ['to go', 'takeout', 'take out', 'takeaway', 'take away', 'take it away', 'away', 'outside', 'leaving', 'grab and go', 'on the go']
    const hereWords = ['here', 'stay', 'sit', 'dine', 'inside', 'table', 'window', 'seat', 'staying', 'eat in', 'corner', 'sofa', 'work here', 'hang out']
    const isToGo = has(t, toGoWords)
    const isHere = has(t, hereWords)
    const atWindow = t.includes('window') || t.includes('by the') || t.includes('near the')
    const withSomeone = has(t, ['friend', 'colleague', 'partner', 'meeting someone'])
    const wantsWork = has(t, ['work', 'laptop', 'study', 'studying'])

    if (!isToGo && !isHere) return { reply: pick(["For here or to go?", "Staying in or taking it away?", "Having it here, or to take away?"]), newStage: 7, newMemory: mem }

    mem.location = (isToGo && !isHere) ? 'to go' : 'for here'

    if (mem.location === 'for here') {
      if (atWindow) return { reply: pick(["The window seats are so lovely — great choice! Name for the order?", "Window seat — perfect! What name?"]), newStage: 8, newMemory: mem }
      if (wantsWork) return { reply: "Perfect for working — the wall tables have sockets! Name for the order?", newStage: 8, newMemory: mem }
      if (withSomeone) return { reply: "Lovely, company! Find a table for two. Name for the order?", newStage: 8, newMemory: mem }
      return { reply: pick(["Great — make yourself at home! Name for the order?", "Wonderful! Any table you like. Name so I can call you?"]), newStage: 8, newMemory: mem }
    }
    return { reply: pick(["To go — I'll pop a lid on that! Name for the cup?", "Sure, taking it away! What name for the cup?"]), newStage: 8, newMemory: mem }
  }

  // ── Stage 8: Name ────────────────────────────────────────────────────────
  if (stage === 8) {
    const words = text.trim().split(/[\s,!.]+/).filter(w =>
      w.length > 1 && !['my', 'name', 'is', 'it', 'call', 'me', 'i', 'am', 'the', 'just', 'hi'].includes(w.toLowerCase())
    )
    const name = words[0] ? cap(words[0]) : 'there'
    mem.name = name

    const drink = mem.drink || 'drink'
    const size  = mem.size || 'medium'
    const milk  = mem.milk && mem.milk !== 'none' ? mem.milk : null
    const extra = mem.extra && mem.extra !== 'none' ? mem.extra : null
    const extraShot = mem.extraShot === 'yes' ? ' + extra shot' : ''
    const temp  = mem.temp === 'iced' ? 'iced ' : ''

    const prices: Record<string, number> = {
      espresso: 2.5, americano: 3.0, 'flat white': 3.8, latte: 4.2, cappuccino: 4.0,
      mocha: 4.5, macchiato: 3.5, cortado: 3.5, 'chai latte': 4.0, 'matcha latte': 4.5,
      'hot chocolate': 4.0, 'cold brew': 4.0, 'iced coffee': 4.0, frappe: 4.5,
      juice: 3.5, smoothie: 4.5, tea: 3.0, 'green tea': 3.0,
    }
    const base     = prices[drink] || 4.0
    const sizeAdd  = size === 'large' ? 0.5 : size === 'small' ? -0.3 : 0
    const milkAdd  = (milk === 'oat milk' || milk === 'almond milk' || milk === 'soy milk') ? 0.5 : 0
    // Multiple extras — count commas
    const extraCount = extra ? extra.split(',').length : 0
    const extraAdd  = extraCount * 0.8
    const shotAdd   = mem.extraShot === 'yes' ? 0.7 : 0
    const total     = (base + sizeAdd + milkAdd + extraAdd + shotAdd).toFixed(2)
    mem.total = total

    const milkStr  = milk && milk !== 'no milk' ? ` with ${milk}` : milk === 'no milk' ? ' black' : ''
    const extraStr = extra ? `, ${extra}` : ''
    const summary  = `${temp}${size} ${drink}${milkStr}${extraStr}${extraShot}`

    return {
      reply: pick([
        `Perfect, ${name}! So that's a ${summary} — $${total}. Card or cash?`,
        `Got it, ${name}! ${cap(summary)}. Your total is $${total}. Card or cash today?`,
        `Thanks, ${name}! To confirm: ${summary} — $${total}. How would you like to pay?`,
      ]),
      newStage: 9,
      newMemory: mem,
    }
  }

  // ── Stage 9: Payment ─────────────────────────────────────────────────────
  if (stage === 9) {
    const byCard = has(t, ['card', 'credit', 'debit', 'tap', 'contactless', 'apple pay',
      'google pay', 'phone', 'watch', 'chip', 'pin', 'swipe'])
    const byCash = has(t, [
      'cash', 'note', 'coin', 'bill', 'money', 'change',
      'dollar', 'dollars', 'buck', 'bucks', 'pound', 'pounds', 'euro', 'euros',
      'five', 'ten', 'twenty', 'fifty', 'hundred',
      '$5', '$10', '$20', '£5', '£10', '€5', '€10',
      "here's", "here is", "here you go", "here, take", 'i have', 'i got', 'i have cash',
      'paying with cash', 'pay with cash', 'pay cash', 'in cash',
      'giving you', 'i give you', 'take this',
      'keep the change', 'keep it', "don't need change", 'no change needed', 'tip',
    ])
    const keepChange = has(t, [
      'keep the change', 'keep it', "don't need change", 'for you', 'tip',
      'no change', "don't worry about the change", 'leave it', 'yours',
    ])
    const cantPay = has(t, ["don't have", 'no money', 'no cash', 'no card', 'forgot my wallet', 'left my wallet'])
    const byApp   = has(t, ['revolut', 'paypal', 'klarna', 'venmo'])

    if (cantPay) return { reply: "Oh no — I can't process without payment unfortunately. Is there someone who could help, or would you like to come back later?", newStage: 9, newMemory: mem }
    if (byApp)   return { reply: "We only take card or cash, I'm afraid! Which one?", newStage: 9, newMemory: mem }

    if (byCash) {
      if (keepChange) {
        return {
          reply: pick([
            "That's so kind — thank you! I really appreciate it. Your order is coming right up, won't be a minute!",
            "Aw, thank you so much! That's really generous. I'll get that ready for you straight away!",
            "Oh, that's very sweet of you — thank you! I'll shout you when it's ready.",
          ]),
          newStage: 10,
          newMemory: mem,
        }
      }
      return {
        reply: pick([
          `Cash — perfect! That's $${mem.total || '4.00'} please. I'll get your change right away.`,
          `Of course! $${mem.total || '4.00'} whenever you're ready.`,
          `Great, cash! $${mem.total || '4.00'} please — I'll sort your change now.`,
        ]),
        newStage: 10,
        newMemory: mem,
      }
    }

    if (byCard) {
      return {
        reply: pick([
          `Card — perfect! Just tap whenever you're ready. I'll call ${mem.name || 'you'} when it's up!`,
          "Go ahead and tap or insert. Won't be long at all!",
          "Lovely! Tap or chip — either works. Starting your order now!",
        ]),
        newStage: 10,
        newMemory: mem,
      }
    }

    // Truly ambiguous — but be more charitable this time
    // If they said something like "here" or "sure" assume they're handing over cash
    if (has(t, ['here', 'sure', 'yes', 'yeah', 'ok', 'okay', 'of course', 'go ahead'])) {
      return {
        reply: pick([
          `Cash — thank you! That's $${mem.total || '4.00'}. Change coming right up.`,
          `Got it — $${mem.total || '4.00'} please. I'll sort your change now.`,
        ]),
        newStage: 10,
        newMemory: mem,
      }
    }

    return { reply: "Card or cash? We take both!", newStage: 9, newMemory: mem }
  }

  // ── Stage 10: Done ───────────────────────────────────────────────────────
  return {
    reply: pick([
      `All sorted! I'll call ${mem.name || 'you'} when it's ready — just a few minutes!`,
      `You're all set! ${mem.name ? `I'll shout ${mem.name} when it's up.` : 'Enjoy your time here!'}`,
      "Perfect! Have a seat and I'll bring it over. Thanks so much!",
      "All done! It'll be right up. Have a wonderful day!",
    ]),
    newStage: 11,
    newMemory: mem,
  }
}


// ══════════════════════════════════════════════════════════════════
// AIRPORT — Daniel
// ══════════════════════════════════════════════════════════════════

function getAirportReply(
  text: string,
  stage: number,
  memory: Record<string, string>
): { reply: string; newStage: number; newMemory: Record<string, string> } {
  const t = text.toLowerCase()
  const mem = { ...memory }

  // ── Global crisis ─────────────────────────────────────────────────────────
  if (has(t, ['medical', 'emergency', 'ambulance', 'doctor', 'hurt', 'chest pain', 'fainted'])) {
    return { reply: "Your health comes first — I'm calling for assistance right now! First aid is on Level 1. Can you tell me what's happening?", newStage: stage, newMemory: mem }
  }
  if (has(t, ['lost passport', "can't find passport", 'forgot passport', 'passport missing', 'left passport'])) {
    return { reply: "Oh dear — without a valid passport I can't check you in for an international flight. Please go to Passenger Services at Counter 12 immediately. They handle exactly this situation.", newStage: stage, newMemory: mem }
  }
  if (has(t, ['missed my flight', 'flight already left', 'too late', 'already departed'])) {
    return { reply: "I'm so sorry — please go to our Rebooking Desk at the end of this hall straight away. They deal with this every day and will get you on the next available flight. Do you have travel insurance?", newStage: stage, newMemory: mem }
  }
  if (has(t, ['stolen', 'theft', 'pickpocket', 'robbed', 'missing bag', 'someone took'])) {
    return { reply: "I'm so sorry! Please report it immediately to Airport Security on Level 0. For theft, the airport police are right next to security on this level. Don't leave the terminal before reporting.", newStage: stage, newMemory: mem }
  }

  // ── Global info ───────────────────────────────────────────────────────────
  if (has(t, ['visa', 'entry requirement', 'do i need a visa'])) {
    return { reply: `Visa requirements depend on your passport nationality. I'd recommend checking your government's travel advisory or the airline's entry requirements. Our information desk on Level 2 can help in detail.`, newStage: stage, newMemory: mem }
  }
  if (has(t, ['upgrade', 'business class', 'first class', 'premium'])) {
    return { reply: "Upgrades are possible! Best to ask at the gate — they sometimes offer last-minute upgrades. I can flag your interest on the system now. Shall I?", newStage: stage, newMemory: mem }
  }
  if (has(t, ['currency', 'exchange', 'atm', 'cash machine'])) {
    return { reply: "Currency exchange is on Level 2 after security. ATMs are near the food court on this level and also just past the security gates.", newStage: stage, newMemory: mem }
  }
  if (has(t, ['pharmacy', 'chemist', 'medicine', 'tablets', 'painkiller'])) {
    return { reply: "There's a pharmacy on Level 1 near the departure gates — they stock travel essentials and medications, and can advise on what you can take through security.", newStage: stage, newMemory: mem }
  }
  if (has(t, ['wifi', 'wi-fi', 'internet', 'password', 'connect'])) {
    return { reply: "Free WiFi throughout the terminal — connect to 'AirportFreeWiFi', open your browser and accept the terms. No password needed.", newStage: stage, newMemory: mem }
  }
  if (has(t, ['lounge', 'vip lounge', 'executive lounge', 'priority pass']) && stage >= 10) {
    return { reply: `The lounge is on Level 2 past security — gold signs. Entry requires a lounge pass, Priority Pass, or eligible card. Hot food, showers, free drinks — great for longer waits!`, newStage: stage, newMemory: mem }
  }
  if (has(t, ['hungry', 'food', 'eat', 'restaurant', 'coffee shop', 'grab a coffee']) && stage >= 10) {
    return { reply: "After security there's a Costa and Pret right at the entrance, then a full food court on Level 2. There's also a great bar near the gates for a pre-flight drink!", newStage: stage, newMemory: mem }
  }
  if (has(t, ['delay', 'delayed', 'on time', 'running late', 'flight status']) && stage >= 9) {
    return { reply: pick([`Your flight to ${mem.destination || 'your destination'} is showing on time. Always worth double-checking the departure boards after security though!`, "Nothing showing on my system — looks on time! The departure screens airside are the most up-to-date."]), newStage: stage, newMemory: mem }
  }
  if (has(t, ['duty free', 'shopping', 'shop', 'perfume', 'alcohol']) && stage >= 10) {
    return { reply: "The duty-free area is right past security on Level 2 — tax-free prices on perfume, alcohol, confectionery, and electronics. Check your destination's customs allowances for alcohol and tobacco!", newStage: stage, newMemory: mem }
  }

  // ════════════════════════
  // MAIN FLOW
  // ════════════════════════

  // ── Stage 0 & 1: Greeting ────────────────────────────────────────────────
  if (stage === 0 || stage === 1) {
    return {
      reply: pick(["Good morning! Welcome to check-in. Where are you flying to today?", "Hello, welcome! Ready to get you checked in — where are you heading?", "Good day! Which destination are you flying to today?"]),
      newStage: 2,
      newMemory: mem,
    }
  }

  // ── Stage 2: Destination ─────────────────────────────────────────────────
  if (stage === 2) {
    const cities: Record<string, string> = {
      london: 'London', paris: 'Paris', dubai: 'Dubai', 'new york': 'New York',
      'los angeles': 'Los Angeles', chicago: 'Chicago', miami: 'Miami',
      tokyo: 'Tokyo', seoul: 'Seoul', osaka: 'Osaka', berlin: 'Berlin',
      rome: 'Rome', madrid: 'Madrid', lisbon: 'Lisbon', amsterdam: 'Amsterdam',
      barcelona: 'Barcelona', athens: 'Athens', prague: 'Prague', vienna: 'Vienna',
      budapest: 'Budapest', warsaw: 'Warsaw', zurich: 'Zurich', geneva: 'Geneva',
      stockholm: 'Stockholm', copenhagen: 'Copenhagen', oslo: 'Oslo', helsinki: 'Helsinki',
      dublin: 'Dublin', edinburgh: 'Edinburgh', manchester: 'Manchester',
      bangkok: 'Bangkok', bali: 'Bali', singapore: 'Singapore', sydney: 'Sydney',
      melbourne: 'Melbourne', toronto: 'Toronto', istanbul: 'Istanbul', milan: 'Milan',
      cairo: 'Cairo', nairobi: 'Nairobi', 'cape town': 'Cape Town', delhi: 'Delhi',
      mumbai: 'Mumbai', beijing: 'Beijing', shanghai: 'Shanghai', moscow: 'Moscow',
      reykjavik: 'Reykjavik', marrakech: 'Marrakech', tenerife: 'Tenerife',
      mallorca: 'Mallorca', ibiza: 'Ibiza', santorini: 'Santorini', cancun: 'Cancun',
    }
    let dest = ''
    const sortedKeys = Object.keys(cities).sort((a, b) => b.length - a.length)
    for (const kw of sortedKeys) { if (t.includes(kw)) { dest = cities[kw]; break } }

    if (!dest) {
      if (has(t, ['transit', 'connecting', 'layover', 'transfer'])) return { reply: "A connecting flight — sure! What's your final destination city?", newStage: 2, newMemory: mem }
      if (has(t, ['fly', 'flying', 'going', 'heading', 'travel', 'holiday'])) return { reply: "Could you say the city name clearly for me?", newStage: 2, newMemory: mem }
      return { reply: pick(["I didn't quite catch that — which city are you flying to?", "Could you say the destination for me? Just the city name is fine."]), newStage: 2, newMemory: mem }
    }

    mem.destination = dest
    const remarks: Record<string, string> = {
      Paris: "Paris — love it!", Tokyo: "Tokyo — amazing!", Bali: "Bali — gorgeous!",
      Dubai: "Dubai — exciting!", Santorini: "Santorini — stunning!", Reykjavik: "Reykjavik — incredible, especially for the Northern Lights!",
    }
    const remark = remarks[dest] ? ` ${remarks[dest]}` : ''
    return { reply: pick([`${dest}!${remark} May I see your passport or photo ID, please?`, `Flying to ${dest}.${remark} I'll need your passport to check you in.`]), newStage: 3, newMemory: mem }
  }

  // ── Stage 3: Passport ────────────────────────────────────────────────────
  if (stage === 3) {
    const noPassport = has(t, ["don't have", 'forgot', 'lost', 'left it', "can't find", 'at home', 'no passport'])
    const hasPassport = has(t, ['passport', 'here', 'yes', 'sure', 'of course', 'id', 'have it', 'got it', 'here it is', 'here you go', 'this is it'])
    if (has(t, ['expired', 'out of date', 'old passport'])) return { reply: "An expired passport unfortunately can't be accepted for international travel. Please speak to Passenger Services at Counter 12 — they deal with document issues every day.", newStage: 3, newMemory: mem }
    if (noPassport) return { reply: "Without a valid passport I can't check you in for an international flight. Please speak to Passenger Services at Counter 12 right away.", newStage: 3, newMemory: mem }
    if (!hasPassport) return { reply: "I'll need your passport to proceed — do you have it with you?", newStage: 3, newMemory: mem }
    return { reply: pick(["Thank you! Do you have your booking reference or e-ticket? It's usually 6 characters in your confirmation email.", "Perfect, thank you. Could I have your booking confirmation number? It should be in your airline email."]), newStage: 4, newMemory: mem }
  }

  // ── Stage 4: Booking reference ───────────────────────────────────────────
  if (stage === 4) {
    const noRef = has(t, ["don't have", 'forgot', "can't find", 'no reference', 'deleted', 'no email', 'phone died', 'no battery', 'phone is dead'])
    if (has(t, ['phone died', 'no battery', 'phone is dead', 'dead phone'])) return { reply: "No problem — I can pull up your booking with your passport details. There's also a charging station around the corner! Give me a moment... Got it. Are you checking any bags today?", newStage: 5, newMemory: { ...mem, bookingRef: 'found' } }
    if (noRef) return { reply: pick(["No worries — found your booking on the system! Are you checking any bags today?", "That's fine — pulled it up with your passport. Any luggage to check in?"]), newStage: 5, newMemory: { ...mem, bookingRef: 'found' } }
    mem.bookingRef = 'provided'
    return { reply: pick(["Got it — your booking is right here. Are you checking any bags today, or just carry-on?", "Perfect! All confirmed. Any bags to check in, or travelling with hand luggage only?"]), newStage: 5, newMemory: mem }
  }

  // ── Stage 5: Bags ────────────────────────────────────────────────────────
  if (stage === 5) {
    const noBags = has(t, ['no bags', 'no luggage', 'carry on only', 'hand luggage only', 'just hand', 'only carry', 'travelling light', 'nothing to check', 'no checked'])
    const hasBags = has(t, ['one bag', 'two bags', 'three bags', '1 bag', '2 bags', '3 bags', 'bag', 'bags', 'suitcase', 'luggage', 'checking', 'hold bag'])
    const isNo  = has(t, ['no', 'none', 'nothing']) && !hasBags
    const isYes = has(t, ['yes', 'yeah', 'yep']) && !noBags

    if ((noBags || isNo) && !hasBags) {
      mem.bags = '0'
      return { reply: pick(["Travelling light — great! Carry-on must fit overhead, max 10kg. Any seat preference — window or aisle?", "Hand luggage only — easy! Remember liquids under 100ml. Window or aisle seat?"]), newStage: 7, newMemory: mem }
    }
    if (!hasBags && !isYes) return { reply: "Are you checking any bags today? Yes or no is fine!", newStage: 5, newMemory: mem }

    const count = (t.includes('two') || t.includes('2') || t.includes('both')) ? 'two bags' : (t.includes('three') || t.includes('3')) ? 'three bags' : 'one bag'
    mem.bags = count
    return { reply: pick([`${cap(count)} — noted. On the scale please. Anything fragile, liquid, or with lithium batteries in there?`, `${cap(count)}, understood. Onto the belt please! Fragile items or lithium batteries in the luggage?`]), newStage: 6, newMemory: mem }
  }

  // ── Stage 6: Bag contents / weight — FIXED: handles laptop/electronics ────
  if (stage === 6) {
    // Lithium batteries / power banks — must go in carry-on
    if (has(t, ['power bank', 'powerbank', 'lithium battery', 'lithium batteries', 'e-cigarette', 'vape', 'e-cig'])) {
      return { reply: "Important — lithium batteries and power banks must go in your carry-on, not checked luggage. Fire safety rules. Please remove them before we tag the bag. Is the bag within 23kg otherwise?", newStage: 6, newMemory: mem }
    }

    // Laptop / electronics being switched on — common security question
    if (has(t, ['laptop', 'laptop in bag', 'laptop in my bag', 'computer', 'tablet', 'ipad', 'macbook', 'surface'])) {
      const wantsToKeep = has(t, ['keep', 'stay', 'leave in', 'in my bag', 'inside', 'packed', 'with luggage', 'in the suitcase', 'checking it'])
      if (wantsToKeep) {
        return {
          reply: pick([
            "I'd recommend keeping your laptop in your carry-on rather than the hold — it's safer there and you avoid any liability issues if it's damaged. In the hold, we aren't liable for electronics. Would you like to move it to carry-on?",
            "Laptops are usually better off in your carry-on for safety. If it stays in the hold, the airline isn't liable for damage. That said, it is allowed — just your call!",
          ]),
          newStage: 6,
          newMemory: mem,
        }
      }
      // Carry-on electronics info (security)
      return {
        reply: pick([
          "At security, laptops and tablets need to come out of your bag and go in a separate tray — it speeds things up. They're completely fine to bring on board and you can use them in flight too!",
          "Security tip: take your laptop out of its bag and put it in a separate tray at the scanner. You can use it on board after takeoff once the crew give the go-ahead.",
          "Laptops and large electronics go in their own tray at security — out of the case, screen down. Perfectly fine on board. Most airlines ask you to switch to flight mode rather than turn it off entirely.",
        ]),
        newStage: 6,
        newMemory: mem,
      }
    }

    // Switch on / turn on electronics at security
    if (has(t, ['switch on', 'turn on', 'power on', 'switch it on', 'turn it on', 'they ask me to turn on', 'ask me to switch', 'check if it works', 'prove it works', 'demonstrate', 'show it works'])) {
      return {
        reply: pick([
          "Yes — security may ask you to turn on your laptop or tablet to prove it works. Just make sure it's charged before you fly. A device that won't power on may not be allowed through.",
          "Good point! They can ask you to switch it on, so keep it charged. If a device doesn't turn on at security they may not let it through. Have it charged to at least 20% to be safe.",
          "That's a real thing — they might ask you to demonstrate it powers up, especially for laptops. It's a security check to confirm it's a genuine device. Fully charged before the airport is always smart.",
        ]),
        newStage: 6,
        newMemory: mem,
      }
    }

    if (has(t, ['fragile', 'glass', 'ceramic', 'instrument', 'guitar', 'camera', 'artwork', 'delicate'])) {
      mem.fragile = 'yes'
      return { reply: "I'll put a fragile sticker on it — handlers will take extra care. Still recommend wrapping delicate items in clothing. Is the bag within 23kg?", newStage: 6, newMemory: mem }
    }
    if (has(t, ['valuable', 'jewellery', 'jewelry', 'cash', 'important documents'])) {
      return { reply: "Keep valuables in your carry-on — jewellery, cash, important documents. The airline's liability for lost or damaged items in hold luggage is limited. Is the bag within 23kg?", newStage: 6, newMemory: mem }
    }
    if (has(t, ['overweight', 'over the limit', 'over 23', 'too heavy', 'heavy bag', 'excess weight'])) {
      return { reply: pick(["The bag is over the 23kg limit — there's an excess fee of $50. You can remove some items to bring it under, or I add the fee to your booking. What would you prefer?", "Over 23kg — options are: remove items, or pay a $50 excess fee. Which would you like to do?"]), newStage: 6, newMemory: mem }
    }
    if (has(t, ['pay the fee', 'add the fee', 'charge me', 'ok to pay', 'i will pay'])) {
      return { reply: "Done — excess fee added. All sorted on the luggage side! Do you have a seat preference — window or aisle?", newStage: 7, newMemory: mem }
    }
    if (has(t, ['remove', 'take out', 'transfer', 'move things', 'take items out'])) {
      return { reply: "Take a moment to shift some things to your carry-on. Let me know when the bag is ready to recheck!", newStage: 6, newMemory: mem }
    }

    // Nothing notable / no / fine
    return { reply: pick(["Perfect — all within the weight limit! Do you have a seat preference — window or aisle?", "All good, no issues! Window, aisle, or no preference for your seat?"]), newStage: 7, newMemory: mem }
  }

  // ── Stage 7: Seat preference ─────────────────────────────────────────────
  if (stage === 7) {
    const wantsWindow = has(t, ['window', 'view', 'outside', 'scenery', 'by the window'])
    const wantsAisle  = has(t, ['aisle', 'stretch', 'leg room', 'legroom', 'bathroom', 'toilet', 'get up', 'walk around', 'quick exit'])
    const wantsExit   = has(t, ['exit row', 'emergency exit', 'extra legroom', 'extra leg room'])
    const noPreference= has(t, ['no preference', 'any', 'either', "don't mind", 'whatever', "doesn't matter", 'anywhere'])
    const withChild   = has(t, ['next to my child', 'sit together', 'family seat', 'together'])

    if (!wantsWindow && !wantsAisle && !wantsExit && !noPreference && t.trim().length < 5) return { reply: "Sorry — window, aisle, or no preference?", newStage: 7, newMemory: mem }
    if (withChild) return { reply: "Of course — I'll seat you together. Window or aisle side for you?", newStage: 8, newMemory: mem }
    if (wantsExit) { mem.seat = 'exit row'; return { reply: "Exit row — extra legroom! Passengers must be able to assist in an emergency and be 15+. Is that okay? Any special requirements today?", newStage: 8, newMemory: mem } }

    mem.seat = wantsWindow ? 'window' : wantsAisle ? 'aisle' : 'no preference'
    const remark = {
      window: pick(["Window seat — great for the views and perfect for sleeping!", "Window! Great choice — something to lean against."]),
      aisle: pick(["Aisle — smart, loads of space and easy to get up!", "Aisle seat — practical choice!"]),
      'no preference': pick(["No preference — I'll find you a nice spot.", "Sure, I'll assign you somewhere comfortable."]),
    }
    return { reply: `${remark[mem.seat as keyof typeof remark]} Any special requirements — medical, mobility, or travelling with children?`, newStage: 8, newMemory: mem }
  }

  // ── Stage 8: Special requirements ────────────────────────────────────────
  if (stage === 8) {
    if (has(t, ['wheelchair', "can't walk", 'limited mobility', 'disabled', 'crutch', 'walking stick', 'assisted boarding'])) { mem.special = 'wheelchair'; return { reply: "Wheelchair assistance flagged on your booking. Someone will meet you at security and accompany you to the gate. Do you need a wheelchair from here, or just at the gate?", newStage: 9, newMemory: mem } }
    if (has(t, ['infant', 'baby', 'newborn', 'toddler', 'pram', 'stroller', 'pushchair'])) { mem.special = 'infant'; return { reply: "Travelling with a baby — lovely! You board first. Your pram goes to the gate and will be at the jetbridge on arrival. Do you have a car seat to check in?", newStage: 9, newMemory: mem } }
    if (has(t, ['pregnant', 'expecting', 'pregnancy'])) { mem.special = 'pregnant'; return { reply: "Of course — travel is generally fine up to 36 weeks. Over 28 weeks you'll likely need a doctor's letter. Do you have one? I'll seat you with easy aisle access.", newStage: 9, newMemory: mem } }
    if (has(t, ['anxiety', 'nervous', 'scared of flying', 'fear of flying'])) { return { reply: "That's very understandable! A seat over the wing is most stable, and front seats feel calmer. Some airlines have a flight tracker in their app that nervous flyers find reassuring. Would a front seat help?", newStage: 9, newMemory: mem } }
    if (has(t, ['no', 'none', 'nothing', "i'm fine", 'all good', 'no requirements', 'not really'])) {
      mem.special = 'none'
      return { reply: pick(["Perfect! Just a couple of quick security reminders and then your gate details.", "All good! Let me go over security quickly and then I'll give you your boarding info."]), newStage: 9, newMemory: mem }
    }
    return { reply: "Any special requirements — wheelchair, medical, children, or infant? Or just say no if not!", newStage: 8, newMemory: mem }
  }

  // ── Stage 9: Security tips ───────────────────────────────────────────────
  if (stage === 9) {
    if (has(t, ['yes', 'ok', 'okay', 'understood', 'got it', 'sure', 'ready', 'no questions', 'all clear', 'makes sense', 'thanks'])) {
      return giveGateInfo(mem)
    }
    if (has(t, ['liquid', 'water', 'bottle', 'perfume', '100ml', '100 ml'])) {
      return { reply: "Liquids in carry-on must be under 100ml each, in a clear resealable bag. You can buy drinks airside — those are fine on board. Any other questions?", newStage: 9, newMemory: mem }
    }
    if (has(t, ['laptop', 'tablet', 'electronics', 'ipad', 'macbook', 'computer', 'turn on', 'switch on', 'power on'])) {
      return { reply: "Laptops and tablets come out of your bag into a separate tray at security. They may ask you to turn it on, so keep it charged. Perfectly fine on board — most flights allow use after takeoff.", newStage: 9, newMemory: mem }
    }
    if (has(t, ['food', 'snack', 'sandwich', 'fruit'])) {
      return { reply: "Food is generally fine in your carry-on. Some countries restrict fresh produce on arrival — check the rules for your destination. Any other questions?", newStage: 9, newMemory: mem }
    }
    return {
      reply: pick([
        "Quick security notes: all liquids under 100ml in a clear bag, laptops in a separate tray, remove belt and jacket at the scanner. Keep your boarding pass accessible. Any questions on that?",
        "Security reminders: clear bag for liquids under 100ml, electronics out of bags into a separate tray — they may ask you to turn them on so keep them charged. Arrive at the gate 20 minutes before boarding. All clear?",
      ]),
      newStage: 10,
      newMemory: mem,
    }
  }

  // ── Stage 10: Gate info ──────────────────────────────────────────────────
  if (stage === 10) {
    return giveGateInfo(mem)
  }

  // ── Stage 11: Post check-in Q&A ──────────────────────────────────────────
  if (stage === 11) {
    if (has(t, ['where is gate', 'how do i get to gate', 'find my gate', 'which terminal', 'directions'])) {
      return { reply: `Gate ${mem.gate || 'is on your boarding pass'} is in Terminal ${mem.gate?.[0] || ''}. Follow signs after security — about 10–15 minutes walk. Moving walkways in Terminals B and C.`, newStage: 11, newMemory: mem }
    }
    if (has(t, ['when do i board', 'boarding time', 'when does boarding'])) {
      return { reply: `Boarding begins at ${mem.boardingTime || 'your scheduled time'}. Be at gate ${mem.gate || 'your gate'} 15 minutes before. Gate closes 10 minutes before departure.`, newStage: 11, newMemory: mem }
    }
    if (has(t, ['gate change', 'gate changed', 'different gate'])) {
      return { reply: `Gate changes are on the departure boards and in the airline app. Your current gate is ${mem.gate || 'on your boarding pass'} — always confirm closer to boarding.`, newStage: 11, newMemory: mem }
    }
    if (has(t, ['how long to gate', 'how far', 'walk to gate', 'distance', 'time to reach'])) {
      return { reply: `Gate ${mem.gate || 'your gate'} is roughly 10–15 minutes from security. Allow extra if stopping for food or shopping. Moving walkways in Terminals B and C!`, newStage: 11, newMemory: mem }
    }
    if (has(t, ['laptop', 'turn on', 'switch on', 'electronics', 'tablet', 'they ask'])) {
      return { reply: "At security they may ask you to switch on your laptop to confirm it works — keep it charged. On board, most flights allow electronics after takeoff. Switch to flight mode when prompted by the crew.", newStage: 11, newMemory: mem }
    }
    if (has(t, ['thank', 'thanks', 'appreciate', 'helpful', 'great', 'wonderful'])) {
      return { reply: pick([`My pleasure — have a wonderful trip to ${mem.destination || 'your destination'}! Safe travels.`, "You're so welcome! Enjoy every moment. Have a great flight!"]), newStage: 11, newMemory: mem }
    }
    if (has(t, ['bye', 'goodbye', 'see you', 'take care', 'farewell'])) {
      return { reply: pick([`Goodbye and safe travels! Enjoy ${mem.destination || 'your trip'}.`, "Have a wonderful journey! Come back and see us soon."]), newStage: 11, newMemory: mem }
    }
    return {
      reply: pick([
        `Anything else before you head to security? Gate ${mem.gate || 'is on your boarding pass'}, boarding at ${mem.boardingTime || 'your scheduled time'}.`,
        "Anything else I can help with? Directions, delays, lounge access — happy to assist!",
      ]),
      newStage: 11,
      newMemory: mem,
    }
  }

  return { reply: "Is there anything else I can help you with?", newStage: stage, newMemory: mem }
}

function giveGateInfo(mem: Record<string, string>) {
  const gates = ['A14', 'B07', 'C22', 'D11', 'B19', 'A03', 'C15', 'D08', 'B23', 'A06']
  const times = ['10:25', '11:40', '13:15', '14:50', '08:30', '16:20', '09:10', '12:35', '15:05', '17:45']
  const gate         = mem.gate || pick(gates)
  const boardingTime = mem.boardingTime || pick(times)
  const newMem       = { ...mem, gate, boardingTime }
  const dest         = mem.destination || 'your destination'
  const terminal     = gate[0]
  return {
    reply: pick([
      `All done! Your gate is ${gate} in Terminal ${terminal}. Boarding for ${dest} begins at ${boardingTime} — please be there 15 minutes before. Have an amazing flight!`,
      `You're all checked in! Head to gate ${gate} after security — Terminal ${terminal} signs will guide you. Boarding at ${boardingTime}. Enjoy ${dest}!`,
      `Here's your boarding pass! Gate ${gate}, boarding at ${boardingTime}. Safe travels to ${dest}. Follow signs for Terminal ${terminal}.`,
    ]),
    newStage: 11,
    newMemory: newMem,
  }
}

// ══════════════════════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════════════════════

export function getCharacterReply(
  userText: string,
  state: ConversationState
): { reply: string; newStage: number; characterName: string; newMemory: Record<string, string> } {
  if (state.scenario === 'cafe') {
    const { reply, newStage, newMemory } = getCafeReply(userText, state.stage, state.memory || {})
    return { reply, newStage, characterName: 'Emma', newMemory }
  } else {
    const { reply, newStage, newMemory } = getAirportReply(userText, state.stage, state.memory || {})
    return { reply, newStage, characterName: 'Daniel', newMemory }
  }
}

export function getOpeningMessage(scenario: Scenario): { reply: string; characterName: string } {
  if (scenario === 'cafe') {
    return { reply: pick(["Hi there, welcome to Bloom Café! What can I get started for you today?", "Hey! Good to see you. What are you in the mood for?", "Hello! Welcome in — what can I get you today?"]), characterName: 'Emma' }
  }
  return { reply: pick(["Good morning! Welcome to check-in. Where are you flying to today?", "Hello, welcome! Ready to get you checked in — where are you heading?", "Good day! Which destination are you flying to today?"]), characterName: 'Daniel' }
}

export function scorePronunciation(text: string): 'good' | 'short' {
  return text.trim().split(/\s+/).filter(Boolean).length >= 4 ? 'good' : 'short'
}

export interface Stats {
  sessionsCompleted: number
  totalSpeakingSeconds: number
  scenariosPlayed: Record<Scenario, number>
}

const DEFAULT_STATS: Stats = { sessionsCompleted: 0, totalSpeakingSeconds: 0, scenariosPlayed: { cafe: 0, airport: 0 } }

export function loadStats(): Stats {
  if (typeof window === 'undefined') return DEFAULT_STATS
  try { const r = localStorage.getItem('lingrind_stats'); return r ? { ...DEFAULT_STATS, ...JSON.parse(r) } : DEFAULT_STATS } catch { return DEFAULT_STATS }
}

export function saveStats(stats: Stats): void {
  if (typeof window !== 'undefined') localStorage.setItem('lingrind_stats', JSON.stringify(stats))
}

export function incrementSession(scenario: Scenario, speakingSeconds: number): void {
  const s = loadStats(); s.sessionsCompleted += 1; s.totalSpeakingSeconds += speakingSeconds
  s.scenariosPlayed[scenario] = (s.scenariosPlayed[scenario] || 0) + 1; saveStats(s)
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60); const s = seconds % 60
  return m === 0 ? `${s}s` : `${m}m ${s}s`
}
