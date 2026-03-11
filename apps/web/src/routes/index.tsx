import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="flex flex-col items-center justify-center p-8">
			<h1 className="text-2xl font-bold text-text-primary">Welcome to the template</h1>
			<p className="mt-2 text-text-secondary">
				Start building your application by adding routes in <code>src/routes/</code>.
			</p>
		</div>
	);
}
