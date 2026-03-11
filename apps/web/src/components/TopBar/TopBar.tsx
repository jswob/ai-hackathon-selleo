export function TopBar() {
	return (
		<header className="flex items-center justify-between border-b border-border-primary bg-bg-secondary px-6 py-3">
			<div className="flex items-center gap-2">
				<span className="text-base font-semibold text-text-primary">My App</span>
			</div>
			<nav className="flex items-center gap-1">{/* Add navigation links here */}</nav>
		</header>
	);
}
