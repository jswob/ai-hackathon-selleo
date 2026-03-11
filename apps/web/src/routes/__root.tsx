import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

import { AppLayout } from '@/components/AppLayout';
import type { RouterContext } from '@/router';

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
});

function RootLayout() {
	return (
		<AppLayout>
			<Outlet />
		</AppLayout>
	);
}
