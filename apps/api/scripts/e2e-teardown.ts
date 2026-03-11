#!/usr/bin/env bun
/**
 * E2E Database Teardown Script
 *
 * Removes the E2E baseline snapshot volume.
 * Called at the end of E2E test suite to clean up resources.
 */
import { execSync } from 'child_process';

const E2E_BASELINE_VOLUME = 'e2e_snapshot_base';

function executeCommand(command: string, description: string): string {
	try {
		return execSync(command, { encoding: 'utf8' }).trim();
	} catch (error) {
		console.error(`❌ Failed to ${description}:`, error);
		process.exit(1);
	}
}

function removeBaselineSnapshot(): void {
	console.log('🧹 Removing E2E baseline snapshot...');

	const volumes = executeCommand('docker volume ls --format "{{.Name}}"', 'list volumes');

	if (!volumes.split('\n').includes(E2E_BASELINE_VOLUME)) {
		console.log('ℹ️ Baseline snapshot does not exist, nothing to remove');
		return;
	}

	executeCommand(`docker volume rm ${E2E_BASELINE_VOLUME}`, 'remove baseline snapshot');
	console.log('✅ Baseline snapshot removed');
}

function main(): void {
	console.log('🧪 E2E teardown...\n');
	removeBaselineSnapshot();
	console.log('\n✅ E2E teardown complete');
}

try {
	main();
} catch (error) {
	console.error('Teardown failed:', error);
	process.exit(1);
}
