import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { MessageBubble } from './MessageBubble';

describe('MessageBubble', () => {
	test('player messages show "You" label', () => {
		render(<MessageBubble role="player" content="My roast" />);

		expect(screen.getByText('You')).toBeInTheDocument();
		expect(screen.getByText('My roast')).toBeInTheDocument();
	});

	test('AI messages show "Roast Bot" label', () => {
		render(<MessageBubble role="ai" content="AI roast" />);

		expect(screen.getByText('Roast Bot')).toBeInTheDocument();
		expect(screen.getByText('AI roast')).toBeInTheDocument();
	});

	test('displays message content', () => {
		render(<MessageBubble role="player" content="Devastating burn!" />);

		expect(screen.getByText('Devastating burn!')).toBeInTheDocument();
	});
});
