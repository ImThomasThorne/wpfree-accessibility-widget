# Accessibility widget: standalone (non-WordPress) version

This folder holds the WordPress plugin's accessibility menu, packaged to drop into any website (for example the Astro portfolio site). It uses **the same files as the plugin**, so it has every feature: the profiles (including Dark Mode), text and colour adjustments, read aloud, page structure, and the rest.

| Path | What it is |
|---|---|
| `assets/` | The widget files. **Don't edit these here.** They are copied from the plugin. |
| `index.html` | A working demo with every configuration option documented. |
| `sync-from-plugin.js` | Refreshes `assets/` from the plugin. |
| `original/` | The widget as it was first taken from the website, before it became a plugin. Kept for reference. |

## Keeping it up to date

The plugin's `assets/` folder is the single source of truth. After changing the plugin, run this from the plugin folder:

```
node legacy/sync-from-plugin.js
```

## Adding it to the Astro site

1. Copy `legacy/assets/` into the site as `public/a11y/`, which gives you `public/a11y/js`, `public/a11y/css` and `public/a11y/fonts`.
   Keep the `js`, `css` and `fonts` folders next to each other: the CSS loads the fonts from `../fonts/`, and the JS finds its stylesheet at `../css/`.

2. In `src/layouts/BaseLayout.astro`, replace the old inline `a11y-preferences` bootstrap with the following in `<head>`:

   ```astro
   <script is:inline>
     window.fa11yConfig = {
       position: 'bottom-right',
       colors: { buttonBg: '#081A2B', buttonFg: '#F3F6F4', accent: '#0B3A66' },
       panelTheme: 'dark',
       darkMode: { light: '#F3F6F4', dark: '#081A2B' }, // the old site's off-white and navy-black
       statementUrl: '/accessibility'
     };
   </script>
   <script is:inline src="/a11y/js/fa11y-early.js"></script>
   <link rel="stylesheet" href="/a11y/css/fa11y-features.css" />
   <script is:inline src="/a11y/js/fa11y-widget.js" defer></script>
   ```

   - `is:inline` stops Astro bundling or moving the scripts.
   - `fa11y-early.js` must stay in `<head>` and must **not** be deferred. It applies the visitor's saved choices before the page first paints.
   - Every config option is optional. See `index.html` for the full list with comments.

3. Remove the old widget code from the site:
   - the `AccessibilityWidget` class in `public/js/main.js`;
   - the `.a11y-trigger`, `.a11y-panel` and `body.a11y-*` rules in `public/css/styles.css`.

   The new widget uses different class names (`fa11y-*`), so the old and new code won't clash. Still, remove the old code so visitors don't see two buttons.

## Differences from the original widget

- **Saved choices:** they're stored under the browser storage key `fa11y-prefs` instead of `a11y-preferences`. Visitors' old choices won't carry over, so they'll start fresh.
- **Theme independence:** the old high-contrast mode switched the site's own CSS variables (`--color-bg-main` and so on). The new modes work on any site without relying on them.
- **Isolated menu:** the menu is drawn in a Shadow DOM, so the site's CSS can't restyle it. Change its look through `fa11yConfig` instead.
- **Admin-bar exclusions:** the CSS mentions `#wpadminbar` (the WordPress admin bar). That's harmless on a non-WordPress site.
