<?php
/**
 * Plugin Name:       Free Accessibility
 * Description:       A lightweight, WCAG-friendly accessibility menu that lets visitors adjust text size, spacing, fonts, contrast, colours, cursors, reading aids, text-to-speech and more. Fully configurable placement and colours.
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

define( 'FA11Y_VERSION', '1.0.0' );
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
