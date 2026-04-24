export const PHRASES = [

  // ── Meetings ────────────────────────────────────────────────────────
  {
    category: 'Meetings',
    translation: 'I think maybe we should try this approach.',
    corrected: 'I recommend we go with this approach — it directly addresses the problem and we can iterate quickly if needed.',
    vocab_word: 'Recommend',
    vocab_meaning: 'To confidently suggest something with a reason behind it — not just a guess.',
    why_weak: '"Think maybe" signals doubt before you have even made your point. Lead with your recommendation, not your uncertainty.'
  },
  {
    category: 'Meetings',
    translation: 'Sorry, I don\'t know the answer to that.',
    corrected: 'I don\'t have that information with me right now — let me follow up with you by end of day.',
    vocab_word: 'Follow up',
    vocab_meaning: 'To come back to someone with an answer, update, or action after a conversation.',
    why_weak: 'Stopping at "I don\'t know" leaves a gap. Always pair it with when and how you will get the answer.'
  },
  {
    category: 'Meetings',
    translation: 'This is a bit complicated to explain.',
    corrected: 'Let me break this down step by step — it will be clear in a minute.',
    vocab_word: 'Break down',
    vocab_meaning: 'To explain something complex by splitting it into smaller, simple parts.',
    why_weak: 'Saying it\'s complicated warns people to disengage. Instead, take control and promise clarity upfront.'
  },
  {
    category: 'Meetings',
    translation: 'I was not in the last meeting so I don\'t know what happened.',
    corrected: 'I missed the previous meeting — could you give me a quick summary of the key decisions so I can get up to speed?',
    vocab_word: 'Loop in',
    vocab_meaning: 'To include someone in a conversation or bring them up to date on what they missed.',
    why_weak: 'Stating you were absent is not enough — always ask specifically what you need to catch up on.'
  },
  {
    category: 'Meetings',
    translation: 'I will try my best to finish it.',
    corrected: 'I will have this done by Thursday noon — I will flag you immediately if anything changes.',
    vocab_word: 'Commit',
    vocab_meaning: 'To firmly promise to deliver something by a specific time.',
    why_weak: '"Try my best" gives you an escape before you have even started. Give a date and own it.'
  },
  {
    category: 'Meetings',
    translation: 'Should I do this or not? I am not sure.',
    corrected: 'Before I proceed, I want to align with you on the approach — can we take two minutes to confirm direction?',
    vocab_word: 'Align',
    vocab_meaning: 'To make sure everyone agrees on the direction or approach before moving forward.',
    why_weak: 'Asking "should I or not" puts the decision entirely on someone else. Frame it as alignment, not confusion.'
  },

  // ── Status Updates ──────────────────────────────────────────────────
  {
    category: 'Status',
    translation: 'I am still working on it.',
    corrected: 'I am on track — the task is about 70% complete and I expect to finish by tomorrow morning.',
    vocab_word: 'On track',
    vocab_meaning: 'Progressing as planned, with no risk to the deadline.',
    why_weak: '"Still working on it" gives no useful information. Always share percentage done and your ETA.'
  },
  {
    category: 'Status',
    translation: 'It is almost done.',
    corrected: 'I have one remaining item — the unit tests. I will have this ready for review by 3 PM today.',
    vocab_word: 'Deliverable',
    vocab_meaning: 'The specific, finished piece of work you hand over for review or use.',
    why_weak: '"Almost done" means nothing without a time. Name what is left and when it lands.'
  },
  {
    category: 'Status',
    translation: 'I was busy so I could not finish it.',
    corrected: 'I had to deprioritize this due to an urgent production issue — I can deliver it by Thursday EOD.',
    vocab_word: 'Deprioritize',
    vocab_meaning: 'To move something lower on your list because something more urgent came up.',
    why_weak: '"I was busy" sounds like an excuse. Name the actual reason and immediately give a new commitment.'
  },
  {
    category: 'Status',
    translation: 'I don\'t know when it will be done.',
    corrected: 'I need to assess the remaining scope — I will send you a clear ETA by end of today.',
    vocab_word: 'ETA',
    vocab_meaning: 'Estimated Time of Arrival — when something will be finished or delivered.',
    why_weak: 'Not knowing is okay. Not committing to finding out is not. Always follow uncertainty with a next step.'
  },
  {
    category: 'Status',
    translation: 'There might be some issues with this.',
    corrected: 'I want to flag a potential risk early — here is what I am seeing and how I plan to handle it.',
    vocab_word: 'Flag',
    vocab_meaning: 'To proactively raise a concern or risk so others are aware before it becomes a problem.',
    why_weak: '"Might be some issues" is vague and creates anxiety. Be specific about the risk and lead with your plan.'
  },
  {
    category: 'Status',
    translation: 'It is taking more time than I thought.',
    corrected: 'This is taking longer than estimated — the root cause is an unexpected API dependency. My revised ETA is Friday noon.',
    vocab_word: 'Root cause',
    vocab_meaning: 'The real underlying reason something went wrong or took longer, not just the surface symptom.',
    why_weak: 'Delays happen — what matters is explaining why and giving a new date. Own both.'
  },

  // ── Handling Disagreements ──────────────────────────────────────────
  {
    category: 'Disagreement',
    translation: 'That won\'t work.',
    corrected: 'I see a potential challenge with this approach — could I propose an alternative that avoids that risk?',
    vocab_word: 'Alternative',
    vocab_meaning: 'A different option you can offer instead of the one being discussed.',
    why_weak: 'Flat rejection without a reason or alternative puts people on the defensive. Always pair a "no" with a "but here\'s what could work".'
  },
  {
    category: 'Disagreement',
    translation: 'This is wrong.',
    corrected: 'I noticed something we may want to revisit — the numbers in slide 3 do not match the data from last week\'s report.',
    vocab_word: 'Revisit',
    vocab_meaning: 'To go back and look at something again to check, correct, or reconsider it.',
    why_weak: '"This is wrong" sounds like an attack. Be specific about what is wrong and frame it as something to look at together.'
  },
  {
    category: 'Disagreement',
    translation: 'I don\'t agree with this decision.',
    corrected: 'I have a different perspective on this — can I share my thinking before we finalize?',
    vocab_word: 'Perspective',
    vocab_meaning: 'Your point of view based on your experience or knowledge of the situation.',
    why_weak: '"I don\'t agree" closes the door. "I have a different perspective" opens a conversation.'
  },
  {
    category: 'Disagreement',
    translation: 'Why are we doing it this way? It doesn\'t make sense to me.',
    corrected: 'Help me understand the reasoning behind this approach — I want to make sure I am fully aligned before we proceed.',
    vocab_word: 'Reasoning',
    vocab_meaning: 'The logical explanation or thinking behind a decision or approach.',
    why_weak: 'Questioning without context sounds like a challenge. Ask to understand, not to challenge.'
  },
  {
    category: 'Disagreement',
    translation: 'This is too complicated. Why can\'t we do it simply?',
    corrected: 'I think we might be able to simplify this — would it work if we broke it into two smaller pieces and handled them separately?',
    vocab_word: 'Simplify',
    vocab_meaning: 'To make something easier to understand or do by removing unnecessary complexity.',
    why_weak: 'Complaining about complexity without a solution is not helpful. Offer the simpler path.'
  },
  {
    category: 'Disagreement',
    translation: 'I have a problem with this.',
    corrected: 'I want to be transparent about a concern I have before we go further — I think this could create a dependency issue downstream.',
    vocab_word: 'Transparent',
    vocab_meaning: 'Being open and honest about what you think or what is happening, even when it is uncomfortable.',
    why_weak: '"I have a problem" is vague and sounds personal. Name the actual concern clearly and early.'
  },

  // ── Making Requests ─────────────────────────────────────────────────
  {
    category: 'Requests',
    translation: 'Can you do this for me?',
    corrected: 'Could you help me with the API integration? I will have all the context and requirements ready before we start so it takes you minimal time.',
    vocab_word: 'Collaborate',
    vocab_meaning: 'To work together with someone — sharing the effort rather than just handing off a task.',
    why_weak: '"Do this for me" sounds like delegation without ownership. Show you will make it easy for them.'
  },
  {
    category: 'Requests',
    translation: 'I need this urgently. Please finish it fast.',
    corrected: 'I have a time-sensitive request — this is blocking the client demo tomorrow at 10 AM. Could we prioritize it today?',
    vocab_word: 'Time-sensitive',
    vocab_meaning: 'Something that must be done quickly because a deadline or dependency is at risk.',
    why_weak: '"Urgent" and "fast" with no reason feels like pressure with no context. Explain what is at stake.'
  },
  {
    category: 'Requests',
    translation: 'When will you finish this? I am waiting for it.',
    corrected: 'Could you share an ETA? Knowing when this is ready will help me plan the downstream work.',
    vocab_word: 'Downstream',
    vocab_meaning: 'Work or tasks that depend on something else being completed first.',
    why_weak: '"I am waiting" sounds impatient. Explaining why you need it helps the other person understand the real impact.'
  },
  {
    category: 'Requests',
    translation: 'Can you explain this again? I did not understand.',
    corrected: 'Could you walk me through that one more time? I want to make sure I have understood it correctly before I proceed.',
    vocab_word: 'Clarify',
    vocab_meaning: 'To explain something more clearly so that any confusion is removed.',
    why_weak: 'Saying "I didn\'t understand" can sound passive. Framing it as wanting to confirm shows intent, not weakness.'
  },
  {
    category: 'Requests',
    translation: 'I need more time. I can\'t finish it by Friday.',
    corrected: 'I need to revise the timeline — I underestimated the testing effort. I can deliver a fully tested version by Monday EOD instead.',
    vocab_word: 'Revise',
    vocab_meaning: 'To update or change something — a timeline, a document, or a plan — based on new information.',
    why_weak: 'Asking for more time without a reason or a new date just moves the problem. Own the miss and give a new commitment.'
  },
  {
    category: 'Requests',
    translation: 'Please help me. I am stuck on this.',
    corrected: 'I could use your expertise on this — I\'ve been stuck on the authentication flow for two hours. Could you spare 15 minutes to look at it with me?',
    vocab_word: 'Expertise',
    vocab_meaning: 'Deep knowledge or skill in a specific area that makes someone the right person to help.',
    why_weak: '"I am stuck" is fine to say — but be specific about where, for how long, and what kind of help you need.'
  },

  // ── Presenting & Explaining ─────────────────────────────────────────
  {
    category: 'Presenting',
    translation: 'So basically, what I\'m trying to say is...',
    corrected: 'The key point is this: the current approach costs us 3 extra days per release. Here is how we fix it.',
    vocab_word: 'Concise',
    vocab_meaning: 'Saying exactly what needs to be said with no wasted words.',
    why_weak: '"So basically what I\'m trying to say" is filler that signals you haven\'t organized your thoughts. Cut it and open with the point.'
  },
  {
    category: 'Presenting',
    translation: 'I hope this makes sense.',
    corrected: 'Happy to clarify any part of this — what questions do you have?',
    vocab_word: 'Clarify',
    vocab_meaning: 'To explain something in a clearer way to remove confusion or doubt.',
    why_weak: '"I hope it makes sense" puts the burden on the audience and suggests you\'re not sure yourself. Ask for questions instead.'
  },
  {
    category: 'Presenting',
    translation: 'Sorry, let me start again. I got confused.',
    corrected: 'Let me take a step back and give you a cleaner picture — here is the core context you need.',
    vocab_word: 'Context',
    vocab_meaning: 'The background information that helps someone understand a situation fully.',
    why_weak: 'Apologizing and restarting loses the room. Pause, reframe calmly, and take control of the narrative.'
  },
  {
    category: 'Presenting',
    translation: 'I will quickly go through all the slides.',
    corrected: 'I will walk you through three key points — this will take about ten minutes and I will leave time for questions.',
    vocab_word: 'Walk through',
    vocab_meaning: 'To explain something step by step in a structured, guided way.',
    why_weak: '"Quickly go through all slides" signals there is too much content and not enough time. Structure it as key points instead.'
  },
  {
    category: 'Presenting',
    translation: 'I hope the demo works. It was working yesterday.',
    corrected: 'Let me show you what we built. I will walk you through the live flow.',
    vocab_word: 'Impact',
    vocab_meaning: 'The meaningful effect or result your work has on people or the business.',
    why_weak: 'Pre-apologizing for a broken demo sets low expectations before you have even started. Never say it — just run the demo.'
  },
  {
    category: 'Presenting',
    translation: 'I am not very good at presentations. Please bear with me.',
    corrected: 'Here is what we built, why it matters, and what I need from you today.',
    vocab_word: 'Agenda',
    vocab_meaning: 'A clear statement of what will be covered and in what order — sets expectations for the audience.',
    why_weak: 'Opening with self-doubt destroys your credibility instantly. Open with your agenda and let your work speak.'
  },
];
