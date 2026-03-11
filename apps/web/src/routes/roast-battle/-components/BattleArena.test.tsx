import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { BattleArena } from './BattleArena';

const defaultProps = {
	messages: [],
	isPlayerTurn: true,
	isStreaming: false,
	currentRound: 1,
	totalRounds: 5,
	topic: 'cats',
	onSendMessage: vi.fn(),
};

describe('BattleArena', () => {
	test('renders all message bubbles', () => {
		render(
			<BattleArena
				{...defaultProps}
				messages={[
					{ role: 'player', content: 'Player roast' },
					{ role: 'ai', content: 'AI roast' },
				]}
			/>
		);

		expect(screen.getByText('Player roast')).toBeInTheDocument();
		expect(screen.getByText('AI roast')).toBeInTheDocument();
	});

	test('input not shown when not player turn', () => {
		render(<BattleArena {...defaultProps} isPlayerTurn={false} />);

		expect(screen.queryByPlaceholderText(/drop your roast/i)).not.toBeInTheDocument();
	});

	test('input not shown while AI streaming', () => {
		render(<BattleArena {...defaultProps} isStreaming={true} />);

		expect(screen.queryByPlaceholderText(/drop your roast/i)).not.toBeInTheDocument();
	});

	test('send button fires callback with text', async () => {
		const user = userEvent.setup();
		const onSendMessage = vi.fn();
		render(<BattleArena {...defaultProps} onSendMessage={onSendMessage} />);

		await user.type(screen.getByPlaceholderText(/drop your roast/i), 'Burn!');
		await user.click(screen.getByRole('button', { name: /send/i }));

		expect(onSendMessage).toHaveBeenCalledWith('Burn!');
	});

	test('clears input after sending', async () => {
		const user = userEvent.setup();
		render(<BattleArena {...defaultProps} onSendMessage={vi.fn()} />);

		const input = screen.getByPlaceholderText(/drop your roast/i);
		await user.type(input, 'Burn!');
		await user.click(screen.getByRole('button', { name: /send/i }));

		expect(input).toHaveValue('');
	});
});
