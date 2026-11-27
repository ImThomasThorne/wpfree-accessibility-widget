<?php
/**
 * Plugin Name:       Free Accessibility
 * Plugin URI:        https://github.com/ImThomasThorne/free-accessibility
 * Description:      A lightweight, WCAG-friendly accessibility menu that lets visitors adjust text size, spacing, fonts, contrast, colours, cursors, reading aids, text-to-speech and more. Fully configurable placement and colours.
 * Version:           1.0.0
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       free-accessibility
 *
 * @package FreeAccessibility
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// The version lives only in the plugin header above; read it from there so a
// release needs just one edit. (Also used to cache-bust the CSS/JS files.)
define( 'FA11Y_VERSION', get_file_data( __FILE__, array( 'Version' => 'Version' ) )['Version'] );
define( 'FA11Y_FILE', __FILE__ );
define( 'FA11Y_DIR', plugin_dir_path( __FILE__ ) );
define( 'FA11Y_URL', plugin_dir_url( __FILE__ ) );

require_once FA11Y_DIR . 'includes/class-fa11y-settings.php';
require_once FA11Y_DIR . 'includes/class-fa11y-frontend.php';

if ( is_admin() ) {
	require_once FA11Y_DIR . 'includes/class-fa11y-admin.php';
	FA11Y_Admin::init();
}

FA11Y_Frontend::init();

// Updates are served from GitHub releases via plugin-update-checker (bundled
// in plugin-update-checker/). Sites see an update when a release is published
// whose tag is higher than the Version header above.
require FA11Y_DIR . 'plugin-update-checker/plugin-update-checker.php';

$fa11y_update_checker = \YahnisElsts\PluginUpdateChecker\v5\PucFactory::buildUpdateChecker(
	'https://github.com/ImThomasThorne/free-accessibility/',
	__FILE__,
	'free-accessibility'
);
$fa11y_update_checker->setBranch( 'main' );
