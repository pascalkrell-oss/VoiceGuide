<?php
/**
 * Plugin Name: Pascal Krell StudioConnect
 * Description: Premium-Chat-Widget im Support-Board-Stil für Pascal Krell Studio.
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
        'vdsLink' => 'https://www.vds-ev.de',
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
            <i class="fa-solid fa-comments" aria-hidden="true"></i>
        </button>
        <div class="studio-connect-panel" role="dialog" aria-label="Pascal Krell StudioConnect" aria-hidden="true">
            <div class="studio-connect-header">
                <div class="studio-connect-header-text">
                    <div class="studio-connect-title">Studio Support</div>
                    <div class="studio-connect-subtitle" id="studio-connect-subtext">Online & bereit</div>
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
                    <div class="studio-connect-result" id="studio-connect-result"></div>
                </div>
            </div>

            <div class="studio-connect-footer">
                <button class="studio-connect-footer-btn" id="studio-connect-reset" type="button" aria-label="Zur Startseite">
                    <i class="fa-solid fa-house" aria-hidden="true"></i>
                </button>
                <div class="studio-connect-footer-spacer" aria-hidden="true"></div>
                <button class="studio-connect-footer-btn" id="studio-connect-mail" type="button" aria-label="E-Mail öffnen">
                    <i class="fa-solid fa-envelope" aria-hidden="true"></i>
                </button>
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
    --sc-dark: #222222;
    --sc-light: #ffffff;
    --sc-text-main: #444444;
    --sc-text-sub: #1a93ee;
    --sc-border: #eef0f5;
    --sc-muted: #f2f2f5;
    --sc-soft: #fcfcfd;
    --sc-shadow: 0 25px 90px rgba(0,0,0,0.2);
}

.studio-connect-widget {
    position: fixed;
    bottom: 25px;
    right: 25px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.studio-connect-launcher {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    border: 1px solid var(--sc-border);
    background: var(--sc-light);
    color: #555555;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.studio-connect-launcher.is-pulsing {
    animation: sc-pulse 1.6s ease-out;
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
    width: 400px;
    height: 700px;
    max-height: 80vh;
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

.studio-connect-widget.is-open .studio-connect-launcher {
    opacity: 0;
    pointer-events: none;
}

.studio-connect-header {
    height: 70px;
    background: #0b0f19;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 24px;
    color: #ffffff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex: 0 0 auto;
}

.studio-connect-header-text {
    flex: 1;
}

.studio-connect-title {
    font-weight: 700;
    font-size: 16px;
    color: #ffffff;
}

.studio-connect-subtitle {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
}

.studio-connect-close {
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    font-size: 16px;
}

.studio-connect-body {
    flex: 1 1 auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: #ffffff;
    overflow-y: auto;
}

.studio-connect-body::-webkit-scrollbar {
    width: 6px;
}

.studio-connect-body::-webkit-scrollbar-track {
    background: transparent;
}

.studio-connect-body::-webkit-scrollbar-thumb {
    background: #d2d2d7;
    border-radius: 8px;
}

.studio-connect-body {
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
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 14px;
    line-height: 1.6;
}

.studio-connect-bubble.bot {
    background: #f2f4f7;
    color: var(--sc-text-main);
    border-radius: 10px 10px 10px 0;
    align-self: flex-start;
}

.studio-connect-bubble.user {
    border: 1px solid var(--sc-primary);
    color: var(--sc-primary);
    align-self: flex-end;
    background: transparent;
    border-radius: 10px 10px 0 10px;
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
    border: 1px solid var(--sc-primary);
    background: transparent;
    color: var(--sc-primary);
    border-radius: 6px;
    padding: 10px 14px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
}

.studio-connect-option-btn:hover {
    background: var(--sc-primary);
    color: #ffffff;
}

.studio-connect-calculator {
    display: none;
    border: 1px solid var(--sc-border);
    border-radius: 10px;
    padding: 12px;
    gap: 10px;
    flex-direction: column;
    background: var(--sc-light);
}

.studio-connect-calculator.is-visible {
    display: flex;
}

.studio-connect-label {
    font-size: 12px;
    color: #7b7e87;
}

#studio-connect-words {
    border: 1px solid var(--sc-border);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
}

.studio-connect-result {
    font-size: 13px;
    color: #333333;
}

.studio-connect-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    border-top: 1px solid #eeeeee;
    background: #ffffff;
    height: 60px;
    flex: 0 0 auto;
}

.studio-connect-footer-spacer {
    flex: 1;
}

.studio-connect-footer-btn {
    border: 1px solid var(--sc-border);
    background: transparent;
    color: #555555;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
}

.studio-connect-footer-btn:hover {
    background: var(--sc-primary);
    color: #ffffff;
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
}

.studio-connect-toast.is-visible {
    opacity: 1;
    transform: translateY(0);
}

@media (max-width: 480px) {
    .studio-connect-widget {
        right: 12px;
        left: 12px;
    }

    .studio-connect-panel {
        width: 100%;
        height: 80vh;
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
        this.closeButton = document.querySelector('.studio-connect-close');
        this.resetButton = document.getElementById('studio-connect-reset');
        this.mailButton = document.getElementById('studio-connect-mail');
        this.body = document.querySelector('.studio-connect-body');
        this.calculator = document.getElementById('studio-connect-calculator');
        this.wordsInput = document.getElementById('studio-connect-words');
        this.result = document.getElementById('studio-connect-result');
        this.headerSubtext = document.getElementById('studio-connect-subtext');
        this.toast = document.getElementById('studio-connect-toast');
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
                text: 'Hallo! Wie kann ich weiterhelfen?',
                options: [
                    { label: '🎧 Demos & Casting', nextId: 'demos' },
                    { label: '💰 Preise & Gagen', nextId: 'preise' },
                    { label: '🎙 Technik & Studio', nextId: 'technik' },
                    { label: '⏱ Wort-Rechner', nextId: 'rechner' },
                    { label: '⚡ Kontakt & Booking', nextId: 'kontakt' }
                ]
            },
            demos: {
                id: 'demos',
                text: 'Welche Kategorie interessiert dich?',
                options: [
                    { label: 'Werbung', action: 'anchor', target: '#werbung' },
                    { label: 'Doku', action: 'anchor', target: '#doku' },
                    { label: 'Image', action: 'anchor', target: '#image' },
                    { label: 'Gaming', action: 'anchor', target: '#gaming' },
                    { label: 'Zurück', nextId: 'start' }
                ]
            },
            preise: {
                id: 'preise',
                text: 'Orientierung nach VDS-Standard. Soll ich dir die Infos öffnen?',
                options: [
                    { label: 'VDS Info', nextId: 'vdsinfo' },
                    { label: 'VDS Liste öffnen', action: 'vdslink' },
                    { label: 'Zurück', nextId: 'start' }
                ]
            },
            vdsinfo: {
                id: 'vdsinfo',
                text: 'Die VDS-Liste liefert transparente Richtwerte für Sprecherhonorare.',
                options: [
                    { label: 'VDS Liste öffnen', action: 'vdslink' },
                    { label: 'Zurück', nextId: 'preise' }
                ]
            },
            technik: {
                id: 'technik',
                text: 'Neumann U87 / RME.',
                options: [
                    { label: 'Remote Regie?', nextId: 'remote' },
                    { label: 'Zurück', nextId: 'start' }
                ]
            },
            remote: {
                id: 'remote',
                text: 'Remote-Regie via SessionLinkPRO oder Source-Connect möglich.',
                options: [
                    { label: 'Zurück', nextId: 'technik' }
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
                text: 'Hier sind meine Kontaktdaten. Tippe zum Kopieren.',
                options: [
                    { label: 'Mail', action: 'email' },
                    { label: 'Anruf', action: 'phone' },
                    { label: 'WhatsApp', action: 'whatsapp' },
                    { label: 'Zurück', nextId: 'start' }
                ]
            }
        };
    }

    bindEvents() {
        this.launcher.addEventListener('click', () => {
            this.registerInteraction();
            this.openPanel();
        });

        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.registerInteraction();
                this.closePanel();
            });
        }

        this.resetButton.addEventListener('click', () => {
            this.registerInteraction();
            this.messages.innerHTML = '';
            this.renderStep('start');
        });

        this.mailButton.addEventListener('click', () => {
            this.registerInteraction();
            if (this.settings.email) {
                window.location.href = `mailto:${this.settings.email}`;
            }
        });

        this.wordsInput.addEventListener('input', () => this.updateCalculator());

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
        this.options.classList.add('is-disabled');
        await this.createBubble(step.text, 'bot');
        if (stepId === 'kontakt') {
            this.createContactBubble();
        }
        this.options.innerHTML = '';
        this.options.classList.remove('is-disabled');

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

    async handleOption(option) {
        if (this.isTyping) {
            return;
        }
        this.registerInteraction();
        this.soundEngine.play('click');
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

        if (option.action === 'whatsapp') {
            const phone = this.settings.whatsapp || '';
            const digits = phone.replace(/\D/g, '');
            if (digits) {
                window.open(`https://wa.me/${encodeURIComponent(digits)}`, '_blank', 'noopener');
            } else {
                this.createBubble('Bitte eine WhatsApp-Nummer im Backend hinterlegen.', 'bot');
            }
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

        if (option.nextId) {
            this.renderStep(option.nextId);
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
            this.result.textContent = 'Bitte eine gültige Wortanzahl eingeben.';
            return;
        }

        const totalSeconds = Math.round((words / 130) * 60);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const paddedSeconds = String(seconds).padStart(2, '0');
        this.result.textContent = `Min:Sek ${minutes}:${paddedSeconds}`;
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

        if (!row.children.length) {
            const fallback = document.createElement('div');
            fallback.textContent = 'Bitte E-Mail, Telefon und WhatsApp im Backend hinterlegen.';
            bubble.appendChild(fallback);
        } else {
            bubble.appendChild(row);
        }

        this.messages.appendChild(bubble);
        this.scrollToBottom();
        this.soundEngine.play('msg_in');
    }

    updateHeaderSubtext(stepId) {
        const map = {
            start: 'Online & bereit',
            demos: 'Demos & Casting',
            preise: 'Preise & Gagen',
            vdsinfo: 'Preise & Gagen',
            technik: 'Technik & Studio',
            remote: 'Technik & Studio',
            kontakt: 'Kontakt & Booking',
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
        this.soundEngine.play('open');
    }

    closePanel() {
        this.widget.classList.remove('is-open');
        this.panel.setAttribute('aria-hidden', 'true');
        this.isOpen = false;
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
        if (!this.body) {
            return;
        }
        requestAnimationFrame(() => {
            this.body.scrollTop = this.body.scrollHeight;
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
