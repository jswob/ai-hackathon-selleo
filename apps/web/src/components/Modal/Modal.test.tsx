import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from './Modal';

describe('Modal', () => {
	describe('rendering', () => {
		it('renders title and children when open', async () => {
			render(
				<Modal open={true} onClose={vi.fn()} title="Test Title">
					<p>Body content</p>
				</Modal>
			);

			expect(await screen.findByText('Test Title')).toBeInTheDocument();
			expect(screen.getByText('Body content')).toBeInTheDocument();
		});

		it('does not render content when closed', () => {
			render(
				<Modal open={false} onClose={vi.fn()} title="Test Title">
					<p>Body content</p>
				</Modal>
			);

			expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
			expect(screen.queryByText('Body content')).not.toBeInTheDocument();
		});

		it('renders description when provided', async () => {
			render(
				<Modal open={true} onClose={vi.fn()} title="Title" description="A helpful description">
					<p>Body</p>
				</Modal>
			);

			expect(await screen.findByText('A helpful description')).toBeInTheDocument();
		});

		it('does not render description when absent', async () => {
			render(
				<Modal open={true} onClose={vi.fn()} title="Title">
					<p>Body</p>
				</Modal>
			);

			await screen.findByText('Title');
			expect(screen.queryByText('description')).not.toBeInTheDocument();
		});

		it('renders footer when provided', async () => {
			render(
				<Modal open={true} onClose={vi.fn()} title="Title" footer={<button>Save</button>}>
					<p>Body</p>
				</Modal>
			);

			expect(await screen.findByRole('button', { name: 'Save' })).toBeInTheDocument();
		});

		it('does not render footer slot when absent', async () => {
			render(
				<Modal open={true} onClose={vi.fn()} title="Title">
					<p>Body</p>
				</Modal>
			);

			await screen.findByText('Title');
			expect(document.querySelector('[data-slot="footer"]')).not.toBeInTheDocument();
		});
	});

	describe('close button', () => {
		it('renders close button with aria-label', async () => {
			render(
				<Modal open={true} onClose={vi.fn()} title="Title">
					<p>Body</p>
				</Modal>
			);

			expect(await screen.findByRole('button', { name: 'Close' })).toBeInTheDocument();
		});

		it('calls onClose when close button is clicked', async () => {
			const user = userEvent.setup();
			const handleClose = vi.fn();

			render(
				<Modal open={true} onClose={handleClose} title="Title">
					<p>Body</p>
				</Modal>
			);

			await user.click(await screen.findByRole('button', { name: 'Close' }));
			expect(handleClose).toHaveBeenCalledWith(false);
		});
	});

	describe('size variants', () => {
		it.each([
			{ size: 'sm' as const, expected: 'max-w-sm' },
			{ size: 'md' as const, expected: 'max-w-md' },
			{ size: 'lg' as const, expected: 'max-w-lg' },
			{ size: 'xl' as const, expected: 'max-w-xl' },
		])('applies $expected class for size=$size', async ({ size, expected }) => {
			render(
				<Modal open={true} onClose={vi.fn()} title="Title" size={size}>
					<p>Body</p>
				</Modal>
			);

			await screen.findByText('Title');
			const panel = document.querySelector('[data-slot="panel"]');
			expect(panel).toBeInTheDocument();
			expect(panel?.className).toContain(expected);
		});

		it('defaults to md size', async () => {
			render(
				<Modal open={true} onClose={vi.fn()} title="Title">
					<p>Body</p>
				</Modal>
			);

			await screen.findByText('Title');
			const panel = document.querySelector('[data-slot="panel"]');
			expect(panel?.className).toContain('max-w-md');
		});
	});

	describe('customization', () => {
		it('merges custom className onto panel', async () => {
			render(
				<Modal open={true} onClose={vi.fn()} title="Title" className="my-custom-class">
					<p>Body</p>
				</Modal>
			);

			await screen.findByText('Title');
			const panel = document.querySelector('[data-slot="panel"]');
			expect(panel?.className).toContain('my-custom-class');
			expect(panel?.className).toContain('rounded-lg');
		});
	});

	describe('accessibility', () => {
		it('has aria-modal attribute', async () => {
			render(
				<Modal open={true} onClose={vi.fn()} title="Title">
					<p>Body</p>
				</Modal>
			);

			const dialog = await screen.findByRole('dialog');
			expect(dialog).toHaveAttribute('aria-modal', 'true');
		});

		it('dialog is labelled by title', async () => {
			render(
				<Modal open={true} onClose={vi.fn()} title="My Dialog Title">
					<p>Body</p>
				</Modal>
			);

			const dialog = await screen.findByRole('dialog', { name: 'My Dialog Title' });
			expect(dialog).toBeInTheDocument();
		});
	});
});
