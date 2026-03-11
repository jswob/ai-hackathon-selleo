#!/usr/bin/env bun

import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

const POSTGRES_CONTAINER = `${process.env.COMPOSE_PROJECT_NAME}-${process.env.POSTGRES_CONTAINER_NAME}`;
const MAIN_VOLUME = `${process.env.COMPOSE_PROJECT_NAME}_postgres_data`;
const BASE_VOLUME = 'postgres_snapshot_base';
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

function getAllSnapshotVolumes(): string[] {
	const volumes = executeCommand('docker volume ls --format "{{.Name}}"', 'list volumes');
	return volumes
		.split('\n')
		.filter(volume => volume === BASE_VOLUME || volume.startsWith(SNAPSHOT_PREFIX));
}

function restoreFromVolume(sourceVolume: string, targetVolume: string) {
	console.log(`🔄 Restoring from ${sourceVolume}...`);

	// Clear target volume and restore from snapshot
	const restoreCommand = `docker run --rm -v ${sourceVolume}:/source:ro -v ${targetVolume}:/target alpine sh -c "rm -rf /target/* /target/.[^.]* && cp -a /source/. /target/"`;
	executeCommand(restoreCommand, 'restore snapshot data');
}

function cleanAllSnapshots() {
	const forceFlag = process.argv.includes('--force');
	const snapshotVolumes = getAllSnapshotVolumes();

	if (snapshotVolumes.length === 0) {
		console.log('✨ No snapshots found - already clean!');
		return;
	}

	console.log('🧹 Database Clean Operation');
	console.log('This will:');
	console.log('  1. Restore baseline (if exists) to preserve clean data');
	console.log('  2. Remove ALL snapshots including protected baseline');
	console.log('  3. Clear push tracking files');
	console.log('');
	console.log(`📋 Found ${snapshotVolumes.length} snapshot volume(s) to remove:`);

	snapshotVolumes.forEach(volume => {
		const isBase = volume === BASE_VOLUME;
		const indicator = isBase ? ' 🔒 (PROTECTED BASE)' : '';
		console.log(`  - ${volume}${indicator}`);
	});

	if (!forceFlag) {
		console.log('');
		console.log('⚠️  This action cannot be undone!');
		console.log('💡 Use --force flag to skip this confirmation');
		console.log('');

		// In a real CLI, you'd prompt for confirmation here
		// For now, require --force flag
		console.log('❌ Aborted - use --force flag to proceed');
		console.log('💡 Run: bun db:clean --force');
		process.exit(1);
	}

	console.log('');
	console.log('🚀 Starting clean operation...');

	// Stop PostgreSQL for consistent operations
	stopPostgres();

	try {
		// Step 1: Restore baseline if it exists (to preserve clean data)
		const hasBaseline = snapshotVolumes.includes(BASE_VOLUME);
		if (hasBaseline) {
			console.log('📦 Restoring baseline to preserve clean data...');
			restoreFromVolume(BASE_VOLUME, MAIN_VOLUME);
			console.log('✅ Baseline restored to main database');
		} else {
			console.log('ℹ️  No baseline found - keeping current database state');
		}

		// Step 2: Remove all snapshot volumes
		console.log('🗑️  Removing all snapshot volumes...');
		snapshotVolumes.forEach(volume => {
			executeCommand(`docker volume rm ${volume}`, `remove volume ${volume}`);
			const isBase = volume === BASE_VOLUME;
			const indicator = isBase ? ' 🔒' : '';
			console.log(`  ❌ Removed: ${volume}${indicator}`);
		});

		// Step 3: Clear tracking files
		if (existsSync(LAST_PUSH_FILE)) {
			unlinkSync(LAST_PUSH_FILE);
			console.log('🗑️  Cleared push tracking file');
		}

		console.log('');
		console.log('✅ Clean operation completed successfully!');
		console.log('🎯 Database restored to clean state');
		console.log('📭 All snapshots removed');
		console.log('💡 Use "bun db:base" to create a new protected baseline');
	} finally {
		// Always restart PostgreSQL
		startPostgres();
	}
}

cleanAllSnapshots();
