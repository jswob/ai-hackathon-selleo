import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface TopicInputProps {
	onStart: (topic: string) => void;
}

export function TopicInput({ onStart }: TopicInputProps) {
	const [topic, setTopic] = useState('');

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (topic.trim()) {
			onStart(topic.trim());
		}
	}

	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<Card className="w-full max-w-md border-border-primary bg-bg-secondary">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold text-text-primary">AI Roast Battle</CardTitle>
					<p className="text-text-secondary">
						Pick a topic and go head-to-head with an AI in a roast battle!
					</p>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<Input
							value={topic}
							onChange={e => setTopic(e.target.value)}
							placeholder="Enter a topic to roast..."
							className="border-border-primary bg-bg-tertiary text-text-primary placeholder:text-text-muted"
						/>
						<Button
							type="submit"
							disabled={!topic.trim()}
							className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
						>
							Start Battle
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
