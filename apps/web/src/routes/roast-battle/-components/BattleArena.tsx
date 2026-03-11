import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Message } from '../-hooks/useRoastBattle';
import { MessageBubble } from './MessageBubble';
import { RoundCounter } from './RoundCounter';
import { TypingIndicator } from './TypingIndicator';

interface BattleArenaProps {
	messages: Message[];
	isPlayerTurn: boolean;
	isStreaming: boolean;
	currentRound: number;
	totalRounds: number;
	topic: string;
	onSendMessage: (content: string) => void;
}

export function BattleArena({
	messages,
	isPlayerTurn,
	isStreaming,
	currentRound,
	totalRounds,
	topic,
	onSendMessage,
}: BattleArenaProps) {
	const [input, setInput] = useState('');
	const scrollRef = useRef<HTMLDivElement>(null);
	const canSend = isPlayerTurn && !isStreaming && input.trim().length > 0;

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!canSend) return;
		onSendMessage(input.trim());
		setInput('');
	}

	return (
		<Card className="mx-auto flex h-[80vh] max-w-2xl flex-col border-border-primary bg-bg-secondary">
			<CardHeader className="flex flex-row items-center justify-between border-b border-border-primary pb-3">
				<div>
					<h2 className="text-lg font-bold text-text-primary">Topic: {topic}</h2>
				</div>
				<RoundCounter current={currentRound} total={totalRounds} />
			</CardHeader>
			<CardContent className="flex flex-1 flex-col gap-3 overflow-hidden p-0">
				<div ref={scrollRef} className="scrollbar-styled flex-1 space-y-4 overflow-y-auto p-4">
					{messages.map((msg, i) => (
						<MessageBubble key={i} role={msg.role} content={msg.content} />
					))}
				</div>

				<div className="border-t border-border-primary p-4">
					{isStreaming || !isPlayerTurn ? (
						<TypingIndicator isAiTyping={isStreaming || !isPlayerTurn} />
					) : (
						<form onSubmit={handleSubmit} className="flex gap-2">
							<Input
								value={input}
								onChange={e => setInput(e.target.value)}
								placeholder="Drop your roast..."
								disabled={!isPlayerTurn || isStreaming}
								className="flex-1 border-border-primary bg-bg-tertiary text-text-primary placeholder:text-text-muted"
							/>
							<Button
								type="submit"
								disabled={!canSend}
								className="bg-primary text-primary-foreground hover:bg-primary/90"
							>
								Send
							</Button>
						</form>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
