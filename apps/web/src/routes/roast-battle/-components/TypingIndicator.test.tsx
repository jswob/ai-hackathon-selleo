import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { TypingIndicator } from './TypingIndicator';

describe('TypingIndicator', () => {
	test('shows animated dots for AI typing', () => {
		render(<TypingIndicator isAiTyping={true} />);

		expect(screen.getByText(/roast bot is typing/i)).toBeInTheDocument();
	});

	test('shows "Your turn" nudge for player', () => {
		render(<TypingIndicator isAiTyping={false} />);

		expect(screen.getByText(/your turn/i)).toBeInTheDocument();
	});
});
