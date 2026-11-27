<?php
/**
 * Front-end output: config + early bootstrap in <head>, assets, widget script.
 *
 * @package FreeAccessibility
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FA11Y_Frontend {

	public static function init() {
		add_action( 'wp_head', array( __CLASS__, 'print_head' ), 1 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
	}

	/**
	 * Whether the widget should load on this request.
	 */
	public static function should_load() {
		if ( is_admin() || wp_doing_ajax() || is_feed() ) {
			return false;
		}
		$settings = FA11Y_Settings::get();
		/**
		 * Filter whether the accessibility widget loads on the current page.
		 *
		 * @param bool $load Whether to load.
		 */
		return (bool) apply_filters( 'fa11y_should_load', ! empty( $settings['enabled'] ) );
	}

	/**
	 * Config object handed to both the early bootstrap and the widget.
	 */
	public static function config() {
		$s     = FA11Y_Settings::get();
		$icons = FA11Y_Settings::trigger_icons();
		$sizes = array(
			'small'  => 44,
			'medium' => 56,
			'large'  => 68,
		);

		$config = array(
			'version'         => FA11Y_VERSION,
			'cssUrl'          => FA11Y_URL . 'assets/css/fa11y-widget.css?ver=' . FA11Y_VERSION,
			'features'        => FA11Y_Settings::enabled_features( $s ),
			'profiles'        => FA11Y_Settings::enabled_profiles( $s ),
			'position'        => $s['position'],
			'offsetX'         => (int) $s['offset_x'],
			'offsetY'         => (int) $s['offset_y'],
			'iconSize'        => $sizes[ $s['icon_size'] ],
			'iconSvg'         => $icons[ $s['icon'] ]['svg'],
			'shape'           => $s['shape'],
			'panelTheme'      => $s['panel_theme'],
			'colors'          => array(
				'buttonBg' => $s['button_bg'],
				'buttonFg' => $s['button_fg'],
				'accent'   => $s['accent'],
				'accentFg' => FA11Y_Settings::readable_on( $s['accent'] ),
			),
			// Dark mode swaps these two (blank = pure white / pure black).
			'darkMode'        => array(
				'light' => $s['dark_light'],
				'dark'  => $s['dark_dark'],
			),
			'title'           => $s['title'],
			'statementUrl'    => $s['statement_url'],
			'statementText'   => $s['statement_text'],
			'shortcut'        => (bool) $s['shortcut'],
			'remember'        => (bool) $s['remember'],
			'hideMobile'      => (bool) $s['hide_mobile'],
			'hideDesktop'     => (bool) $s['hide_desktop'],
			'respectOsMotion' => (bool) $s['respect_os_motion'],
		);

		/**
		 * Filter the widget configuration passed to JavaScript.
		 *
		 * @param array $config Config.
		 */
		return apply_filters( 'fa11y_config', $config );
	}

	/**
	 * Print config + early bootstrap as early as possible so saved
	 * preferences are applied before first paint (no flash).
	 */
	public static function print_head() {
		if ( ! self::should_load() ) {
			return;
		}
		$early = FA11Y_DIR . 'assets/js/fa11y-early.js';
		$js    = 'window.fa11yConfig=' . wp_json_encode( self::config() ) . ";\n";
		if ( is_readable( $early ) ) {
			$js .= file_get_contents( $early ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local plugin file.
		}
		wp_print_inline_script_tag( $js, array( 'id' => 'fa11y-early' ) );
	}

	public static function enqueue() {
		if ( ! self::should_load() ) {
			return;
		}
		wp_enqueue_style( 'fa11y-features', FA11Y_URL . 'assets/css/fa11y-features.css', array(), FA11Y_VERSION );
		wp_enqueue_script(
			'fa11y-widget',
			FA11Y_URL . 'assets/js/fa11y-widget.js',
			array(),
			FA11Y_VERSION,
			array(
				'in_footer' => true,
				'strategy'  => 'defer',
			)
		);
	}
}
