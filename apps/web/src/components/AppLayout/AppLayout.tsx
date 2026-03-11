import type { ReactNode } from 'react';

import { TopBar } from '@/components/TopBar';

interface AppLayoutProps {
	children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
	return (
		<div className="flex h-screen flex-col overflow-hidden">
			<TopBar />
			<main className="min-h-0 flex-1 overflow-hidden">{children}</main>
		</div>
	);
}
