// ============================================
// Accessibility Widget — standalone copy
// Extracted from public/js/main.js (class AccessibilityWidget)
// for reuse/experimentation outside the main site.
// ============================================
class AccessibilityWidget {
    constructor() {
        this.isOpen = false;
        this.storageKey = 'a11y-preferences';
        this.textLevel = 0;
        this.maxTextLevel = 4;

        this.toggles = [
            { id: 'high-contrast', label: 'High Contrast', cls: 'a11y-high-contrast' },
            { id: 'reduced-motion', label: 'Reduced Motion', cls: 'a11y-reduced-motion' },
            { id: 'dyslexia-font', label: 'Dyslexia-Friendly Font', cls: 'a11y-dyslexia-font' },
            { id: 'line-height', label: 'Increased Line Height', cls: 'a11y-line-height' },
            { id: 'letter-spacing', label: 'Increased Letter Spacing', cls: 'a11y-letter-spacing' },
            { id: 'highlight-links', label: 'Highlight Links', cls: 'a11y-highlight-links' },
            { id: 'large-cursor', label: 'Large Cursor', cls: 'a11y-large-cursor' },
            { id: 'focus-enhanced', label: 'Enhanced Focus', cls: 'a11y-focus-enhanced' }
        ];

        this.init();
    }

    init() {
        this.createWidget();
        this.restorePreferences();
        this.bindEvents();
    }

    createWidget() {
        // Trigger button
        this.trigger = document.createElement('button');
        this.trigger.className = 'a11y-trigger';
        this.trigger.setAttribute('aria-label', 'Accessibility Settings');
        this.trigger.setAttribute('aria-expanded', 'false');
        this.trigger.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.5" r="2.5"/><path d="M12 8c-4 0-7 1-7 1v2.5l4 .5v9h2v-5h2v5h2v-9l4-.5V9s-3-1-7-1z"/></svg>`;

        // Panel
        this.panel = document.createElement('div');
        this.panel.className = 'a11y-panel';
        this.panel.setAttribute('role', 'dialog');
        this.panel.setAttribute('aria-label', 'Accessibility Settings');
        this.panel.setAttribute('aria-modal', 'true');

        let settingsHTML = '';

        // Text size stepper
        settingsHTML += `
            <div class="a11y-setting">
                <span class="a11y-setting-label" id="a11y-text-size-label">Text Size</span>
                <div class="a11y-stepper" role="group" aria-labelledby="a11y-text-size-label">
                    <button type="button" data-action="text-decrease" aria-label="Decrease text size">&minus;</button>
                    <span class="a11y-stepper-value" aria-live="polite">100%</span>
                    <button type="button" data-action="text-increase" aria-label="Increase text size">&plus;</button>
                </div>
            </div>`;

        // Toggle settings
        this.toggles.forEach(t => {
            settingsHTML += `
            <div class="a11y-setting">
                <span class="a11y-setting-label" id="a11y-label-${t.id}">${t.label}</span>
                <label class="a11y-switch">
                    <input type="checkbox" role="switch" data-setting="${t.id}" aria-labelledby="a11y-label-${t.id}">
                    <span class="a11y-switch-track"></span>
                </label>
            </div>`;
        });

        this.panel.innerHTML = `
            <div class="a11y-panel-header">
                <h2>Accessibility</h2>
                <button class="a11y-panel-close" aria-label="Close accessibility settings">&times;</button>
            </div>
            <div class="a11y-panel-body">
                ${settingsHTML}
                <button type="button" class="a11y-reset">Reset All Settings</button>
            </div>
        `;

        document.body.appendChild(this.trigger);
        document.body.appendChild(this.panel);
    }

    bindEvents() {
        // Open/close
        this.trigger.addEventListener('click', () => this.toggle());
        this.panel.querySelector('.a11y-panel-close').addEventListener('click', () => this.close());

        // Click outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.panel.contains(e.target) && !this.trigger.contains(e.target)) {
                this.close();
            }
        });

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Text size stepper
        this.panel.querySelector('[data-action="text-decrease"]').addEventListener('click', () => this.changeTextSize(-1));
        this.panel.querySelector('[data-action="text-increase"]').addEventListener('click', () => this.changeTextSize(1));

        // Toggle switches
        this.panel.querySelectorAll('input[data-setting]').forEach(input => {
            input.addEventListener('change', () => {
                const setting = input.dataset.setting;
                const toggle = this.toggles.find(t => t.id === setting);
                if (toggle) {
                    document.body.classList.toggle(toggle.cls, input.checked);
                    this.savePreferences();
                }
            });
        });

        // Reset
        this.panel.querySelector('.a11y-reset').addEventListener('click', () => this.resetAll());

        // Focus trap
        this.panel.addEventListener('keydown', (e) => this.trapFocus(e));
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.panel.classList.add('active');
        this.trigger.setAttribute('aria-expanded', 'true');
        // Move focus to close button
        requestAnimationFrame(() => {
            this.panel.querySelector('.a11y-panel-close').focus();
        });
    }

    close() {
        this.isOpen = false;
        this.panel.classList.remove('active');
        this.trigger.setAttribute('aria-expanded', 'false');
        this.trigger.focus();
    }

    trapFocus(e) {
        if (e.key !== 'Tab') return;
        const focusable = this.panel.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    changeTextSize(direction) {
        this.textLevel = Math.max(0, Math.min(this.maxTextLevel, this.textLevel + direction));

        // Remove all text level classes
        for (let i = 1; i <= this.maxTextLevel; i++) {
            document.body.classList.remove(`a11y-text-${i}`);
        }

        if (this.textLevel > 0) {
            document.body.classList.add(`a11y-text-${this.textLevel}`);
        }

        const percentages = [100, 112, 125, 137, 150];
        this.panel.querySelector('.a11y-stepper-value').textContent = percentages[this.textLevel] + '%';
        this.savePreferences();
    }

    savePreferences() {
        const prefs = { textLevel: this.textLevel };
        this.toggles.forEach(t => {
            prefs[t.id] = document.body.classList.contains(t.cls);
        });
        try { localStorage.setItem(this.storageKey, JSON.stringify(prefs)); } catch(e) {}
    }

    restorePreferences() {
        let prefs;
        try { prefs = JSON.parse(localStorage.getItem(this.storageKey)); } catch(e) {}
        if (!prefs) {
            // Respect prefers-reduced-motion as default
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                const input = this.panel.querySelector('[data-setting="reduced-motion"]');
                if (input) {
                    input.checked = true;
                    document.body.classList.add('a11y-reduced-motion');
                }
            }
            return;
        }

        // Text size
        if (prefs.textLevel) {
            this.textLevel = prefs.textLevel;
            if (this.textLevel > 0) {
                document.body.classList.add(`a11y-text-${this.textLevel}`);
            }
            const percentages = [100, 112, 125, 137, 150];
            this.panel.querySelector('.a11y-stepper-value').textContent = percentages[this.textLevel] + '%';
        }

        // Toggles
        this.toggles.forEach(t => {
            if (prefs[t.id]) {
                document.body.classList.add(t.cls);
                const input = this.panel.querySelector(`[data-setting="${t.id}"]`);
                if (input) input.checked = true;
            }
        });
    }

    resetAll() {
        // Remove all classes
        this.textLevel = 0;
        for (let i = 1; i <= this.maxTextLevel; i++) {
            document.body.classList.remove(`a11y-text-${i}`);
        }
        this.toggles.forEach(t => {
            document.body.classList.remove(t.cls);
        });

        // Reset UI
        this.panel.querySelector('.a11y-stepper-value').textContent = '100%';
        this.panel.querySelectorAll('input[data-setting]').forEach(input => {
            input.checked = false;
        });

        // Clear storage
        try { localStorage.removeItem(this.storageKey); } catch(e) {}
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityWidget();
});
