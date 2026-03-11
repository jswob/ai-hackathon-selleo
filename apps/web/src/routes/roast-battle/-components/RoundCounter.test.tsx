import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { RoundCounter } from './RoundCounter';

describe('RoundCounter', () => {
	test('shows correct "Round X / Y" text', () => {
		render(<RoundCounter current={3} total={5} />);

		expect(screen.getByText('Round 3 / 5')).toBeInTheDocument();
	});
});
