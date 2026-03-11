#!/usr/bin/env bun

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

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

function formatDate(timestamp: number): string {
	return new Date(timestamp * 1000).toLocaleString('en-US', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});
}

function getVolumeSize(volumeName: string): string {
	try {
		const sizeOutput = executeCommand(
			`docker run --rm -v ${volumeName}:/data alpine du -sh /data`,
			`get size of ${volumeName}`
		);
		return sizeOutput.split('\t')[0] || 'Unknown';
	} catch {
		return 'Unknown';
	}
}

function listSnapshots() {
	const volumes = executeCommand('docker volume ls --format "{{.Name}}"', 'list volumes');
	const allVolumes = volumes.split('\n').filter(Boolean);

	const baseSnapshot = allVolumes.find(v => v === BASE_VOLUME);
	const regularSnapshots = allVolumes
		.filter(volume => volume.startsWith(SNAPSHOT_PREFIX) && volume !== BASE_VOLUME)
		.map(volume => {
			const parts = volume.split('_');
			const timestampStr = parts[parts.length - 1] || '';
			const timestamp = parseInt(timestampStr);

			return {
				volume,
				timestamp: isNaN(timestamp) ? 0 : timestamp,
				name: isNaN(timestamp) ? parts.slice(2).join('_') || 'unknown' : `snapshot_${timestamp}`,
				isTimestamped: !isNaN(timestamp),
			};
		})
		.sort((a, b) => b.timestamp - a.timestamp);

	let lastPushSnapshot: string | null = null;
	if (existsSync(LAST_PUSH_FILE)) {
		try {
			lastPushSnapshot = readFileSync(LAST_PUSH_FILE, 'utf8').trim();
		} catch {
			// Ignore errors reading last push file
		}
	}

	console.log('📊 Database Snapshots:\n');

	// Show base snapshot first
	if (baseSnapshot) {
		const size = getVolumeSize(baseSnapshot);
		console.log(`🔒 base                    (${size})    PROTECTED BASELINE`);
	} else {
		console.log('🔒 base                    (missing)   💡 Create with: bun db:base');
	}

	if (regularSnapshots.length === 0) {
		console.log('\n📭 No regular snapshots found');
		console.log('💡 Create snapshots with: bun db:snapshot [name]');
		console.log('💡 Auto-create with: bun db:push:safe');
	} else {
		console.log('\n📸 Regular Snapshots:');

		const nameWidth = Math.max(...regularSnapshots.map(s => s.name.length), 15);

		regularSnapshots.forEach((snapshot, index) => {
			const size = getVolumeSize(snapshot.volume);
			let indicators = '';

			if (index === 0) indicators += ' ⭐';
			if (snapshot.volume === lastPushSnapshot) indicators += ' 🔄';

			const dateStr = snapshot.isTimestamped ? formatDate(snapshot.timestamp) : 'Custom';
			const sizeStr = `(${size})`.padEnd(10);

			console.log(`   ${snapshot.name.padEnd(nameWidth)} ${sizeStr} ${dateStr}${indicators}`);
		});

		console.log('\n🔄 = Can be undone with "bun db:undo"');
		console.log('⭐ = Latest snapshot');
	}

	console.log('\n💡 Commands:');
	console.log('  bun db:restore              - Restore latest snapshot');
	console.log('  bun db:restore base         - Restore baseline');
	console.log('  bun db:restore <name>       - Restore specific snapshot');
	console.log('  bun db:undo                 - Undo last push');
	console.log('  bun db:base                 - Create/update baseline');
	console.log('  bun db:snapshot [name]      - Create new snapshot');
}

listSnapshots();
