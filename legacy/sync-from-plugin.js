#!/usr/bin/env node
/**
 * Copies the plugin's front-end files into legacy/assets so the standalone
 * (non-WordPress) version always has exactly the same features.
 *
 * Run after changing the plugin:   node legacy/sync-from-plugin.js
 *
 * The plugin's assets/ folder is the single source of truth — edit files there,
 * never in legacy/assets (they are overwritten by this script).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const pluginAssets = path.resolve(__dirname, '..', 'assets');
const out = path.resolve(__dirname, 'assets');

const files = [
	'js/fa11y-early.js',
	'js/fa11y-widget.js',
	'css/fa11y-features.css',
	'css/fa11y-widget.css',
	'fonts/OpenDyslexic-Regular.woff',
	'fonts/OpenDyslexic-Bold.woff',
	'fonts/LICENSE-OpenDyslexic.txt',
];

for (const rel of files) {
	const src = path.join(pluginAssets, rel);
	const dest = path.join(out, rel);
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	fs.copyFileSync(src, dest);
	console.log('copied', rel);
}
console.log('\nStandalone files are up to date in', out);
