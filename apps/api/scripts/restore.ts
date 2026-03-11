#!/usr/bin/env bun

import { execSync } from 'child_process';

const POSTGRES_CONTAINER = `${process.env.COMPOSE_PROJECT_NAME}-${process.env.POSTGRES_CONTAINER_NAME}`;
const MAIN_VOLUME = `${process.env.COMPOSE_PROJECT_NAME}_postgres_data`;
const BASE_VOLUME = 'postgres_snapshot_base';
const SNAPSHOT_PREFIX = 'postgres_snapshot_';

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

function getAvailableSnapshots(): {
	name: string;
	volume: string;
	isBase: boolean;
	timestamp?: number;
}[] {
	const volumes = executeCommand('docker volume ls --format "{{.Name}}"', 'list volumes');
	const snapshots = volumes
		.split('\n')
		.filter(volume => volume === BASE_VOLUME || volume.startsWith(SNAPSHOT_PREFIX))
		.map(volume => {
			if (volume === BASE_VOLUME) {
				return { name: 'base', volume, isBase: true };
			}
			const parts = volume.split('_');
			const lastPart = parts[parts.length - 1] || '';
			const timestamp = parseInt(lastPart);
			return {
				name: isNaN(timestamp) ? lastPart || 'unknown' : `snapshot_${timestamp}`,
				volume,
				isBase: false,
				timestamp: isNaN(timestamp) ? undefined : timestamp,
			};
		})
		.sort((a, b) => {
			if (a.isBase) return -1;
			if (b.isBase) return 1;
			return (b.timestamp || 0) - (a.timestamp || 0);
		});

	return snapshots;
}

function getLatestSnapshot() {
	const snapshots = getAvailableSnapshots();
	return snapshots.find(s => !s.isBase) || null;
}

function findSnapshot(name: string) {
	const snapshots = getAvailableSnapshots();

	if (name === 'base') {
		return snapshots.find(s => s.isBase) || null;
	}

	// Try exact match first
	let snapshot = snapshots.find(s => s.name === name);
	if (snapshot) return snapshot;

	// Try with snapshot_ prefix
	snapshot = snapshots.find(s => s.name === `snapshot_${name}`);
	if (snapshot) return snapshot;

	// Try volume name match
	const volumeName = name.startsWith(SNAPSHOT_PREFIX) ? name : `${SNAPSHOT_PREFIX}${name}`;
	snapshot = snapshots.find(s => s.volume === volumeName);
	if (snapshot) return snapshot;

	return null;
}

function restoreFromVolume(sourceVolume: string, targetVolume: string) {
	// Create a temporary volume for backup
	const backupVolume = `${targetVolume}_backup_${Math.floor(Date.now() / 1000)}`;

	console.log('💾 Creating safety backup...');
	executeCommand(`docker volume create ${backupVolume}`, `create backup volume`);

	// Backup current data
	const backupCommand = `docker run --rm -v ${targetVolume}:/source:ro -v ${backupVolume}:/target alpine sh -c "cp -a /source/. /target/"`;
	executeCommand(backupCommand, 'backup current data');

	console.log('🔄 Restoring snapshot...');

	// Clear target volume and restore from snapshot
	const restoreCommand = `docker run --rm -v ${sourceVolume}:/source:ro -v ${targetVolume}:/target alpine sh -c "rm -rf /target/* /target/.[^.]* && cp -a /source/. /target/"`;
	executeCommand(restoreCommand, 'restore snapshot data');

	console.log(`💾 Current state backed up to: ${backupVolume}`);
	console.log(`💡 You can remove backup with: docker volume rm ${backupVolume}`);
}

function restoreSnapshot(snapshotName?: string) {
	const snapshots = getAvailableSnapshots();

	if (snapshots.length === 0) {
		console.error('❌ No snapshots found');
		console.log('💡 Create your first snapshot with: bun db:snapshot');
		process.exit(1);
	}

	let targetSnapshot;

	if (snapshotName) {
		targetSnapshot = findSnapshot(snapshotName);

		if (!targetSnapshot) {
			console.error(`❌ Snapshot not found: ${snapshotName}`);
			console.log('\nAvailable snapshots:');
			snapshots.forEach(s => {
				const indicator = s.isBase ? ' 🔒 (BASE)' : s === getLatestSnapshot() ? ' ⭐ (LATEST)' : '';
				console.log(`  - ${s.name}${indicator}`);
			});
			process.exit(1);
		}
	} else {
		targetSnapshot = getLatestSnapshot();
		if (!targetSnapshot) {
			console.error('❌ No regular snapshots found (only base exists)');
			console.log('💡 Use "bun db:restore base" to restore base snapshot');
			process.exit(1);
		}
	}

	const indicator = targetSnapshot.isBase ? ' 🔒 (BASE)' : '';
	console.log(`🔄 Restoring from: ${targetSnapshot.name}${indicator}`);

	// Stop PostgreSQL for consistent restore
	stopPostgres();

	try {
		restoreFromVolume(targetSnapshot.volume, MAIN_VOLUME);
		console.log('✅ Database restored successfully');

		if (targetSnapshot.isBase) {
			console.log('🎯 You are now back to your protected baseline state');
		}
	} finally {
		// Always restart PostgreSQL
		startPostgres();
	}
}

const snapshotName = process.argv[2];
restoreSnapshot(snapshotName);
