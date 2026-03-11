import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmationModal } from './ConfirmationModal';

const defaultProps = {
	open: true,
	onClose: vi.fn(),
	onConfirm: vi.fn(),
	title: 'Delete Item',
	description: 'Are you sure you want to delete this item?',
};

describe('ConfirmationModal', () => {
	it('renders title and description when open', async () => {
		render(<ConfirmationModal {...defaultProps} />);

		expect(await screen.findByText('Delete Item')).toBeInTheDocument();
		expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
	});

	it('does not render when closed', () => {
		render(<ConfirmationModal {...defaultProps} open={false} />);

		expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
	});

	it('calls onConfirm when confirm button clicked', async () => {
		const onConfirm = vi.fn();
		const user = userEvent.setup();
		render(<ConfirmationModal {...defaultProps} onConfirm={onConfirm} />);

		await user.click(await screen.findByRole('button', { name: 'Delete' }));

		expect(onConfirm).toHaveBeenCalledOnce();
	});

	it('calls onClose when cancel button clicked', async () => {
		const onClose = vi.fn();
		const user = userEvent.setup();
		render(<ConfirmationModal {...defaultProps} onClose={onClose} />);

		await user.click(await screen.findByRole('button', { name: 'Cancel' }));

		expect(onClose).toHaveBeenCalledOnce();
	});

	it('calls onClose when X button clicked', async () => {
		const onClose = vi.fn();
		const user = userEvent.setup();
		render(<ConfirmationModal {...defaultProps} onClose={onClose} />);

		await user.click(await screen.findByRole('button', { name: 'Close' }));

		expect(onClose).toHaveBeenCalled();
	});

	it('shows custom confirmLabel and cancelLabel', async () => {
		render(<ConfirmationModal {...defaultProps} confirmLabel="Remove" cancelLabel="Keep" />);

		expect(await screen.findByRole('button', { name: 'Remove' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
	});

	it('disables both buttons when isPending', async () => {
		render(<ConfirmationModal {...defaultProps} isPending />);

		await screen.findByText('Delete Item');
		expect(screen.getByRole('button', { name: 'Deleting...' })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
	});

	it('shows pendingLabel text when pending', async () => {
		render(<ConfirmationModal {...defaultProps} isPending pendingLabel="Removing..." />);

		expect(await screen.findByRole('button', { name: 'Removing...' })).toBeDisabled();
	});
});
