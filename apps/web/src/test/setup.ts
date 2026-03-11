import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
	cleanup();
});

// Mock DataTransfer if not available
if (typeof DataTransfer === 'undefined') {
	global.DataTransfer = class DataTransfer {
		items: DataTransferItem[] = [];
		types: string[] = [];
		files: FileList = [] as unknown as FileList;

		getData(_formatUnused: string): string {
			return '';
		}

		setData(_formatUnused: string, _dataUnused: string): void {
			// Mock implementation
		}

		clearData(_formatUnused?: string): void {
			// Mock implementation
		}
	} as unknown as typeof DataTransfer;
}

// Mock ClipboardEvent if not available
if (typeof ClipboardEvent === 'undefined') {
	global.ClipboardEvent = class ClipboardEvent extends Event {
		clipboardData: DataTransfer;
		constructor(type: string, init?: ClipboardEventInit) {
			super(type, init);
			this.clipboardData = init?.clipboardData || new DataTransfer();
		}
	} as unknown as typeof ClipboardEvent;
}

Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

Element.prototype.getAnimations = () => [];

// Make HTMLElement.prototype.focus writable for @react-aria/interactions compatibility in jsdom.
// react-aria overrides focus() to track input modality, but jsdom defines focus as a non-writable getter.
Object.defineProperty(window.HTMLElement.prototype, 'focus', {
	configurable: true,
	enumerable: true,
	writable: true,
	// eslint-disable-next-line @typescript-eslint/unbound-method -- Reason: re-defining the native focus method as a writable data property
	value: HTMLElement.prototype.focus,
});
