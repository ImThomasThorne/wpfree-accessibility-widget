/*!
 * Free Accessibility — early bootstrap.
 * Inlined in <head> so saved preferences are applied before first paint.
 * Exposes window.fa11yEarly, which the widget reuses (single source of truth
 * for how preferences map to <html> classes, CSS variables and filters).
 */
(function (w, d) {
	'use strict';

	var cfg = w.fa11yConfig || {};
	var KEY = 'fa11y-prefs';
	var COLOR_KEYS = { textColor: 1, titleColor: 1, bgColor: 1 };
	var NO_CLASS = { profile: 1, fontScale: 1 }; // fontScale is applied by the widget (needs the DOM)
	var HEX = /^#[0-9a-f]{6}$/i;

	function kebab(s) {
		return s.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); });
	}

	function featureFor(key) {
		return COLOR_KEYS[key] ? 'customColors' : key;
	}

	function enabled(key) {
		// Dark mode belongs to the "dark" profile rather than the feature list.
		if (key === 'darkMode') return !cfg.profiles || cfg.profiles.indexOf('dark') !== -1;
		return !cfg.features || cfg.features.indexOf(featureFor(key)) !== -1;
	}

	function store() {
		try {
			return cfg.remember === false ? w.sessionStorage : w.localStorage;
		} catch (e) {
			return null;
		}
	}

	function read() {
		try {
			var s = store();
			var raw = s && s.getItem(KEY);
			var p = raw ? JSON.parse(raw) : null;
			return p && typeof p === 'object' ? p : null;
		} catch (e) {
			return null;
		}
	}

	function write(prefs) {
		try {
			var s = store();
			if (!s) return;
			var empty = true;
			for (var k in prefs) {
				if (Object.prototype.hasOwnProperty.call(prefs, k) && prefs[k]) { empty = false; break; }
			}
			if (empty) s.removeItem(KEY); else s.setItem(KEY, JSON.stringify(prefs));
		} catch (e) { /* storage unavailable: settings last for this page only */ }
	}

	function apply(prefs) {
		var html = d.documentElement;
		var keep = [];
		var add = [];
		var filters = [];
		prefs = prefs || {};

		(html.getAttribute('class') || '').split(/\s+/).forEach(function (c) {
			if (c && c.indexOf('fa11y-') !== 0) keep.push(c);
		});

		for (var k in COLOR_KEYS) {
			if (prefs[k] && HEX.test(prefs[k]) && enabled(k)) {
				html.style.setProperty('--fa11y-' + kebab(k), prefs[k]);
			} else {
				html.style.removeProperty('--fa11y-' + kebab(k));
			}
		}

		for (var key in prefs) {
			if (!Object.prototype.hasOwnProperty.call(prefs, key)) continue;
			var v = prefs[key];
			if (!v || NO_CLASS[key] || !enabled(key)) continue;
			if (COLOR_KEYS[key]) {
				if (HEX.test(v)) add.push('fa11y-' + kebab(key));
			} else if (v === true) {
				add.push('fa11y-' + kebab(key));
			} else if (typeof v === 'number') {
				add.push('fa11y-' + kebab(key) + '-' + Math.round(v));
			}
		}

		if (enabled('contrast')) {
			if (prefs.contrast === 3) filters.push('contrast(1.5)');
			if (prefs.contrast === 4) filters.push('invert(1) hue-rotate(180deg)');
		}
		if (enabled('saturation')) {
			if (prefs.saturation === 1) filters.push('saturate(0.4)');
			if (prefs.saturation === 2) filters.push('saturate(2)');
			if (prefs.saturation === 3) filters.push('grayscale(1)');
		}
		// Filters are applied by a backdrop-filter layer (see fa11y-features.css)
		// that sits below the admin bar and the widget, so neither is altered.
		if (filters.length) {
			html.style.setProperty('--fa11y-filter', filters.join(' '));
			add.push('fa11y-filtered');
		} else {
			html.style.removeProperty('--fa11y-filter');
		}

		html.setAttribute('class', keep.concat(add).join(' '));
	}

	var initial = read();
	if (!initial && cfg.respectOsMotion !== false && w.matchMedia &&
		w.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		initial = { stopAnimations: true };
	}

	w.fa11yEarly = { KEY: KEY, read: read, write: write, apply: apply, initial: initial || {} };

	try {
		apply(initial);
		// Dark mode briefly covers the page (see CSS) until the widget has swapped the
		// colours. Safety net: uncover after 3s even if the widget never runs.
		if (initial.darkMode && enabled('darkMode')) {
			setTimeout(function () { d.documentElement.setAttribute('data-fa11y-dark-ready', ''); }, 3000);
		}
	} catch (e) { /* never break the page */ }
})(window, document);
