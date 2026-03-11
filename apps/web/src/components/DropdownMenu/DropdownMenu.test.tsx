import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Trash2 } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu';

const defaultItems: DropdownMenuItem[] = [
	{ label: 'Edit', onClick: vi.fn() },
	{ label: 'Delete', onClick: vi.fn(), variant: 'destructive' },
];

describe('DropdownMenu', () => {
	// Phase 1: basic open/close

	it('renders trigger children', () => {
		render(
			<DropdownMenu items={defaultItems}>
				<button type="button">Open menu</button>
			</DropdownMenu>
		);

		expect(screen.getByText('Open menu')).toBeInTheDocument();
	});

	it('does not show menu items by default', () => {
		render(
			<DropdownMenu items={defaultItems}>
				<button type="button">Open menu</button>
			</DropdownMenu>
		);

		expect(screen.queryByText('Edit')).not.toBeInTheDocument();
		expect(screen.queryByText('Delete')).not.toBeInTheDocument();
	});

	it('opens on trigger click and shows items', async () => {
		render(
			<DropdownMenu items={defaultItems}>
				<button type="button">Open menu</button>
			</DropdownMenu>
		);

		await userEvent.click(screen.getByText('Open menu'));

		expect(screen.getByText('Edit')).toBeInTheDocument();
		expect(screen.getByText('Delete')).toBeInTheDocument();
	});

	it('closes on outside click', async () => {
		render(
			<div>
				<DropdownMenu items={defaultItems}>
					<button type="button">Open menu</button>
				</DropdownMenu>
				<span>Outside</span>
			</div>
		);

		await userEvent.click(screen.getByText('Open menu'));
		expect(screen.getByText('Edit')).toBeInTheDocument();

		await userEvent.click(screen.getByText('Outside'));
		expect(screen.queryByText('Edit')).not.toBeInTheDocument();
	});

	it('closes on Escape', async () => {
		render(
			<DropdownMenu items={defaultItems}>
				<button type="button">Open menu</button>
			</DropdownMenu>
		);

		await userEvent.click(screen.getByText('Open menu'));
		expect(screen.getByText('Edit')).toBeInTheDocument();

		await userEvent.keyboard('{Escape}');
		expect(screen.queryByText('Edit')).not.toBeInTheDocument();
	});

	// Phase 2: item features

	it('renders icons when provided', async () => {
		const items: DropdownMenuItem[] = [{ label: 'Delete', onClick: vi.fn(), icon: Trash2 }];

		render(
			<DropdownMenu items={items}>
				<button type="button">Open menu</button>
			</DropdownMenu>
		);

		await userEvent.click(screen.getByText('Open menu'));

		const deleteButton = screen.getByRole('menuitem', { name: 'Delete' });
		expect(deleteButton.querySelector('svg')).toBeInTheDocument();
	});

	it('disabled items are not clickable', async () => {
		const onClick = vi.fn();
		const items: DropdownMenuItem[] = [{ label: 'Edit', onClick, disabled: true }];

		render(
			<DropdownMenu items={items}>
				<button type="button">Open menu</button>
			</DropdownMenu>
		);

		await userEvent.click(screen.getByText('Open menu'));
		await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));

		expect(onClick).not.toHaveBeenCalled();
	});

	it('calls onClick and closes menu on item click', async () => {
		const onClick = vi.fn();
		const items: DropdownMenuItem[] = [{ label: 'Edit', onClick }];

		render(
			<DropdownMenu items={items}>
				<button type="button">Open menu</button>
			</DropdownMenu>
		);

		await userEvent.click(screen.getByText('Open menu'));
		await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));

		expect(onClick).toHaveBeenCalledOnce();
		expect(screen.queryByText('Edit')).not.toBeInTheDocument();
	});

	it('destructive variant has text-danger class', async () => {
		const items: DropdownMenuItem[] = [
			{ label: 'Delete', onClick: vi.fn(), variant: 'destructive' },
		];

		render(
			<DropdownMenu items={items}>
				<button type="button">Open menu</button>
			</DropdownMenu>
		);

		await userEvent.click(screen.getByText('Open menu'));

		expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveClass('text-danger');
	});

	it('default variant has text-text-primary class', async () => {
		const items: DropdownMenuItem[] = [{ label: 'Edit', onClick: vi.fn() }];

		render(
			<DropdownMenu items={items}>
				<button type="button">Open menu</button>
			</DropdownMenu>
		);

		await userEvent.click(screen.getByText('Open menu'));

		expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveClass('text-text-primary');
	});
});
