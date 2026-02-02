<?php
/**
 * Plugin Name: StudioConnect Pro
 * Description: Premium-Chat-Widget im Support-Portal-Design für Pascal Krell Studio.
 * Version: 7.0.0
 * Author: Pascal Krell Studio
 * License: GPL-2.0+
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Registrierung der Plugin-Einstellungen.
 */
function studio_connect_register_settings(): void
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
add_action('admin_init', 'studio_connect_register_settings');

/**
 * Einstellungsseite im WordPress-Backend hinzufügen.
 */
function studio_connect_add_settings_page(): void
{
    add_options_page(
        'Pascal Krell StudioConnect',
        'Pascal Krell StudioConnect',
        'manage_options',
        'studio-connect-pro',
        'studio_connect_render_settings_page'
    );
}
add_action('admin_menu', 'studio_connect_add_settings_page');

/**
 * Ausgabe der Einstellungsseite.
 */
function studio_connect_render_settings_page(): void
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
function studio_connect_enqueue_assets(): void
{
    $settings = [
        'email' => get_option('studio_connect_contact_email', ''),
        'phone' => get_option('studio_connect_contact_phone', ''),
        'whatsapp' => get_option('studio_connect_contact_whatsapp', ''),
        'vdsLink' => 'https://www.sprecherverband.de/wp-content/uploads/2025/02/VDS_Gagenkompass_2025.pdf',
        'gagenrechnerLink' => 'https://dev.pascal-krell.de/gagenrechner/',
        'siteUrl' => home_url('/'),
        'avatarUrl' => 'https://dev.pascal-krell.de/wp-content/uploads/2026/02/Studio-Helfer_Avatar_Sprecher-Pascal-Krell.webp',
    ];

    wp_register_style(
        'studio-connect-fontawesome',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
        [],
        '6.5.1'
    );
    wp_enqueue_style('studio-connect-fontawesome');

    wp_register_style('studio-connect-interface', false);
    wp_enqueue_style('studio-connect-interface');
    wp_add_inline_style('studio-connect-interface', studio_connect_get_inline_styles());

    wp_register_script('studio-connect-interface', '', [], null, true);
    wp_enqueue_script('studio-connect-interface');
    wp_localize_script('studio-connect-interface', 'StudioConnectSettings', $settings);
    wp_add_inline_script('studio-connect-interface', studio_connect_get_inline_script());
}
add_action('wp_enqueue_scripts', 'studio_connect_enqueue_assets');

/**
 * Frontend-Markup ausgeben.
 */
function studio_connect_render_widget(): void
{
    ?>
    <div class="studio-connect-widget" id="studio-connect-widget" aria-live="polite">
        <button class="studio-connect-launcher" id="studio-connect-launcher" type="button" aria-label="Pascal Krell StudioConnect öffnen">
            <span class="studio-connect-launcher-icon" aria-hidden="true">
                <i class="fa-solid fa-question"></i>
            </span>
        </button>
        <div class="studio-connect-panel" role="dialog" aria-label="Pascal Krell StudioConnect" aria-hidden="true">
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
add_action('wp_footer', 'studio_connect_render_widget');

/**
 * Inline-Styles für das Widget.
 */
function studio_connect_get_inline_styles(): string
{
    return <<<CSS
:root {
    --sc-primary: #1a93ee;
    --sc-dark: #0f141a;
    --sc-light: #ffffff;
    --sc-text-main: #1c1e21;
    --sc-text-sub: #1a93ee;
    --sc-border: #eef0f5;
    --sc-muted: #f2f2f5;
    --sc-soft: #fcfcfd;
    --sc-shadow: 0 25px 90px rgba(0,0,0,0.2);
}

div[class*="gemerkte"],
.saved-demos {
    right: 100px !important;
    bottom: 30px !important;
}

.studio-connect-widget {
    position: fixed;
    right: 0;
    bottom: 0;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.studio-connect-launcher {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 999999;
    width: 60px;
    height: 60px;
    border-radius: 999px;
    border: none;
    background: var(--sc-primary);
    color: #ffffff;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: opacity 0.2s ease, background 0.2s ease;
}

.studio-connect-launcher.is-pulsing {
    animation: sc-pulse 1.6s ease-out;
}

.studio-connect-launcher-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.studio-connect-launcher-icon i {
    transition: transform 0.2s ease;
}

.studio-connect-widget.is-open .studio-connect-launcher {
    background: var(--sc-dark);
}

.studio-connect-widget.is-open .studio-connect-launcher-icon i {
    transform: rotate(90deg);
}

@keyframes sc-pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(26, 147, 238, 0.4);
    }
    70% {
        box-shadow: 0 0 0 14px rgba(26, 147, 238, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(26, 147, 238, 0);
    }
}

.studio-connect-panel {
    position: fixed;
    bottom: 100px;
    right: 30px;
    width: 420px;
    height: 720px;
    max-height: 85vh;
    z-index: 999998;
    background: var(--sc-light);
    border-radius: 18px;
    box-shadow: var(--sc-shadow);
    border: 1px solid var(--sc-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
    transform: translateY(12px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.studio-connect-widget.is-open .studio-connect-panel {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
}

.studio-connect-header {
    height: 80px;
    background: var(--sc-dark);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 28px;
    color: #ffffff;
    flex: 0 0 auto;
}

.studio-connect-header-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.12);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
}

.studio-connect-header-text {
    flex: 1;
}

.studio-connect-header-actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.studio-connect-social {
    color: #c7cdd8;
    font-size: 14px;
    transition: color 0.2s ease;
}

.studio-connect-social:hover {
    color: #ffffff;
}

.studio-connect-close {
    border: none;
    background: transparent;
    color: #ffffff;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 4px;
}

.studio-connect-title {
    font-weight: 700;
    font-size: 18px;
    color: #ffffff;
}

.studio-connect-subtitle {
    font-size: 12px;
    color: #8b9bb4;
    display: flex;
    align-items: center;
    gap: 6px;
}

.studio-connect-body {
    flex: 1 1 auto;
    padding: 0;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    min-height: 0;
}

.studio-connect-chat-area {
    flex: 1 1 auto;
    padding: 20px 20px 10px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.studio-connect-chat-area::-webkit-scrollbar {
    width: 6px;
}

.studio-connect-chat-area::-webkit-scrollbar-track {
    background: transparent;
}

.studio-connect-chat-area::-webkit-scrollbar-thumb {
    background: #d2d2d7;
    border-radius: 8px;
}

.studio-connect-chat-area {
    scrollbar-color: #d2d2d7 transparent;
    scrollbar-width: thin;
}

.studio-connect-messages {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.studio-connect-message {
    display: flex;
}

.studio-connect-message.bot {
    align-items: flex-end;
    gap: 8px;
}

.studio-connect-message.user {
    justify-content: flex-end;
}

.studio-connect-avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    flex: 0 0 auto;
}

.studio-connect-bubble {
    max-width: 85%;
    padding: 14px 18px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.6;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.studio-connect-bubble.bot {
    background: #e3f2fd;
    color: #2f2f2f;
    border-radius: 18px 18px 18px 4px;
    align-self: flex-start;
}

.studio-connect-bubble.user {
    border: none;
    color: #2f2f2f;
    align-self: flex-end;
    background: linear-gradient(135deg, #f3f4f6, #e7e9ee);
    border-radius: 16px 16px 4px 16px;
}

.studio-connect-option-dock {
    flex: 0 0 auto;
    padding: 12px 20px 14px;
    border-top: 1px solid var(--sc-border);
    background: #ffffff;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: sticky;
    bottom: 0;
    z-index: 2;
}

.studio-connect-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.studio-connect-options.is-disabled {
    opacity: 0.6;
    pointer-events: none;
}

.studio-connect-option-btn {
    border: none;
    outline: none;
    box-shadow: none;
    background: var(--sc-primary);
    color: #ffffff;
    border-radius: 50px;
    padding: 10px 16px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s ease;
}

.studio-connect-option-btn:hover {
    background: #136db5;
}

.studio-connect-calculator {
    display: none;
    border-radius: 14px;
    padding: 12px;
    gap: 10px;
    flex-direction: column;
    background: #f7f8fb;
}

.studio-connect-calculator.is-visible {
    display: flex;
}

.studio-connect-hint {
    font-size: 11px;
    color: #8b9bb4;
    font-style: italic;
}

.studio-connect-label {
    font-size: 12px;
    color: #7b7e87;
}

#studio-connect-words {
    border: 1px solid transparent;
    background: #f3f4f6;
    border-radius: 12px;
    padding: 10px 12px;
    font-size: 14px;
    color: #1c1e21;
}

.studio-connect-result {
    font-size: 13px;
    color: #2f2f2f;
    min-height: 18px;
}

.studio-connect-calculator-btn {
    border: none;
    background: var(--sc-primary);
    color: #ffffff;
    border-radius: 50px;
    padding: 10px 16px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s ease;
}

.studio-connect-calculator-btn:hover {
    background: #136db5;
}

.studio-connect-copy-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}

.studio-connect-copy {
    border: 1px solid var(--sc-border);
    background: #ffffff;
    color: #333333;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.studio-connect-copy i {
    color: var(--sc-primary);
}

.studio-connect-copy.inline {
    border-color: var(--sc-primary);
    color: var(--sc-primary);
    background: transparent;
    font-size: 13px;
    padding: 4px 8px;
    margin: 0 2px;
}

.studio-connect-typing {
    font-size: 13px;
    color: #7b7e87;
    letter-spacing: 2px;
    animation: sc-typing 1s ease-in-out infinite;
}

@keyframes sc-typing {
    0%,
    100% {
        opacity: 0.3;
    }
    50% {
        opacity: 1;
    }
}

.studio-connect-footer {
    flex: 0 0 auto;
    padding: 0 20px;
    border-top: 1px solid #222;
    background: var(--sc-dark);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 54px;
}

.studio-connect-home {
    border: 1px solid #222;
    background: transparent;
    color: #ffffff;
    border-radius: 999px;
    padding: 8px 12px;
    font-size: 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    position: relative;
    pointer-events: auto;
    z-index: 9999;
}

.studio-connect-home:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: #2d3138;
}

.studio-connect-home-tooltip {
    position: absolute;
    bottom: 44px;
    left: 50%;
    transform: translateX(-50%);
    background: #1f242c;
    color: #ffffff;
    font-size: 11px;
    padding: 6px 8px;
    border-radius: 10px;
    opacity: 0;
    pointer-events: none;
    white-space: nowrap;
    transition: opacity 0.2s ease;
}

.studio-connect-home:hover .studio-connect-home-tooltip {
    opacity: 1;
}

.studio-connect-home-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #1a93ee;
}

.studio-connect-footer-socials {
    display: inline-flex;
    align-items: center;
    gap: 12px;
}

.studio-connect-toast {
    position: absolute;
    top: 90px;
    left: 50%;
    right: auto;
    bottom: auto;
    background: #222222;
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 12px;
    opacity: 0;
    transform: translate(-50%, -6px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
    z-index: 2147483647;
}

.studio-connect-toast.is-visible {
    opacity: 1;
    transform: translate(-50%, 0);
}

@media (max-width: 480px) {
    .studio-connect-panel {
        width: 100%;
        height: 80vh;
        right: 12px;
        left: 12px;
        bottom: 90px;
    }

    .studio-connect-launcher {
        right: 16px;
        bottom: 20px;
    }
}
CSS;
}

/**
 * Inline-Script für die Logik.
 */
function studio_connect_get_inline_script(): string
{
    $script = <<<'JS'
class StudioBot {
    constructor(settings) {
        this.settings = settings;
        this.widget = document.getElementById('studio-connect-widget');
        this.panel = document.querySelector('.studio-connect-panel');
        this.launcher = document.getElementById('studio-connect-launcher');
        this.body = document.getElementById('sc-body');
        this.dock = document.getElementById('sc-dock');
        this.headerSubtext = document.getElementById('studio-connect-subtext');
        this.toast = document.getElementById('studio-connect-toast');
        this.homeButton = document.getElementById('sc-reset');
        this.closeButton = document.getElementById('studio-connect-close');
        this.launcherIcon = this.launcher ? this.launcher.querySelector('i') : null;
        this.avatarUrl = this.settings.avatarUrl || 'https://dev.pascal-krell.de/wp-content/uploads/2026/02/Studio-Helfer_Avatar_Sprecher-Pascal-Krell.webp';
        this.isTyping = false;
        this.isOpen = false;
        this.hasInteraction = false;
        this.soundEngine = new SoundController();
        this.logicTree = this.buildLogicTree();
        this.currentStep = 'start';
        this.restoredFromSession = false;
        this.storageKey = 'sc_chat_state';

        this.restoreState();
        this.refreshDomReferences();
        this.bindEvents();
        this.rebindOptionButtons();
        if (!this.restoredFromSession) {
            this.renderStep('start');
        }
        this.startPulseCycle();
    }

    buildLogicTree() {
        return {
            start: this.getStepConfig('start'),
            demos: this.getStepConfig('demos'),
            preise: this.getStepConfig('preise'),
            technik: this.getStepConfig('technik'),
            ablauf: this.getStepConfig('ablauf'),
            rechner: this.getStepConfig('rechner'),
            kontakt: this.getStepConfig('kontakt')
        };
    }

    getStepConfig(stepId) {
        switch (stepId) {
            case 'start':
                return {
                    id: 'start',
                    text: 'Moin! Ich bin Dein Studio-Assistent. Womit starten wir?',
                    options: [
                        { label: '🎧 Casting & Demos', nextId: 'demos' },
                        { label: 'Preise & Buyouts', userLabel: 'Preise & Gagen', nextId: 'preise' },
                        { label: 'Technik Check', nextId: 'technik' },
                        { label: '🔄 Ablauf einer Buchung', nextId: 'ablauf' },
                        { label: 'Kontakt', nextId: 'kontakt' }
                    ]
                };
            case 'demos':
                return {
                    id: 'demos',
                    text: 'Welche Kategorie interessiert Dich?',
                    options: [
                        { label: 'Werbung', action: 'hardlink', target: '/sprecher-audio-leistungen/werbesprecher/' },
                        { label: 'Webvideo', action: 'hardlink', target: '/sprecher-audio-leistungen/voiceover-social-media/' },
                        { label: 'Telefonansage', action: 'hardlink', target: '/sprecher-audio-leistungen/telefonansagen-warteschleife-mailbox/' },
                        { label: 'Podcast', action: 'hardlink', target: '/sprecher-audio-leistungen/podcast-service-editing-intro-outro-produktion/' },
                        { label: 'Imagefilm', action: 'hardlink', target: '/sprecher-audio-leistungen/imagefilm-sprecher/' },
                        { label: 'Erklärvideo', action: 'hardlink', target: '/sprecher-audio-leistungen/erklaervideo-sprecher/' },
                        { label: 'E-Learning', action: 'hardlink', target: '/sprecher-audio-leistungen/e-learning-sprecher/' }
                    ]
                };
            case 'preise':
                return {
                    id: 'preise',
                    text: 'Ich arbeite transparent nach Industriestandard (VDS). Für genaue Kalkulationen nutze bitte mein Online-Tool.',
                    options: [
                        { label: '📄 VDS Gagenliste', action: 'vdslink' },
                        { label: '🧮 Zum Gagenrechner', action: 'gagenrechner' },
                        { label: 'Wort-Rechner', nextId: 'rechner' },
                        { label: '💬 Direkt anfragen', nextId: 'kontakt' }
                    ]
                };
            case 'technik':
                return {
                    id: 'technik',
                    text: 'Profi-Setup für Broadcast-Qualität: Neumann TLM 102 Mikrofon, RME Babyface Pro Interface & High-End Akustikkabine. DAW: Logic Pro X auf Mac Studio.',
                    options: [
                        { label: 'SessionLinkPRO', action: 'form' },
                        { label: 'SourceConnect Now', action: 'form' },
                        { label: 'Test-File anfordern', action: 'form' },
                        { label: 'Kontakt', nextId: 'kontakt' },
                        { label: 'Zurück', nextId: 'start' }
                    ]
                };
            case 'ablauf':
                return {
                    id: 'ablauf',
                    text: 'So einfach ist der Prozess bei mir:\n\n1. Anfrage & Skript-Check\n2. Angebot & Bestätigung\n3. Aufnahme (meist innerhalb 24h)\n4. Datenlieferung & Abnahme\n5. Rechnung & Nutzungslizenz',
                    options: [
                        { label: '⚡ Jetzt Projekt anfragen', action: 'form' },
                        { label: 'Zurück', nextId: 'start' }
                    ]
                };
            case 'rechner':
                return {
                    id: 'rechner',
                    text: 'Wort-Rechner aktiviert. Gib die Wortanzahl ein.',
                    action: 'calculator',
                    options: [
                        { label: 'Kontakt', nextId: 'kontakt' },
                        { label: 'Zurück', nextId: 'start' }
                    ]
                };
            case 'kontakt':
                return {
                    id: 'kontakt',
                    text: 'Wie möchtest Du mich kontaktieren?',
                    options: []
                };
            default:
                return {
                    id: 'start',
                    text: 'Moin! Ich bin Dein Studio-Assistent. Womit starten wir?',
                    options: [
                        { label: '🎧 Casting & Demos', nextId: 'demos' },
                        { label: 'Preise & Buyouts', userLabel: 'Preise & Gagen', nextId: 'preise' },
                        { label: 'Technik Check', nextId: 'technik' },
                        { label: '🔄 Ablauf einer Buchung', nextId: 'ablauf' },
                        { label: 'Kontakt', nextId: 'kontakt' }
                    ]
                };
        }
    }

    bindEvents() {
        this.launcher.addEventListener('click', () => {
            this.registerInteraction();
            if (this.isOpen) {
                this.closePanel();
                return;
            }
            this.openPanel();
        });

        this.wordsInput.addEventListener('input', () => this.updateCalculator());
        this.calculatorCta.addEventListener('click', () => {
            this.registerInteraction();
            this.handleContactAction('form');
        });

        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.registerInteraction();
                this.closePanel();
            });
        }

        this.messages.addEventListener('click', (event) => {
            const target = event.target.closest('[data-copy]');
            const actionTarget = event.target.closest('[data-action]');
            if (actionTarget) {
                this.registerInteraction();
                const action = actionTarget.dataset.action;
                if (action) {
                    this.handleContactAction(action);
                }
                return;
            }
            if (!target) {
                return;
            }
            this.registerInteraction();
            const value = target.dataset.copy || '';
            if (!value) {
                return;
            }
            this.handleUtilityAction('copy', value);
        });

        window.addEventListener('beforeunload', () => this.persistState());
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.persistState();
            }
        });
    }

    async renderStep(stepId) {
        const step = this.logicTree[stepId];
        if (!step) {
            return;
        }

        this.currentStep = stepId;
        this.updateHeaderSubtext(stepId);
        this.ensureOptionsContainer();
        this.options.classList.add('is-disabled');
        await this.createBubble(step.text, 'bot');
        if (stepId === 'kontakt') {
            this.createContactBubble();
        }
        this.replaceOptions();

        this.calculator.classList.remove('is-visible');
        this.calculator.setAttribute('aria-hidden', 'true');
        this.result.textContent = '';
        this.wordsInput.value = '';

        if (step.action === 'calculator') {
            this.calculator.classList.add('is-visible');
            this.calculator.setAttribute('aria-hidden', 'false');
        }

        step.options.forEach((option) => this.appendOption(option));
        this.persistState();
    }

    async handleOption(option) {
        if (this.isTyping) {
            return;
        }
        this.registerInteraction();
        this.soundEngine.play('click');
        this.replaceOptions();
        const label = option.userLabel || option.label;
        this.createBubble(label, 'user');

        if (option.action === 'anchor' && option.target) {
            this.triggerAnchor(option.target);
        }

        if (option.action === 'hardlink' && option.target) {
            window.location.href = option.target;
            return;
        }

        if (option.action) {
            this.handleContactAction(option.action);
        }

        if (option.nextId) {
            this.renderStep(option.nextId);
            return;
        }

        if (option.action) {
            this.renderStep(this.currentStep);
        }
    }

    createBubble(text, type) {
        const { row, bubble } = this.createMessageRow(type);
        this.messages.appendChild(row);
        this.scrollToBottom();
        if (type === 'bot') {
            this.soundEngine.play('msg_in');
            return this.typeWriter(bubble, text);
        }
        bubble.textContent = text;
        this.persistState();
        return Promise.resolve();
    }

    createMessageRow(type) {
        const row = document.createElement('div');
        row.className = `studio-connect-message ${type}`;
        if (type === 'bot') {
            const avatar = document.createElement('img');
            avatar.className = 'studio-connect-avatar';
            avatar.src = this.avatarUrl;
            avatar.alt = 'Studio Helfer Avatar';
            avatar.loading = 'eager';
            avatar.decoding = 'async';
            avatar.fetchPriority = 'high';
            row.appendChild(avatar);
        }
        const bubble = document.createElement('div');
        bubble.className = `studio-connect-bubble ${type}`;
        row.appendChild(bubble);
        return { row, bubble };
    }

    triggerAnchor(target) {
        const anchor = document.querySelector(`a[href*="${target}"]`);
        if (anchor) {
            anchor.click();
            return;
        }
        window.location.hash = target;
    }

    updateCalculator() {
        const words = Number.parseFloat(this.wordsInput.value);
        if (Number.isNaN(words) || words <= 0) {
            this.result.textContent = '';
            return;
        }

        const totalSeconds = Math.round((words / 130) * 60);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const paddedSeconds = String(seconds).padStart(2, '0');
        this.result.textContent = `⏱ Ca. ${minutes}:${paddedSeconds} Min bei moderatem Sprechtempo.`;
    }

    typeWriter(bubble, text) {
        if (bubble.dataset.typed === 'true') {
            bubble.innerHTML = this.createCopyMarkup(text);
            this.persistState();
            return Promise.resolve();
        }
        this.isTyping = true;
        bubble.textContent = '';
        return new Promise((resolve) => {
            let index = 0;
            const typingRow = this.createMessageRow('bot');
            typingRow.bubble.classList.add('studio-connect-typing');
            typingRow.bubble.textContent = '...';
            this.messages.appendChild(typingRow.row);
            this.scrollToBottom();
            const timer = setInterval(() => {
                bubble.textContent += text.charAt(index);
                index += 1;
                this.scrollToBottom();
                if (index >= text.length) {
                    clearInterval(timer);
                    typingRow.row.remove();
                    this.isTyping = false;
                    bubble.classList.remove('studio-connect-typing');
                    bubble.innerHTML = this.createCopyMarkup(text);
                    bubble.dataset.typed = 'true';
                    this.persistState();
                    resolve();
                }
            }, 15);
        });
    }

    createContactBubble() {
        const { row: messageRow, bubble } = this.createMessageRow('bot');
        const label = document.createElement('div');
        label.textContent = 'Wie möchtest Du mich kontaktieren?';
        bubble.appendChild(label);

        const copyRow = document.createElement('div');
        copyRow.className = 'studio-connect-copy-row';

        const formBtn = document.createElement('button');
        formBtn.type = 'button';
        formBtn.className = 'studio-connect-copy';
        formBtn.dataset.action = 'form';
        formBtn.textContent = '📝 Formular';
        copyRow.appendChild(formBtn);

        const emailBtn = document.createElement('button');
        emailBtn.type = 'button';
        emailBtn.className = 'studio-connect-copy';
        emailBtn.textContent = 'E-Mail kopieren';
        if (this.settings.email) {
            emailBtn.dataset.copy = this.settings.email;
        } else {
            emailBtn.disabled = true;
        }
        copyRow.appendChild(emailBtn);

        const phoneBtn = document.createElement('button');
        phoneBtn.type = 'button';
        phoneBtn.className = 'studio-connect-copy';
        phoneBtn.textContent = 'Telefon kopieren';
        if (this.settings.phone) {
            phoneBtn.dataset.copy = this.settings.phone;
        } else {
            phoneBtn.disabled = true;
        }
        copyRow.appendChild(phoneBtn);

        bubble.appendChild(copyRow);

        if (!this.settings.email && !this.settings.phone) {
            const fallback = document.createElement('div');
            fallback.textContent = 'Bitte E-Mail und Telefon im Backend hinterlegen.';
            bubble.appendChild(fallback);
        }

        bubble.dataset.typed = 'true';
        this.messages.appendChild(messageRow);
        this.scrollToBottom();
        this.soundEngine.play('msg_in');
        this.persistState();
    }

    updateHeaderSubtext(stepId) {
        const map = {
            start: 'Hilfe-System und Tipps',
            demos: 'Casting & Demos',
            preise: 'Preise & Gagen',
            technik: 'Technik Check',
            kontakt: 'Kontakt',
            rechner: 'Wort-Rechner',
            ablauf: 'Ablauf einer Buchung'
        };
        if (this.headerSubtext && map[stepId]) {
            this.headerSubtext.textContent = map[stepId];
        }
    }

    openPanel() {
        this.applyOpenState(true);
        this.persistState();
    }

    closePanel() {
        this.applyOpenState(false, true);
        this.persistState();
    }

    showToast(message) {
        if (!this.toast) {
            return;
        }
        this.toast.textContent = message;
        this.toast.classList.add('is-visible');
        window.setTimeout(() => {
            this.toast.classList.remove('is-visible');
        }, 1400);
    }

    registerInteraction() {
        if (!this.hasInteraction) {
            this.hasInteraction = true;
            this.soundEngine.unlock();
        }
    }

    startPulseCycle() {
        window.setInterval(() => {
            if (this.isOpen) {
                return;
            }
            this.launcher.classList.add('is-pulsing');
            window.setTimeout(() => {
                this.launcher.classList.remove('is-pulsing');
            }, 1600);
        }, 15000);
    }

    scrollToBottom() {
        if (!this.chatArea) {
            return;
        }
        requestAnimationFrame(() => {
            this.chatArea.scrollTop = this.chatArea.scrollHeight;
        });
    }

    createCopyMarkup(text) {
        const escaped = this.escapeHtml(text);
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const phoneRegex = /(\+?\d[\d\s().-]{6,}\d)/g;
        let withEmails = escaped.replace(/\n/g, '<br>');
        withEmails = withEmails.replace(emailRegex, (match) => {
            return `<button type="button" class="studio-connect-copy inline" data-copy="${match}">${match}</button>`;
        });
        withEmails = withEmails.replace(phoneRegex, (match) => {
            return `<button type="button" class="studio-connect-copy inline" data-copy="${match}">${match}</button>`;
        });
        return withEmails;
    }

    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    replaceOptions() {
        if (!this.options) {
            return;
        }
        this.options.innerHTML = '';
        this.options.classList.remove('is-disabled');
        this.persistState();
    }

    ensureOptionsContainer() {
        if (!this.options) {
            this.options = document.getElementById('studio-connect-options');
        }
    }

    appendOption(option) {
        if (!this.options) {
            return;
        }
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'studio-connect-option-btn';
        button.textContent = option.label;
        button.addEventListener('click', () => this.handleOption(option));
        button.dataset.label = option.label;
        if (option.userLabel) {
            button.dataset.userLabel = option.userLabel;
        }
        if (option.nextId) {
            button.dataset.nextId = option.nextId;
        }
        if (option.action) {
            button.dataset.action = option.action;
        }
        if (option.target) {
            button.dataset.target = option.target;
        }
        this.options.appendChild(button);
    }

    handleContactAction(action) {
        if (action === 'email') {
            if (this.settings.email) {
                window.location.href = `mailto:${this.settings.email}`;
                return true;
            }
            this.createBubble('Bitte eine E-Mail-Adresse im Backend hinterlegen.', 'bot');
            return true;
        }

        if (action === 'phone') {
            if (this.settings.phone) {
                window.location.href = `tel:${this.settings.phone}`;
                return true;
            }
            this.createBubble('Bitte eine Telefonnummer im Backend hinterlegen.', 'bot');
            return true;
        }

        if (action === 'whatsapp') {
            const phone = this.settings.whatsapp || '';
            const digits = phone.replace(/\D/g, '');
            if (digits) {
                window.open(`https://wa.me/${encodeURIComponent(digits)}`, '_blank', 'noopener');
            } else {
                this.createBubble('Bitte eine WhatsApp-Nummer im Backend hinterlegen.', 'bot');
            }
            return true;
        }

        if (action === 'vdslink') {
            if (this.settings.vdsLink) {
                window.open(this.settings.vdsLink, '_blank', 'noopener');
            } else {
                this.createBubble('Kein VDS-Link hinterlegt. Bitte im Backend ergänzen.', 'bot');
            }
            return true;
        }

        if (action === 'gagenrechner') {
            if (this.settings.gagenrechnerLink) {
                window.open(this.settings.gagenrechnerLink, '_blank', 'noopener');
            } else {
                this.createBubble('Kein Gagenrechner-Link hinterlegt. Bitte im Backend ergänzen.', 'bot');
            }
            return true;
        }

        if (action === 'form') {
            const baseUrl = (this.settings.siteUrl || '/').replace(/\/$/, '');
            window.location.href = `${baseUrl}/kontakt/`;
            return true;
        }

        return false;
    }

    updateLauncherState() {
        if (!this.launcherIcon) {
            return;
        }
        if (this.isOpen) {
            this.launcherIcon.classList.remove('fa-question');
            this.launcherIcon.classList.add('fa-times');
        } else {
            this.launcherIcon.classList.remove('fa-times');
            this.launcherIcon.classList.add('fa-question');
        }
    }

    resetConversation() {
        if (this.messages) {
            this.messages.innerHTML = '';
        }
        this.replaceOptions();
        this.calculator.classList.remove('is-visible');
        this.calculator.setAttribute('aria-hidden', 'true');
        this.result.textContent = '';
        this.wordsInput.value = '';
        this.clearState();
        this.renderStep('start');
    }

    refreshDomReferences() {
        this.messages = document.getElementById('studio-connect-messages');
        this.options = document.getElementById('studio-connect-options');
        this.chatArea = document.getElementById('studio-connect-chat-area');
        this.calculator = document.getElementById('studio-connect-calculator');
        this.wordsInput = document.getElementById('studio-connect-words');
        this.result = document.getElementById('studio-connect-result');
        this.calculatorCta = document.getElementById('studio-connect-calculator-cta');
        this.body = document.getElementById('sc-body');
        this.dock = document.getElementById('sc-dock');
    }

    rebindOptionButtons() {
        if (!this.options) {
            return;
        }
        const buttons = this.options.querySelectorAll('.studio-connect-option-btn');
        buttons.forEach((button) => {
            const option = {
                label: button.dataset.label || button.textContent,
                userLabel: button.dataset.userLabel || undefined,
                nextId: button.dataset.nextId || undefined,
                action: button.dataset.action || undefined,
                target: button.dataset.target || undefined
            };
            button.addEventListener('click', () => this.handleOption(option));
        });
    }

    applyOpenState(isOpen, silent = false) {
        this.widget.classList.toggle('is-open', isOpen);
        this.panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        this.isOpen = isOpen;
        this.updateLauncherState();
        if (!silent && isOpen) {
            this.soundEngine.play('open');
        }
    }

    persistState() {
        if (!this.body || !this.dock || this.isTyping) {
            return;
        }
        const state = {
            bodyHtml: this.body.innerHTML,
            dockHtml: this.dock.innerHTML,
            isOpen: this.isOpen,
            currentStep: this.currentStep
        };
        try {
            sessionStorage.setItem(this.storageKey, JSON.stringify(state));
        } catch (error) {
            // Fallback: Kein Storage verfügbar.
        }
    }

    restoreState() {
        if (!this.body || !this.dock) {
            return;
        }
        const rawState = sessionStorage.getItem(this.storageKey);
        if (!rawState) {
            return;
        }
        try {
            const state = JSON.parse(rawState);
            if (state.bodyHtml) {
                this.body.innerHTML = state.bodyHtml;
            }
            if (state.dockHtml) {
                const dock = this.body.querySelector('#sc-dock');
                if (dock) {
                    dock.innerHTML = state.dockHtml;
                }
            }
            this.currentStep = state.currentStep || 'start';
            this.applyOpenState(Boolean(state.isOpen), true);
            this.updateHeaderSubtext(this.currentStep);
            this.restoredFromSession = true;
        } catch (error) {
            this.clearState();
        }
    }

    clearState() {
        try {
            sessionStorage.removeItem(this.storageKey);
        } catch (error) {
            // Ignorieren.
        }
    }

    handleUtilityAction(action, value) {
        switch (action) {
            case 'copy':
                if (!value) {
                    return false;
                }
                navigator.clipboard.writeText(value).then(() => {
                    this.showToast('Kopiert');
                }).catch(() => {
                    this.showToast('Kopiert');
                });
                return true;
            default:
                return false;
        }
    }
}

class SoundController {
    constructor() {
        // User: Replace with real MP3 Base64
        // Kurze Dummy-Sounds als Base64-Platzhalter.
        this.sounds = {
            click: this.createAudio('data:audio/mp3;base64,SUQzBAAAAAAA'),
            msg_in: this.createAudio('data:audio/mp3;base64,SUQzBAAAAAAB'),
            open: this.createAudio('data:audio/mp3;base64,SUQzBAAAAAAC')
        };
        this.unlocked = false;
    }

    createAudio(source) {
        const audio = new Audio(source);
        audio.preload = 'auto';
        audio.volume = 0.7;
        audio.muted = true;
        return audio;
    }

    unlock() {
        if (this.unlocked) {
            return;
        }
        this.unlocked = true;
        Object.values(this.sounds).forEach((audio) => {
            audio.muted = false;
        });
    }

    play(name) {
        const audio = this.sounds[name];
        if (!audio || !this.unlocked) {
            return;
        }
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let studioConnectBot = null;
    const startChat = () => {
        if (studioConnectBot) {
            studioConnectBot.refreshDomReferences();
            studioConnectBot.resetConversation();
            return;
        }
        studioConnectBot = new StudioBot(window.StudioConnectSettings || {});
    };
    const resetButton = document.getElementById('sc-reset');
    if (resetButton) {
        resetButton.addEventListener('click', function (e) {
            e.preventDefault();
            sessionStorage.removeItem('sc_chat_state');
            document.getElementById('sc-body').innerHTML = '';
            document.getElementById('sc-dock').innerHTML = '';
            startChat();
        });
    }
    if (document.getElementById('studio-connect-widget')) {
        startChat();
    }
});
JS;

    return $script;
}
