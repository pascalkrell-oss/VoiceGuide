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
 * Frontend-Markup ausgeben.
 */
function scp_render_widget(): void
{
    ?>
    <div class="studio-connect-widget" id="sc-widget" aria-live="polite">
        <button class="studio-connect-launcher" id="sc-launcher" type="button" aria-label="Pascal Krell StudioConnect öffnen">
            <span class="studio-connect-launcher-icon" aria-hidden="true">
                <i class="fa-solid fa-question"></i>
            </span>
        </button>
        <div class="studio-connect-panel" id="sc-container" role="dialog" aria-label="Pascal Krell StudioConnect" aria-hidden="true" tabindex="-1">
            <div class="studio-connect-header">
                <div class="studio-connect-header-icon" aria-hidden="true">
                    <i class="fa-solid fa-life-ring"></i>
                </div>
                <div class="studio-connect-header-text">
                    <div class="studio-connect-title">Support Portal</div>
                    <div class="studio-connect-subtitle" id="studio-connect-subtext">Hilfe-System und Tipps</div>
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
