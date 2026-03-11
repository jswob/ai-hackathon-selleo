import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';

export type ConfirmationModalProps = {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	isPending?: boolean;
	pendingLabel?: string;
	warningMessage?: string;
};

/** Reusable confirmation dialog built on Modal with pre-configured footer buttons. */
export function ConfirmationModal({
	open,
	onClose,
	onConfirm,
	title,
	description,
	confirmLabel = 'Delete',
	cancelLabel = 'Cancel',
	isPending = false,
	pendingLabel = 'Deleting...',
	warningMessage,
}: ConfirmationModalProps) {
	return (
		<Modal
			open={open}
			onClose={() => onClose()}
			title={title}
			description={description}
			size="sm"
			footer={
				<>
					<Button variant="secondary" onClick={onClose} disabled={isPending}>
						{cancelLabel}
					</Button>
					<Button variant="destructive" onClick={onConfirm} disabled={isPending}>
						{isPending ? pendingLabel : confirmLabel}
					</Button>
				</>
			}
		>
			{warningMessage ? (
				<div
					className="flex items-start gap-2 rounded-md border border-warning bg-warning/10 p-3"
					role="alert"
				>
					<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
					<p className="text-sm text-warning">{warningMessage}</p>
				</div>
			) : (
				<></>
			)}
		</Modal>
	);
}
