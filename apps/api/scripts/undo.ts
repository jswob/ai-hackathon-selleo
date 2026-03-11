#!/usr/bin/env bun

import { execSync } from 'child_process';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const POSTGRES_CONTAINER = `${process.env.COMPOSE_PROJECT_NAME}-${process.env.POSTGRES_CONTAINER_NAME}`;
const MAIN_VOLUME = `${process.env.COMPOSE_PROJECT_NAME}_postgres_data`;
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

function restoreFromVolume(sourceVolume: string, targetVolume: string) {
	// Create a temporary volume for backup
	const backupVolume = `${targetVolume}_backup_${Math.floor(Date.now() / 1000)}`;

	console.log('💾 Creating safety backup...');
	executeCommand(`docker volume create ${backupVolume}`, `create backup volume`);

	// Backup current data
	const backupCommand = `docker run --rm -v ${targetVolume}:/source:ro -v ${backupVolume}:/target alpine sh -c "cp -a /source/. /target/"`;
	executeCommand(backupCommand, 'backup current data');

	console.log('🔄 Restoring to pre-push state...');

	// Clear target volume and restore from snapshot
	const restoreCommand = `docker run --rm -v ${sourceVolume}:/source:ro -v ${targetVolume}:/target alpine sh -c "rm -rf /target/* /target/.[^.]* && cp -a /source/. /target/"`;
	executeCommand(restoreCommand, 'restore snapshot data');

	console.log(`💾 Current state backed up to: ${backupVolume}`);
	console.log(`💡 You can remove backup with: docker volume rm ${backupVolume}`);
}

function undoLastPush() {
	if (!existsSync(LAST_PUSH_FILE)) {
		console.error('❌ No push to undo');
		console.log('💡 Use "bun db:push:safe" to create trackable pushes');
		process.exit(1);
	}

	let lastPushSnapshot: string;
	try {
		lastPushSnapshot = readFileSync(LAST_PUSH_FILE, 'utf8').trim();
	} catch (error) {
		console.error('❌ Cannot read last push snapshot file:', error);
		process.exit(1);
	}

	// Check if the snapshot volume still exists
	const volumes = executeCommand('docker volume ls --format "{{.Name}}"', 'list volumes');
	if (!volumes.split('\n').includes(lastPushSnapshot)) {
		console.error(`❌ Last push snapshot no longer exists: ${lastPushSnapshot}`);
		console.log('💡 It may have been cleaned up or manually removed');
		unlinkSync(LAST_PUSH_FILE);
		process.exit(1);
	}

	console.log(`⏪ Undoing last push (restoring: ${lastPushSnapshot})`);

	// Stop PostgreSQL for consistent restore
	stopPostgres();

	try {
		restoreFromVolume(lastPushSnapshot, MAIN_VOLUME);

		// Remove the snapshot volume after successful restore
		console.log('🗑️  Removing used snapshot...');
		executeCommand(`docker volume rm ${lastPushSnapshot}`, 'remove snapshot volume');
		console.log(`❌ Removed snapshot: ${lastPushSnapshot}`);

		// Clear the last push tracking
		unlinkSync(LAST_PUSH_FILE);

		console.log('✅ Last push undone successfully');
		console.log('🎯 Database restored to state before last push');
	} finally {
		// Always restart PostgreSQL
		startPostgres();
	}
}

undoLastPush();
