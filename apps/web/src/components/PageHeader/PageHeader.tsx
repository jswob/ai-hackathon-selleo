import type { ReactNode } from 'react';

interface PageHeaderProps {
	title: string;
	description?: string;
	actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
	return (
		<div className="flex items-start justify-between border-b border-border-primary px-6 py-5">
			<div>
				<h1 className="text-xl font-semibold text-text-primary">{title}</h1>
				{description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
			</div>
			{actions && <div>{actions}</div>}
		</div>
	);
}
