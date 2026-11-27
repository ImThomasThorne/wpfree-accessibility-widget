<?php
/**
 * Settings model: defaults, feature registry, sanitising and colour helpers.
 *
 * @package FreeAccessibility
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FA11Y_Settings {

	const OPTION = 'fa11y_settings';

	/**
	 * Feature registry, grouped as shown in the visitor menu.
	 * IDs must match the feature IDs used in assets/js/fa11y-widget.js.
	 *
	 * @return array<string, array{label:string, items:array<string,string>}>
	 */
	public static function feature_groups() {
		return array(
			'content'    => array(
				'label' => __( 'Content adjustments', 'wpfree-accessibility-widget' ),
				'items' => array(
					'fontScale'       => __( 'Text size', 'wpfree-accessibility-widget' ),
					'pageZoom'        => __( 'Page zoom', 'wpfree-accessibility-widget' ),
					'lineHeight'      => __( 'Line height', 'wpfree-accessibility-widget' ),
					'letterSpacing'   => __( 'Letter & word spacing', 'wpfree-accessibility-widget' ),
					'textAlign'       => __( 'Text alignment', 'wpfree-accessibility-widget' ),
					'readableFont'    => __( 'Readable font', 'wpfree-accessibility-widget' ),
					'dyslexiaFont'    => __( 'Dyslexia-friendly font', 'wpfree-accessibility-widget' ),
					'boldText'        => __( 'Bold text', 'wpfree-accessibility-widget' ),
					'highlightLinks'  => __( 'Highlight links', 'wpfree-accessibility-widget' ),
					'highlightTitles' => __( 'Highlight headings', 'wpfree-accessibility-widget' ),
					'magnifier'       => __( 'Text magnifier', 'wpfree-accessibility-widget' ),
				),
			),
			'colour'     => array(
				'label' => __( 'Colour adjustments', 'wpfree-accessibility-widget' ),
				'items' => array(
					'contrast'     => __( 'Contrast modes (dark, light, high, inverted)', 'wpfree-accessibility-widget' ),
					'saturation'   => __( 'Saturation (low, high, monochrome)', 'wpfree-accessibility-widget' ),
					'customColors' => __( 'Custom text, heading & background colours', 'wpfree-accessibility-widget' ),
				),
			),
			'navigation' => array(
				'label' => __( 'Orientation & navigation', 'wpfree-accessibility-widget' ),
				'items' => array(
					'readAloud'       => __( 'Read aloud (text to speech)', 'wpfree-accessibility-widget' ),
					'pageStructure'   => __( 'Page structure (headings, landmarks, links)', 'wpfree-accessibility-widget' ),
					'readingGuide'    => __( 'Reading guide', 'wpfree-accessibility-widget' ),
					'readingMask'     => __( 'Reading mask', 'wpfree-accessibility-widget' ),
					'stopAnimations'  => __( 'Stop animations', 'wpfree-accessibility-widget' ),
					'muteSounds'      => __( 'Mute sounds', 'wpfree-accessibility-widget' ),
					'hideImages'      => __( 'Hide images', 'wpfree-accessibility-widget' ),
					'cursor'          => __( 'Big cursor', 'wpfree-accessibility-widget' ),
					'highlightHover'  => __( 'Highlight on hover', 'wpfree-accessibility-widget' ),
					'highlightFocus'  => __( 'Highlight focus', 'wpfree-accessibility-widget' ),
				),
			),
		);
	}

	/**
	 * Flat list of feature IDs.
	 *
	 * @return string[]
	 */
	public static function feature_ids() {
		$ids = array();
		foreach ( self::feature_groups() as $group ) {
			$ids = array_merge( $ids, array_keys( $group['items'] ) );
		}
		return $ids;
	}

	/**
	 * Preset profiles. IDs must match the widget JS.
	 *
	 * @return array<string,string>
	 */
	public static function profiles() {
		return array(
			'seizure'   => __( 'Seizure safe', 'wpfree-accessibility-widget' ),
			'vision'    => __( 'Vision impaired', 'wpfree-accessibility-widget' ),
			'adhd'      => __( 'ADHD friendly', 'wpfree-accessibility-widget' ),
			'cognitive' => __( 'Cognitive & learning', 'wpfree-accessibility-widget' ),
			'motor'     => __( 'Motor impaired', 'wpfree-accessibility-widget' ),
			'dyslexia'  => __( 'Dyslexia friendly', 'wpfree-accessibility-widget' ),
			'dark'      => __( 'Dark mode', 'wpfree-accessibility-widget' ),
		);
	}

	public static function positions() {
		return array(
			'bottom-right' => __( 'Bottom right', 'wpfree-accessibility-widget' ),
			'bottom-left'  => __( 'Bottom left', 'wpfree-accessibility-widget' ),
			'middle-right' => __( 'Middle right', 'wpfree-accessibility-widget' ),
			'middle-left'  => __( 'Middle left', 'wpfree-accessibility-widget' ),
			'top-right'    => __( 'Top right', 'wpfree-accessibility-widget' ),
			'top-left'     => __( 'Top left', 'wpfree-accessibility-widget' ),
		);
	}

	public static function icon_sizes() {
		return array(
			'small'  => __( 'Small (44px)', 'wpfree-accessibility-widget' ),
			'medium' => __( 'Medium (56px)', 'wpfree-accessibility-widget' ),
			'large'  => __( 'Large (68px)', 'wpfree-accessibility-widget' ),
		);
	}

	public static function shapes() {
		return array(
			'circle'  => __( 'Circle', 'wpfree-accessibility-widget' ),
			'rounded' => __( 'Rounded square', 'wpfree-accessibility-widget' ),
			'square'  => __( 'Square', 'wpfree-accessibility-widget' ),
		);
	}

	public static function panel_themes() {
		return array(
			'light' => __( 'Light', 'wpfree-accessibility-widget' ),
			'dark'  => __( 'Dark', 'wpfree-accessibility-widget' ),
			'auto'  => __( 'Follow visitor\'s system setting', 'wpfree-accessibility-widget' ),
		);
	}

	/**
	 * Trigger button icons (inline SVG, decorative — the button carries the label).
	 *
	 * @return array<string, array{label:string, svg:string}>
	 */
	public static function trigger_icons() {
		return array(
			'access'   => array(
				'label' => __( 'Universal access', 'wpfree-accessibility-widget' ),
				'svg'   => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm0 2a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 1.75a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5ZM6.6 8.6a.9.9 0 0 0-.2 1.78c1.3.3 2.6.52 3.85.62v2.2l-1.6 5.05a.9.9 0 0 0 1.71.55L11.8 14h.4l1.44 4.8a.9.9 0 0 0 1.71-.55L13.75 13.2V11c1.25-.1 2.55-.32 3.85-.62a.9.9 0 0 0-.4-1.76c-1.7.4-3.45.62-5.2.62s-3.5-.22-5.2-.62a.9.9 0 0 0-.2-.02Z"/></svg>',
			),
			'person'   => array(
				'label' => __( 'Person', 'wpfree-accessibility-widget' ),
				'svg'   => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle fill="currentColor" cx="12" cy="4.5" r="2.5"/><path fill="currentColor" d="M12 8c-4 0-7 1-7 1v2.5l4 .5v9h2v-5h2v5h2v-9l4-.5V9s-3-1-7-1z"/></svg>',
			),
			'eye'      => array(
				'label' => __( 'Eye', 'wpfree-accessibility-widget' ),
				'svg'   => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 5C6.5 5 2.3 8.6 1 12c1.3 3.4 5.5 7 11 7s9.7-3.6 11-7c-1.3-3.4-5.5-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>',
			),
			'settings' => array(
				'label' => __( 'Adjustment sliders', 'wpfree-accessibility-widget' ),
				'svg'   => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3 6h9.2a3 3 0 0 1 5.6 0H21v2h-3.2a3 3 0 0 1-5.6 0H3V6Zm12 2a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM3 16h3.2a3 3 0 0 1 5.6 0H21v2h-9.2a3 3 0 0 1-5.6 0H3v-2Zm6 2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/></svg>',
			),
		);
	}

	public static function defaults() {
		return array(
			'enabled'           => 1,
			'position'          => 'bottom-right',
			'offset_x'          => 20,
			'offset_y'          => 20,
			'icon'              => 'access',
			'icon_size'         => 'medium',
			'shape'             => 'circle',
			'button_bg'         => '#0B3A66',
			'button_fg'         => '#FFFFFF',
			'accent'            => '#0B3A66',
			'panel_theme'       => 'light',
			'dark_light'        => '', // Dark mode: the site's light colour (blank = pure white).
			'dark_dark'         => '', // Dark mode: the site's dark colour (blank = pure black).
			'title'             => __( 'Accessibility Menu', 'wpfree-accessibility-widget' ),
			'statement_url'     => '',
			'statement_text'    => __( 'Accessibility statement', 'wpfree-accessibility-widget' ),
			'shortcut'          => 1,
			'remember'          => 1,
			'hide_mobile'       => 0,
			'hide_desktop'      => 0,
			'respect_os_motion' => 1,
			'disabled_features' => array(),
			'disabled_profiles' => array(),
		);
	}

	/**
	 * Saved settings merged over defaults.
	 */
	public static function get() {
		$saved = get_option( self::OPTION, array() );
		if ( ! is_array( $saved ) ) {
			$saved = array();
		}
		return array_merge( self::defaults(), $saved );
	}

	public static function enabled_features( $settings = null ) {
		$settings = $settings ? $settings : self::get();
		return array_values( array_diff( self::feature_ids(), (array) $settings['disabled_features'] ) );
	}

	public static function enabled_profiles( $settings = null ) {
		$settings = $settings ? $settings : self::get();
		return array_values( array_diff( array_keys( self::profiles() ), (array) $settings['disabled_profiles'] ) );
	}

	/**
	 * Sanitise callback for register_setting().
	 *
	 * @param mixed $input Raw form input.
	 * @return array
	 */
	public static function sanitize( $input ) {
		$d     = self::defaults();
		$input = is_array( $input ) ? $input : array();
		$out   = array();

		foreach ( array( 'enabled', 'shortcut', 'remember', 'hide_mobile', 'hide_desktop', 'respect_os_motion' ) as $key ) {
			$out[ $key ] = empty( $input[ $key ] ) ? 0 : 1;
		}

		$out['position']    = self::pick( $input, 'position', self::positions(), $d['position'] );
		$out['icon']        = self::pick( $input, 'icon', self::trigger_icons(), $d['icon'] );
		$out['icon_size']   = self::pick( $input, 'icon_size', self::icon_sizes(), $d['icon_size'] );
		$out['shape']       = self::pick( $input, 'shape', self::shapes(), $d['shape'] );
		$out['panel_theme'] = self::pick( $input, 'panel_theme', self::panel_themes(), $d['panel_theme'] );

		foreach ( array( 'offset_x', 'offset_y' ) as $key ) {
			$val         = isset( $input[ $key ] ) ? absint( $input[ $key ] ) : $d[ $key ];
			$out[ $key ] = min( 300, $val );
		}

		foreach ( array( 'button_bg', 'button_fg', 'accent' ) as $key ) {
			$hex         = isset( $input[ $key ] ) ? sanitize_hex_color( trim( (string) $input[ $key ] ) ) : '';
			$out[ $key ] = $hex ? strtoupper( $hex ) : $d[ $key ];
			// Expand #abc to #AABBCC so contrast maths is consistent.
			if ( 4 === strlen( $out[ $key ] ) ) {
				$c           = $out[ $key ];
				$out[ $key ] = '#' . $c[1] . $c[1] . $c[2] . $c[2] . $c[3] . $c[3];
			}
		}

		// Optional dark-mode colours: blank means "automatic" (pure white / pure black).
		foreach ( array( 'dark_light', 'dark_dark' ) as $key ) {
			$hex         = isset( $input[ $key ] ) ? sanitize_hex_color( trim( (string) $input[ $key ] ) ) : '';
			$hex         = $hex ? strtoupper( $hex ) : '';
			$out[ $key ] = 4 === strlen( $hex ) ? '#' . $hex[1] . $hex[1] . $hex[2] . $hex[2] . $hex[3] . $hex[3] : $hex;
		}

		$out['title']          =isset( $input['title'] ) && '' !== trim( $input['title'] ) ? sanitize_text_field( $input['title'] ) : $d['title'];
		$out['statement_text'] = isset( $input['statement_text'] ) && '' !== trim( $input['statement_text'] ) ? sanitize_text_field( $input['statement_text'] ) : $d['statement_text'];
		$out['statement_url']  = isset( $input['statement_url'] ) ? esc_url_raw( trim( $input['statement_url'] ) ) : '';

		$profile_ids = array_keys( self::profiles() );

		if ( ! empty( $input['_form'] ) ) {
			// Submitted from the settings page: checkbox lists contain the ENABLED items.
			// We store the disabled ones so features added in future versions default to on.
			$enabled                  = isset( $input['features'] ) ? array_map( 'sanitize_key', (array) $input['features'] ) : array();
			$out['disabled_features'] = array_values( array_diff( self::feature_ids(), self::match_ids( $enabled, self::feature_ids() ) ) );

			$enabled_p                = isset( $input['profiles'] ) ? array_map( 'sanitize_key', (array) $input['profiles'] ) : array();
			$out['disabled_profiles'] = array_values( array_diff( $profile_ids, self::match_ids( $enabled_p, $profile_ids ) ) );
		} else {
			// Already-sanitised data (WordPress re-sanitises on add_option) or programmatic update.
			$out['disabled_features'] = isset( $input['disabled_features'] ) ? array_values( array_intersect( self::feature_ids(), (array) $input['disabled_features'] ) ) : array();
			$out['disabled_profiles'] = isset( $input['disabled_profiles'] ) ? array_values( array_intersect( $profile_ids, (array) $input['disabled_profiles'] ) ) : array();
		}

		return $out;
	}

	/**
	 * Feature IDs are camelCase but sanitize_key() lower-cases; map back.
	 */
	private static function match_ids( $submitted, $known ) {
		$map = array();
		foreach ( $known as $id ) {
			$map[ strtolower( $id ) ] = $id;
		}
		$out = array();
		foreach ( $submitted as $s ) {
			if ( isset( $map[ $s ] ) ) {
				$out[] = $map[ $s ];
			}
		}
		return $out;
	}

	private static function pick( $input, $key, $allowed, $fallback ) {
		return ( isset( $input[ $key ] ) && array_key_exists( $input[ $key ], $allowed ) ) ? $input[ $key ] : $fallback;
	}

	/**
	 * The active theme's colours, used to suggest dark-mode colours in the admin.
	 *
	 * @return array{background:?string, text:?string, palette:string[], entries:array}
	 *         entries: [ ['name' => 'Base', 'hex' => '#FFFFFF', 'role' => 'background'|'text'|''], ... ]
	 */
	public static function theme_colours() {
		$out = array(
			'background' => null,
			'text'       => null,
			'palette'    => array(),
			'entries'    => array(),
		);

		$by_slug = array();
		$names   = array();
		if ( function_exists( 'wp_get_global_settings' ) ) {
			$palettes = wp_get_global_settings( array( 'color', 'palette' ) );
			// Theme colours first, then any custom ones; core's default palette isn't the theme's.
			foreach ( array( 'theme', 'custom' ) as $origin ) {
				if ( empty( $palettes[ $origin ] ) || ! is_array( $palettes[ $origin ] ) ) {
					continue;
				}
				foreach ( $palettes[ $origin ] as $entry ) {
					$hex = isset( $entry['color'] ) ? self::normalise_hex( $entry['color'] ) : null;
					if ( $hex && isset( $entry['slug'] ) ) {
						$by_slug[ $entry['slug'] ] = $hex;
						$names[ $entry['slug'] ]   = ! empty( $entry['name'] ) ? $entry['name'] : $entry['slug'];
					}
				}
			}
		} elseif ( $classic = get_theme_support( 'editor-color-palette' ) ) { // phpcs:ignore Generic.CodeAnalysis.AssignmentInCondition
			foreach ( (array) $classic[0] as $entry ) {
				$hex = isset( $entry['color'] ) ? self::normalise_hex( $entry['color'] ) : null;
				if ( $hex && isset( $entry['slug'] ) ) {
					$by_slug[ $entry['slug'] ] = $hex;
					$names[ $entry['slug'] ]   = ! empty( $entry['name'] ) ? $entry['name'] : $entry['slug'];
				}
			}
		}
		$out['palette'] = array_values( array_unique( $by_slug ) );

		if ( function_exists( 'wp_get_global_styles' ) ) {
			$styles = wp_get_global_styles( array( 'color' ) );
			foreach ( array( 'background', 'text' ) as $key ) {
				if ( ! empty( $styles[ $key ] ) && is_string( $styles[ $key ] ) ) {
					$out[ $key ] = self::resolve_colour( $styles[ $key ], $by_slug );
				}
			}
		}
		// Classic themes: Customizer background colour.
		if ( ! $out['background'] && get_background_color() ) {
			$out['background'] = self::normalise_hex( '#' . get_background_color() );
		}

		// Named list for the colour chooser, tagging what the theme uses for background/text.
		// One option per colour; palette names sharing a colour are combined ("Base / White").
		$entries = array();
		foreach ( $by_slug as $slug => $hex ) {
			if ( isset( $entries[ $hex ] ) ) {
				$entries[ $hex ]['name'] .= ' / ' . $names[ $slug ];
				continue;
			}
			$role = '';
			if ( $hex === $out['background'] ) {
				$role = 'background';
			} elseif ( $hex === $out['text'] ) {
				$role = 'text';
			}
			$entries[ $hex ] = array(
				'name' => $names[ $slug ],
				'hex'  => $hex,
				'role' => $role,
			);
		}
		$out['entries'] = array_values( $entries );
		return $out;
	}

	/**
	 * Resolve '#hex', 'var(--wp--preset--color--slug)' or 'var:preset|color|slug' to a hex colour.
	 */
	private static function resolve_colour( $value, $by_slug ) {
		if ( preg_match( '/--wp--preset--color--([a-z0-9-]+)/i', $value, $m ) || preg_match( '/^var:preset\|color\|([a-z0-9-]+)$/i', $value, $m ) ) {
			return isset( $by_slug[ $m[1] ] ) ? $by_slug[ $m[1] ] : null;
		}
		return self::normalise_hex( $value );
	}

	private static function normalise_hex( $value ) {
		$hex = sanitize_hex_color( trim( (string) $value ) );
		if ( ! $hex ) {
			return null;
		}
		$hex = strtoupper( $hex );
		return 4 === strlen( $hex ) ? '#' . $hex[1] . $hex[1] . $hex[2] . $hex[2] . $hex[3] . $hex[3] : $hex;
	}

	/* ---------- Colour helpers (WCAG relative luminance) ---------- */

	public static function luminance( $hex ) {
		$hex = ltrim( $hex, '#' );
		$rgb = array( hexdec( substr( $hex, 0, 2 ) ), hexdec( substr( $hex, 2, 2 ) ), hexdec( substr( $hex, 4, 2 ) ) );
		foreach ( $rgb as &$c ) {
			$c = $c / 255;
			$c = $c <= 0.03928 ? $c / 12.92 : pow( ( $c + 0.055 ) / 1.055, 2.4 );
		}
		return 0.2126 * $rgb[0] + 0.7152 * $rgb[1] + 0.0722 * $rgb[2];
	}

	public static function contrast( $a, $b ) {
		$l1 = self::luminance( $a );
		$l2 = self::luminance( $b );
		return ( max( $l1, $l2 ) + 0.05 ) / ( min( $l1, $l2 ) + 0.05 );
	}

	/**
	 * Black or white, whichever has more contrast on the given background.
	 */
	public static function readable_on( $bg ) {
		return self::contrast( $bg, '#000000' ) >= self::contrast( $bg, '#FFFFFF' ) ? '#000000' : '#FFFFFF';
	}
}
