import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

interface TopBarNavLinkProps {
	to: string;
	children: ReactNode;
}

export function TopBarNavLink({ to, children }: TopBarNavLinkProps) {
	return (
		<Link
			to={to}
			activeOptions={{ exact: false }}
			className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary data-[status=active]:text-text-primary"
		>
			{children}
		</Link>
	);
}
