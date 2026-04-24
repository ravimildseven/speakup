export function buildPrompt(userText, language, goal = {}) {
  const isEnglish = language === 'English';
  const goalTitle = goal.title || 'Learn Speaking';
  const coachGoal = goal.coachGoal || 'general English speaking practice';
  const rewriteTarget = goal.rewriteTarget || 'clear, natural spoken English';
  const scoreLabel = goal.scoreLabel || 'Speaking score';
  const scoreFocus = goal.scoreFocus || 'clarity, grammar, natural flow, and ease of speaking aloud';
  const extraGuidance = goal.extraGuidance || 'Keep the corrected version natural and easy to say aloud.';

  const context = isEnglish
    ? `The user said this in English:\n"${userText}"`
    : `The user said this in ${language} (or mixed):\n"${userText}"`;

  const task = isEnglish
    ? `1. Write exactly what they said in "translation"
2. Rewrite it so it sounds ${rewriteTarget} in "corrected"
3. Estimate a ${scoreLabel.toLowerCase()} from 0-100 for the original phrasing in "confidence" (integer only)
4. Pick 1 strong vocabulary word from the corrected version
5. Give the IPA pronunciation of that word in "vocab_ipa"
6. Give the word meaning in "vocab_meaning"
7. Give one short example sentence using that word in "vocab_example"
8. Give exactly 2 reasons why the original phrasing was weak`
    : `1. Translate what they said to natural English in "translation"
2. Rewrite it so it sounds ${rewriteTarget} in "corrected"
3. Estimate a ${scoreLabel.toLowerCase()} from 0-100 for the translated phrasing in "confidence" (integer only)
4. Pick 1 strong vocabulary word from the corrected version
5. Give the IPA pronunciation of that word in "vocab_ipa"
6. Give the word meaning in "vocab_meaning"
7. Give one short example sentence using that word in "vocab_example"
8. Give exactly 2 reasons why the original phrasing was weak`;

  return `You are a speaking coach for someone who thinks in ${language} and wants help with ${coachGoal}.

Selected learning goal: ${goalTitle}

The learner may be any age, so keep the corrected version age-appropriate, natural, and easy to say aloud.
${extraGuidance}

${context}

Your job:
${task}

Score using these factors:
- ${scoreFocus}
- Give higher scores only when the original already sounds natural for the selected goal
- Do not reward unnecessary complexity

Respond ONLY in this exact JSON format. No markdown. No extra text. No trailing commas:
{
  "translation": "natural English of what they said",
  "corrected": "the stronger version for the selected goal",
  "confidence": 72,
  "vocab_word": "Word",
  "vocab_ipa": "/ˈwɜːrd/",
  "vocab_meaning": "definition of the word",
  "vocab_example": "A short example sentence using the word.",
  "why_weak": [
    {"heading": "Reason label", "detail": "One sentence explanation."},
    {"heading": "Reason label", "detail": "One sentence explanation."}
  ]
}`;
}
