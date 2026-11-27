<?php
/**
 * Remove plugin settings on uninstall. Visitor preferences live only in their
 * own browsers, so nothing else is stored server-side.
 *
 * @package FreeAccessibility
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'fa11y_settings' );
