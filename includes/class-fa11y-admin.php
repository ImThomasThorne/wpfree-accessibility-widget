<?php
/**
 * Admin settings page: Settings → Accessibility Widget.
 *
 * @package FreeAccessibility
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FA11Y_Admin {

	const SLUG = 'wpfree-accessibility-widget';

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'register' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
		add_filter( 'plugin_action_links_' . plugin_basename( FA11Y_FILE ), array( __CLASS__, 'action_links' ) );
		add_action( 'admin_post_fa11y_reset', array( __CLASS__, 'handle_reset' ) );
	}

	public static function menu() {
		add_options_page(
			__( 'Accessibility Widget', 'wpfree-accessibility-widget' ),
			__( 'Accessibility Widget', 'wpfree-accessibility-widget' ),
			'manage_options',
			self::SLUG,
			array( __CLASS__, 'render' )
		);
	}

	public static function register() {
		register_setting(
			'fa11y',
			FA11Y_Settings::OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( 'FA11Y_Settings', 'sanitize' ),
				'default'           => FA11Y_Settings::defaults(),
			)
		);
	}

	public static function action_links( $links ) {
		$url = admin_url( 'options-general.php?page=' . self::SLUG );
		array_unshift( $links, '<a href="' . esc_url( $url ) . '">' . esc_html__( 'Settings', 'wpfree-accessibility-widget' ) . '</a>' );
		return $links;
	}

	public static function assets( $hook ) {
		if ( 'settings_page_' . self::SLUG !== $hook ) {
			return;
		}
		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_style( 'fa11y-admin', FA11Y_URL . 'assets/css/fa11y-admin.css', array(), FA11Y_VERSION );
		wp_enqueue_script( 'fa11y-admin', FA11Y_URL . 'assets/js/fa11y-admin.js', array( 'jquery', 'wp-color-picker', 'wp-a11y' ), FA11Y_VERSION, true );
		$icons = array();
		foreach ( FA11Y_Settings::trigger_icons() as $key => $icon ) {
			$icons[ $key ] = $icon['svg'];
		}
		$theme = FA11Y_Settings::theme_colours();
		wp_localize_script(
			'fa11y-admin',
			'fa11yAdmin',
			array(
				'icons'   => $icons,
				// Theme palette shown as quick-pick swatches in the colour pickers.
				'palette' => $theme['palette'] ? array_slice( $theme['palette'], 0, 12 ) : true,
			)
		);
	}

	public static function handle_reset() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to do that.', 'wpfree-accessibility-widget' ), 403 );
		}
		check_admin_referer( 'fa11y_reset' );
		delete_option( FA11Y_Settings::OPTION );
		wp_safe_redirect( admin_url( 'options-general.php?page=' . self::SLUG . '&fa11y-reset=1' ) );
		exit;
	}

	/* ---------- Field helpers ---------- */

	private static function name( $key ) {
		return FA11Y_Settings::OPTION . '[' . $key . ']';
	}

	private static function checkbox( $s, $key, $label, $desc = '' ) {
		$id = 'fa11y-' . $key;
		?>
		<label for="<?php echo esc_attr( $id ); ?>">
			<input type="checkbox" id="<?php echo esc_attr( $id ); ?>" name="<?php echo esc_attr( self::name( $key ) ); ?>" value="1" <?php checked( ! empty( $s[ $key ] ) ); ?> <?php echo $desc ? 'aria-describedby="' . esc_attr( $id ) . '-desc"' : ''; ?>>
			<?php echo esc_html( $label ); ?>
		</label>
		<?php if ( $desc ) : ?>
			<p class="description" id="<?php echo esc_attr( $id ); ?>-desc"><?php echo esc_html( $desc ); ?></p>
		<?php endif; ?>
		<?php
	}

	private static function select( $s, $key, $options ) {
		$id = 'fa11y-' . $key;
		?>
		<select id="<?php echo esc_attr( $id ); ?>" name="<?php echo esc_attr( self::name( $key ) ); ?>">
			<?php foreach ( $options as $val => $label ) : ?>
				<option value="<?php echo esc_attr( $val ); ?>" <?php selected( $s[ $key ], $val ); ?>><?php echo esc_html( $label ); ?></option>
			<?php endforeach; ?>
		</select>
		<?php
	}

	private static function colour( $s, $key ) {
		$id = 'fa11y-' . $key;
		?>
		<input type="text" class="fa11y-colour" id="<?php echo esc_attr( $id ); ?>" name="<?php echo esc_attr( self::name( $key ) ); ?>" value="<?php echo esc_attr( $s[ $key ] ); ?>" data-default-color="<?php echo esc_attr( FA11Y_Settings::defaults()[ $key ] ); ?>" pattern="^#([0-9a-fA-F]{3}){1,2}$" spellcheck="false">
		<?php
	}

	/**
	 * Modal dialog for choosing the dark-mode light/dark colours from the theme palette.
	 * Rendered outside the settings form so its radios are never submitted.
	 *
	 * @param array $entries Theme palette entries from FA11Y_Settings::theme_colours().
	 */
	private static function render_colour_chooser( $entries ) {
		if ( ! $entries ) {
			return;
		}
		$columns = array(
			'light' => array(
				'legend'  => __( 'Light colour', 'wpfree-accessibility-widget' ),
				'hint'    => __( 'Used for light areas, usually the background.', 'wpfree-accessibility-widget' ),
				'default' => array( '#FFFFFF', __( 'Pure white (default)', 'wpfree-accessibility-widget' ) ),
			),
			'dark'  => array(
				'legend'  => __( 'Dark colour', 'wpfree-accessibility-widget' ),
				'hint'    => __( 'Used for dark areas, usually text.', 'wpfree-accessibility-widget' ),
				'default' => array( '#000000', __( 'Pure black (default)', 'wpfree-accessibility-widget' ) ),
			),
		);
		$roles   = array(
			'background' => __( 'Theme background', 'wpfree-accessibility-widget' ),
			'text'       => __( 'Theme text', 'wpfree-accessibility-widget' ),
		);
		?>
		<dialog id="fa11y-pick" class="fa11y-pick" aria-labelledby="fa11y-pick-title" aria-describedby="fa11y-pick-intro">
			<div class="fa11y-pick-head">
				<h2 id="fa11y-pick-title"><?php esc_html_e( 'Choose your dark mode colours', 'wpfree-accessibility-widget' ); ?></h2>
				<button type="button" class="fa11y-pick-x" data-pick-close aria-label="<?php esc_attr_e( 'Close', 'wpfree-accessibility-widget' ); ?>"><span aria-hidden="true">&times;</span></button>
			</div>
			<p id="fa11y-pick-intro"><?php esc_html_e( 'Pick the colour your site uses for light areas and the one it uses for dark areas. Dark Mode swaps them with each other. Colours your theme uses for its background and text are labelled to help.', 'wpfree-accessibility-widget' ); ?></p>

			<div class="fa11y-pick-cols">
				<?php foreach ( $columns as $key => $col ) : ?>
					<fieldset class="fa11y-pick-group" data-pick-group="<?php echo esc_attr( $key ); ?>" aria-describedby="fa11y-pick-hint-<?php echo esc_attr( $key ); ?>">
						<legend><?php echo esc_html( $col['legend'] ); ?></legend>
						<p class="description" id="fa11y-pick-hint-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $col['hint'] ); ?></p>
						<div class="fa11y-pick-options">
							<label class="fa11y-pick-option">
								<input type="radio" name="fa11y-pick-<?php echo esc_attr( $key ); ?>" value="" data-hex="<?php echo esc_attr( $col['default'][0] ); ?>">
								<span class="fa11y-pick-swatch" style="background:<?php echo esc_attr( $col['default'][0] ); ?>" aria-hidden="true"></span>
								<span class="fa11y-pick-name"><?php echo esc_html( $col['default'][1] ); ?></span>
								<code><?php echo esc_html( $col['default'][0] ); ?></code>
							</label>
							<?php foreach ( $entries as $e ) : ?>
								<label class="fa11y-pick-option">
									<input type="radio" name="fa11y-pick-<?php echo esc_attr( $key ); ?>" value="<?php echo esc_attr( $e['hex'] ); ?>" data-hex="<?php echo esc_attr( $e['hex'] ); ?>">
									<span class="fa11y-pick-swatch" style="background:<?php echo esc_attr( $e['hex'] ); ?>" aria-hidden="true"></span>
									<span class="fa11y-pick-name"><?php echo esc_html( $e['name'] ); ?><?php if ( $e['role'] ) : ?> <span class="fa11y-pick-tag"><?php echo esc_html( $roles[ $e['role'] ] ); ?></span><?php endif; ?></span>
									<code><?php echo esc_html( $e['hex'] ); ?></code>
								</label>
							<?php endforeach; ?>
						</div>
					</fieldset>
				<?php endforeach; ?>
			</div>

			<div class="fa11y-dark-preview fa11y-pick-preview" aria-hidden="true">
				<div class="fa11y-dark-sample" data-pick-sample="normal"><strong><?php esc_html_e( 'Normal', 'wpfree-accessibility-widget' ); ?></strong><span><?php esc_html_e( 'Text on your background', 'wpfree-accessibility-widget' ); ?></span></div>
				<div class="fa11y-dark-sample" data-pick-sample="dark"><strong><?php esc_html_e( 'Dark mode', 'wpfree-accessibility-widget' ); ?></strong><span><?php esc_html_e( 'Text on your background', 'wpfree-accessibility-widget' ); ?></span></div>
			</div>
			<p class="fa11y-contrast" id="fa11y-pick-msg" aria-live="polite"></p>

			<div class="fa11y-pick-actions">
				<button type="button" class="button button-primary" id="fa11y-pick-apply"><?php esc_html_e( 'Use these colours', 'wpfree-accessibility-widget' ); ?></button>
				<button type="button" class="button" data-pick-close><?php esc_html_e( 'Cancel', 'wpfree-accessibility-widget' ); ?></button>
			</div>
		</dialog>
		<?php
	}

	/* ---------- Page ---------- */

	public static function render() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$s        = FA11Y_Settings::get();
		$enabled  = FA11Y_Settings::enabled_features( $s );
		$profiles = FA11Y_Settings::enabled_profiles( $s );
		$icons    = FA11Y_Settings::trigger_icons();
		?>
		<div class="wrap fa11y-admin">
			<h1><?php esc_html_e( 'Accessibility Widget', 'wpfree-accessibility-widget' ); ?></h1>

			<?php if ( isset( $_GET['fa11y-reset'] ) ) : // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- display only. ?>
				<div class="notice notice-success is-dismissible"><p><?php esc_html_e( 'Settings restored to defaults.', 'wpfree-accessibility-widget' ); ?></p></div>
			<?php endif; ?>
			<?php settings_errors(); ?>

			<p class="fa11y-intro"><?php esc_html_e( 'Adds an accessibility menu to every page of your site so visitors can adjust text, colours, spacing and navigation to suit their needs. Visitors\' choices are remembered on their device.', 'wpfree-accessibility-widget' ); ?></p>

			<form method="post" action="options.php" novalidate>
				<?php settings_fields( 'fa11y' ); ?>
				<input type="hidden" name="<?php echo esc_attr( self::name( '_form' ) ); ?>" value="1">

				<div class="fa11y-layout">
					<div class="fa11y-main">

						<div class="fa11y-card">
							<h2><?php esc_html_e( 'General', 'wpfree-accessibility-widget' ); ?></h2>
							<table class="form-table" role="presentation">
								<tr>
									<th scope="row"><?php esc_html_e( 'Status', 'wpfree-accessibility-widget' ); ?></th>
									<td><?php self::checkbox( $s, 'enabled', __( 'Show the accessibility menu on the front end', 'wpfree-accessibility-widget' ) ); ?></td>
								</tr>
								<tr>
									<th scope="row"><?php esc_html_e( 'Devices', 'wpfree-accessibility-widget' ); ?></th>
									<td>
										<fieldset>
											<legend class="screen-reader-text"><?php esc_html_e( 'Devices', 'wpfree-accessibility-widget' ); ?></legend>
											<?php self::checkbox( $s, 'hide_mobile', __( 'Hide on mobile (screens narrower than 768px)', 'wpfree-accessibility-widget' ) ); ?><br>
											<?php self::checkbox( $s, 'hide_desktop', __( 'Hide on desktop (768px and wider)', 'wpfree-accessibility-widget' ) ); ?>
										</fieldset>
									</td>
								</tr>
								<tr>
									<th scope="row"><?php esc_html_e( 'Behaviour', 'wpfree-accessibility-widget' ); ?></th>
									<td>
										<fieldset>
											<legend class="screen-reader-text"><?php esc_html_e( 'Behaviour', 'wpfree-accessibility-widget' ); ?></legend>
											<?php self::checkbox( $s, 'remember', __( 'Remember visitors\' choices between visits', 'wpfree-accessibility-widget' ), __( 'Stored only in the visitor\'s browser (localStorage). No cookies, no tracking. When off, choices last until the browser tab is closed.', 'wpfree-accessibility-widget' ) ); ?>
											<?php self::checkbox( $s, 'shortcut', __( 'Enable the Alt + A keyboard shortcut', 'wpfree-accessibility-widget' ) ); ?><br>
											<?php self::checkbox( $s, 'respect_os_motion', __( 'Stop animations automatically if the visitor\'s device asks for reduced motion', 'wpfree-accessibility-widget' ) ); ?>
										</fieldset>
									</td>
								</tr>
							</table>
						</div>

						<div class="fa11y-card">
							<h2><?php esc_html_e( 'Placement', 'wpfree-accessibility-widget' ); ?></h2>
							<table class="form-table" role="presentation">
								<tr>
									<th scope="row"><label for="fa11y-position"><?php esc_html_e( 'Position', 'wpfree-accessibility-widget' ); ?></label></th>
									<td><?php self::select( $s, 'position', FA11Y_Settings::positions() ); ?></td>
								</tr>
								<tr>
									<th scope="row"><label for="fa11y-offset_x"><?php esc_html_e( 'Horizontal offset', 'wpfree-accessibility-widget' ); ?></label></th>
									<td><input type="number" id="fa11y-offset_x" class="small-text" min="0" max="300" step="1" name="<?php echo esc_attr( self::name( 'offset_x' ) ); ?>" value="<?php echo esc_attr( $s['offset_x'] ); ?>" aria-describedby="fa11y-offset-desc"> px</td>
								</tr>
								<tr>
									<th scope="row"><label for="fa11y-offset_y"><?php esc_html_e( 'Vertical offset', 'wpfree-accessibility-widget' ); ?></label></th>
									<td>
										<input type="number" id="fa11y-offset_y" class="small-text" min="0" max="300" step="1" name="<?php echo esc_attr( self::name( 'offset_y' ) ); ?>" value="<?php echo esc_attr( $s['offset_y'] ); ?>" aria-describedby="fa11y-offset-desc"> px
										<p class="description" id="fa11y-offset-desc"><?php esc_html_e( 'Distance from the edge of the screen. Increase this if the button overlaps a chat widget, cookie banner or "back to top" button. Vertical offset is ignored for middle positions.', 'wpfree-accessibility-widget' ); ?></p>
									</td>
								</tr>
							</table>
						</div>

						<div class="fa11y-card">
							<h2><?php esc_html_e( 'Appearance', 'wpfree-accessibility-widget' ); ?></h2>
							<table class="form-table" role="presentation">
								<tr>
									<th scope="row"><?php esc_html_e( 'Icon', 'wpfree-accessibility-widget' ); ?></th>
									<td>
										<fieldset class="fa11y-icon-choices">
											<legend class="screen-reader-text"><?php esc_html_e( 'Icon', 'wpfree-accessibility-widget' ); ?></legend>
											<?php foreach ( $icons as $key => $icon ) : ?>
												<label class="fa11y-icon-choice">
													<input type="radio" name="<?php echo esc_attr( self::name( 'icon' ) ); ?>" value="<?php echo esc_attr( $key ); ?>" <?php checked( $s['icon'], $key ); ?>>
													<span class="fa11y-icon-swatch"><?php echo $icon['svg']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static SVG defined in plugin. ?></span>
													<span class="fa11y-icon-name"><?php echo esc_html( $icon['label'] ); ?></span>
												</label>
											<?php endforeach; ?>
										</fieldset>
									</td>
								</tr>
								<tr>
									<th scope="row"><label for="fa11y-icon_size"><?php esc_html_e( 'Button size', 'wpfree-accessibility-widget' ); ?></label></th>
									<td>
										<?php self::select( $s, 'icon_size', FA11Y_Settings::icon_sizes() ); ?>
										<p class="description"><?php esc_html_e( 'All sizes meet the WCAG 2.2 minimum target size (24px) and the enhanced 44px target size.', 'wpfree-accessibility-widget' ); ?></p>
									</td>
								</tr>
								<tr>
									<th scope="row"><label for="fa11y-shape"><?php esc_html_e( 'Button shape', 'wpfree-accessibility-widget' ); ?></label></th>
									<td><?php self::select( $s, 'shape', FA11Y_Settings::shapes() ); ?></td>
								</tr>
								<tr>
									<th scope="row"><label for="fa11y-button_bg"><?php esc_html_e( 'Button background colour', 'wpfree-accessibility-widget' ); ?></label></th>
									<td><?php self::colour( $s, 'button_bg' ); ?></td>
								</tr>
								<tr>
									<th scope="row"><label for="fa11y-button_fg"><?php esc_html_e( 'Button icon colour', 'wpfree-accessibility-widget' ); ?></label></th>
									<td>
										<?php self::colour( $s, 'button_fg' ); ?>
										<p class="fa11y-contrast" id="fa11y-contrast-button" aria-live="polite"></p>
									</td>
								</tr>
								<tr>
									<th scope="row"><label for="fa11y-accent"><?php esc_html_e( 'Menu accent colour', 'wpfree-accessibility-widget' ); ?></label></th>
									<td>
										<?php self::colour( $s, 'accent' ); ?>
										<p class="description"><?php esc_html_e( 'Used for the menu header and active settings. Text on top of it is automatically set to black or white, whichever has the higher contrast.', 'wpfree-accessibility-widget' ); ?></p>
										<p class="fa11y-contrast" id="fa11y-contrast-accent" aria-live="polite"></p>
									</td>
								</tr>
								<tr>
									<th scope="row"><label for="fa11y-panel_theme"><?php esc_html_e( 'Menu theme', 'wpfree-accessibility-widget' ); ?></label></th>
									<td><?php self::select( $s, 'panel_theme', FA11Y_Settings::panel_themes() ); ?></td>
								</tr>
							</table>
						</div>

						<div class="fa11y-card">
							<h2><?php esc_html_e( 'Dark mode colours', 'wpfree-accessibility-widget' ); ?></h2>
							<p class="fa11y-card-intro"><?php esc_html_e( 'The Dark Mode profile swaps your site\'s light and dark colours and leaves brand colours alone. If your theme uses an off-white or a dark grey rather than pure white and black, choose them here so they swap with each other exactly. Shades in between are mapped proportionally. Leave both blank to use pure white and black.', 'wpfree-accessibility-widget' ); ?></p>
							<?php $theme = FA11Y_Settings::theme_colours(); ?>
							<?php if ( $theme['entries'] ) : ?>
								<p>
									<button type="button" class="button" id="fa11y-pick-open" aria-haspopup="dialog" aria-describedby="fa11y-pick-open-desc">
										<?php esc_html_e( 'Choose from my theme\'s colours…', 'wpfree-accessibility-widget' ); ?>
									</button>
								</p>
								<p class="description" id="fa11y-pick-open-desc">
									<?php
									/* translators: %d: number of colours. */
									printf( esc_html( _n( 'Pick from the %d colour in your theme\'s palette.', 'Pick from the %d colours in your theme\'s palette.', count( $theme['entries'] ), 'wpfree-accessibility-widget' ) ), count( $theme['entries'] ) );
									?>
								</p>
							<?php endif; ?>
							<table class="form-table" role="presentation">
								<tr>
									<th scope="row"><label for="fa11y-dark_light"><?php esc_html_e( 'Light colour', 'wpfree-accessibility-widget' ); ?></label></th>
									<td>
										<?php self::colour( $s, 'dark_light' ); ?>
										<p class="description"><?php esc_html_e( 'Your usual background colour, e.g. white or off-white. In dark mode it becomes the dark colour.', 'wpfree-accessibility-widget' ); ?></p>
									</td>
								</tr>
								<tr>
									<th scope="row"><label for="fa11y-dark_dark"><?php esc_html_e( 'Dark colour', 'wpfree-accessibility-widget' ); ?></label></th>
									<td>
										<?php self::colour( $s, 'dark_dark' ); ?>
										<p class="description"><?php esc_html_e( 'Your usual text colour, e.g. black or dark grey. In dark mode it becomes the light colour.', 'wpfree-accessibility-widget' ); ?></p>
									</td>
								</tr>
							</table>
							<div class="fa11y-dark-preview" aria-hidden="true">
								<div class="fa11y-dark-sample" data-mode="normal"><strong><?php esc_html_e( 'Normal', 'wpfree-accessibility-widget' ); ?></strong><span><?php esc_html_e( 'Text on your background', 'wpfree-accessibility-widget' ); ?></span></div>
								<div class="fa11y-dark-sample" data-mode="dark"><strong><?php esc_html_e( 'Dark mode', 'wpfree-accessibility-widget' ); ?></strong><span><?php esc_html_e( 'Text on your background', 'wpfree-accessibility-widget' ); ?></span></div>
							</div>
							<p class="fa11y-contrast" id="fa11y-contrast-dark" aria-live="polite"></p>
						</div>

						<div class="fa11y-card">
							<h2><?php esc_html_e( 'Menu text & links', 'wpfree-accessibility-widget' ); ?></h2>
							<table class="form-table" role="presentation">
								<tr>
									<th scope="row"><label for="fa11y-title"><?php esc_html_e( 'Menu title', 'wpfree-accessibility-widget' ); ?></label></th>
									<td>
										<input type="text" class="regular-text" id="fa11y-title" name="<?php echo esc_attr( self::name( 'title' ) ); ?>" value="<?php echo esc_attr( $s['title'] ); ?>" aria-describedby="fa11y-title-desc">
										<p class="description" id="fa11y-title-desc"><?php esc_html_e( 'Also used as the button\'s accessible name for screen reader users.', 'wpfree-accessibility-widget' ); ?></p>
									</td>
								</tr>
								<tr>
									<th scope="row"><label for="fa11y-statement_url"><?php esc_html_e( 'Accessibility statement URL', 'wpfree-accessibility-widget' ); ?></label></th>
									<td>
										<input type="url" class="regular-text" id="fa11y-statement_url" name="<?php echo esc_attr( self::name( 'statement_url' ) ); ?>" value="<?php echo esc_attr( $s['statement_url'] ); ?>" placeholder="https://" aria-describedby="fa11y-statement-desc">
										<p class="description" id="fa11y-statement-desc"><?php esc_html_e( 'Optional. Adds a link to your accessibility statement at the bottom of the menu. Leave blank to hide it.', 'wpfree-accessibility-widget' ); ?></p>
									</td>
								</tr>
								<tr>
									<th scope="row"><label for="fa11y-statement_text"><?php esc_html_e( 'Statement link text', 'wpfree-accessibility-widget' ); ?></label></th>
									<td><input type="text" class="regular-text" id="fa11y-statement_text" name="<?php echo esc_attr( self::name( 'statement_text' ) ); ?>" value="<?php echo esc_attr( $s['statement_text'] ); ?>"></td>
								</tr>
							</table>
						</div>

						<div class="fa11y-card">
							<h2><?php esc_html_e( 'Features', 'wpfree-accessibility-widget' ); ?></h2>
							<p><?php esc_html_e( 'Choose which options visitors can use. Unticked features are hidden from the menu.', 'wpfree-accessibility-widget' ); ?></p>
							<p><button type="button" class="button" data-fa11y-check="all"><?php esc_html_e( 'Select all', 'wpfree-accessibility-widget' ); ?></button> <button type="button" class="button" data-fa11y-check="none"><?php esc_html_e( 'Select none', 'wpfree-accessibility-widget' ); ?></button></p>

							<fieldset class="fa11y-feature-group">
								<legend><?php esc_html_e( 'Accessibility profiles (one-click presets)', 'wpfree-accessibility-widget' ); ?></legend>
								<div class="fa11y-checks">
									<?php foreach ( FA11Y_Settings::profiles() as $id => $label ) : ?>
										<label><input type="checkbox" name="<?php echo esc_attr( self::name( 'profiles' ) ); ?>[]" value="<?php echo esc_attr( $id ); ?>" <?php checked( in_array( $id, $profiles, true ) ); ?>> <?php echo esc_html( $label ); ?></label>
									<?php endforeach; ?>
								</div>
							</fieldset>

							<?php foreach ( FA11Y_Settings::feature_groups() as $group ) : ?>
								<fieldset class="fa11y-feature-group">
									<legend><?php echo esc_html( $group['label'] ); ?></legend>
									<div class="fa11y-checks">
										<?php foreach ( $group['items'] as $id => $label ) : ?>
											<label><input type="checkbox" name="<?php echo esc_attr( self::name( 'features' ) ); ?>[]" value="<?php echo esc_attr( $id ); ?>" <?php checked( in_array( $id, $enabled, true ) ); ?>> <?php echo esc_html( $label ); ?></label>
										<?php endforeach; ?>
									</div>
								</fieldset>
							<?php endforeach; ?>
							<p class="description"><?php esc_html_e( 'Read aloud uses the visitor\'s browser speech engine and is hidden automatically in browsers that do not support it.', 'wpfree-accessibility-widget' ); ?></p>
						</div>

						<?php submit_button(); ?>
					</div>

					<aside class="fa11y-side" aria-labelledby="fa11y-preview-title">
						<div class="fa11y-card fa11y-sticky">
							<h2 id="fa11y-preview-title"><?php esc_html_e( 'Preview', 'wpfree-accessibility-widget' ); ?></h2>
							<div class="fa11y-preview" aria-hidden="true">
								<div class="fa11y-preview-screen" data-position="<?php echo esc_attr( $s['position'] ); ?>">
									<span class="fa11y-preview-btn" data-shape="<?php echo esc_attr( $s['shape'] ); ?>" data-size="<?php echo esc_attr( $s['icon_size'] ); ?>"><?php echo $icons[ $s['icon'] ]['svg']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static SVG. ?></span>
								</div>
							</div>
							<p class="description"><?php esc_html_e( 'Updates as you change placement and appearance settings. Save to apply them to your site.', 'wpfree-accessibility-widget' ); ?></p>
							<h3><?php esc_html_e( 'Your own site\'s accessibility', 'wpfree-accessibility-widget' ); ?></h3>
							<p class="description"><?php esc_html_e( 'This menu helps visitors personalise their experience, but it doesn\'t make a site WCAG compliant by itself. Keep using good headings, alt text, colour contrast and keyboard-friendly design in your theme and content.', 'wpfree-accessibility-widget' ); ?></p>
						</div>
					</aside>
				</div>
			</form>

			<?php self::render_colour_chooser( $theme['entries'] ); ?>

			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="fa11y-reset-form">
				<input type="hidden" name="action" value="fa11y_reset">
				<?php wp_nonce_field( 'fa11y_reset' ); ?>
				<button type="submit" class="button button-link-delete" onclick="return confirm('<?php echo esc_js( __( 'Restore all accessibility widget settings to their defaults?', 'wpfree-accessibility-widget' ) ); ?>');"><?php esc_html_e( 'Restore default settings', 'wpfree-accessibility-widget' ); ?></button>
			</form>
		</div>
		<?php
	}
}
