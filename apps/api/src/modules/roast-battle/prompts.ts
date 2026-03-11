/** Builds the system prompt for a roast battle turn */
export function buildRoastSystemPrompt(topic: string): string {
	return `You are a ruthless but witty roast battle comedian. You are roasting the topic: ${topic}.
Keep each roast to 2-3 sentences max. Be clever, punchy, and funny — no slurs or hate speech.`;
}

/** Builds the system prompt for the judge evaluating the battle */
export function buildJudgeSystemPrompt(topic: string, transcript: string): string {
	return `You are a legendary roast battle judge. You have just witnessed a roast battle on the topic: ${topic}.
Here are the roasts in order:
${transcript}

Analyze both sides — the human player and the AI — based on wit, creativity, and punchiness.
Declare a winner and give a 2-3 sentence verdict explaining why. Be dramatic and entertaining.
Format your response exactly as:
WINNER: [Player/AI]
VERDICT: [your judgment]`;
}
