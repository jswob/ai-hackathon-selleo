import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { TopicInput } from './TopicInput';

describe('TopicInput', () => {
	test('renders topic input and start button', () => {
		render(<TopicInput onStart={vi.fn()} />);

		expect(screen.getByPlaceholderText(/enter a topic/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /start battle/i })).toBeInTheDocument();
	});

	test('start button disabled when input empty', () => {
		render(<TopicInput onStart={vi.fn()} />);

		expect(screen.getByRole('button', { name: /start battle/i })).toBeDisabled();
	});

	test('calls onStart with topic on submit', async () => {
		const user = userEvent.setup();
		const onStart = vi.fn();
		render(<TopicInput onStart={onStart} />);

		await user.type(screen.getByPlaceholderText(/enter a topic/i), 'cats');
		await user.click(screen.getByRole('button', { name: /start battle/i }));

		expect(onStart).toHaveBeenCalledWith('cats');
	});

	test('supports Enter key submission', async () => {
		const user = userEvent.setup();
		const onStart = vi.fn();
		render(<TopicInput onStart={onStart} />);

		await user.type(screen.getByPlaceholderText(/enter a topic/i), 'dogs{Enter}');

		expect(onStart).toHaveBeenCalledWith('dogs');
	});
});
