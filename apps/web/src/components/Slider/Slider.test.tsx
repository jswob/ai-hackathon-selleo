import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Slider } from './Slider';

describe('Slider', () => {
	it('renders slider with role="slider"', () => {
		render(<Slider value={50} onChange={vi.fn()} min={0} max={100} />);
		expect(screen.getByRole('slider')).toBeInTheDocument();
	});

	it('has correct aria-valuemin and aria-valuemax', () => {
		render(<Slider value={50} onChange={vi.fn()} min={10} max={200} />);
		const slider = screen.getByRole('slider');
		expect(slider).toHaveAttribute('aria-valuemin', '10');
		expect(slider).toHaveAttribute('aria-valuemax', '200');
	});

	it('fires onChange with numeric value on change', () => {
		const onChange = vi.fn();
		render(<Slider value={50} onChange={onChange} min={0} max={100} />);
		fireEvent.change(screen.getByRole('slider'), { target: { value: '75' } });
		expect(onChange).toHaveBeenCalledWith(75);
	});

	it('supports disabled prop', () => {
		render(<Slider value={50} onChange={vi.fn()} min={0} max={100} disabled />);
		expect(screen.getByRole('slider')).toBeDisabled();
	});

	it('passes through aria-label', () => {
		render(<Slider value={50} onChange={vi.fn()} min={0} max={100} aria-label="Time limit" />);
		expect(screen.getByRole('slider')).toHaveAttribute('aria-label', 'Time limit');
	});
});
