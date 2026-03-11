#!/usr/bin/env bun

import { readdirSync, rmSync } from 'fs';
import { join } from 'path';

const SEED_DATA_ROOT = join(import.meta.dir, '..', 'src', 'db', 'seed-data');

function getTimestampedDirs(): string[] {
	let entries: string[];
	try {
		entries = readdirSync(SEED_DATA_ROOT);
	} catch {
		return [];
	}
	return entries.filter(name => /^\d+$/.test(name)).sort((a, b) => Number(b) - Number(a));
}

const deleteAll = process.argv.includes('--all');

if (deleteAll) {
	try {
		rmSync(SEED_DATA_ROOT, { recursive: true, force: true });
		console.log(`Deleted entire seed-data/ directory`);
	} catch {
		console.error('No seed-data directory found.');
		process.exit(1);
	}
} else {
	const dirs = getTimestampedDirs();

	if (dirs.length === 0) {
		console.error('No seed-data snapshots found. Nothing to delete.');
		process.exit(1);
	}

	const [latest] = dirs;
	const latestPath = join(SEED_DATA_ROOT, latest as string);

	let fileCount = 0;
	try {
		fileCount = readdirSync(latestPath).filter(f => f.endsWith('.json')).length;
	} catch {
		// directory might be empty
	}

	rmSync(latestPath, { recursive: true, force: true });
	console.log(`Deleted snapshot ${latest} (${fileCount} files)`);
	console.log(`Remaining snapshots: ${dirs.length - 1}`);
}
