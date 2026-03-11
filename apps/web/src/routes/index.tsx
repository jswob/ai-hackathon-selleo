import { createFileRoute, Link } from '@tanstack/react-router';

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
			<Link
				to="/roast-battle"
				className="mt-6 rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
			>
				AI Roast Battle
			</Link>
		</div>
	);
}
