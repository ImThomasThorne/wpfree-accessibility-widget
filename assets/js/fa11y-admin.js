/* Free Accessibility — admin settings: colour pickers, live preview, WCAG contrast checks. */
(function ($) {
	'use strict';

	var icons = (window.fa11yAdmin && window.fa11yAdmin.icons) || {};
	var $screen = $('.fa11y-preview-screen');
	var $btn = $('.fa11y-preview-btn');

	function hex(v) {
		v = String(v || '').trim();
		if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
		return /^#[0-9a-f]{6}$/i.test(v) ? v : null;
	}
	function lum(h) {
		var c = [1, 3, 5].map(function (i) {
			var x = parseInt(h.substr(i, 2), 16) / 255;
			return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
	}
	function ratio(a, b) {
		var l1 = lum(a), l2 = lum(b);
		return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
	}
	function readable(bg) {
		return ratio(bg, '#000000') >= ratio(bg, '#FFFFFF') ? '#000000' : '#FFFFFF';
	}
	function val(id) {
		var $i = $('#fa11y-' + id);
		return hex($i.val());
	}

	function report($el, r, need, okMsg, failMsg) {
		var pass = r >= need;
		$el.removeClass('is-pass is-fail').addClass(pass ? 'is-pass' : 'is-fail')
			.html('<strong>' + (pass ? 'Pass' : 'Low contrast') + '</strong> — ' + r.toFixed(2) + ':1. ' + (pass ? okMsg : failMsg));
	}

	function update() {
		var bg = val('button_bg') || '#0B3A66';
		var fg = val('button_fg') || '#FFFFFF';
		var accent = val('accent') || '#0B3A66';

		$btn.css({ background: bg, color: fg, borderColor: fg });
		$screen.attr('data-position', $('#fa11y-position').val());
		$btn.attr('data-shape', $('#fa11y-shape').val());
		$btn.attr('data-size', $('#fa11y-icon_size').val());
		var icon = $('input[name$="[icon]"]:checked').val();
		if (icons[icon]) $btn.html(icons[icon]);

		report($('#fa11y-contrast-button'), ratio(bg, fg), 3,
			'The icon meets WCAG 1.4.11 non-text contrast (3:1).',
			'The icon needs at least 3:1 against the button background (WCAG 1.4.11).');

		var panelBg = $('#fa11y-panel_theme').val() === 'dark' ? '#1B1D21' : '#FFFFFF';
		var r = ratio(accent, panelBg);
		// Dark mode colours (blank = pure white / black)
		var light = val('dark_light') || '#FFFFFF';
		var dark = val('dark_dark') || '#000000';
		$('.fa11y-dark-sample[data-mode="normal"]').css({ background: light, color: dark, borderColor: dark });
		$('.fa11y-dark-sample[data-mode="dark"]').css({ background: dark, color: light, borderColor: light });
		report($('#fa11y-contrast-dark'), ratio(light, dark), 4.5,
			'Text stays readable in dark mode (WCAG 1.4.3 needs 4.5:1).',
			'These two colours are too similar to each other. Text needs at least 4.5:1 to stay readable in dark mode (WCAG 1.4.3).');

		report($('#fa11y-contrast-accent'), r, 3,
			'Header text will be ' + (readable(accent) === '#000000' ? 'black' : 'white') + ' (' + ratio(accent, readable(accent)).toFixed(2) + ':1). Active settings stand out from the menu background.',
			'Active settings may be hard to tell apart from the menu background. Choose a colour with at least 3:1 against ' + (panelBg === '#FFFFFF' ? 'white' : 'the dark menu') + '.');
	}

	$('.fa11y-colour').wpColorPicker({
		palettes: (window.fa11yAdmin && window.fa11yAdmin.palette) || true, // theme palette as quick-pick swatches
		change: function (e, ui) {
			$(e.target).val(ui.color.toString());
			update();
		},
		clear: function () { setTimeout(update, 0); }
	});

	/* ---------- Dark mode colour chooser (native modal <dialog>) ---------- */
	var dialog = document.getElementById('fa11y-pick');
	var $opener = $('#fa11y-pick-open');

	function setPicker(id, value) {
		var $i = $('#fa11y-' + id);
		if (value) {
			$i.wpColorPicker('color', value);
		} else {
			// Blank = automatic (pure white / black). Clear the field and its swatch.
			$i.val('');
			$i.closest('.wp-picker-container').find('.wp-color-result').css('background-color', '');
		}
	}

	function chosen(group) {
		var $r = $(dialog).find('input[name="fa11y-pick-' + group + '"]:checked');
		return $r.length ? { value: $r.val(), hex: $r.data('hex') } : null;
	}

	function preselect(group, current) {
		var $radios = $(dialog).find('input[name="fa11y-pick-' + group + '"]');
		$(dialog).find('.fa11y-pick-custom[data-group="' + group + '"]').remove();
		var match = $radios.filter(function () { return String(this.value).toUpperCase() === current; });
		if (!match.length && current) {
			// Keep a colour that isn't in the theme palette available as an option.
			var $opt = $('<label class="fa11y-pick-option fa11y-pick-custom"></label>').attr('data-group', group)
				.append($('<input type="radio">').attr({ name: 'fa11y-pick-' + group, value: current, 'data-hex': current }))
				.append($('<span class="fa11y-pick-swatch" aria-hidden="true"></span>').css('background', current))
				.append($('<span class="fa11y-pick-name">Your current colour</span>'))
				.append($('<code></code>').text(current));
			$(dialog).find('[data-pick-group="' + group + '"] .fa11y-pick-options').prepend($opt);
			match = $opt.find('input');
		}
		(match.length ? match : $radios.filter('[value=""]')).first().prop('checked', true);
	}

	function updateDialog() {
		var l = chosen('light'), d = chosen('dark');
		if (!l || !d) return;
		$(dialog).find('[data-pick-sample="normal"]').css({ background: l.hex, color: d.hex, borderColor: d.hex });
		$(dialog).find('[data-pick-sample="dark"]').css({ background: d.hex, color: l.hex, borderColor: l.hex });
		var $msg = $('#fa11y-pick-msg');
		if (String(l.hex).toUpperCase() === String(d.hex).toUpperCase()) {
			$msg.removeClass('is-pass').addClass('is-fail').html('<strong>Same colour</strong> — choose two different colours.');
			return;
		}
		report($msg, ratio(l.hex, d.hex), 4.5,
			'Text stays readable in dark mode.',
			'These colours are too similar. Text needs at least 4.5:1 (WCAG 1.4.3) — you can still use them, but text may be hard to read.');
	}

	if (dialog && typeof dialog.showModal === 'function') {
		$opener.on('click', function () {
			preselect('light', (hex($('#fa11y-dark_light').val()) || '').toUpperCase());
			preselect('dark', (hex($('#fa11y-dark_dark').val()) || '').toUpperCase());
			updateDialog();
			dialog.showModal();
			// Start on the selected light colour so arrow keys move through the options.
			var first = dialog.querySelector('input[name="fa11y-pick-light"]:checked');
			if (first) first.focus();
		});
		$(dialog).on('change', 'input[type="radio"]', updateDialog);
		$(dialog).on('click', '[data-pick-close]', function () { dialog.close(); });
		$('#fa11y-pick-apply').on('click', function () {
			var l = chosen('light'), d = chosen('dark');
			if (String(l.hex).toUpperCase() === String(d.hex).toUpperCase()) {
				updateDialog();
				$(dialog).find('input[name="fa11y-pick-dark"]:checked').trigger('focus');
				return;
			}
			setPicker('dark_light', l.value);
			setPicker('dark_dark', d.value);
			update();
			dialog.close();
			if (window.wp && wp.a11y && wp.a11y.speak) {
				wp.a11y.speak('Dark mode colours updated. Save changes to apply them.');
			}
		});
		// Return focus to the button that opened the dialog (Escape, Cancel or Apply).
		dialog.addEventListener('close', function () { $opener.trigger('focus'); });
	} else {
		$opener.closest('p').hide();
		$('#fa11y-pick-open-desc').hide();
	}

	$('#fa11y-position, #fa11y-shape, #fa11y-icon_size, #fa11y-panel_theme').on('change', update);
	$('input[name$="[icon]"]').on('change', update);
	$('.fa11y-colour').on('input', update);

	$('[data-fa11y-check]').on('click', function () {
		var on = $(this).data('fa11y-check') === 'all';
		$('.fa11y-feature-group input[type="checkbox"]').prop('checked', on);
	});

	update();
})(jQuery);
