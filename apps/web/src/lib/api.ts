import { treaty } from '@elysiajs/eden';
import type { App } from '@meetings-scheduler/api';
import { ENV } from '@/env';

const baseUrl = ENV.VITE_API_URL.startsWith('http') ? ENV.VITE_API_URL : window.location.origin;

export const client = treaty<App>(baseUrl);
