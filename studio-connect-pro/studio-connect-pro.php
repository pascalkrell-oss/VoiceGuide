<?php
/**
 * Plugin Name: StudioConnect Pro
 * Description: Premium-Chat-Widget im Support-Portal-Design für Pascal Krell Studio.
 * Version: 8.0.0
 * Author: Pascal Krell Studio
 * License: GPL-2.0+
 */

if (!defined('ABSPATH')) {
    exit;
}

const SCP_AVATAR_URL = 'https://dev.pascal-krell.de/wp-content/uploads/2026/02/Studio-Helfer_Avatar_Sprecher-Pascal-Krell.webp';

/**
 * Registrierung der Plugin-Einstellungen.
 */
function scp_register_settings(): void
{
    register_setting('studio_connect_settings', 'studio_connect_contact_email', [
        'type' => 'string',
        'sanitize_callback' => 'sanitize_email',
        'default' => '',
    ]);

    register_setting('studio_connect_settings', 'studio_connect_contact_phone', [
        'type' => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default' => '',
    ]);

    register_setting('studio_connect_settings', 'studio_connect_contact_whatsapp', [
        'type' => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default' => '',
    ]);
}
add_action('admin_init', 'scp_register_settings');

/**
 * Einstellungsseite im WordPress-Backend hinzufügen.
 */
function scp_add_settings_page(): void
{
    add_options_page(
        'Pascal Krell StudioConnect',
        'Pascal Krell StudioConnect',
        'manage_options',
        'studio-connect-pro',
        'scp_render_settings_page'
    );
}
add_action('admin_menu', 'scp_add_settings_page');

/**
 * Ausgabe der Einstellungsseite.
 */
function scp_render_settings_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }
    ?>
    <div class="wrap">
        <h1>Pascal Krell StudioConnect Einstellungen</h1>
        <form method="post" action="options.php">
            <?php settings_fields('studio_connect_settings'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="studio_connect_contact_email">E-Mail Adresse</label></th>
                    <td>
                        <input type="email" id="studio_connect_contact_email" name="studio_connect_contact_email"
                               class="regular-text" value="<?php echo esc_attr(get_option('studio_connect_contact_email', '')); ?>" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="studio_connect_contact_phone">Telefonnummer</label></th>
                    <td>
                        <input type="text" id="studio_connect_contact_phone" name="studio_connect_contact_phone"
                               class="regular-text" value="<?php echo esc_attr(get_option('studio_connect_contact_phone', '')); ?>" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="studio_connect_contact_whatsapp">WhatsApp Nummer</label></th>
                    <td>
                        <input type="text" id="studio_connect_contact_whatsapp" name="studio_connect_contact_whatsapp"
                               class="regular-text" value="<?php echo esc_attr(get_option('studio_connect_contact_whatsapp', '')); ?>" />
                        <p class="description">Beispiel: +491721234567</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

/**
 * Styles und Skripte registrieren und lokal konfigurieren.
 */
function scp_enqueue_assets(): void
{
    $plugin_url = plugin_dir_url(__FILE__);
    $settings = [
        'ajax_url' => admin_url('admin-ajax.php'),
        'email' => get_option('studio_connect_contact_email', ''),
        'phone' => get_option('studio_connect_contact_phone', ''),
        'whatsapp' => get_option('studio_connect_contact_whatsapp', ''),
        'avatar_url' => SCP_AVATAR_URL,
        'callback_nonce' => wp_create_nonce('scp_callback_request'),
        'module_links' => [
            'studiofinder' => home_url('/extras/studio-finder/'),
            'gagenrechner' => home_url('/extras/gagenrechner/'),
            'skriptanalyse' => home_url('/extras/skript-analyse-fuer-sprecher-und-autoren/'),
        ],
        'nav_links' => [
            'werbung' => home_url('/sprecher-audio-leistungen/werbesprecher/'),
            'webvideo' => home_url('/sprecher-audio-leistungen/voiceover-social-media/'),
            'telefonansage' => home_url('/sprecher-audio-leistungen/telefonansagen-warteschleife-mailbox/'),
            'podcast' => home_url('/sprecher-audio-leistungen/podcast-service-editing-intro-outro-produktion/'),
            'imagefilm' => home_url('/sprecher-audio-leistungen/imagefilm-sprecher/'),
            'erklaervideo' => home_url('/sprecher-audio-leistungen/erklaervideo-sprecher/'),
            'elearning' => home_url('/sprecher-audio-leistungen/e-learning-sprecher/'),
        ],
    ];

    wp_register_style(
        'studio-connect-fontawesome',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
        [],
        '6.5.1'
    );
    wp_enqueue_style('studio-connect-fontawesome');

    wp_enqueue_style(
        'studio-connect-pro-style',
        $plugin_url . 'assets/css/style.css',
        [],
        '8.0.0'
    );

    wp_enqueue_script(
        'studio-connect-pro-script',
        $plugin_url . 'assets/js/script.js',
        [],
        '8.0.0',
        true
    );

    wp_localize_script('studio-connect-pro-script', 'sc_vars', $settings);
}
add_action('wp_enqueue_scripts', 'scp_enqueue_assets');



/**
 * AJAX: Rückrufwunsch speichern und per Mail senden.
 */
function scp_handle_callback_request(): void
{
    check_ajax_referer('scp_callback_request', 'security');

    $ip = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : 'unknown';
    $rate_key = 'scp_callback_rate_' . md5($ip);
    $rate_data = get_transient($rate_key);
    if (!is_array($rate_data)) {
        $rate_data = ['count' => 0, 'started' => time()];
    }

    if ((int) $rate_data['count'] >= 3) {
        wp_send_json_error(['message' => 'Du hast das Limit erreicht. Bitte versuche es in ca. 60 Minuten erneut.'], 429);
    }

    $phone = isset($_POST['phone']) ? sanitize_text_field(wp_unslash($_POST['phone'])) : '';
    $time = isset($_POST['time']) ? sanitize_text_field(wp_unslash($_POST['time'])) : '';
    $note = isset($_POST['note']) ? sanitize_textarea_field(wp_unslash($_POST['note'])) : '';
    $page_url = isset($_POST['page_url']) ? esc_url_raw(wp_unslash($_POST['page_url'])) : '';
    $page_context_key = isset($_POST['page_context_key']) ? sanitize_key(wp_unslash($_POST['page_context_key'])) : 'general';

    if (!preg_match('/^[+\d\s()\-]{7,}$/', $phone)) {
        wp_send_json_error(['message' => 'Bitte gib eine gültige Telefonnummer an.'], 400);
    }

    if (!preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $time)) {
        wp_send_json_error(['message' => 'Bitte wähle eine gültige Wunschuhrzeit.'], 400);
    }

    if (mb_strlen($note) > 240) {
        $note = mb_substr($note, 0, 240);
    }

    $to = get_option('studio_connect_contact_email', '');
    if (!$to || !is_email($to)) {
        $to = get_option('admin_email');
    }

    if (!$to || !is_email($to)) {
        wp_send_json_error(['message' => 'Es ist aktuell keine Empfänger-E-Mail konfiguriert.'], 500);
    }

    $subject = '[Studio Assistenz] Rückruf gewünscht';
    $body_lines = [
        'Telefon: ' . $phone,
        'Wunschzeit: ' . $time,
        'Notiz: ' . ($note !== '' ? $note : '-'),
        'URL: ' . ($page_url !== '' ? $page_url : '-'),
        'Kontext: ' . ($page_context_key !== '' ? $page_context_key : 'general'),
        'Zeitpunkt: ' . wp_date('Y-m-d H:i:s'),
        'IP: ' . $ip,
    ];

    $sent = wp_mail($to, $subject, implode("\n", $body_lines));
    if (!$sent) {
        wp_send_json_error(['message' => 'Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.'], 500);
    }

    $rate_data['count'] = (int) $rate_data['count'] + 1;
    set_transient($rate_key, $rate_data, HOUR_IN_SECONDS);

    wp_send_json_success(['message' => 'Danke! Dein Rückrufwunsch wurde gesendet.']);
}
add_action('wp_ajax_scp_callback_request', 'scp_handle_callback_request');
add_action('wp_ajax_nopriv_scp_callback_request', 'scp_handle_callback_request');

/**
 * Frontend-Markup ausgeben.
 */
function scp_render_widget(): void
{
    ?>
    <div class="studio-connect-widget" id="sc-widget" aria-live="polite">
        <div id="sc-proactive-root"></div>
        <button class="studio-connect-launcher" id="sc-launcher" type="button" aria-label="Pascal Krell StudioConnect öffnen">
            <span class="studio-connect-launcher-icon" aria-hidden="true">
                <i class="fa-solid fa-life-ring"></i>
            </span>
        </button>
        <div class="studio-connect-panel" id="sc-container" role="dialog" aria-label="Pascal Krell StudioConnect" aria-hidden="true" tabindex="-1">
            <div class="studio-connect-header">
                <div class="studio-connect-header-icon" aria-hidden="true">
                    <i class="fa-solid fa-life-ring"></i>
                </div>
                <div class="studio-connect-header-text">
                    <div class="studio-connect-title">Studio Assistenz</div>
                    <div class="studio-connect-subtitle" id="studio-connect-subtext">Du bist hier: Start</div>
                </div>
                <div class="studio-connect-header-actions">
                    <button class="studio-connect-close" id="studio-connect-close" type="button" aria-label="Chat schließen">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                </div>
            </div>

            <div class="studio-connect-body" id="sc-body">
                <div class="studio-connect-chat-area" id="studio-connect-chat-area">
                    <div class="studio-connect-messages" id="studio-connect-messages"></div>
                </div>
                <div class="studio-connect-option-dock" id="sc-dock">
                    <div class="studio-connect-options" id="studio-connect-options"></div>
                    <div class="studio-connect-calculator" id="studio-connect-calculator" aria-hidden="true">
                        <div class="studio-connect-result" id="studio-connect-result"></div>
                        <div class="studio-connect-hint">Erhalte Infos zur Sprechzeit Deines Skripts (Basis: 130 Wörter/Min).</div>
                        <label for="studio-connect-words" class="studio-connect-label">Wortanzahl</label>
                        <input id="studio-connect-words" type="number" min="0" inputmode="numeric" placeholder="z.B. 520" />
                        <button class="studio-connect-calculator-btn" id="studio-connect-calculator-cta" type="button">
                            Angebot dafür anfragen
                        </button>
                    </div>
                </div>
                <div class="studio-connect-footer">
                    <button class="studio-connect-home" id="sc-reset" type="button" aria-label="Home / Neustart">
                        <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
                        <span class="studio-connect-home-tooltip" aria-hidden="true">Neustart</span>
                        <span class="studio-connect-home-badge" aria-hidden="true"></span>
                    </button>
                    <div class="studio-connect-footer-socials">
                        <a class="studio-connect-social" href="https://www.tiktok.com/@sprecher_pascal" target="_blank" rel="noopener" aria-label="TikTok">
                            <i class="fa-brands fa-tiktok" aria-hidden="true"></i>
                        </a>
                        <a class="studio-connect-social" href="https://www.instagram.com/sprecher_pascal/" target="_blank" rel="noopener" aria-label="Instagram">
                            <i class="fa-brands fa-instagram" aria-hidden="true"></i>
                        </a>
                        <a class="studio-connect-social" href="https://www.youtube.com/@sprecher_pascal-krell" target="_blank" rel="noopener" aria-label="YouTube">
                            <i class="fa-brands fa-youtube" aria-hidden="true"></i>
                        </a>
                        <a class="studio-connect-social" href="https://www.linkedin.com/in/pascal-krell-220454138/" target="_blank" rel="noopener" aria-label="LinkedIn">
                            <i class="fa-brands fa-linkedin-in" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="studio-connect-toast" id="studio-connect-toast" role="status" aria-live="polite"></div>
        </div>
    </div>
    <?php
}
add_action('wp_footer', 'scp_render_widget');
