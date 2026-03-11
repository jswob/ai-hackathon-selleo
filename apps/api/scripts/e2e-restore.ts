#!/usr/bin/env bun
/**
 * E2E Database Restore Script
 *
 * Restores the E2E database from the baseline snapshot.
 * This provides fast (~2-5 second) database restoration for test isolation.
 */
import { execSync } from 'child_process';

const E2E_CONTAINER = `${process.env.COMPOSE_PROJECT_NAME || 'meetings-scheduler'}-postgres-e2e`;
const E2E_VOLUME = `${process.env.COMPOSE_PROJECT_NAME || 'meetings-scheduler'}_postgres_e2e_data`;
const E2E_BASELINE_VOLUME = 'e2e_snapshot_base';

function executeCommand(command: string, description: string): string {
	try {
		return execSync(command, { encoding: 'utf8' }).trim();
	} catch (error) {
		console.error(`❌ Failed to ${description}:`, error);
		process.exit(1);
	}
}

function checkBaselineExists(): void {
	const volumes = executeCommand('docker volume ls --format "{{.Name}}"', 'list volumes');
	if (!volumes.split('\n').includes(E2E_BASELINE_VOLUME)) {
		console.error(`❌ Baseline snapshot not found: ${E2E_BASELINE_VOLUME}`);
		console.log('💡 Run "bun e2e:setup" to create the baseline snapshot');
		process.exit(1);
	}
}

function stopE2EContainer(): void {
	console.log('🛑 Stopping E2E PostgreSQL container...');
	executeCommand(`docker stop ${E2E_CONTAINER}`, 'stop E2E PostgreSQL');
}

function startE2EContainer(): void {
	console.log('🚀 Starting E2E PostgreSQL container...');
	executeCommand(`docker start ${E2E_CONTAINER}`, 'start E2E PostgreSQL');
}

function restoreFromBaseline(): void {
	console.log(`🔄 Restoring from baseline snapshot...`);

	// Clear target volume and restore from baseline
	const restoreCommand = `docker run --rm -v ${E2E_BASELINE_VOLUME}:/source:ro -v ${E2E_VOLUME}:/target alpine sh -c "rm -rf /target/* /target/.[^.]* && cp -a /source/. /target/"`;
	executeCommand(restoreCommand, 'restore from baseline');

	console.log('✅ Database restored from baseline');
}

function main(): void {
	const startTime = Date.now();

	checkBaselineExists();
	stopE2EContainer();

	try {
		restoreFromBaseline();
	} finally {
		startE2EContainer();
	}

	const duration = ((Date.now() - startTime) / 1000).toFixed(2);
	console.log(`⏱️ Restore completed in ${duration}s`);
}

try {
	main();
} catch (error) {
	console.error('Restore failed:', error);
	process.exit(1);
}
