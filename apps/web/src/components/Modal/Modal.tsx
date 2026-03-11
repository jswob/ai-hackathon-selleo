import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import type { VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { ButtonIcon } from '@/components/ButtonIcon';
import { cn } from '@/lib/utils';

import { modalPanelVariants } from './Modal.variants';

export type ModalProps = {
	open: boolean;
	onClose: (value: boolean) => void;
	title: string;
	description?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	size?: VariantProps<typeof modalPanelVariants>['size'];
	className?: string;
};

/** Accessible modal dialog built on Headless UI. */
export function Modal({
	open,
	onClose,
	title,
	description,
	children,
	footer,
	size,
	className,
}: ModalProps) {
	return (
		<Dialog open={open} onClose={onClose}>
			<DialogBackdrop
				transition
				className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 data-closed:opacity-0"
			/>

			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<DialogPanel
					transition
					data-slot="panel"
					className={cn(
						modalPanelVariants({ size }),
						'transition-all duration-200 data-closed:scale-95 data-closed:opacity-0',
						className
					)}
				>
					<div className="flex items-center justify-between border-b border-border-primary px-4 py-3">
						<DialogTitle className="text-sm font-semibold text-text-primary">{title}</DialogTitle>
						<ButtonIcon
							icon={X}
							variant="ghost"
							size="sm"
							aria-label="Close"
							onClick={() => onClose(false)}
						/>
					</div>

					{description && (
						<Description className="px-4 pt-3 text-sm text-text-muted">{description}</Description>
					)}

					<div className="scrollbar-styled max-h-[60vh] overflow-y-auto px-4 py-4">{children}</div>

					{footer && (
						<div
							data-slot="footer"
							className="flex justify-end gap-2 border-t border-border-primary px-4 py-3"
						>
							{footer}
						</div>
					)}
				</DialogPanel>
			</div>
		</Dialog>
	);
}
