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
        <button class="studio-connect-launcher" id="studio-connect-launcher" type="button" aria-label="StudioConnect Pro öffnen">
            <i class="fa-solid fa-comments" aria-hidden="true"></i>
        </button>
        <div class="studio-connect-panel" role="dialog" aria-label="StudioConnect Pro" aria-hidden="true">
            <div class="studio-connect-header">
                <div class="studio-connect-avatar">
                    <i class="fa-solid fa-user-tie" aria-hidden="true"></i>
                </div>
                <div class="studio-connect-header-text">
                    <div class="studio-connect-title">Pascal Krell</div>
                    <div class="studio-connect-subtitle">
                        <span class="studio-connect-status"></span>
                        <span id="studio-connect-subtext">Studio Hamburg &bull; Online</span>
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

.studio-connect-widget.lifted {
    transform: translateY(-80px);
}

.studio-connect-launcher {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    border: none;
    background: var(--sc-primary);
    color: #ffffff;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 12px 30px rgba(26, 147, 238, 0.3);
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
    width: 380px;
    height: 600px;
    background: var(--sc-light);
    border-radius: 18px;
    box-shadow: var(--sc-shadow);
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
    background: var(--sc-dark);
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 24px;
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
    padding: 24px;
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
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.6;
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

.studio-connect-options.is-disabled {
    opacity: 0.6;
    pointer-events: none;
}

.studio-connect-option-btn {
    border: 1px solid #d2d2d7;
    background: transparent;
    color: var(--sc-primary);
    border-radius: 18px;
    padding: 10px 14px;
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
    padding: 16px 20px;
    border-top: 1px solid #f0f0f2;
}

.studio-connect-footer-btn {
    border: 1px solid #d2d2d7;
    background: transparent;
    color: var(--sc-primary);
    border-radius: 16px;
    padding: 10px 14px;
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

.studio-connect-copy-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}

.studio-connect-copy {
    border: 1px solid #d2d2d7;
    background: #f5f7fb;
    color: var(--sc-text-main);
    border-radius: 14px;
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

.studio-connect-toast {
    position: absolute;
    right: 0;
    bottom: 72px;
    background: var(--sc-dark);
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
        this.panel = document.querySelector('.studio-connect-panel');
        this.launcher = document.getElementById('studio-connect-launcher');
        this.messages = document.getElementById('studio-connect-messages');
        this.options = document.getElementById('studio-connect-options');
        this.closeButton = document.querySelector('.studio-connect-close');
        this.resetButton = document.getElementById('studio-connect-reset');
        this.mailButton = document.getElementById('studio-connect-mail');
        this.calculator = document.getElementById('studio-connect-calculator');
        this.wordsInput = document.getElementById('studio-connect-words');
        this.speedButtons = Array.from(document.querySelectorAll('.studio-connect-speed-btn'));
        this.result = document.getElementById('studio-connect-result');
        this.headerSubtext = document.getElementById('studio-connect-subtext');
        this.toast = document.getElementById('studio-connect-toast');
        this.activeSpeed = 130;
        this.isTyping = false;
        this.isOpen = false;
        this.hasInteraction = false;
        this.soundEngine = new SoundEngine();
        this.logicTree = this.buildLogicTree();
        this.currentStep = 'start';

        this.bindEvents();
        this.renderStep('start');
        this.startCollisionCheck();
        this.startPulseCycle();
    }

    buildLogicTree() {
        return {
            start: {
                id: 'start',
                text: 'Moin! Willkommen im Studio. Wie kann ich helfen?',
                options: [
                    { label: '🎧 Demos', nextId: 'demos' },
                    { label: '💰 Preise', nextId: 'preise' },
                    { label: '🎙 Technik', nextId: 'technik' },
                    { label: '⚡ Kontakt', nextId: 'kontakt' },
                    { label: '⏱ Wort-Rechner', nextId: 'rechner' }
                ]
            },
            demos: {
                id: 'demos',
                text: 'Welche Demo soll ich öffnen?',
                options: [
                    { label: 'Werbung', action: 'anchor', target: '#werbung' },
                    { label: 'Doku', action: 'anchor', target: '#doku' },
                    { label: 'Image', action: 'anchor', target: '#image' },
                    { label: 'Zurück', nextId: 'start' }
                ]
            },
            preise: {
                id: 'preise',
                text: 'Transparente Kalkulation nach VDS-Standard. Was möchtest du wissen?',
                options: [
                    { label: 'VDS Liste', action: 'vdslink' },
                    { label: 'Buyouts erklärt', nextId: 'buyouts' },
                    { label: 'Zurück', nextId: 'start' }
                ]
            },
            buyouts: {
                id: 'buyouts',
                text: 'Buyouts sind Nutzungsrechte nach Laufzeit, Medium und Reichweite.',
                options: [
                    { label: 'Zurück', nextId: 'preise' }
                ]
            },
            technik: {
                id: 'technik',
                text: 'Neumann U87 & SessionLinkPRO stehen bereit.',
                options: [
                    { label: 'Remote Verbindung testen', action: 'anchor', target: '#remote-test' },
                    { label: 'Zurück', nextId: 'start' }
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
                    { label: 'E-Mail öffnen', action: 'email' },
                    { label: 'Telefon anrufen', action: 'phone' },
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

        this.speedButtons.forEach((button) => {
            button.addEventListener('click', () => {
                this.registerInteraction();
                this.speedButtons.forEach((btn) => btn.classList.remove('is-active'));
                button.classList.add('is-active');
                this.activeSpeed = Number.parseInt(button.dataset.speed, 10) || 130;
                this.updateCalculator();
            });
        });

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
                this.showToast('Kopiert!');
            }).catch(() => {
                this.showToast('Kopiert!');
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
        this.messages.scrollTop = this.messages.scrollHeight;
        if (type === 'bot') {
            this.soundEngine.play('pop');
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

        const totalSeconds = Math.round((words / this.activeSpeed) * 60);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const paddedSeconds = String(seconds).padStart(2, '0');
        this.result.textContent = `Dauer: ${minutes}:${paddedSeconds} min`;
    }

    typeWriter(bubble, text) {
        this.isTyping = true;
        bubble.textContent = '';
        return new Promise((resolve) => {
            let index = 0;
            const timer = setInterval(() => {
                bubble.textContent += text.charAt(index);
                index += 1;
                this.messages.scrollTop = this.messages.scrollHeight;
                if (index >= text.length) {
                    clearInterval(timer);
                    this.isTyping = false;
                    resolve();
                }
            }, 18);
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

        if (!row.children.length) {
            const fallback = document.createElement('div');
            fallback.textContent = 'Bitte E-Mail und Telefon im Backend hinterlegen.';
            bubble.appendChild(fallback);
        } else {
            bubble.appendChild(row);
        }

        this.messages.appendChild(bubble);
        this.messages.scrollTop = this.messages.scrollHeight;
        this.soundEngine.play('pop');
    }

    updateHeaderSubtext(stepId) {
        const map = {
            start: 'Studio Hamburg • Online',
            demos: 'Demos & Hörproben',
            preise: 'Preise & Infos',
            buyouts: 'Preise & Infos',
            technik: 'Technik & Setup',
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
        this.soundEngine.play('swoosh');
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
        }, 10000);
    }

    startCollisionCheck() {
        const isVisible = (element) => {
            if (!element) {
                return false;
            }
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
        };

        const matchesDemoSaved = (element) => {
            const idText = (element.id || '').toLowerCase();
            const classText = (element.className || '').toString().toLowerCase();
            const idMatch = idText.includes('demo') && idText.includes('saved');
            const classMatch = classText.includes('demo') && classText.includes('saved');
            return idMatch || classMatch;
        };

        const updateLift = () => {
            const candidates = document.querySelectorAll('[id*="demo"], [class*="demo"]');
            let shouldLift = false;
            candidates.forEach((element) => {
                if (matchesDemoSaved(element) && isVisible(element)) {
                    shouldLift = true;
                }
            });
            if (shouldLift) {
                this.widget.classList.add('lifted');
            } else {
                this.widget.classList.remove('lifted');
            }
        };

        updateLift();
        window.setInterval(updateLift, 1000);
    }
}

class SoundEngine {
    constructor() {
        // Kurze Dummy-Sounds als Base64-Platzhalter.
        this.sounds = {
            click: this.createAudio('data:audio/mp3;base64,SUQzBAAAAAAA'),
            pop: this.createAudio('data:audio/mp3;base64,SUQzBAAAAAAB'),
            swoosh: this.createAudio('data:audio/mp3;base64,SUQzBAAAAAAC')
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
