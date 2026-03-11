import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TextLink } from './TextLink';

describe('TextLink', () => {
	it('renders children text', () => {
		render(<TextLink>Click me</TextLink>);
		expect(screen.getByText('Click me')).toBeInTheDocument();
	});

	it('calls onClick when clicked', async () => {
		const onClick = vi.fn();
		render(<TextLink onClick={onClick}>Click me</TextLink>);

		await userEvent.click(screen.getByText('Click me'));
		expect(onClick).toHaveBeenCalledOnce();
	});

	it('does not call onClick when disabled', async () => {
		const onClick = vi.fn();
		render(
			<TextLink onClick={onClick} disabled>
				Click me
			</TextLink>
		);

		await userEvent.click(screen.getByText('Click me'));
		expect(onClick).not.toHaveBeenCalled();
	});

	it('has correct link-like styling classes', () => {
		render(<TextLink>Styled link</TextLink>);
		const button = screen.getByRole('button');

		expect(button.className).toContain('text-primary');
		expect(button.className).toContain('underline');
		expect(button.className).toContain('bg-transparent');
		expect(button.className).toContain('cursor-pointer');
	});
});
