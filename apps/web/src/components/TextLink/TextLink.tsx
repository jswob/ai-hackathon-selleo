import { cn } from '@/lib/utils';

type TextLinkProps = React.ComponentProps<'button'>;

/** A button styled as an inline text link. */
export function TextLink({ className, ...props }: TextLinkProps) {
	return (
		<button
			type="button"
			className={cn(
				'cursor-pointer border-none bg-transparent p-0 font-inherit text-primary underline decoration-primary/40 hover:decoration-primary focus-visible:rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary',
				className
			)}
			{...props}
		/>
	);
}
