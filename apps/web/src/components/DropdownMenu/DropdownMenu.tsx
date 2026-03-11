import {
	FloatingPortal,
	flip,
	offset,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
	type Placement,
} from '@floating-ui/react';
import type { LucideIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { dropdownMenuItemVariants } from './DropdownMenu.variants';

export interface DropdownMenuItem {
	label: string;
	icon?: LucideIcon;
	onClick: () => void;
	disabled?: boolean;
	variant?: 'default' | 'destructive';
}

interface DropdownMenuProps {
	items: DropdownMenuItem[];
	children: ReactNode;
	placement?: Placement;
}

/** Floating dropdown menu triggered by clicking children. */
export function DropdownMenu({ items, children, placement = 'bottom-end' }: DropdownMenuProps) {
	const [isOpen, setIsOpen] = useState(false);

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement,
		middleware: [offset(4), flip(), shift({ padding: 8 })],
	});

	const click = useClick(context);
	const dismiss = useDismiss(context);
	const role = useRole(context, { role: 'menu' });

	const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

	return (
		<>
			<span className="inline-flex" ref={refs.setReference} {...getReferenceProps()}>
				{children}
			</span>
			{isOpen && (
				<FloatingPortal>
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						className="z-60 w-44 rounded-lg border border-border-primary bg-bg-primary py-1 shadow-lg"
						{...getFloatingProps()}
					>
						{items.map(item => {
							const Icon = item.icon;
							return (
								<button
									key={item.label}
									type="button"
									role="menuitem"
									disabled={item.disabled}
									className={dropdownMenuItemVariants({
										variant: item.variant ?? 'default',
									})}
									onClick={() => {
										if (!item.disabled) {
											setIsOpen(false);
											item.onClick();
										}
									}}
								>
									{Icon && <Icon aria-hidden="true" className="h-4 w-4" />}
									{item.label}
								</button>
							);
						})}
					</div>
				</FloatingPortal>
			)}
		</>
	);
}
