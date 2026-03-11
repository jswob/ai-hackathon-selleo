import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ResultScreen } from './ResultScreen';

describe('ResultScreen', () => {
	test('"You Win!" for player winner', () => {
		render(<ResultScreen winner="Player" verdict="Great roasts!" onPlayAgain={vi.fn()} />);

		expect(screen.getByText('You Win!')).toBeInTheDocument();
	});

	test('"AI Wins!" for AI winner', () => {
		render(<ResultScreen winner="AI" verdict="AI was brutal!" onPlayAgain={vi.fn()} />);

		expect(screen.getByText('AI Wins!')).toBeInTheDocument();
	});

	test('displays verdict text', () => {
		render(
			<ResultScreen winner="Player" verdict="Player had killer punchlines" onPlayAgain={vi.fn()} />
		);

		expect(screen.getByText('Player had killer punchlines')).toBeInTheDocument();
	});

	test('"Play Again" button fires callback', async () => {
		const user = userEvent.setup();
		const onPlayAgain = vi.fn();
		render(<ResultScreen winner="Player" verdict="Verdict" onPlayAgain={onPlayAgain} />);

		await user.click(screen.getByRole('button', { name: /play again/i }));

		expect(onPlayAgain).toHaveBeenCalledOnce();
	});
});
