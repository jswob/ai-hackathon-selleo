import {
	flip,
	FloatingPortal,
	offset,
	shift,
	useDismiss,
	useFloating,
	useFocus,
	useHover,
	useInteractions,
	useRole,
	type Placement,
} from '@floating-ui/react';
import { type ReactNode, useState } from 'react';

import { cn } from '@/lib/utils';

interface TooltipProps {
	content: ReactNode;
	children: ReactNode;
	placement?: Placement;
	maxWidth?: number;
	className?: string;
}

/** Floating tooltip that appears on hover/focus with a configurable delay. */
export function Tooltip({
	content,
	children,
	placement = 'top',
	maxWidth = 320,
	className,
}: TooltipProps) {
	const [isOpen, setIsOpen] = useState(false);

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement,
		middleware: [offset(6), flip(), shift({ padding: 8 })],
	});

	const hover = useHover(context, { move: false, delay: { open: 200 } });
	const focus = useFocus(context);
	const dismiss = useDismiss(context);
	const role = useRole(context, { role: 'tooltip' });

	const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

	return (
		<>
			<span className="inline-flex" tabIndex={0} ref={refs.setReference} {...getReferenceProps()}>
				{children}
			</span>
			{isOpen && (
				<FloatingPortal>
					<div
						ref={refs.setFloating}
						style={{ ...floatingStyles, maxWidth }}
						className={cn(
							'z-70 rounded-md border border-border-primary bg-bg-tertiary px-3 py-2 text-xs text-text-primary shadow-md',
							className
						)}
						{...getFloatingProps()}
					>
						{content}
					</div>
				</FloatingPortal>
			)}
		</>
	);
}
