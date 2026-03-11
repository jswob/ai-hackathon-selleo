#!/usr/bin/env bun

import { execSync } from 'child_process';

const POSTGRES_CONTAINER = `${process.env.COMPOSE_PROJECT_NAME}-${process.env.POSTGRES_CONTAINER_NAME}`;
const MAIN_VOLUME = `${process.env.COMPOSE_PROJECT_NAME}_postgres_data`;
const BASE_VOLUME = 'postgres_snapshot_base';
const SNAPSHOT_PREFIX = 'postgres_snapshot_';
const MAX_SNAPSHOTS = 4; // Keep base + 4 recent

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

function getSnapshotVolumes(): string[] {
	const volumes = executeCommand('docker volume ls --format "{{.Name}}"', 'list volumes');
	return volumes
		.split('\n')
		.filter(volume => volume.startsWith(SNAPSHOT_PREFIX) && volume !== BASE_VOLUME)
		.sort((a, b) => {
			const timeA = parseInt(a.split('_').pop() || '0');
			const timeB = parseInt(b.split('_').pop() || '0');
			return timeB - timeA; // Most recent first
		});
}

function cleanupOldSnapshots() {
	const snapshots = getSnapshotVolumes();
	const toDelete = snapshots.slice(MAX_SNAPSHOTS);

	if (toDelete.length === 0) return;

	console.log(`🧹 Cleaning up ${toDelete.length} old snapshot(s)...`);
	toDelete.forEach(volume => {
		executeCommand(`docker volume rm ${volume}`, `remove volume ${volume}`);
		console.log(`  ❌ Removed: ${volume}`);
	});
}

function createVolumeSnapshot(sourceVolume: string, targetVolume: string) {
	// Create target volume
	executeCommand(`docker volume create ${targetVolume}`, `create volume ${targetVolume}`);

	// Copy data from source to target
	const copyCommand = `docker run --rm -v ${sourceVolume}:/source:ro -v ${targetVolume}:/target alpine sh -c "cp -a /source/. /target/"`;
	executeCommand(copyCommand, `copy data to ${targetVolume}`);
}

function createSnapshot(name?: string) {
	const isBase = name === 'base';
	let volumeName: string;

	if (isBase) {
		volumeName = BASE_VOLUME;
	} else {
		const timestamp = Math.floor(Date.now() / 1000);
		volumeName = name ? `${SNAPSHOT_PREFIX}${name}` : `${SNAPSHOT_PREFIX}${timestamp}`;
	}

	console.log(`📸 Creating ${isBase ? 'BASE' : 'snapshot'}: ${volumeName}`);

	// Stop PostgreSQL for consistent snapshot
	stopPostgres();

	try {
		// Remove existing volume if it exists (for base updates)
		if (isBase) {
			try {
				const volumes = executeCommand('docker volume ls --format "{{.Name}}"', 'list volumes');
				if (volumes.split('\n').includes(volumeName)) {
					executeCommand(`docker volume rm ${volumeName}`, 'remove existing base');
					console.log('  🔄 Updating existing base snapshot');
				} else {
					console.log('  ✨ Creating new base snapshot');
				}
			} catch {
				console.log('  ✨ Creating new base snapshot');
			}
		}

		// Create snapshot
		createVolumeSnapshot(MAIN_VOLUME, volumeName);

		if (!isBase) {
			// Clean up old snapshots (but keep base)
			cleanupOldSnapshots();
		}

		console.log(`✅ ${isBase ? 'Base snapshot' : 'Snapshot'} created successfully`);
		if (isBase) {
			console.log('🔒 Base snapshot is protected and will never be auto-deleted');
		}
	} finally {
		// Always restart PostgreSQL
		startPostgres();
	}

	return volumeName;
}

const snapshotName = process.argv[2];
createSnapshot(snapshotName);
