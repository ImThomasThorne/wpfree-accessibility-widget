/*!
 * Free Accessibility — widget.
 * Builds the menu inside a Shadow DOM (isolated from theme CSS) and runs the
 * behaviours that need JavaScript (text scaling, reading aids, speech, etc.).
 * Preference -> <html> class mapping lives in fa11y-early.js (window.fa11yEarly).
 */
(function () {
	'use strict';

	var cfg = window.fa11yConfig || {};
	// Captured now: document.currentScript is only set while this file first runs.
	// Used to find the widget stylesheet when no cssUrl is configured (standalone use).
	var scriptSrc = document.currentScript && document.currentScript.src;
	var early = window.fa11yEarly;
	if (!early || !document.body || !('attachShadow' in Element.prototype)) return;

	/* ------------------------------------------------------------------ *
	 * Icons
	 * ------------------------------------------------------------------ */
	function svg(inner, extra) {
		return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (extra || 2) +
			'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + '</svg>';
	}
	var I = {
		text: svg('<path d="M4 7V5h16v2M9 19h6M12 5v14"/>'),
		pageZoom: svg('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>'),
		lineHeight: svg('<path d="M11 6h10M11 12h10M11 18h10M5 4v16M2.5 6.5 5 4l2.5 2.5M2.5 17.5 5 20l2.5-2.5"/>'),
		letterSpacing: svg('<path d="M3 16l3.5-10L10 16M4.2 12.5h4.6M14 6h3.5a2.5 2.5 0 0 1 0 5H14zM14 11h4a2.5 2.5 0 0 1 0 5h-4zM2 20h20"/>'),
		textAlign: svg('<path d="M3 6h18M3 10h12M3 14h18M3 18h12"/>'),
		readableFont: svg('<path d="M3 19l5-14 5 14M4.8 14h6.4"/><circle cx="18" cy="15.5" r="3"/><path d="M21 12.5V19"/>'),
		dyslexiaFont: svg('<path d="M3 5h4a7 7 0 0 1 0 14H3z"/><path d="M16 19V9a3 3 0 0 1 3-3h1M13.5 12H20"/>'),
		boldText: svg('<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>', 2.6),
		highlightLinks: svg('<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'),
		highlightTitles: svg('<path d="M6 4v16M18 4v16M6 12h12"/>'),
		magnifier: svg('<circle cx="10" cy="10" r="7"/><path d="M21 21l-6-6M7.5 12.5l2.5-6 2.5 6M8.3 11h3.4"/>'),
		contrast: svg('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'),
		saturation: svg('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M12 20a6 6 0 0 0 6-6" />'),
		palette: svg('<path d="M12 3a9 9 0 0 0 0 18c1.2 0 2-.8 2-2 0-.6-.2-1-.6-1.4-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4.2-4-7.5-9-7.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>'),
		readAloud: svg('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'),
		pageStructure: svg('<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-2h12v2"/>'),
		readingGuide: svg('<rect x="2" y="10" width="20" height="4" rx="1"/><path d="M4 5h16M4 19h16"/>'),
		readingMask: svg('<rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 9h20M2 15h20"/>'),
		stopAnimations: svg('<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>'),
		muteSounds: svg('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>'),
		hideImages: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21M2 2l20 20"/>'),
		cursor: svg('<path d="m4 3 7 18 2.5-7.5L21 11z"/>'),
		highlightHover: svg('<path d="M9 11V5a2 2 0 0 1 4 0v5"/><path d="M13 10a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v4a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.6-2.8L4.5 16a2 2 0 0 1 3-2.6L9 15"/>'),
		highlightFocus: svg('<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><circle cx="12" cy="12" r="3"/>'),
		seizure: svg('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
		vision: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
		adhd: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
		cognitive: svg('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>'),
		motor: svg('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'),
		dyslexia: svg('<path d="M2 5h7a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5H2zM22 5h-7a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5H22z"/>'),
		dark: svg('<path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z"/>'),
		close: svg('<path d="M6 6l12 12M18 6 6 18"/>', 2.5),
		reset: svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
		check: svg('<path d="m5 12 5 5 9-10"/>', 3),
		chevron: svg('<path d="m6 9 6 6 6-6"/>'),
		back: svg('<path d="m15 6-6 6 6 6"/>', 2.5)
	};

	/* Trigger button icons — mirror of FA11Y_Settings::trigger_icons() in PHP,
	 * so the standalone version can pick one with `icon: 'eye'` etc. */
	var TRIGGER_ICONS = {
		access: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm0 2a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 1.75a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5ZM6.6 8.6a.9.9 0 0 0-.2 1.78c1.3.3 2.6.52 3.85.62v2.2l-1.6 5.05a.9.9 0 0 0 1.71.55L11.8 14h.4l1.44 4.8a.9.9 0 0 0 1.71-.55L13.75 13.2V11c1.25-.1 2.55-.32 3.85-.62a.9.9 0 0 0-.4-1.76c-1.7.4-3.45.62-5.2.62s-3.5-.22-5.2-.62a.9.9 0 0 0-.2-.02Z"/></svg>',
		person: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle fill="currentColor" cx="12" cy="4.5" r="2.5"/><path fill="currentColor" d="M12 8c-4 0-7 1-7 1v2.5l4 .5v9h2v-5h2v5h2v-9l4-.5V9s-3-1-7-1z"/></svg>',
		eye: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 5C6.5 5 2.3 8.6 1 12c1.3 3.4 5.5 7 11 7s9.7-3.6 11-7c-1.3-3.4-5.5-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>',
		settings: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3 6h9.2a3 3 0 0 1 5.6 0H21v2h-3.2a3 3 0 0 1-5.6 0H3V6Zm12 2a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM3 16h3.2a3 3 0 0 1 5.6 0H21v2h-9.2a3 3 0 0 1-5.6 0H3v-2Zm6 2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/></svg>'
	};

	/* ------------------------------------------------------------------ *
	 * Feature registry (IDs must match includes/class-fa11y-settings.php)
	 * ------------------------------------------------------------------ */
	var FONT_LEVELS = [1, 1.1, 1.2, 1.35, 1.5, 1.75, 2];

	var FEATURES = [
		{ id: 'fontScale', group: 'content', type: 'stepper', label: 'Text Size' },
		{ id: 'pageZoom', group: 'content', type: 'cycle', label: 'Page Zoom', levels: ['110%', '125%', '150%'] },
		{ id: 'lineHeight', group: 'content', type: 'cycle', label: 'Line Height', levels: ['1.5×', '1.75×', '2×'] },
		{ id: 'letterSpacing', group: 'content', type: 'cycle', label: 'Text Spacing', levels: ['Small', 'Medium', 'Large'] },
		{ id: 'textAlign', group: 'content', type: 'cycle', label: 'Align Text', levels: ['Left', 'Centre', 'Right'] },
		{ id: 'readableFont', group: 'content', type: 'toggle', label: 'Readable Font', excludes: ['dyslexiaFont'] },
		{ id: 'dyslexiaFont', group: 'content', type: 'toggle', label: 'Dyslexia Font', excludes: ['readableFont'] },
		{ id: 'boldText', group: 'content', type: 'toggle', label: 'Bold Text' },
		{ id: 'highlightLinks', group: 'content', type: 'toggle', label: 'Highlight Links' },
		{ id: 'highlightTitles', group: 'content', type: 'toggle', label: 'Highlight Headings' },
		{ id: 'magnifier', group: 'content', type: 'toggle', label: 'Text Magnifier', hint: 'Hover over or focus text to see it enlarged.' },

		{ id: 'contrast', group: 'colour', type: 'cycle', label: 'Contrast', levels: ['Dark', 'Light', 'High', 'Inverted'], excludes: ['darkMode'] },
		{ id: 'saturation', group: 'colour', type: 'cycle', label: 'Saturation', levels: ['Low', 'High', 'Monochrome'] },
		{ id: 'customColors', group: 'colour', type: 'colours', label: 'Custom Colours' },

		{ id: 'readAloud', group: 'navigation', type: 'toggle', label: 'Read Aloud', hint: 'Select any text on the page to hear it read aloud. Press Escape to stop.' },
		{ id: 'pageStructure', group: 'navigation', type: 'action', label: 'Page Structure' },
		{ id: 'readingGuide', group: 'navigation', type: 'toggle', label: 'Reading Guide' },
		{ id: 'readingMask', group: 'navigation', type: 'toggle', label: 'Reading Mask' },
		{ id: 'stopAnimations', group: 'navigation', type: 'toggle', label: 'Stop Animations' },
		{ id: 'muteSounds', group: 'navigation', type: 'toggle', label: 'Mute Sounds' },
		{ id: 'hideImages', group: 'navigation', type: 'toggle', label: 'Hide Images' },
		{ id: 'cursor', group: 'navigation', type: 'cycle', label: 'Big Cursor', levels: ['Black', 'White'] },
		{ id: 'highlightHover', group: 'navigation', type: 'toggle', label: 'Highlight Hover' },
		{ id: 'highlightFocus', group: 'navigation', type: 'toggle', label: 'Highlight Focus' },

		// Profile-only setting (no tile of its own). Swaps neutral colours only; see startDarkMode().
		{ id: 'darkMode', group: 'profile-only', type: 'toggle', label: 'Dark Mode', excludes: ['contrast', 'textColor', 'titleColor', 'bgColor'] }
	];

	var GROUPS = [
		{ id: 'content', label: 'Content adjustments' },
		{ id: 'colour', label: 'Colour adjustments' },
		{ id: 'navigation', label: 'Orientation & navigation' }
	];

	var PROFILES = [
		{ id: 'seizure', label: 'Seizure Safe', desc: 'Stops motion, softens colours', prefs: { stopAnimations: true, saturation: 1 } },
		{ id: 'vision', label: 'Vision Impaired', desc: 'Larger text, more contrast', prefs: { fontScale: 3, contrast: 3, readableFont: true, highlightLinks: true, highlightTitles: true, cursor: 1 } },
		{ id: 'adhd', label: 'ADHD Friendly', desc: 'Reading mask, fewer distractions', prefs: { readingMask: true, stopAnimations: true, saturation: 1 } },
		{ id: 'cognitive', label: 'Cognitive & Learning', desc: 'Clearer text, reading aids', prefs: { readableFont: true, highlightTitles: true, highlightLinks: true, readingGuide: true, stopAnimations: true } },
		{ id: 'motor', label: 'Motor Impaired', desc: 'Big cursor, strong focus', prefs: { cursor: 1, highlightFocus: true, highlightHover: true, stopAnimations: true } },
		{ id: 'dyslexia', label: 'Dyslexia Friendly', desc: 'Dyslexia font and spacing', prefs: { dyslexiaFont: true, letterSpacing: 1, lineHeight: 2 } },
		// Uses the "Inverted" contrast mode: swaps light and dark, keeps hues, leaves photos and video untouched.
		{ id: 'dark', label: 'Dark Mode', desc: 'Swaps black and white, keeps brand colours', prefs: { darkMode: true } }
	];

	var SWATCHES = [
		['#000000', 'Black'], ['#FFFFFF', 'White'], ['#0B3A66', 'Navy'], ['#1565C0', 'Blue'],
		['#1B5E20', 'Green'], ['#B71C1C', 'Red'], ['#4A148C', 'Purple'], ['#F5E6C8', 'Cream'], ['#FFEB3B', 'Yellow']
	];
	var COLOUR_GROUPS = [
		{ key: 'textColor', label: 'Text colour' },
		{ key: 'titleColor', label: 'Heading colour' },
		{ key: 'bgColor', label: 'Background colour' }
	];

	var HEX = /^#[0-9a-f]{6}$/i;
	var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, BR: 1, HR: 1, IMG: 1, VIDEO: 1, AUDIO: 1, CANVAS: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, SOURCE: 1, TRACK: 1, PICTURE: 1, LINK: 1, META: 1 };
	var FORM_TAGS = { INPUT: 1, SELECT: 1, TEXTAREA: 1, BUTTON: 1 };
	var READ_SEL = 'p, li, h1, h2, h3, h4, h5, h6, a, button, label, td, th, blockquote, figcaption, dt, dd, summary, caption, legend, q, cite';
	var FOCUSABLE = 'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]';

	var hasSpeech = 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';

	/* ------------------------------------------------------------------ *
	 * Helpers
	 * ------------------------------------------------------------------ */
	function esc(s) {
		return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
		});
	}
	function inUI(node) {
		// The widget, its overlays and the WordPress admin bar are never altered.
		return !!(node && node.nodeType === 1 && node.closest('.fa11y-ui, #wpadminbar'));
	}
	function hasOwnText(el) {
		for (var n = el.firstChild; n; n = n.nextSibling) {
			if (n.nodeType === 3 && n.nodeValue.trim()) return true;
		}
		return false;
	}
	function textOf(el, max) {
		var t = '';
		if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
			t = el.value || el.placeholder || el.getAttribute('aria-label') || '';
		} else if (el.tagName === 'SELECT') {
			t = el.selectedOptions && el.selectedOptions[0] ? el.selectedOptions[0].text : '';
		} else {
			t = el.innerText || el.textContent || '';
			if (!t.trim()) t = el.getAttribute('aria-label') || el.getAttribute('title') || '';
		}
		t = t.replace(/\s+/g, ' ').trim();
		return max && t.length > max ? t.slice(0, max - 1) + '…' : t;
	}
	function textHost(t) {
		var el = t;
		for (var i = 0; el && el !== document.body && i < 6; i++, el = el.parentElement) {
			if (FORM_TAGS[el.tagName] || hasOwnText(el)) return el;
		}
		return null;
	}
	function isVisible(el) {
		if (el.checkVisibility) return el.checkVisibility({ visibilityProperty: true });
		return el.getClientRects().length > 0;
	}
	function luminance(hex) {
		var c = [1, 3, 5].map(function (i) {
			var v = parseInt(hex.substr(i, 2), 16) / 255;
			return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
	}
	function el(tag, cls, attrs) {
		var e = document.createElement(tag);
		if (cls) e.className = cls;
		if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
		return e;
	}
	function prefersReducedMotion() {
		return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	/* ------------------------------------------------------------------ *
	 * Widget
	 * ------------------------------------------------------------------ */
	function Widget() {
		var enabledIds = cfg.features || FEATURES.map(function (f) { return f.id; });
		var enabledProfiles = cfg.profiles || PROFILES.map(function (p) { return p.id; });
		this.features = FEATURES.filter(function (f) {
			// Dark mode is switched on/off with its profile rather than in the feature list.
			if (f.id === 'darkMode') return enabledProfiles.indexOf('dark') !== -1;
			if (enabledIds.indexOf(f.id) === -1) return false;
			if (f.id === 'readAloud' && !hasSpeech) return false;
			return true;
		});
		this.featureMap = {};
		this.features.forEach(function (f) { this.featureMap[f.id] = f; }, this);

		var self = this;
		this.profiles = PROFILES.filter(function (p) { return enabledProfiles.indexOf(p.id) !== -1; })
			.map(function (p) {
				// Drop profile settings for features the site owner disabled.
				var prefs = {};
				Object.keys(p.prefs).forEach(function (k) { if (self.featureMap[k]) prefs[k] = p.prefs[k]; });
				return { id: p.id, label: p.label, desc: p.desc, prefs: prefs };
			})
			.filter(function (p) { return Object.keys(p.prefs).length > 0; });

		this.isOpen = false;
		this.cleanups = {};
		this.mutationHooks = {};
		this.appliedFactor = 1;
		this.prefs = this.sanitize(early.initial);

		this.build();
		this.bind();
		this.commit(false);
	}

	Widget.prototype.sanitize = function (raw) {
		var out = {};
		raw = raw || {};
		this.features.forEach(function (f) {
			var v = raw[f.id];
			if (f.type === 'toggle' && v === true) out[f.id] = true;
			if (f.type === 'cycle' && typeof v === 'number' && v >= 1 && v <= f.levels.length && v % 1 === 0) out[f.id] = v;
			if (f.type === 'stepper' && typeof v === 'number' && v >= 1 && v < FONT_LEVELS.length && v % 1 === 0) out[f.id] = v;
			if (f.type === 'colours') {
				COLOUR_GROUPS.forEach(function (g) { if (typeof raw[g.key] === 'string' && HEX.test(raw[g.key])) out[g.key] = raw[g.key].toUpperCase(); });
			}
		});
		if (typeof raw.profile === 'string' && this.profiles.some(function (p) { return p.id === raw.profile; })) {
			out.profile = raw.profile;
		}
		return out;
	};

	/* ---------- Build ---------- */

	Widget.prototype.build = function () {
		var host = el('div', 'fa11y-ui', { id: 'fa11y-root' });
		var hs = host.style;
		[['position', 'fixed'], ['inset', '0'], ['top', '0'], ['left', '0'], ['width', '100%'], ['height', '100%'], ['pointer-events', 'none'],
			['z-index', '2147483000'], ['display', 'block'], ['margin', '0'], ['padding', '0'], ['border', '0'],
			['background', 'transparent'], ['visibility', 'hidden'], ['transform', 'none'], ['zoom', '1'], ['filter', 'none'], ['cursor', 'default']
		].forEach(function (p) { hs.setProperty(p[0], p[1], 'important'); });

		var shadow = host.attachShadow({ mode: 'open' });
		this.host = host;
		this.shadow = shadow;

		var cssUrl = cfg.cssUrl;
		if (!cssUrl && scriptSrc) {
			try { cssUrl = new URL('../css/fa11y-widget.css', scriptSrc).href; } catch (e) { cssUrl = ''; }
		}
		var link = el('link', '', { rel: 'stylesheet', href: cssUrl || '' });
		var reveal = function () { hs.setProperty('visibility', 'visible', 'important'); };
		link.addEventListener('load', reveal);
		link.addEventListener('error', reveal);
		shadow.appendChild(link);

		var c = cfg.colors || {};
		var root = el('div', 'fa11y', {
			lang: 'en',
			'data-position': cfg.position || 'bottom-right',
			'data-theme': cfg.panelTheme || 'light',
			'data-shape': cfg.shape || 'circle'
		});
		if (cfg.hideMobile) root.classList.add('hide-mobile');
		if (cfg.hideDesktop) root.classList.add('hide-desktop');
		var vars = {
			'--size': (cfg.iconSize || 56) + 'px',
			'--ox': (cfg.offsetX != null ? cfg.offsetX : 20) + 'px',
			'--oy': (cfg.offsetY != null ? cfg.offsetY : 20) + 'px'
		};
		if (c.buttonBg) vars['--btn-bg'] = c.buttonBg;
		if (c.buttonFg) vars['--btn-fg'] = c.buttonFg;
		if (c.accent) vars['--accent'] = c.accent;
		var accentFg = c.accentFg;
		if (!accentFg && c.accent && HEX.test(c.accent)) {
			// Black or white, whichever has more contrast (WCAG formula).
			var L = luminance(c.accent);
			accentFg = (L + 0.05) / 0.05 >= 1.05 / (L + 0.05) ? '#000000' : '#FFFFFF';
		}
		if (accentFg) vars['--accent-fg'] = accentFg;
		Object.keys(vars).forEach(function (k) { root.style.setProperty(k, vars[k]); });
		this.root = root;

		var title = cfg.title || 'Accessibility Menu';

		// Trigger
		var trigger = el('button', 'trigger', {
			type: 'button',
			'aria-label': title,
			'aria-expanded': 'false',
			'aria-controls': 'fa11y-panel',
			'aria-haspopup': 'dialog'
		});
		trigger.innerHTML = cfg.iconSvg || TRIGGER_ICONS[cfg.icon] || TRIGGER_ICONS.access;
		this.trigger = trigger;

		// Panel
		var panel = el('div', 'panel', { id: 'fa11y-panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'fa11y-title' });
		panel.innerHTML =
			'<div class="header">' +
				'<h2 id="fa11y-title">' + esc(title) + '</h2>' +
				'<button type="button" class="icon-btn" data-act="close" aria-label="Close ' + esc(title) + '">' + I.close + '</button>' +
			'</div>' +
			'<div class="body" data-view="main">' + this.mainHTML() + '</div>' +
			'<div class="structure" data-view="structure" hidden>' + this.structureHTML() + '</div>' +
			'<div class="footer">' +
				'<button type="button" class="reset" data-act="reset">' + I.reset + '<span>Reset all settings</span></button>' +
				(cfg.statementUrl ? '<a href="' + esc(cfg.statementUrl) + '">' + esc(cfg.statementText || 'Accessibility statement') + '</a>' : '') +
				(cfg.shortcut !== false ? '<p class="hint">Tip: press <kbd>Alt</kbd> + <kbd>A</kbd> to open or close this menu.</p>' : '') +
			'</div>';
		this.panel = panel;

		// Status messages (outside the panel so they're announced even when it's closed)
		this.live = el('div', 'sr-only', { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });

		root.appendChild(trigger);
		root.appendChild(panel);
		root.appendChild(this.live);
		shadow.appendChild(root);
		document.body.appendChild(host);

		this.mainView = panel.querySelector('[data-view="main"]');
		this.structView = panel.querySelector('[data-view="structure"]');
	};

	Widget.prototype.tileHTML = function (f) {
		var levelHTML = '';
		if (f.type === 'cycle') {
			var dots = '';
			for (var i = 0; i < f.levels.length; i++) dots += '<span></span>';
			levelHTML = '<span class="tile-level">Off</span><span class="dots" aria-hidden="true">' + dots + '</span>';
		}
		var pressed = f.type === 'action' ? '' : ' aria-pressed="false"';
		var desc = f.hint ? ' aria-describedby="fa11y-hint-' + f.id + '"' : '';
		return '<button type="button" class="tile" data-feature="' + f.id + '"' + pressed + desc + '>' +
			'<span class="tile-check" aria-hidden="true">' + I.check + '</span>' +
			'<span class="tile-icon" aria-hidden="true">' + (I[f.id] || '') + '</span>' +
			'<span class="tile-label">' + esc(f.label) + '</span>' + levelHTML +
			(f.hint ? '<span class="sr-only" id="fa11y-hint-' + f.id + '">' + esc(f.hint) + '</span>' : '') +
			'</button>';
	};

	Widget.prototype.mainHTML = function () {
		var self = this;
		var html = '';

		if (this.profiles.length) {
			html += '<section class="section" aria-labelledby="fa11y-h-profiles"><h3 id="fa11y-h-profiles">Accessibility profiles</h3><div class="grid">';
			this.profiles.forEach(function (p) {
				html += '<button type="button" class="tile profile" data-profile="' + p.id + '" aria-pressed="false" aria-describedby="fa11y-pd-' + p.id + '">' +
					'<span class="tile-check" aria-hidden="true">' + I.check + '</span>' +
					'<span class="tile-icon" aria-hidden="true">' + I[p.id] + '</span>' +
					'<span class="tile-label">' + esc(p.label) + '</span>' +
					'<span class="tile-desc" id="fa11y-pd-' + p.id + '">' + esc(p.desc) + '</span></button>';
			});
			html += '</div></section>';
		}

		GROUPS.forEach(function (g) {
			var items = self.features.filter(function (f) { return f.group === g.id; });
			if (!items.length) return;
			html += '<section class="section" aria-labelledby="fa11y-h-' + g.id + '"><h3 id="fa11y-h-' + g.id + '">' + esc(g.label) + '</h3>';

			items.filter(function (f) { return f.type === 'stepper'; }).forEach(function () {
				html += '<div class="stepper" role="group" aria-labelledby="fa11y-ts-label">' +
					'<span class="stepper-label">' + I.text + '<span id="fa11y-ts-label">Text Size</span></span>' +
					'<span class="stepper-controls">' +
						'<button type="button" class="stepper-btn" data-step="-1" aria-label="Decrease text size">&minus;</button>' +
						'<span class="stepper-value" data-ts-value>100%</span>' +
						'<button type="button" class="stepper-btn" data-step="1" aria-label="Increase text size">+</button>' +
					'</span></div>';
			});

			var tiles = items.filter(function (f) { return f.type === 'toggle' || f.type === 'cycle' || f.type === 'action'; });
			if (tiles.length) {
				html += '<div class="grid">';
				tiles.forEach(function (f) { html += self.tileHTML(f); });
				html += '</div>';
			}

			if (items.some(function (f) { return f.type === 'colours'; })) {
				html += '<button type="button" class="disclosure" aria-expanded="false" aria-controls="fa11y-colours">' +
					'<span style="display:flex;align-items:center;gap:10px">' + I.palette + 'Custom colours</span>' + I.chevron + '</button>' +
					'<div class="colour-panel" id="fa11y-colours" hidden>';
				COLOUR_GROUPS.forEach(function (cg) {
					html += '<fieldset class="colour-group"><legend>' + esc(cg.label) + '</legend><div class="swatches">' +
						'<button type="button" class="swatch swatch-default" data-colour-key="' + cg.key + '" data-colour="" aria-pressed="true">Default</button>';
					SWATCHES.forEach(function (s) {
						var tick = luminance(s[0]) > 0.4 ? '#000' : '#fff';
						html += '<button type="button" class="swatch" data-colour-key="' + cg.key + '" data-colour="' + s[0] + '" aria-pressed="false" aria-label="' + esc(s[1]) + '" style="background:' + s[0] + ';color:' + tick + '">' +
							'<span class="swatch-tick" aria-hidden="true">' + I.check + '</span></button>';
					});
					html += '</div></fieldset>';
				});
				html += '</div>';
			}
			html += '</section>';
		});
		return html;
	};

	Widget.prototype.structureHTML = function () {
		var tabs = [['headings', 'Headings'], ['landmarks', 'Landmarks'], ['links', 'Links']];
		var html = '<div class="structure-top">' +
			'<button type="button" class="back" data-act="back">' + I.back + '<span>Back</span></button>' +
			'<h3 id="fa11y-struct-title">Page structure</h3></div>' +
			'<div class="tablist" role="tablist" aria-labelledby="fa11y-struct-title">';
		tabs.forEach(function (t, i) {
			html += '<button type="button" class="tab" role="tab" id="fa11y-tab-' + t[0] + '" data-tab="' + t[0] + '" aria-controls="fa11y-tp-' + t[0] + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + t[1] + '</button>';
		});
		html += '</div>';
		tabs.forEach(function (t, i) {
			html += '<div class="tabpanel" role="tabpanel" id="fa11y-tp-' + t[0] + '" aria-labelledby="fa11y-tab-' + t[0] + '"' + (i === 0 ? '' : ' hidden') + '></div>';
		});
		return html;
	};

	/* ---------- Events ---------- */

	Widget.prototype.bind = function () {
		var self = this;

		this.trigger.addEventListener('click', function () { self.isOpen ? self.close() : self.open(); });

		this.panel.addEventListener('click', function (e) {
			var t = e.target.closest('button');
			if (!t || !self.panel.contains(t)) return;
			if (t.dataset.act === 'close') return self.close();
			if (t.dataset.act === 'reset') return self.reset();
			if (t.dataset.act === 'back') return self.showMain(true);
			if (t.dataset.step) return self.step(parseInt(t.dataset.step, 10), t);
			if (t.dataset.profile) return self.toggleProfile(t.dataset.profile);
			if (t.dataset.tab) return self.selectTab(t.dataset.tab, false);
			if (t.classList.contains('disclosure')) return self.toggleDisclosure(t);
			if (t.dataset.colourKey) return self.setColour(t.dataset.colourKey, t.dataset.colour);
			if (t.dataset.feature) return self.activateFeature(t.dataset.feature);
		});

		this.panel.addEventListener('keydown', function (e) {
			if (e.key === 'Tab') self.trapFocus(e);
			if (e.target.getAttribute && e.target.getAttribute('role') === 'tab') self.tabKeys(e);
		});

		document.addEventListener('click', function (e) {
			if (self.isOpen && e.composedPath().indexOf(self.host) === -1) self.close(false);
		});

		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' || e.key === 'Esc') {
				if (self.isOpen) {
					e.preventDefault();
					self.close();
				} else if (self.speaking) {
					self.stopSpeaking();
				}
				if (self.magnifierTip) self.magnifierTip.hidden = true;
			}
			if (cfg.shortcut !== false && e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.code === 'KeyA') {
				e.preventDefault();
				self.isOpen ? self.close() : self.open();
			}
		});

		// Re-apply JS-driven features to content added after load (sliders, AJAX, infinite scroll...).
		if (window.MutationObserver) {
			var timer = null;
			this.observer = new MutationObserver(function (muts) {
				var relevant = muts.some(function (m) {
					for (var i = 0; i < m.addedNodes.length; i++) {
						var n = m.addedNodes[i];
						if (n.nodeType === 1 && !inUI(n)) return true;
						if (n.nodeType === 3 && !inUI(m.target)) return true;
					}
					return false;
				});
				if (!relevant) return;
				clearTimeout(timer);
				timer = setTimeout(function () {
					if (self.prefs.fontScale) self.scaleText();
					Object.keys(self.mutationHooks).forEach(function (k) { self.mutationHooks[k](); });
				}, 300);
			});
			this.observer.observe(document.body, { childList: true, subtree: true, characterData: false });
		}
	};

	Widget.prototype.open = function () {
		this.isOpen = true;
		this.panel.classList.add('is-open');
		this.trigger.setAttribute('aria-expanded', 'true');
		var self = this;
		// Wait until the panel is visible before moving focus into it.
		requestAnimationFrame(function () {
			var btn = self.panel.querySelector('[data-act="close"]');
			if (btn) btn.focus();
		});
	};

	Widget.prototype.close = function (restoreFocus) {
		if (!this.isOpen) return;
		this.isOpen = false;
		this.panel.classList.remove('is-open');
		this.trigger.setAttribute('aria-expanded', 'false');
		if (!this.structView.hidden) this.showMain(false);
		if (restoreFocus !== false) this.trigger.focus();
	};

	Widget.prototype.focusables = function () {
		return Array.prototype.filter.call(
			this.panel.querySelectorAll('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])'),
			function (n) { return n.offsetParent !== null || n.getClientRects().length > 0; }
		);
	};

	Widget.prototype.trapFocus = function (e) {
		var list = this.focusables();
		if (!list.length) return;
		var first = list[0];
		var last = list[list.length - 1];
		var active = this.shadow.activeElement;
		if (e.shiftKey && (active === first || list.indexOf(active) === -1)) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && (active === last || list.indexOf(active) === -1)) {
			e.preventDefault();
			first.focus();
		}
	};

	Widget.prototype.announce = function (msg) {
		var live = this.live;
		live.textContent = '';
		clearTimeout(this.announceTimer);
		this.announceTimer = setTimeout(function () { live.textContent = msg; }, 60);
	};

	/* ---------- State changes ---------- */

	Widget.prototype.levelText = function (f) {
		var v = this.prefs[f.id] || 0;
		return v ? f.levels[v - 1] : 'Off';
	};

	Widget.prototype.activateFeature = function (id) {
		var f = this.featureMap[id];
		if (!f) return;
		if (f.type === 'action') {
			if (id === 'pageStructure') this.showStructure();
			return;
		}
		if (f.type === 'toggle') {
			var on = !this.prefs[id];
			this.set(id, on);
			this.announce(f.label + (on ? ' on' : ' off') + (on && f.hint ? '. ' + f.hint : ''));
		} else if (f.type === 'cycle') {
			var next = ((this.prefs[id] || 0) + 1) % (f.levels.length + 1);
			this.set(id, next);
			this.announce(f.label + ': ' + this.levelText(f));
		}
		this.commit(true);
	};

	Widget.prototype.set = function (id, value) {
		var f = this.featureMap[id];
		if (value) this.prefs[id] = value; else delete this.prefs[id];
		if (value && f && f.excludes) {
			f.excludes.forEach(function (x) {
				if (!this.prefs[x]) return;
				delete this.prefs[x];
				// If that setting belonged to the active profile, the profile is no longer on.
				var active = this.profiles.filter(function (pr) { return pr.id === this.prefs.profile; }, this)[0];
				if (active && x in active.prefs) delete this.prefs.profile;
			}, this);
		}
	};

	Widget.prototype.step = function (dir, btn) {
		if (btn.getAttribute('aria-disabled') === 'true') return;
		var v = Math.max(0, Math.min(FONT_LEVELS.length - 1, (this.prefs.fontScale || 0) + dir));
		this.set('fontScale', v);
		this.commit(true);
		this.announce('Text size ' + Math.round(FONT_LEVELS[v] * 100) + '%');
	};

	Widget.prototype.setColour = function (key, value) {
		this.set(key, value || '');
		if (value && this.prefs.darkMode) {
			// Custom colours and dark mode would fight each other; the latest choice wins.
			delete this.prefs.darkMode;
			if (this.prefs.profile === 'dark') delete this.prefs.profile;
		}
		this.commit(true);
		var g = COLOUR_GROUPS.filter(function (x) { return x.key === key; })[0];
		var name = 'default';
		SWATCHES.forEach(function (s) { if (s[0] === value) name = s[1]; });
		this.announce(g.label + ': ' + name);
	};

	Widget.prototype.toggleProfile = function (id) {
		var p = this.profiles.filter(function (x) { return x.id === id; })[0];
		if (!p) return;
		var self = this;
		var undo = function (profile) {
			Object.keys(profile.prefs).forEach(function (k) { delete self.prefs[k]; });
		};
		if (this.prefs.profile === id) {
			undo(p);
			delete this.prefs.profile;
			this.announce(p.label + ' profile off');
		} else {
			if (this.prefs.profile) {
				var prev = this.profiles.filter(function (x) { return x.id === self.prefs.profile; })[0];
				if (prev) undo(prev);
			}
			Object.keys(p.prefs).forEach(function (k) { self.set(k, p.prefs[k]); });
			this.prefs.profile = id;
			this.announce(p.label + ' profile on');
		}
		this.commit(true);
	};

	Widget.prototype.toggleDisclosure = function (btn) {
		var region = this.shadow.getElementById(btn.getAttribute('aria-controls'));
		var open = btn.getAttribute('aria-expanded') !== 'true';
		btn.setAttribute('aria-expanded', String(open));
		region.hidden = !open;
	};

	Widget.prototype.reset = function () {
		this.prefs = {};
		this.commit(true);
		this.announce('All accessibility settings have been reset');
	};

	/**
	 * Apply current prefs to the page.
	 * @param {boolean} persist Save to storage (false on initial load).
	 */
	Widget.prototype.commit = function (persist) {
		early.apply(this.prefs);
		this.scaleText();
		this.syncBehaviours();
		if (persist) early.write(this.prefs);
		this.root.classList.toggle('no-motion', !!this.prefs.stopAnimations);
		this.updateUI();
	};

	Widget.prototype.updateUI = function () {
		var self = this;
		var p = this.prefs;

		this.panel.querySelectorAll('.tile[data-feature]').forEach(function (t) {
			var f = self.featureMap[t.dataset.feature];
			if (!f || f.type === 'action') return;
			var v = p[f.id] || 0;
			t.setAttribute('aria-pressed', String(!!v));
			if (f.type === 'cycle') {
				t.querySelector('.tile-level').textContent = self.levelText(f);
				t.querySelectorAll('.dots span').forEach(function (d, i) { d.classList.toggle('on', i < v); });
			}
		});

		this.panel.querySelectorAll('.tile[data-profile]').forEach(function (t) {
			t.setAttribute('aria-pressed', String(p.profile === t.dataset.profile));
		});

		var tsVal = this.panel.querySelector('[data-ts-value]');
		if (tsVal) {
			var lvl = p.fontScale || 0;
			tsVal.textContent = Math.round(FONT_LEVELS[lvl] * 100) + '%';
			this.panel.querySelector('[data-step="-1"]').setAttribute('aria-disabled', String(lvl === 0));
			this.panel.querySelector('[data-step="1"]').setAttribute('aria-disabled', String(lvl === FONT_LEVELS.length - 1));
		}

		this.panel.querySelectorAll('.swatch').forEach(function (s) {
			var cur = p[s.dataset.colourKey] || '';
			s.setAttribute('aria-pressed', String(cur.toUpperCase() === (s.dataset.colour || '').toUpperCase()));
		});
	};

	/* ------------------------------------------------------------------ *
	 * Text scaling — works with px-based themes, not just rem/em.
	 * Each text element's original computed size is stored once, then set
	 * to original × factor, so nested elements never compound.
	 * ------------------------------------------------------------------ */
	Widget.prototype.originalSize = function (node) {
		var computed = parseFloat(getComputedStyle(node).fontSize) || 16;
		if (this.appliedFactor !== 1 && node.parentElement && node.parentElement.closest('[data-fa11y-fs]')) {
			// Added after scaling, inside scaled content: undo the inherited scale.
			return computed / this.appliedFactor;
		}
		return computed;
	};

	Widget.prototype.scaleText = function () {
		var factor = FONT_LEVELS[this.prefs.fontScale || 0] || 1;
		if (factor === 1 && this.appliedFactor === 1) return;

		var all = document.body.getElementsByTagName('*');
		var targets = [];
		for (var i = 0; i < all.length; i++) {
			var n = all[i];
			if (SKIP_TAGS[n.tagName] || n.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue;
			if (n.id === 'fa11y-root' || n.classList.contains('fa11y-ui')) continue;
			if (n.dataset.fa11yFs === undefined && !(FORM_TAGS[n.tagName] || hasOwnText(n))) continue;
			if (inUI(n)) continue;
			targets.push(n);
		}

		// Pass 1: record originals before changing anything.
		var self = this;
		if (factor !== 1) {
			targets.forEach(function (t) {
				if (t.dataset.fa11yFs !== undefined) return;
				t.dataset.fa11yFsInline = t.style.getPropertyValue('font-size') + '|' + t.style.getPropertyPriority('font-size');
				t.dataset.fa11yFs = String(self.originalSize(t));
			});
		}

		// Pass 2: apply or restore.
		targets.forEach(function (t) {
			if (t.dataset.fa11yFs === undefined) return;
			if (factor === 1) {
				var parts = (t.dataset.fa11yFsInline || '|').split('|');
				t.style.removeProperty('font-size');
				if (parts[0]) t.style.setProperty('font-size', parts[0], parts[1] || '');
				delete t.dataset.fa11yFs;
				delete t.dataset.fa11yFsInline;
			} else {
				t.style.setProperty('font-size', (parseFloat(t.dataset.fa11yFs) * factor).toFixed(2) + 'px', 'important');
			}
		});
		this.appliedFactor = factor;
	};

	/* ------------------------------------------------------------------ *
	 * JS behaviours (start returns a cleanup function)
	 * ------------------------------------------------------------------ */
	Widget.prototype.syncBehaviours = function () {
		var p = this.prefs;
		this.behaviour('readingGuide', p.readingGuide, this.startGuide);
		this.behaviour('readingMask', p.readingMask, this.startMask);
		this.behaviour('magnifier', p.magnifier, this.startMagnifier);
		this.behaviour('readAloud', p.readAloud, this.startReadAloud);
		this.behaviour('muteSounds', p.muteSounds, this.startMute);
		this.behaviour('stopAnimations', p.stopAnimations, this.startStopMedia);
		this.behaviour('darkMode', p.darkMode, this.startDarkMode);
	};

	Widget.prototype.behaviour = function (name, on, start) {
		if (on && !this.cleanups[name]) {
			this.cleanups[name] = start.call(this);
		} else if (!on && this.cleanups[name]) {
			this.cleanups[name]();
			delete this.cleanups[name];
		}
	};

	Widget.prototype.startGuide = function () {
		var bar = el('div', 'fa11y-ui fa11y-reading-guide', { 'aria-hidden': 'true' });
		bar.style.top = Math.round(window.innerHeight / 2) + 'px';
		document.body.appendChild(bar);
		var move = function (e) { bar.style.top = e.clientY + 'px'; };
		var focus = function (e) {
			if (inUI(e.target) || !e.target.getBoundingClientRect) return;
			bar.style.top = Math.round(e.target.getBoundingClientRect().bottom + 6) + 'px';
		};
		window.addEventListener('pointermove', move, { passive: true });
		document.addEventListener('focusin', focus);
		return function () {
			window.removeEventListener('pointermove', move);
			document.removeEventListener('focusin', focus);
			bar.remove();
		};
	};

	Widget.prototype.startMask = function () {
		var top = el('div', 'fa11y-ui fa11y-mask fa11y-mask-top', { 'aria-hidden': 'true' });
		var bottom = el('div', 'fa11y-ui fa11y-mask fa11y-mask-bottom', { 'aria-hidden': 'true' });
		var gap = 140;
		var y = window.innerHeight / 2;
		var place = function () {
			top.style.height = Math.max(0, y - gap / 2) + 'px';
			bottom.style.height = Math.max(0, window.innerHeight - y - gap / 2) + 'px';
		};
		var move = function (e) { y = e.clientY; place(); };
		var focus = function (e) {
			if (inUI(e.target) || !e.target.getBoundingClientRect) return;
			var r = e.target.getBoundingClientRect();
			y = r.top + r.height / 2;
			place();
		};
		place();
		document.body.appendChild(top);
		document.body.appendChild(bottom);
		window.addEventListener('pointermove', move, { passive: true });
		window.addEventListener('resize', place);
		document.addEventListener('focusin', focus);
		return function () {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('resize', place);
			document.removeEventListener('focusin', focus);
			top.remove();
			bottom.remove();
		};
	};

	Widget.prototype.startMagnifier = function () {
		var tip = el('div', 'fa11y-ui fa11y-magnifier', { 'aria-hidden': 'true' });
		tip.hidden = true;
		document.body.appendChild(tip);
		this.magnifierTip = tip;
		var current = null;

		var place = function (x, y) {
			var w = tip.offsetWidth;
			var h = tip.offsetHeight;
			var left = x + 16;
			var top = y + 24;
			if (left + w > window.innerWidth - 8) left = Math.max(8, window.innerWidth - w - 8);
			if (top + h > window.innerHeight - 8) top = Math.max(8, y - h - 16);
			tip.style.left = left + 'px';
			tip.style.top = top + 'px';
		};
		var show = function (target) {
			var host = target && !inUI(target) ? textHost(target) : null;
			if (!host) { tip.hidden = true; current = null; return false; }
			if (host !== current) {
				current = host;
				tip.textContent = textOf(host, 280);
			}
			tip.hidden = !tip.textContent;
			return !tip.hidden;
		};
		var over = function (e) { if (show(e.target)) place(e.clientX, e.clientY); };
		var move = function (e) { if (!tip.hidden) place(e.clientX, e.clientY); };
		var out = function (e) { if (!e.relatedTarget) { tip.hidden = true; current = null; } };
		var focus = function (e) {
			if (show(e.target)) {
				var r = e.target.getBoundingClientRect();
				place(r.left, r.bottom);
			}
		};
		var blur = function () { tip.hidden = true; current = null; };

		document.addEventListener('mouseover', over);
		document.addEventListener('mousemove', move, { passive: true });
		document.addEventListener('mouseout', out);
		document.addEventListener('focusin', focus);
		document.addEventListener('focusout', blur);
		var self = this;
		return function () {
			document.removeEventListener('mouseover', over);
			document.removeEventListener('mousemove', move);
			document.removeEventListener('mouseout', out);
			document.removeEventListener('focusin', focus);
			document.removeEventListener('focusout', blur);
			tip.remove();
			self.magnifierTip = null;
		};
	};

	Widget.prototype.pickVoice = function (lang) {
		var voices = window.speechSynthesis.getVoices() || [];
		var l = (lang || 'en').toLowerCase();
		var exact = voices.filter(function (v) { return v.lang && v.lang.toLowerCase() === l; });
		if (exact.length) return exact[0];
		var base = l.split('-')[0];
		var close = voices.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(base) === 0; });
		return close[0] || null;
	};

	Widget.prototype.speak = function (node) {
		var synth = window.speechSynthesis;
		var text = textOf(node, 4000);
		if (!text) return;
		this.stopSpeaking();

		// Chrome cuts off long utterances, so speak in sentence-sized chunks.
		var parts = text.match(/[^.!?;:]+[.!?;:]*\s*/g) || [text];
		var chunks = [];
		var buf = '';
		parts.forEach(function (s) {
			if ((buf + s).length > 180 && buf) { chunks.push(buf); buf = ''; }
			buf += s;
		});
		if (buf.trim()) chunks.push(buf);

		var lang = document.documentElement.lang || 'en-GB';
		var voice = this.pickVoice(lang);
		var self = this;
		var token = {};
		this.speaking = token;
		node.classList.add('fa11y-speaking');
		this.speakingNode = node;

		chunks.forEach(function (chunk, i) {
			var u = new SpeechSynthesisUtterance(chunk);
			u.lang = lang;
			if (voice) u.voice = voice;
			if (i === chunks.length - 1) {
				u.onend = u.onerror = function () {
					if (self.speaking === token) self.stopSpeaking();
				};
			}
			synth.speak(u);
		});
	};

	Widget.prototype.stopSpeaking = function () {
		if (hasSpeech) window.speechSynthesis.cancel();
		if (this.speakingNode) this.speakingNode.classList.remove('fa11y-speaking');
		this.speakingNode = null;
		this.speaking = null;
	};

	Widget.prototype.startReadAloud = function () {
		var self = this;
		window.speechSynthesis.getVoices(); // warm up voice list
		var click = function (e) {
			if (inUI(e.target)) return;
			var node = e.target.closest(READ_SEL) || textHost(e.target);
			if (node) self.speak(node);
		};
		document.addEventListener('click', click, true);
		return function () {
			document.removeEventListener('click', click, true);
			self.stopSpeaking();
		};
	};

	Widget.prototype.startMute = function () {
		var muteAll = function () {
			document.querySelectorAll('audio, video').forEach(function (m) {
				if (m.dataset.fa11yMuted === undefined) m.dataset.fa11yMuted = m.muted ? '1' : '0';
				m.muted = true;
			});
		};
		var onPlay = function (e) {
			var t = e.target;
			if (t && (t.tagName === 'AUDIO' || t.tagName === 'VIDEO')) {
				if (t.dataset.fa11yMuted === undefined) t.dataset.fa11yMuted = t.muted ? '1' : '0';
				t.muted = true;
			}
		};
		muteAll();
		this.mutationHooks.mute = muteAll;
		document.addEventListener('play', onPlay, true);
		var self = this;
		return function () {
			delete self.mutationHooks.mute;
			document.removeEventListener('play', onPlay, true);
			document.querySelectorAll('[data-fa11y-muted]').forEach(function (m) {
				m.muted = m.dataset.fa11yMuted === '1';
				delete m.dataset.fa11yMuted;
			});
		};
	};

	Widget.prototype.startStopMedia = function () {
		var self = this;
		var freeze = function (img) {
			if (img.dataset.fa11ySrc !== undefined) return;
			var src = img.currentSrc || img.src || '';
			if (!/\.gif(\?|#|$)/i.test(src)) return;
			if (!img.complete || !img.naturalWidth) {
				img.addEventListener('load', function () { if (self.prefs.stopAnimations) freeze(img); }, { once: true });
				return;
			}
			try {
				var c = document.createElement('canvas');
				c.width = img.naturalWidth;
				c.height = img.naturalHeight;
				c.getContext('2d').drawImage(img, 0, 0);
				var data = c.toDataURL('image/png'); // throws for cross-origin images; they're left as-is
				img.dataset.fa11ySrc = img.getAttribute('src') || '';
				if (img.hasAttribute('srcset')) {
					img.dataset.fa11ySrcset = img.getAttribute('srcset');
					img.removeAttribute('srcset');
				}
				img.src = data;
			} catch (err) { /* cross-origin */ }
		};
		var pauseAll = function () {
			document.querySelectorAll('video').forEach(function (v) {
				if (!v.paused && (v.autoplay || v.loop || v.muted)) {
					v.pause();
					v.dataset.fa11yPaused = '1';
				}
			});
			document.querySelectorAll('img').forEach(freeze);
		};
		pauseAll();
		this.mutationHooks.media = pauseAll;
		return function () {
			delete self.mutationHooks.media;
			document.querySelectorAll('img[data-fa11y-src]').forEach(function (img) {
				if (img.dataset.fa11ySrcset) img.setAttribute('srcset', img.dataset.fa11ySrcset);
				img.setAttribute('src', img.dataset.fa11ySrc);
				delete img.dataset.fa11ySrc;
				delete img.dataset.fa11ySrcset;
			});
			document.querySelectorAll('video[data-fa11y-paused]').forEach(function (v) {
				delete v.dataset.fa11yPaused;
				var pr = v.play();
				if (pr && pr.catch) pr.catch(function () {});
			});
		};
	};

	/* ------------------------------------------------------------------ *
	 * Dark mode — swaps ONLY neutral colours (white, greys, black, plus colours
	 * close to the site's configured light/dark colours).
	 * Brand colours (anything with noticeable hue) and images are untouched.
	 *  - Neutral backgrounds are swapped (light colour -> dark colour, greys in proportion).
	 *    Translucent overlays that dim a photo (e.g. a Cover block's overlay) are kept.
	 *  - Text, borders, shadows and SVG fills are only touched where the background
	 *    behind them changed. On an untouched brand-coloured background (a green footer,
	 *    a pink button) they keep the site's own colours. Where the background did change,
	 *    a neutral colour is swapped if that reads better against the new background.
	 * Values are written as inline CSS variables (--fa11y-dm-*) plus a data-fa11y-dm
	 * attribute; fa11y-features.css applies them with !important, so they beat theme
	 * rules such as WordPress's `.has-base-background-color { ... !important }`.
	 * Features that must win over dark mode (e.g. Highlight Links) use more specific selectors.
	 * ------------------------------------------------------------------ */
	var NEUTRAL_CHROMA = 30; // max(r,g,b) - min(r,g,b) at or below this counts as neutral (0-255)
	var CANVAS_WHITE = { r: 255, g: 255, b: 255, a: 1 };
	var BLACK = { r: 0, g: 0, b: 0, a: 1 };
	var DM_BORDERS = ['border-top', 'border-right', 'border-bottom', 'border-left'];
	// CSS property -> short name used for the --fa11y-dm-* variable and the data-fa11y-dm token.
	var DM_PROPS = {
		'background-color': 'bg', 'color': 'color', 'fill': 'fill', 'stroke': 'stroke', 'box-shadow': 'shadow',
		'border-top-color': 'bt', 'border-right-color': 'br', 'border-bottom-color': 'bb', 'border-left-color': 'bl'
	};

	var colourCache = {};
	var colourCtx = null;
	function parseRGB(s) {
		s = String(s || '').trim();
		var m = /^rgba?\(([^)]+)\)$/.exec(s);
		if (m) {
			var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
			if (p.length >= 3 && !p.some(isNaN)) return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
		}
		// Other formats browsers may report (oklch(), color(srgb ...), color-mix() results):
		// let a 1px canvas convert them to sRGB.
		if (!s || s === 'none' || s === 'currentcolor') return null;
		if (s in colourCache) return colourCache[s];
		var out = null;
		try {
			if (!colourCtx) colourCtx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
			colourCtx.clearRect(0, 0, 1, 1);
			colourCtx.fillStyle = 'rgba(1, 2, 3, 0.004)';
			colourCtx.fillStyle = s; // ignored if the browser can't parse it
			if (colourCtx.fillStyle !== 'rgba(1, 2, 3, 0.004)') {
				colourCtx.fillRect(0, 0, 1, 1);
				var d = colourCtx.getImageData(0, 0, 1, 1).data;
				out = { r: d[0], g: d[1], b: d[2], a: Math.round(d[3] / 255 * 100) / 100 };
			}
		} catch (e) { /* no canvas: leave the colour alone */ }
		colourCache[s] = out;
		return out;
	}
	function isNeutral(c) { return Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) <= NEUTRAL_CHROMA; }
	function invertRGB(c) { return { r: 255 - c.r, g: 255 - c.g, b: 255 - c.b, a: c.a }; }
	function rgbCss(c) {
		var r = Math.round(c.r), g = Math.round(c.g), b = Math.round(c.b);
		return c.a < 1 ? 'rgba(' + r + ', ' + g + ', ' + b + ', ' + c.a + ')' : 'rgb(' + r + ', ' + g + ', ' + b + ')';
	}
	function over(fg, bg) { // composite fg (may be translucent) over an opaque bg
		var a = fg.a;
		return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
	}
	function relLum(c) {
		var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
		return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
	}
	function ratioRGB(a, b) {
		var l1 = relLum(a), l2 = relLum(b);
		return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
	}
	function hexRGB(h) {
		return HEX.test(h || '') ? { r: parseInt(h.substr(1, 2), 16), g: parseInt(h.substr(3, 2), 16), b: parseInt(h.substr(5, 2), 16), a: 1 } : null;
	}

	/*
	 * The site's own light and dark colours (plugin settings "Dark mode colours",
	 * or `darkMode: { light, dark }` in the standalone config). Blank = white / black.
	 * Dark mode swaps them exactly, maps shades in between proportionally, and also
	 * treats colours close to either one as swappable — so an off-white or a
	 * slightly tinted dark (e.g. a navy-black) is swapped rather than kept as a "brand" colour.
	 */
	var DM_CFG = cfg.darkMode || {};
	var DM_LIGHT = hexRGB(DM_CFG.light) || { r: 255, g: 255, b: 255, a: 1 };
	var DM_DARK = hexRGB(DM_CFG.dark) || { r: 0, g: 0, b: 0, a: 1 };
	var DM_NEAR = 40; // colour distance counted as "close to" one of the site's colours

	function avg(c) { return (c.r + c.g + c.b) / 3; }
	function dist(a, b) { return Math.sqrt(Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2)); }
	function swappable(c) { return isNeutral(c) || dist(c, DM_LIGHT) <= DM_NEAR || dist(c, DM_DARK) <= DM_NEAR; }

	/** Light colour -> dark colour, dark -> light, shades in between proportionally. Keeps alpha. */
	function swapRGB(c) {
		var span = avg(DM_LIGHT) - avg(DM_DARK);
		if (Math.abs(span) < 16) return invertRGB(c); // the two colours are too similar to map between
		var t = Math.max(0, Math.min(1, (avg(c) - avg(DM_DARK)) / span)); // 1 = as light as the light colour
		return {
			r: DM_LIGHT.r + (DM_DARK.r - DM_LIGHT.r) * t,
			g: DM_LIGHT.g + (DM_DARK.g - DM_LIGHT.g) * t,
			b: DM_LIGHT.b + (DM_DARK.b - DM_LIGHT.b) * t,
			a: c.a
		};
	}

	/** For a swappable foreground: the swapped colour if it reads better on bg, else null (keep). */
	function bestNeutral(fg, bg) {
		if (!bg || !swappable(fg) || fg.a === 0) return null;
		var sw = swapRGB(fg);
		return ratioRGB(over(sw, bg), bg) > ratioRGB(over(fg, bg), bg) + 0.01 ? sw : null;
	}

	/** Does this element show a photo/video behind its content (e.g. a WordPress Cover block)? */
	function hasMediaBackground(n) {
		for (var c = n.firstElementChild; c; c = c.nextElementSibling) {
			if ((c.tagName === 'IMG' || c.tagName === 'VIDEO' || c.tagName === 'PICTURE') && getComputedStyle(c).position === 'absolute') return true;
		}
		return false;
	}
	function sameRGB(a, b) { return !!a && !!b && dist(a, b) < 1.5; }

	/** Swap the neutral colours in a computed box-shadow (solid ones only; soft drop shadows are kept). */
	function swapShadow(value) {
		var changed = false;
		var out = value.replace(/rgba?\([^)]*\)/g, function (s) {
			var c = parseRGB(s);
			if (!c || c.a < 0.5 || !swappable(c)) return s;
			changed = true;
			return rgbCss(swapRGB(c));
		});
		return changed ? out : null;
	}

	Widget.prototype.startDarkMode = function () {
		var html = document.documentElement;
		// element -> { bg: opaque background behind its content after the swap, orig: the same before it (null = unknown/image) }
		var info = new WeakMap();
		var touched = new Set(); // elements given --fa11y-dm-* variables

		var write = function (node, prop, value) {
			var key = DM_PROPS[prop];
			node.style.setProperty('--fa11y-dm-' + key, value);
			var tokens = (node.getAttribute('data-fa11y-dm') || '').split(' ').filter(Boolean);
			if (tokens.indexOf(key) === -1) node.setAttribute('data-fa11y-dm', tokens.concat(key).join(' '));
			touched.add(node);
		};
		var parentInfo = function (node) {
			for (var p = node.parentElement; p; p = p.parentElement) {
				if (info.has(p)) return info.get(p);
			}
			return { bg: CANVAS_WHITE, orig: CANVAS_WHITE };
		};

		var run = function () {
			var all = [html, document.body].concat(Array.prototype.slice.call(document.body.getElementsByTagName('*')));
			var jobs = [];

			// Pass 1: read every original value before changing anything.
			for (var i = 0; i < all.length; i++) {
				var n = all[i];
				if (info.has(n) || SKIP_TAGS[n.tagName]) continue;
				if (n !== html && n !== document.body && inUI(n)) continue;
				var cs = getComputedStyle(n);
				var job = {
					el: n,
					bg: cs.backgroundColor,
					bgImage: cs.backgroundImage !== 'none' || hasMediaBackground(n),
					overlay: (cs.position === 'absolute' || cs.position === 'fixed') && parseFloat(cs.opacity) < 1,
					color: cs.color,
					svg: n.namespaceURI === 'http://www.w3.org/2000/svg',
					fill: cs.fill,
					stroke: cs.stroke,
					shadow: cs.boxShadow,
					borders: []
				};
				for (var b = 0; b < DM_BORDERS.length; b++) {
					var side = DM_BORDERS[b];
					if (cs.getPropertyValue(side + '-style') !== 'none' && parseFloat(cs.getPropertyValue(side + '-width')) > 0) {
						job.borders.push([side + '-color', cs.getPropertyValue(side + '-color')]);
					}
				}
				jobs.push(job);
			}

			// Pass 2: decide and write, parents before children (document order).
			jobs.forEach(function (j) {
				var node = j.el;
				var up = node === html ? { bg: CANVAS_WHITE, orig: CANVAS_WHITE } : parentInfo(node);
				var eff = up.bg, orig = up.orig;
				var bg = parseRGB(j.bg);

				if (bg && bg.a > 0) {
					var origBg = bg;
					// A translucent layer dimming a photo keeps its colour, or the photo would wash out.
					if (swappable(bg) && !j.overlay) {
						bg = swapRGB(bg);
						write(node, 'background-color', rgbCss(bg));
					}
					eff = eff ? over(bg, eff) : (bg.a >= 0.95 ? over(bg, BLACK) : null);
					orig = orig ? over(origBg, orig) : (origBg.a >= 0.95 ? over(origBg, BLACK) : null);
				} else if (node === html) {
					// Transparent root = white browser canvas; give it the dark colour.
					eff = swapRGB(CANVAS_WHITE);
					write(node, 'background-color', rgbCss(eff));
				}
				// Content over a background image or photo: we can't know what's behind it, so leave its text alone.
				if (j.bgImage) eff = orig = null;
				if (node === html) node.style.setProperty('color-scheme', 'dark');
				info.set(node, { bg: eff, orig: orig });

				// Only recolour content whose background actually changed. On an untouched
				// brand-coloured background the site's own text colours are kept.
				if (!eff || sameRGB(eff, orig)) return;

				var fg = parseRGB(j.color);
				var newFg = fg && bestNeutral(fg, eff);
				if (newFg) write(node, 'color', rgbCss(newFg));

				// Borders that follow the text colour (currentColor) update automatically.
				j.borders.forEach(function (pair) {
					if (pair[1] === j.color) return;
					var c = parseRGB(pair[1]);
					if (c && swappable(c)) write(node, pair[0], rgbCss(swapRGB(c)));
				});

				// Solid box-shadows are often used as borders (e.g. on form fields).
				if (j.shadow && j.shadow !== 'none') {
					var sh = swapShadow(j.shadow);
					if (sh) write(node, 'box-shadow', sh);
				}

				if (j.svg) {
					['fill', 'stroke'].forEach(function (prop) {
						if (j[prop] === j.color) return; // currentColor
						var c = parseRGB(j[prop]);
						var nc = c && bestNeutral(c, eff);
						if (nc) write(node, prop, rgbCss(nc));
					});
				}
			});
			html.setAttribute('data-fa11y-dark-ready', '');
		};

		run();
		this.mutationHooks.darkMode = run;
		var self = this;
		return function () {
			delete self.mutationHooks.darkMode;
			touched.forEach(function (node) {
				Object.keys(DM_PROPS).forEach(function (prop) { node.style.removeProperty('--fa11y-dm-' + DM_PROPS[prop]); });
				node.removeAttribute('data-fa11y-dm');
				if (node.getAttribute('style') === '') node.removeAttribute('style');
			});
			touched.clear();
			html.style.removeProperty('color-scheme');
			if (html.getAttribute('style') === '') html.removeAttribute('style');
			html.removeAttribute('data-fa11y-dark-ready');
		};
	};

	/* ------------------------------------------------------------------ *
	 * Page structure navigator
	 * ------------------------------------------------------------------ */
	Widget.prototype.showStructure = function () {
		this.collectStructure();
		this.mainView.hidden = true;
		this.structView.hidden = false;
		this.selectTab(this.currentTab || 'headings', true);
		this.announce('Page structure');
	};

	Widget.prototype.showMain = function (focusTile) {
		this.structView.hidden = true;
		this.mainView.hidden = false;
		if (focusTile) {
			var t = this.panel.querySelector('[data-feature="pageStructure"]');
			if (t) t.focus();
		}
	};

	Widget.prototype.collectStructure = function () {
		var visible = function (n) { return !inUI(n) && isVisible(n); };

		var headings = Array.prototype.filter.call(document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]'), visible)
			.map(function (n) {
				var lvl = /^H[1-6]$/.test(n.tagName) ? n.tagName.charAt(1) : (n.getAttribute('aria-level') || '2');
				return { node: n, tag: 'H' + lvl, text: textOf(n, 120), indent: (parseInt(lvl, 10) - 1) * 12 };
			}).filter(function (h) { return h.text; });

		var ROLE_NAMES = { banner: 'Banner', navigation: 'Navigation', main: 'Main', complementary: 'Complementary', contentinfo: 'Footer', search: 'Search', region: 'Region', form: 'Form' };
		var landmarkSel = 'header, nav, main, aside, footer, section[aria-label], section[aria-labelledby], form[aria-label], form[aria-labelledby], search, [role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"], [role="search"], [role="region"], [role="form"]';
		var landmarks = Array.prototype.filter.call(document.querySelectorAll(landmarkSel), visible).map(function (n) {
			var role = n.getAttribute('role');
			if (!role) {
				var tag = n.tagName.toLowerCase();
				var nested = n.parentElement && n.parentElement.closest('article, aside, main, nav, section');
				role = { header: nested ? '' : 'banner', footer: nested ? '' : 'contentinfo', nav: 'navigation', main: 'main', aside: 'complementary', section: 'region', form: 'form', search: 'search' }[tag];
			}
			if (!role || !ROLE_NAMES[role]) return null;
			var name = n.getAttribute('aria-label') || '';
			var lb = n.getAttribute('aria-labelledby');
			if (!name && lb) {
				name = lb.split(/\s+/).map(function (id) { var x = document.getElementById(id); return x ? textOf(x) : ''; }).join(' ').trim();
			}
			return { node: n, tag: ROLE_NAMES[role], text: name || ROLE_NAMES[role] + ' area' };
		}).filter(Boolean);

		var links = Array.prototype.filter.call(document.querySelectorAll('a[href]'), visible).slice(0, 400).map(function (n) {
			var text = textOf(n, 120);
			if (!text) {
				var img = n.querySelector('img[alt]');
				text = img ? img.getAttribute('alt') : '';
			}
			return { node: n, tag: 'Link', text: text || n.getAttribute('href') };
		});

		this.fillList('headings', headings, 'No headings found on this page.');
		this.fillList('landmarks', landmarks, 'No landmarks found on this page.');
		this.fillList('links', links, 'No links found on this page.');
	};

	Widget.prototype.fillList = function (id, items, emptyMsg) {
		var tp = this.shadow.getElementById('fa11y-tp-' + id);
		tp.textContent = '';
		var self = this;
		if (!items.length) {
			var p = el('p', 'empty');
			p.textContent = emptyMsg;
			tp.appendChild(p);
			tp.setAttribute('tabindex', '0');
			return;
		}
		tp.removeAttribute('tabindex');
		var ul = el('ul');
		items.forEach(function (it) {
			var li = el('li');
			var b = el('button', 'struct-item', { type: 'button' });
			if (it.indent) b.style.paddingLeft = (10 + it.indent) + 'px';
			var tag = el('span', 'struct-tag');
			tag.textContent = it.tag;
			var txt = el('span', 'struct-text');
			txt.textContent = it.text;
			b.appendChild(tag);
			b.appendChild(txt);
			b.addEventListener('click', function () { self.goTo(it.node); });
			li.appendChild(b);
			ul.appendChild(li);
		});
		tp.appendChild(ul);
		tp.setAttribute('aria-label', items.length + ' ' + id);
	};

	Widget.prototype.selectTab = function (id, focus) {
		this.currentTab = id;
		var self = this;
		this.structView.querySelectorAll('[role="tab"]').forEach(function (t) {
			var on = t.dataset.tab === id;
			t.setAttribute('aria-selected', String(on));
			t.setAttribute('tabindex', on ? '0' : '-1');
			self.shadow.getElementById(t.getAttribute('aria-controls')).hidden = !on;
			if (on && focus) t.focus();
		});
	};

	Widget.prototype.tabKeys = function (e) {
		var tabs = Array.prototype.slice.call(this.structView.querySelectorAll('[role="tab"]'));
		var i = tabs.indexOf(e.target);
		var next = null;
		if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
		if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
		if (e.key === 'Home') next = tabs[0];
		if (e.key === 'End') next = tabs[tabs.length - 1];
		if (next) {
			e.preventDefault();
			this.selectTab(next.dataset.tab, true);
		}
	};

	Widget.prototype.goTo = function (node) {
		this.close(false);
		if (!node.matches(FOCUSABLE) || node.getAttribute('tabindex') === '-1') {
			if (!node.hasAttribute('tabindex')) {
				node.setAttribute('tabindex', '-1');
				node.addEventListener('blur', function () { node.removeAttribute('tabindex'); }, { once: true });
			}
		}
		node.scrollIntoView({ block: 'center', behavior: (prefersReducedMotion() || this.prefs.stopAnimations) ? 'auto' : 'smooth' });
		node.focus({ preventScroll: true });
		node.classList.add('fa11y-target-flash');
		setTimeout(function () { node.classList.remove('fa11y-target-flash'); }, 2500);
	};

	/* ------------------------------------------------------------------ */
	function boot() {
		try {
			window.fa11yWidget = new Widget();
		} catch (e) {
			if (window.console) console.error('[Free Accessibility]', e);
		}
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
	else boot();
})();
