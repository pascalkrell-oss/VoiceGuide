<?php
/**
 * Plugin Name: SpeakerConcierge Bot
 * Description: Rule-basiertes Chat-Widget für Sprecher-Webseiten ohne externe KI.
 * Version: 1.0.0
 * Author: SpeakerConcierge
 * License: GPL-2.0+
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Registrierung der Plugin-Einstellungen.
 */
function scb_register_settings(): void
{
    register_setting('scb_settings', 'scb_contact_email', [
        'type' => 'string',
        'sanitize_callback' => 'sanitize_email',
        'default' => '',
    ]);

    register_setting('scb_settings', 'scb_contact_phone', [
        'type' => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default' => '',
    ]);

    register_setting('scb_settings', 'scb_demo_link', [
        'type' => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default' => '',
    ]);
}
add_action('admin_init', 'scb_register_settings');

/**
 * Einstellungsseite im WordPress-Backend hinzufügen.
 */
function scb_add_settings_page(): void
{
    add_options_page(
        'SpeakerConcierge Bot',
        'SpeakerConcierge Bot',
        'manage_options',
        'speakerconcierge-bot',
        'scb_render_settings_page'
    );
}
add_action('admin_menu', 'scb_add_settings_page');

/**
 * Ausgabe der Einstellungsseite.
 */
function scb_render_settings_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }

    ?>
    <div class="wrap">
        <h1>SpeakerConcierge Bot Einstellungen</h1>
        <form method="post" action="options.php">
            <?php settings_fields('scb_settings'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="scb_contact_email">E-Mail Adresse für Kontakt</label></th>
                    <td>
                        <input type="email" id="scb_contact_email" name="scb_contact_email" class="regular-text"
                               value="<?php echo esc_attr(get_option('scb_contact_email', '')); ?>" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="scb_contact_phone">Telefonnummer</label></th>
                    <td>
                        <input type="text" id="scb_contact_phone" name="scb_contact_phone" class="regular-text"
                               value="<?php echo esc_attr(get_option('scb_contact_phone', '')); ?>" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="scb_demo_link">Link zur Demo-Seite</label></th>
                    <td>
                        <input type="url" id="scb_demo_link" name="scb_demo_link" class="regular-text"
                               value="<?php echo esc_attr(get_option('scb_demo_link', '')); ?>" />
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

/**
 * Frontend-Markup, Styles und Skripte ausgeben.
 */
function scb_render_frontend_widget(): void
{
    $settings = [
        'email' => get_option('scb_contact_email', ''),
        'phone' => get_option('scb_contact_phone', ''),
        'demoLink' => get_option('scb_demo_link', ''),
    ];

    ?>
    <div id="scb-chat-root">
        <button id="scb-fab" aria-label="Chat öffnen">
            <span class="scb-fab-icon">💬</span>
        </button>

        <div id="scb-chat-window" aria-live="polite" aria-hidden="true">
            <div class="scb-header">
                <div class="scb-avatar" aria-hidden="true">🎙️</div>
                <div class="scb-title">
                    <strong>SpeakerConcierge</strong>
                    <span>Dein Voice Assistant</span>
                </div>
                <button id="scb-close" aria-label="Chat schließen">✕</button>
            </div>
            <div class="scb-messages" id="scb-messages"></div>
            <div class="scb-typing" id="scb-typing" aria-hidden="true">
                <span></span><span></span><span></span>
            </div>
            <div class="scb-chips" id="scb-chips"></div>
        </div>
    </div>

    <style>
        #scb-chat-root {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        #scb-fab {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: none;
            background: #0b1f3a;
            color: #fff;
            font-size: 24px;
            box-shadow: 0 12px 30px rgba(11, 31, 58, 0.35);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #scb-chat-window {
            position: absolute;
            bottom: 72px;
            right: 0;
            width: 320px;
            max-height: 480px;
            background: rgba(255, 255, 255, 0.85);
            border-radius: 20px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            display: none;
            flex-direction: column;
            overflow: hidden;
        }

        #scb-chat-window.is-open {
            display: flex;
        }

        .scb-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            background: #0b1f3a;
            color: #fff;
        }

        .scb-avatar {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-size: 20px;
        }

        .scb-title {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
            font-size: 13px;
        }

        .scb-title strong {
            font-size: 15px;
        }

        #scb-close {
            background: transparent;
            border: none;
            color: #fff;
            font-size: 18px;
            cursor: pointer;
        }

        .scb-messages {
            padding: 16px;
            overflow-y: auto;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .scb-message {
            padding: 10px 12px;
            border-radius: 14px;
            font-size: 14px;
            line-height: 1.4;
            max-width: 90%;
        }

        .scb-message.bot {
            background: #f0f4ff;
            color: #0b1f3a;
            align-self: flex-start;
        }

        .scb-message.user {
            background: #0b1f3a;
            color: #fff;
            align-self: flex-end;
        }

        .scb-chips {
            padding: 12px 16px 16px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            border-top: 1px solid rgba(11, 31, 58, 0.08);
        }

        .scb-chip {
            background: #fff;
            border: 1px solid rgba(11, 31, 58, 0.2);
            color: #0b1f3a;
            padding: 8px 12px;
            border-radius: 999px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .scb-chip:hover {
            background: #0b1f3a;
            color: #fff;
        }

        .scb-typing {
            display: none;
            align-items: center;
            gap: 6px;
            padding: 0 16px 12px;
        }

        .scb-typing span {
            width: 6px;
            height: 6px;
            background: #0b1f3a;
            border-radius: 50%;
            display: inline-block;
            animation: scb-bounce 0.6s infinite alternate;
        }

        .scb-typing span:nth-child(2) {
            animation-delay: 0.2s;
        }

        .scb-typing span:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes scb-bounce {
            from {
                transform: translateY(0);
                opacity: 0.4;
            }
            to {
                transform: translateY(-6px);
                opacity: 1;
            }
        }
    </style>

    <?php

    wp_register_script('scb-chat-script', '', [], null, true);
    wp_enqueue_script('scb-chat-script');
    wp_localize_script('scb-chat-script', 'SCB_SETTINGS', $settings);
    wp_add_inline_script('scb-chat-script', scb_get_inline_script());
}
add_action('wp_footer', 'scb_render_frontend_widget');

/**
 * Inline JavaScript für die Chatlogik.
 */
function scb_get_inline_script(): string
{
    return <<<JS
    (function() {
        const fab = document.getElementById('scb-fab');
        const chatWindow = document.getElementById('scb-chat-window');
        const closeBtn = document.getElementById('scb-close');
        const messages = document.getElementById('scb-messages');
        const chips = document.getElementById('scb-chips');
        const typing = document.getElementById('scb-typing');

        const settings = window.SCB_SETTINGS || {};
        const safeEmail = settings.email || 'kontakt@example.com';
        const safePhone = settings.phone || '+49 000 000000';
        const safeDemo = settings.demoLink || '#';

        function appendMessage(text, type) {
            const message = document.createElement('div');
            message.className = 'scb-message ' + type;
            message.textContent = text;
            messages.appendChild(message);
            messages.scrollTop = messages.scrollHeight;
        }

        function setChips(options) {
            chips.innerHTML = '';
            options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'scb-chip';
                button.textContent = option.label;
                button.addEventListener('click', option.onClick);
                chips.appendChild(button);
            });
        }

        function showTyping(callback) {
            typing.style.display = 'flex';
            setTimeout(() => {
                typing.style.display = 'none';
                callback();
            }, 600);
        }

        function showStart() {
            showTyping(() => {
                appendMessage('Hallo! Suchst du eine Stimme für dein Projekt?', 'bot');
                setChips([
                    { label: 'Demos hören', onClick: () => handleUser('Demos hören', showDemos) },
                    { label: 'Kontakt aufnehmen', onClick: () => handleUser('Kontakt aufnehmen', showContact) },
                    { label: 'Preise/Rates', onClick: () => handleUser('Preise/Rates', showRates) },
                    { label: 'Studio-Info', onClick: () => handleUser('Studio-Info', showStudio) },
                ]);
            });
        }

        function handleUser(text, next) {
            appendMessage(text, 'user');
            setChips([]);
            showTyping(next);
        }

        function showDemos() {
            appendMessage('Welches Genre interessiert dich?', 'bot');
            setChips([
                { label: 'Werbung', onClick: () => handleUser('Werbung', () => showDemoLinks('Werbung')) },
                { label: 'Doku', onClick: () => handleUser('Doku', () => showDemoLinks('Doku')) },
                { label: 'Imagefilm', onClick: () => handleUser('Imagefilm', () => showDemoLinks('Imagefilm')) },
            ]);
        }

        function showDemoLinks(category) {
            appendMessage(`Hier sind ${category}-Demos:`, 'bot');
            appendMessage(`🔗 ${safeDemo}`, 'bot');
            setChips([
                { label: 'Mehr Demos', onClick: () => handleUser('Mehr Demos', showDemos) },
                { label: 'Kontakt aufnehmen', onClick: () => handleUser('Kontakt aufnehmen', showContact) },
            ]);
        }

        function showContact() {
            appendMessage('Super! Wie möchtest du Kontakt aufnehmen?', 'bot');
            setChips([
                { label: 'E-Mail schreiben', onClick: () => handleUser('E-Mail schreiben', showEmail) },
                { label: 'Anrufen', onClick: () => handleUser('Anrufen', showPhone) },
                { label: 'WhatsApp', onClick: () => handleUser('WhatsApp', showWhatsApp) },
            ]);
        }

        function showEmail() {
            appendMessage(`Schreib gerne an: ${safeEmail}`, 'bot');
            setChips([
                { label: 'Zurück zum Start', onClick: () => handleUser('Zurück', showStart) },
            ]);
        }

        function showPhone() {
            appendMessage(`Ruf mich an: ${safePhone}`, 'bot');
            setChips([
                { label: 'Zurück zum Start', onClick: () => handleUser('Zurück', showStart) },
            ]);
        }

        function showWhatsApp() {
            appendMessage(`WhatsApp: ${safePhone}`, 'bot');
            setChips([
                { label: 'Zurück zum Start', onClick: () => handleUser('Zurück', showStart) },
            ]);
        }

        function showRates() {
            appendMessage('Preise sind abhängig vom Projektumfang. Schreib mir kurz dein Briefing, dann erstelle ich ein Angebot.', 'bot');
            setChips([
                { label: 'Kontakt aufnehmen', onClick: () => handleUser('Kontakt aufnehmen', showContact) },
                { label: 'Zurück zum Start', onClick: () => handleUser('Zurück', showStart) },
            ]);
        }

        function showStudio() {
            appendMessage('Ich arbeite aus einem professionellen Studio mit Broadcast-Qualität und schneller Lieferung.', 'bot');
            setChips([
                { label: 'Demos hören', onClick: () => handleUser('Demos hören', showDemos) },
                { label: 'Kontakt aufnehmen', onClick: () => handleUser('Kontakt aufnehmen', showContact) },
            ]);
        }

        function toggleChat(open) {
            if (open) {
                chatWindow.classList.add('is-open');
                chatWindow.setAttribute('aria-hidden', 'false');
                if (!messages.children.length) {
                    showStart();
                }
            } else {
                chatWindow.classList.remove('is-open');
                chatWindow.setAttribute('aria-hidden', 'true');
            }
        }

        if (fab && chatWindow) {
            fab.addEventListener('click', () => toggleChat(true));
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => toggleChat(false));
        }
    })();
    JS;
}
