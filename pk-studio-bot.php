<?php
/**
 * Plugin Name: StudioConnect Pro
 * Description: Enterprise-Chat-Widget für Voiceover-Artists mit StudioConnect Pro Branding.
 * Version: 2.0.0
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
        'sanitize_callback' => 'esc_url_raw',
        'default' => '',
    ]);

    register_setting('studio_connect_settings', 'studio_connect_vds_link', [
        'type' => 'string',
        'sanitize_callback' => 'esc_url_raw',
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
        'StudioConnect Pro',
        'StudioConnect Pro',
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
        <h1>StudioConnect Pro Einstellungen</h1>
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
                    <th scope="row"><label for="studio_connect_contact_whatsapp">WhatsApp-Link</label></th>
                    <td>
                        <input type="url" id="studio_connect_contact_whatsapp" name="studio_connect_contact_whatsapp"
                               class="regular-text" value="<?php echo esc_attr(get_option('studio_connect_contact_whatsapp', '')); ?>" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="studio_connect_vds_link">Link zur VDS-Gagenliste</label></th>
                    <td>
                        <input type="url" id="studio_connect_vds_link" name="studio_connect_vds_link"
                               class="regular-text" value="<?php echo esc_attr(get_option('studio_connect_vds_link', '')); ?>" />
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
        'vdsLink' => get_option('studio_connect_vds_link', ''),
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
        <div class="studio-connect-panel" role="dialog" aria-label="StudioConnect Pro">
            <div class="studio-connect-header">
                <div class="studio-connect-avatar">
                    <i class="fa-solid fa-user-tie" aria-hidden="true"></i>
                </div>
                <div class="studio-connect-header-text">
                    <div class="studio-connect-title">Pascal Krell</div>
                    <div class="studio-connect-subtitle">
                        <span class="studio-connect-status"></span>
                        Studio Hamburg &bull; Online
                    </div>
                </div>
                <button class="studio-connect-close" type="button" aria-label="Chat schließen">
                    <i class="fa-solid fa-times" aria-hidden="true"></i>
                </button>
            </div>

            <div class="studio-connect-body">
                <div class="studio-connect-messages" id="studio-connect-messages"></div>
                <div class="studio-connect-options" id="studio-connect-options"></div>

                <div class="studio-connect-calculator" id="studio-connect-calculator" aria-hidden="true">
                    <label for="studio-connect-words" class="studio-connect-label">Wortanzahl</label>
                    <input id="studio-connect-words" type="number" min="0" inputmode="numeric" placeholder="z.B. 520" />
                    <div class="studio-connect-speed">
                        <button type="button" class="studio-connect-speed-btn" data-speed="110">Langsam (110)</button>
                        <button type="button" class="studio-connect-speed-btn is-active" data-speed="130">Normal (130)</button>
                        <button type="button" class="studio-connect-speed-btn" data-speed="150">Schnell (150)</button>
                    </div>
                    <div class="studio-connect-result" id="studio-connect-result"></div>
                </div>
            </div>

            <div class="studio-connect-footer">
                <button class="studio-connect-footer-btn" id="studio-connect-reset" type="button">
                    <i class="fa-solid fa-house" aria-hidden="true"></i>
                    Reset / Home
                </button>
                <button class="studio-connect-footer-btn" id="studio-connect-mail" type="button">
                    <i class="fa-solid fa-envelope" aria-hidden="true"></i>
                    Mail
                </button>
            </div>
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
    --sc-text-main: #1d1d1f;
    --sc-text-sub: #86868b;
    --sc-shadow: 0 12px 40px rgba(0,0,0,0.12);
}

.studio-connect-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    transform: translateY(0);
    transition: transform 0.3s ease;
}

.studio-connect-widget.is-lifted {
    transform: translateY(-80px);
}

.studio-connect-panel {
    width: 380px;
    height: 600px;
    background: var(--sc-light);
    border-radius: 18px;
    box-shadow: var(--sc-shadow);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.studio-connect-header {
    height: 70px;
    background: var(--sc-dark);
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 18px;
    color: var(--sc-light);
}

.studio-connect-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: var(--sc-primary);
}

.studio-connect-header-text {
    flex: 1;
}

.studio-connect-title {
    font-weight: 600;
    font-size: 16px;
}

.studio-connect-subtitle {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
}

.studio-connect-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #35c759;
    display: inline-block;
}

.studio-connect-close {
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    font-size: 16px;
}

.studio-connect-body {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: var(--sc-light);
}

.studio-connect-messages {
    flex: 1;
    overflow-y: auto;
    padding-right: 6px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.studio-connect-messages::-webkit-scrollbar {
    width: 6px;
}

.studio-connect-messages::-webkit-scrollbar-track {
    background: transparent;
}

.studio-connect-messages::-webkit-scrollbar-thumb {
    background: #d2d2d7;
    border-radius: 8px;
}

.studio-connect-messages {
    scrollbar-color: #d2d2d7 transparent;
    scrollbar-width: thin;
}

.studio-connect-bubble {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
}

.studio-connect-bubble.bot {
    background: #f5f5f7;
    color: var(--sc-text-main);
    align-self: flex-start;
}

.studio-connect-bubble.user {
    border: 1px solid #d2d2d7;
    color: var(--sc-primary);
    align-self: flex-end;
    background: transparent;
}

.studio-connect-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.studio-connect-option-btn {
    border: 1px solid #d2d2d7;
    background: transparent;
    color: var(--sc-primary);
    border-radius: 18px;
    padding: 8px 12px;
    font-size: 13px;
    cursor: pointer;
}

.studio-connect-option-btn:hover {
    background: var(--sc-primary);
    color: #ffffff;
}

.studio-connect-calculator {
    display: none;
    border: 1px solid #e5e5ea;
    border-radius: 14px;
    padding: 12px;
    gap: 10px;
    flex-direction: column;
}

.studio-connect-calculator.is-visible {
    display: flex;
}

.studio-connect-label {
    font-size: 12px;
    color: var(--sc-text-sub);
}

#studio-connect-words {
    border: 1px solid #d2d2d7;
    border-radius: 12px;
    padding: 10px 12px;
    font-size: 14px;
}

.studio-connect-speed {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.studio-connect-speed-btn {
    border: 1px solid #d2d2d7;
    background: transparent;
    color: var(--sc-text-main);
    border-radius: 16px;
    padding: 6px 10px;
    font-size: 12px;
    cursor: pointer;
}

.studio-connect-speed-btn.is-active {
    background: var(--sc-primary);
    color: #ffffff;
    border-color: var(--sc-primary);
}

.studio-connect-result {
    font-size: 13px;
    color: var(--sc-text-main);
}

.studio-connect-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-top: 1px solid #f0f0f2;
}

.studio-connect-footer-btn {
    border: 1px solid #d2d2d7;
    background: transparent;
    color: var(--sc-primary);
    border-radius: 16px;
    padding: 8px 12px;
    font-size: 13px;
    cursor: pointer;
    display: inline-flex;
    gap: 8px;
    align-items: center;
}

.studio-connect-footer-btn:hover {
    background: var(--sc-primary);
    color: #ffffff;
}

@media (max-width: 480px) {
    .studio-connect-widget {
        right: 12px;
        left: 12px;
    }

    .studio-connect-panel {
        width: 100%;
        height: 520px;
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
        this.messages = document.getElementById('studio-connect-messages');
        this.options = document.getElementById('studio-connect-options');
        this.closeButton = document.querySelector('.studio-connect-close');
        this.resetButton = document.getElementById('studio-connect-reset');
        this.mailButton = document.getElementById('studio-connect-mail');
        this.calculator = document.getElementById('studio-connect-calculator');
        this.wordsInput = document.getElementById('studio-connect-words');
        this.speedButtons = Array.from(document.querySelectorAll('.studio-connect-speed-btn'));
        this.result = document.getElementById('studio-connect-result');
        this.activeSpeed = 130;
        this.logicTree = this.buildLogicTree();
        this.currentStep = 'start';

        this.bindEvents();
        this.renderStep('start');
        this.observeCollisions();
    }

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) {
            return 'Guten Morgen';
        }
        if (hour < 18) {
            return 'Guten Tag';
        }
        return 'Guten Abend';
    }

    buildLogicTree() {
        return {
            start: {
                id: 'start',
                text: `${this.getGreeting()}! Schön, dass du da bist. Wobei kann ich unterstützen?`,
                options: [
                    { label: 'Demos & Casting', nextId: 'demos' },
                    { label: 'Preise & Rates', nextId: 'preise' },
                    { label: 'Studio & Regie', nextId: 'studio' },
                    { label: 'Booking & Kontakt', nextId: 'kontakt' },
                    { label: 'Tools: Wort-Rechner', nextId: 'rechner' }
                ]
            },
            demos: {
                id: 'demos',
                text: 'Welche Demo möchtest du hören?',
                options: [
                    { label: 'Werbung', action: 'anchor', target: '#werbung' },
                    { label: 'Imagefilm', action: 'anchor', target: '#imagefilm' },
                    { label: 'E-Learning', action: 'anchor', target: '#elearning' },
                    { label: 'Voice-Acting', action: 'anchor', target: '#voice-acting' },
                    { label: 'Zurück', nextId: 'start' }
                ]
            },
            preise: {
                id: 'preise',
                text: 'Ich kalkuliere transparent nach VDS-Standard oder individueller Abstimmung.',
                options: [
                    { label: 'TV/Funk Buyouts', nextId: 'preise-tv' },
                    { label: 'Web/Online', nextId: 'preise-web' },
                    { label: 'VDS Liste öffnen', action: 'vdslink' },
                    { label: 'Zurück', nextId: 'start' }
                ]
            },
            'preise-tv': {
                id: 'preise-tv',
                text: 'TV/Funk Buyouts orientieren sich an der VDS-Gagenliste und Reichweite.',
                options: [
                    { label: 'VDS Liste öffnen', action: 'vdslink' },
                    { label: 'Zurück', nextId: 'preise' }
                ]
            },
            'preise-web': {
                id: 'preise-web',
                text: 'Web/Online Raten richten sich nach Kanal, Laufzeit und Umfang.',
                options: [
                    { label: 'VDS Liste öffnen', action: 'vdslink' },
                    { label: 'Zurück', nextId: 'preise' }
                ]
            },
            studio: {
                id: 'studio',
                text: 'Gerne! Was interessiert dich?',
                options: [
                    { label: 'Equipment zeigen', nextId: 'studio-equipment' },
                    { label: 'Remote-Regie?', nextId: 'studio-remote' },
                    { label: 'Zurück', nextId: 'start' }
                ]
            },
            'studio-equipment': {
                id: 'studio-equipment',
                text: 'Neumann U87 / TLM 102 & RME.',
                options: [
                    { label: 'Zurück', nextId: 'studio' }
                ]
            },
            'studio-remote': {
                id: 'studio-remote',
                text: 'SessionLinkPRO, SourceConnect Now, Teams.',
                options: [
                    { label: 'Zurück', nextId: 'studio' }
                ]
            },
            rechner: {
                id: 'rechner',
                text: 'Wort-Rechner aktiviert. Gib die Wortanzahl ein.',
                action: 'calculator',
                options: [
                    { label: 'Zurück', nextId: 'start' }
                ]
            },
            kontakt: {
                id: 'kontakt',
                text: 'Wie möchtest du Kontakt aufnehmen?',
                options: [
                    { label: 'E-Mail', action: 'email' },
                    { label: 'Telefon', action: 'phone' },
                    { label: 'WhatsApp', action: 'whatsapp' },
                    { label: 'vCard herunterladen', action: 'vcard' },
                    { label: 'Zurück', nextId: 'start' }
                ]
            }
        };
    }

    bindEvents() {
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.widget.style.display = 'none';
            });
        }

        this.resetButton.addEventListener('click', () => {
            this.messages.innerHTML = '';
            this.renderStep('start');
        });

        this.mailButton.addEventListener('click', () => {
            if (this.settings.email) {
                window.location.href = `mailto:${this.settings.email}`;
            }
        });

        this.wordsInput.addEventListener('input', () => this.updateCalculator());

        this.speedButtons.forEach((button) => {
            button.addEventListener('click', () => {
                this.speedButtons.forEach((btn) => btn.classList.remove('is-active'));
                button.classList.add('is-active');
                this.activeSpeed = Number.parseInt(button.dataset.speed, 10) || 130;
                this.updateCalculator();
            });
        });
    }

    renderStep(stepId) {
        const step = this.logicTree[stepId];
        if (!step) {
            return;
        }

        this.currentStep = stepId;
        this.createBubble(step.text, 'bot');
        this.options.innerHTML = '';

        this.calculator.classList.remove('is-visible');
        this.calculator.setAttribute('aria-hidden', 'true');
        this.result.textContent = '';
        this.wordsInput.value = '';

        if (step.action === 'calculator') {
            this.calculator.classList.add('is-visible');
            this.calculator.setAttribute('aria-hidden', 'false');
        }

        step.options.forEach((option) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'studio-connect-option-btn';
            button.textContent = option.label;
            button.addEventListener('click', () => this.handleOption(option));
            this.options.appendChild(button);
        });
    }

    handleOption(option) {
        this.createBubble(option.label, 'user');

        if (option.action === 'anchor' && option.target) {
            this.triggerAnchor(option.target);
        }

        if (option.action === 'email' && this.settings.email) {
            window.location.href = `mailto:${this.settings.email}`;
            return;
        }

        if (option.action === 'phone' && this.settings.phone) {
            window.location.href = `tel:${this.settings.phone}`;
            return;
        }

        if (option.action === 'whatsapp' && this.settings.whatsapp) {
            window.open(this.settings.whatsapp, '_blank', 'noopener');
            return;
        }

        if (option.action === 'vdslink') {
            if (this.settings.vdsLink) {
                window.open(this.settings.vdsLink, '_blank', 'noopener');
            } else {
                this.createBubble('Kein VDS-Link hinterlegt. Bitte im Backend ergänzen.', 'bot');
            }
            return;
        }

        if (option.action === 'vcard') {
            this.downloadVCard();
            return;
        }

        if (option.nextId) {
            this.renderStep(option.nextId);
        }
    }

    createBubble(text, type) {
        const bubble = document.createElement('div');
        bubble.className = `studio-connect-bubble ${type}`;
        bubble.textContent = text;
        this.messages.appendChild(bubble);
        this.messages.scrollTop = this.messages.scrollHeight;
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
            this.result.textContent = 'Bitte eine gültige Wortanzahl eingeben.';
            return;
        }

        const totalSeconds = Math.round((words / this.activeSpeed) * 60);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const paddedSeconds = String(seconds).padStart(2, '0');
        this.result.textContent = `Dauer: ${minutes}:${paddedSeconds} min`;
    }

    downloadVCard() {
        const name = 'Pascal Krell';
        const email = this.settings.email || 'kontakt@pascal-krell.de';
        const website = this.settings.siteUrl || window.location.origin;
        const vcard = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${name}`,
            `EMAIL:${email}`,
            `URL:${website}`,
            'END:VCARD'
        ].join('\n');

        const blob = new Blob([vcard], { type: 'text/vcard' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'PascalKrell.vcf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    observeCollisions() {
        const selector = '[class*="demo"], [id*="demo"], .saved-demos';
        const isVisible = (element) => {
            if (!element) {
                return false;
            }
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
        };

        const updateLift = () => {
            const target = document.querySelector(selector);
            if (target && isVisible(target)) {
                this.widget.classList.add('is-lifted');
            } else {
                this.widget.classList.remove('is-lifted');
            }
        };

        const observer = new MutationObserver(updateLift);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        updateLift();
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
