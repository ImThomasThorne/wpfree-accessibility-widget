=== Free Accessibility ===
Tags: accessibility, wcag, a11y, accessibility widget, dyslexia
Requires at least: 6.3
Tested up to: 7.1
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A lightweight accessibility menu that lets visitors adjust text, colours, spacing and navigation. No tracking, no external requests.

== Description ==

Adds a floating accessibility button to every page. Visitors can personalise the site, and their choices are remembered in their own browser.

**Profiles (one-click presets):** Seizure safe, Vision impaired, ADHD friendly, Cognitive & learning, Motor impaired, Dyslexia friendly.

**Content:** Text size (100–200%, works with px-based themes), page zoom, line height, letter & word spacing (meets WCAG 1.4.12 values), text alignment, readable font, dyslexia-friendly font (OpenDyslexic, bundled locally), bold text, highlight links, highlight headings, text magnifier.

**Colour:** Dark, light, high and inverted contrast; low, high and monochrome saturation; custom text, heading and background colours.

**Orientation & navigation:** Read aloud (text to speech), page structure navigator (headings, landmarks, links), reading guide, reading mask, stop animations (including GIFs and autoplaying video), mute sounds, hide images, big black or white cursor, highlight on hover, highlight focus.

**Settings (Settings → Accessibility Widget):** Position (six placements) and offsets, icon (four choices), size, shape, button and accent colours with live WCAG contrast checks, light/dark/auto menu theme, menu title, accessibility statement link, Alt + A shortcut, hide on mobile or desktop, remember choices, follow the device's reduced-motion setting, and switch every feature or profile on or off.

= Accessibility of the widget itself =

* Built to WCAG 2.2 AA: a labelled modal dialog with focus trapping, Escape to close and focus returned to the button.
* Toggles use `aria-pressed`. Changes are announced through a polite live region.
* All targets are at least 44×44px. Focus rings are visible on any background.
* Reflows to a full-screen sheet on small screens and at high zoom. Supports Windows High Contrast (forced colours) and reduced motion.
* Rendered in a Shadow DOM so theme CSS cannot break it.

= Important =

An overlay widget helps people personalise their experience, but it does not make a website WCAG compliant on its own. Your theme and content still need proper headings, alt text, colour contrast, labels and keyboard support.

= Privacy =

No cookies, no analytics, no third-party requests. Preferences are stored in the visitor's browser (localStorage, or sessionStorage if "remember" is off).

The only outside connection is server-side: about every 12 hours your site asks GitHub (api.github.com) whether a new version of the plugin has been released. Visitors' browsers never contact GitHub.

= Updates =

Updates come from this plugin's GitHub releases (https://github.com/ImThomasThorne/wpfree-accessibility-widget) and appear in Dashboard → Updates like any other plugin.
= Developer filters =

* `fa11y_should_load` (bool): disable the widget on specific pages.
* `fa11y_config` (array): modify the configuration passed to JavaScript.

== Changelog ==

= 1.0.0 =
* Initial release, converted from the standalone site widget.

== Credits ==

OpenDyslexic font by Abbie Gonzalez. Licence in assets/fonts/LICENSE-OpenDyslexic.txt.
