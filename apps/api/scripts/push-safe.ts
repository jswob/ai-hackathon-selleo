#!/usr/bin/env bun

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const POSTGRES_CONTAINER = `${process.env.COMPOSE_PROJECT_NAME}-${process.env.POSTGRES_CONTAINER_NAME}`;
const MAIN_VOLUME = `${process.env.COMPOSE_PROJECT_NAME}_postgres_data`;
const SNAPSHOT_PREFIX = 'postgres_snapshot_';
const LAST_PUSH_FILE = join(process.cwd(), '.last_push_snapshot');

function executeCommand(command: string, description: string): string {
	try {
		return execSync(command, { encoding: 'utf8' }).trim();
	} catch (error) {
		console.error(`❌ Failed to ${description}:`, error);
		process.exit(1);
	}
}

function stopPostgres() {
	console.log('🛑 Stopping PostgreSQL container...');
	executeCommand(`docker stop ${POSTGRES_CONTAINER}`, 'stop PostgreSQL');
}

function startPostgres() {
	console.log('🚀 Starting PostgreSQL container...');
	executeCommand(`docker start ${POSTGRES_CONTAINER}`, 'start PostgreSQL');
}

function createVolumeSnapshot(sourceVolume: string, targetVolume: string) {
	// Create target volume
	executeCommand(`docker volume create ${targetVolume}`, `create volume ${targetVolume}`);

	// Copy data from source to target
	const copyCommand = `docker run --rm -v ${sourceVolume}:/source:ro -v ${targetVolume}:/target alpine sh -c "cp -a /source/. /target/"`;
	executeCommand(copyCommand, `copy data to ${targetVolume}`);
}

function cleanupOldSnapshots() {
	const MAX_SNAPSHOTS = 4;
	const volumes = executeCommand('docker volume ls --format "{{.Name}}"', 'list volumes');
	const snapshots = volumes
		.split('\n')
		.filter(volume => volume.startsWith(SNAPSHOT_PREFIX) && !volume.includes('base'))
		.sort((a, b) => {
			const timeA = parseInt(a.split('_').pop() || '0');
			const timeB = parseInt(b.split('_').pop() || '0');
			return timeB - timeA; // Most recent first
		});

	const toDelete = snapshots.slice(MAX_SNAPSHOTS);

	if (toDelete.length === 0) return;

	console.log(`🧹 Cleaning up ${toDelete.length} old snapshot(s)...`);
	toDelete.forEach(volume => {
		executeCommand(`docker volume rm ${volume}`, `remove volume ${volume}`);
		console.log(`  ❌ Removed: ${volume}`);
	});
}

function safePush() {
	const timestamp = Math.floor(Date.now() / 1000);
	const snapshotVolume = `${SNAPSHOT_PREFIX}before_push_${timestamp}`;

	console.log('📸 Creating pre-push snapshot...');

	// Stop PostgreSQL for consistent snapshot
	stopPostgres();

	try {
		// Create snapshot before push
		createVolumeSnapshot(MAIN_VOLUME, snapshotVolume);
		console.log(`✅ Pre-push snapshot created: ${snapshotVolume}`);

		// Track this snapshot for undo functionality
		writeFileSync(LAST_PUSH_FILE, snapshotVolume, 'utf8');

		// Clean up old snapshots
		cleanupOldSnapshots();
	} finally {
		// Always restart PostgreSQL
		startPostgres();
	}

	console.log('🚀 Running drizzle-kit push...');

	// Run the actual push command
	try {
		executeCommand('drizzle-kit push', 'run drizzle push');
		console.log('✅ Push completed successfully');
		console.log('💡 Use "bun db:undo" to revert if needed');
	} catch {
		console.error('❌ Push failed, but snapshot is preserved');
		console.log('💡 Use "bun db:undo" to restore pre-push state');
		process.exit(1);
	}
}

safePush();
