<?php
/**
 * Plugin Name: StudioConnect Pro
 * Description: Premium-Chat-Widget im Support-Portal-Design für Pascal Krell Studio.
 * Version: 3.0.0
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
                    <div class="studio-connect-subtitle" id="studio-connect-subtext">Hilfen für die wichtigen Themen</div>
                </div>
                <div class="studio-connect-header-actions">
                    <button class="studio-connect-close" id="studio-connect-close" type="button" aria-label="Chat schließen">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                </div>
            </div>

            <div class="studio-connect-body">
                <div class="studio-connect-chat-area" id="studio-connect-chat-area">
                    <div class="studio-connect-messages" id="studio-connect-messages"></div>
                </div>
                <div class="studio-connect-option-dock" id="studio-connect-option-dock">
                    <div class="studio-connect-options" id="studio-connect-options"></div>
                    <div class="studio-connect-calculator" id="studio-connect-calculator" aria-hidden="true">
                    <div class="studio-connect-result" id="studio-connect-result"></div>
                    <div class="studio-connect-hint">Erhalte Infos zur Sprechzeit deines Skripts (Basis: 130 Wörter/Min).</div>
                    <label for="studio-connect-words" class="studio-connect-label">Wortanzahl</label>
                    <input id="studio-connect-words" type="number" min="0" inputmode="numeric" placeholder="z.B. 520" />
                        <button class="studio-connect-calculator-btn" id="studio-connect-calculator-cta" type="button">
                            Angebot dafür anfragen
                        </button>
                    </div>
                </div>
                <div class="studio-connect-footer">
                    <button class="studio-connect-home" id="studio-connect-home" type="button" aria-label="Home / Neustart">
                        <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
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
        </div>
        <div class="studio-connect-toast" id="studio-connect-toast" role="status" aria-live="polite"></div>
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
}

.studio-connect-home:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: #2d3138;
}

.studio-connect-footer-socials {
    display: inline-flex;
    align-items: center;
    gap: 12px;
}

.studio-connect-toast {
    position: absolute;
    right: 0;
    bottom: 72px;
    background: #222222;
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 12px;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
    z-index: 2147483647;
}

.studio-connect-toast.is-visible {
    opacity: 1;
    transform: translateY(0);
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
        this.messages = document.getElementById('studio-connect-messages');
        this.options = document.getElementById('studio-connect-options');
        this.chatArea = document.getElementById('studio-connect-chat-area');
        this.calculator = document.getElementById('studio-connect-calculator');
        this.wordsInput = document.getElementById('studio-connect-words');
        this.result = document.getElementById('studio-connect-result');
        this.calculatorCta = document.getElementById('studio-connect-calculator-cta');
        this.headerSubtext = document.getElementById('studio-connect-subtext');
        this.toast = document.getElementById('studio-connect-toast');
        this.homeButton = document.getElementById('studio-connect-home');
        this.closeButton = document.getElementById('studio-connect-close');
        this.launcherIcon = this.launcher ? this.launcher.querySelector('i') : null;
        this.isTyping = false;
        this.isOpen = false;
        this.hasInteraction = false;
        this.soundEngine = new SoundController();
        this.logicTree = this.buildLogicTree();
        this.currentStep = 'start';

        this.bindEvents();
        this.renderStep('start');
        this.startPulseCycle();
    }

    buildLogicTree() {
        return {
            start: {
                id: 'start',
                text: 'Moin! Ich bin dein Studio-Assistent. Womit starten wir?',
                options: [
                    { label: 'Casting & Demos', nextId: 'demos' },
                    { label: 'Preise & Buyouts', userLabel: 'Preise & Gagen', nextId: 'preise' },
                    { label: 'Technik Check', nextId: 'technik' },
                    { label: 'Wort-Rechner', nextId: 'rechner' }
                ]
            },
            demos: {
                id: 'demos',
                text: 'Welche Kategorie interessiert dich?',
                options: [
                    { label: 'Werbung', action: 'anchor', target: '#werbung' },
                    { label: 'Doku', action: 'anchor', target: '#doku' },
                    { label: 'Image', action: 'anchor', target: '#image' },
                    { label: 'Kontakt', nextId: 'kontakt' },
                    { label: 'Zurück', nextId: 'start' }
                ]
            },
            preise: {
                id: 'preise',
                text: 'Ich arbeite transparent nach Industriestandard (VDS). Für genaue Kalkulationen nutze bitte mein Online-Tool.',
                options: [
                    { label: '📄 VDS Gagenliste', action: 'vdslink' },
                    { label: '🧮 Zum Gagenrechner', action: 'gagenrechner' },
                    { label: '💬 Direkt anfragen', nextId: 'kontakt' }
                ]
            },
            technik: {
                id: 'technik',
                text: 'Profi-Setup für Broadcast-Qualität: Neumann TLM 102 Mikrofon, RME Babyface Pro Interface & High-End Akustikkabine. DAW: Logic Pro X auf Mac Studio.',
                options: [
                    { label: 'SessionLinkPRO', action: 'form' },
                    { label: 'SourceConnect Now', action: 'form' },
                    { label: 'Test-File anfordern', action: 'form' },
                    { label: 'Kontakt', nextId: 'kontakt' },
                    { label: 'Zurück', nextId: 'start' }
                ]
            },
            rechner: {
                id: 'rechner',
                text: 'Wort-Rechner aktiviert. Gib die Wortanzahl ein.',
                action: 'calculator',
                options: [
                    { label: 'Kontakt', nextId: 'kontakt' },
                    { label: 'Zurück', nextId: 'start' }
                ]
            },
            kontakt: {
                id: 'kontakt',
                text: 'Hier sind die Kontaktmöglichkeiten.',
                options: [
                    { label: 'Anruf', action: 'phone' },
                    { label: 'WhatsApp', action: 'whatsapp' },
                    { label: 'Mail', action: 'email' },
                    { label: '📝 Formular', action: 'form' }
                ]
            }
        };
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
            this.handleContactAction('email');
        });

        if (this.homeButton) {
            this.homeButton.addEventListener('click', () => {
                this.registerInteraction();
                this.resetConversation();
            });
        }

        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.registerInteraction();
                this.closePanel();
            });
        }

        this.messages.addEventListener('click', (event) => {
            const target = event.target.closest('[data-copy]');
            if (!target) {
                return;
            }
            this.registerInteraction();
            const value = target.dataset.copy || '';
            if (!value) {
                return;
            }
            navigator.clipboard.writeText(value).then(() => {
                this.showToast('In Zwischenablage kopiert');
            }).catch(() => {
                this.showToast('In Zwischenablage kopiert');
            });
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
        const bubble = document.createElement('div');
        bubble.className = `studio-connect-bubble ${type}`;
        this.messages.appendChild(bubble);
        this.scrollToBottom();
        if (type === 'bot') {
            this.soundEngine.play('msg_in');
            return this.typeWriter(bubble, text);
        }
        bubble.textContent = text;
        return Promise.resolve();
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
        this.isTyping = true;
        bubble.textContent = '';
        return new Promise((resolve) => {
            let index = 0;
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'studio-connect-bubble bot studio-connect-typing';
            typingIndicator.textContent = '...';
            this.messages.appendChild(typingIndicator);
            this.scrollToBottom();
            const timer = setInterval(() => {
                bubble.textContent += text.charAt(index);
                index += 1;
                this.scrollToBottom();
                if (index >= text.length) {
                    clearInterval(timer);
                    typingIndicator.remove();
                    this.isTyping = false;
                    bubble.innerHTML = this.createCopyMarkup(text);
                    resolve();
                }
            }, 15);
        });
    }

    createContactBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'studio-connect-bubble bot';
        const label = document.createElement('div');
        label.textContent = 'Zum Kopieren klicken:';
        bubble.appendChild(label);

        const row = document.createElement('div');
        row.className = 'studio-connect-copy-row';

        const formBtn = document.createElement('button');
        formBtn.type = 'button';
        formBtn.className = 'studio-connect-copy';
        formBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> 📝 Formular';
        formBtn.addEventListener('click', () => {
            this.handleContactAction('form');
        });
        row.appendChild(formBtn);

        if (this.settings.email) {
            const emailBtn = document.createElement('button');
            emailBtn.type = 'button';
            emailBtn.className = 'studio-connect-copy';
            emailBtn.dataset.copy = this.settings.email;
            emailBtn.innerHTML = '<i class="fa-solid fa-envelope"></i> ' + this.settings.email;
            row.appendChild(emailBtn);
        }

        if (this.settings.phone) {
            const phoneBtn = document.createElement('button');
            phoneBtn.type = 'button';
            phoneBtn.className = 'studio-connect-copy';
            phoneBtn.dataset.copy = this.settings.phone;
            phoneBtn.innerHTML = '<i class="fa-solid fa-phone"></i> ' + this.settings.phone;
            row.appendChild(phoneBtn);
        }

        if (this.settings.whatsapp) {
            const whatsappBtn = document.createElement('button');
            whatsappBtn.type = 'button';
            whatsappBtn.className = 'studio-connect-copy';
            whatsappBtn.dataset.copy = this.settings.whatsapp;
            whatsappBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> ' + this.settings.whatsapp;
            row.appendChild(whatsappBtn);
        }

        bubble.appendChild(row);

        if (!this.settings.email && !this.settings.phone && !this.settings.whatsapp) {
            const fallback = document.createElement('div');
            fallback.textContent = 'Bitte E-Mail, Telefon und WhatsApp im Backend hinterlegen.';
            bubble.appendChild(fallback);
        }

        this.messages.appendChild(bubble);
        this.scrollToBottom();
        this.soundEngine.play('msg_in');
    }

    updateHeaderSubtext(stepId) {
        const map = {
            start: 'Hilfen für die wichtigen Themen',
            demos: 'Casting & Demos',
            preise: 'Preise & Gagen',
            technik: 'Technik Check',
            kontakt: 'Kontakt',
            rechner: 'Wort-Rechner'
        };
        if (this.headerSubtext && map[stepId]) {
            this.headerSubtext.textContent = map[stepId];
        }
    }

    openPanel() {
        this.widget.classList.add('is-open');
        this.panel.setAttribute('aria-hidden', 'false');
        this.isOpen = true;
        this.updateLauncherState();
        this.soundEngine.play('open');
    }

    closePanel() {
        this.widget.classList.remove('is-open');
        this.panel.setAttribute('aria-hidden', 'true');
        this.isOpen = false;
        this.updateLauncherState();
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
        let withEmails = escaped.replace(emailRegex, (match) => {
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
        this.renderStep('start');
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
    if (document.getElementById('studio-connect-widget')) {
        new StudioBot(window.StudioConnectSettings || {});
    }
});
JS;

    return $script;
}
