<?php
/**
 * Plugin Name: SpeakerConcierge Bot
 * Description: Rule-basiertes Chat-Widget für Sprecher-Webseiten ohne externe KI.
 * Version: 1.1.0
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

    register_setting('scb_settings', 'scb_greeting_text', [
        'type' => 'string',
        'sanitize_callback' => 'sanitize_textarea_field',
        'default' => 'Hallo! Wie kann ich deinem Projekt helfen?',
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
                    <th scope="row"><label for="scb_greeting_text">Standard-Begrüßungstext</label></th>
                    <td>
                        <textarea id="scb_greeting_text" name="scb_greeting_text" class="large-text" rows="3"><?php
                            echo esc_textarea(get_option('scb_greeting_text', 'Hallo! Wie kann ich deinem Projekt helfen?'));
                        ?></textarea>
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
        'greeting' => get_option('scb_greeting_text', 'Hallo! Wie kann ich deinem Projekt helfen?'),
    ];

    ?>
    <div id="scb-chat-root">
        <button id="my-chat-trigger" aria-label="Chat öffnen">
            <span class="scb-fab-icon">💬</span>
        </button>

        <div id="scb-chat-window" aria-live="polite" aria-hidden="true">
            <div class="scb-header">
                <div class="scb-title">
                    <span class="scb-title-row">
                        <i class="fa-solid fa-microphone" aria-hidden="true"></i>
                        <strong>Studio Assistenz</strong>
                    </span>
                    <span class="scb-subtext">Hilfe &amp; Direktdraht</span>
                </div>
                <button id="scb-close" aria-label="Chat schließen">✕</button>
            </div>
            <div class="scb-messages" id="scb-messages"></div>
            <div class="scb-typing" id="scb-typing" aria-hidden="true">
                <span></span><span></span><span></span>
            </div>
            <div class="scb-chips" id="scb-chips"></div>
            <form class="scb-input" id="scb-input" aria-label="Chat Eingabe">
                <input type="text" id="scb-input-field" placeholder="Nachricht schreiben..." autocomplete="off" />
                <button type="submit" id="scb-send">Senden</button>
            </form>
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

        #my-chat-trigger {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: none;
            background: #1a93ee;
            color: #fff;
            font-size: 24px;
            box-shadow: 0 18px 40px rgba(26, 147, 238, 0.35);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
        }

        #my-chat-trigger.scb-shifted {
            transform: translateY(-70px);
        }

        #scb-chat-window {
            position: absolute;
            bottom: 76px;
            right: 0;
            width: 340px;
            max-height: 520px;
            background: rgba(255, 255, 255, 0.72);
            border-radius: 22px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(18px);
            border: 1px solid rgba(255, 255, 255, 0.35);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.3s ease;
            pointer-events: none;
        }

        #scb-chat-window.is-open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
            pointer-events: auto;
        }

        .scb-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            background: #1a93ee;
            color: #fff;
        }

        .scb-title {
            display: flex;
            flex-direction: column;
            gap: 2px;
            font-size: 13px;
        }

        .scb-title-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 15px;
        }

        .scb-subtext {
            opacity: 0.9;
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
            background: rgba(255, 255, 255, 0.9);
            color: #0b1f3a;
            align-self: flex-start;
            border: 1px solid rgba(26, 147, 238, 0.15);
        }

        .scb-message.user {
            background: #1a93ee;
            color: #fff;
            align-self: flex-end;
        }

        .scb-chips {
            padding: 0 16px 12px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .scb-chip {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(26, 147, 238, 0.3);
            color: #0b1f3a;
            padding: 8px 12px;
            border-radius: 999px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .scb-chip:hover {
            background: #1a93ee;
            color: #fff;
        }

        .scb-typing {
            display: none;
            align-items: center;
            gap: 6px;
            padding: 0 16px 10px;
        }

        .scb-typing span {
            width: 6px;
            height: 6px;
            background: #1a93ee;
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

        .scb-input {
            padding: 12px 16px 16px;
            display: flex;
            gap: 8px;
            border-top: 1px solid rgba(26, 147, 238, 0.15);
        }

        #scb-input-field {
            flex: 1;
            border-radius: 999px;
            border: 1px solid rgba(26, 147, 238, 0.25);
            padding: 8px 12px;
            font-size: 14px;
        }

        #scb-send {
            border: none;
            background: #1a93ee;
            color: #fff;
            padding: 8px 14px;
            border-radius: 999px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        #scb-send:hover {
            filter: brightness(0.95);
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
        const fab = document.getElementById('my-chat-trigger');
        const chatWindow = document.getElementById('scb-chat-window');
        const closeBtn = document.getElementById('scb-close');
        const messages = document.getElementById('scb-messages');
        const chips = document.getElementById('scb-chips');
        const typing = document.getElementById('scb-typing');
        const inputForm = document.getElementById('scb-input');
        const inputField = document.getElementById('scb-input-field');

        const settings = window.SCB_SETTINGS || {};
        const safeEmail = settings.email || 'kontakt@example.com';
        const safePhone = settings.phone || '+49 000 000000';
        const safeGreeting = settings.greeting || 'Hallo! Wie kann ich deinem Projekt helfen?';

        let awaitingWordCount = false;

        function ensureFontAwesome() {
            const existing = document.querySelector('link[href*="fontawesome"], link[href*="font-awesome"], link[href*="use.fontawesome"]');
            if (existing) {
                return;
            }
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        }

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
                button.type = 'button';
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
            }, 500);
        }

        function showStart() {
            showTyping(() => {
                appendMessage(safeGreeting, 'bot');
                setChips([
                    { label: 'Preise', onClick: () => handleUser('Preise', handleKeyword) },
                    { label: 'Kontakt', onClick: () => handleUser('Kontakt', handleKeyword) },
                    { label: 'Studio-Technik', onClick: () => handleUser('Studio-Technik', handleKeyword) },
                    { label: 'Wort-Rechner', onClick: () => handleUser('Wort-Rechner', handleKeyword) },
                ]);
            });
        }

        function handleUser(text, next) {
            appendMessage(text, 'user');
            setChips([]);
            showTyping(() => next(text));
        }

        function handleKeyword(input) {
            const lower = (input || '').toLowerCase();

            if (awaitingWordCount) {
                const wordCount = parseInt(lower.replace(/[^0-9]/g, ''), 10);
                if (!Number.isNaN(wordCount) && wordCount > 0) {
                    const totalMinutes = wordCount / 130;
                    const minutes = Math.floor(totalMinutes);
                    const seconds = Math.round((totalMinutes - minutes) * 60);
                    appendMessage(`Bei normalem Sprechtempo sind das ca. ${minutes} Minuten und ${seconds} Sekunden.`, 'bot');
                    awaitingWordCount = false;
                    showStart();
                    return;
                }
                appendMessage('Bitte nenne mir eine Zahl, damit ich die Dauer berechnen kann.', 'bot');
                return;
            }

            if (lower.includes('rechner') || lower.includes('wort')) {
                awaitingWordCount = true;
                appendMessage('Wie viele Wörter hat dein Skript ca.?', 'bot');
                return;
            }

            if (lower.includes('preis') || lower.includes('kosten') || lower.includes('budget') || lower.includes('rate')) {
                appendMessage('Meine Preise orientieren sich an der VDS-Liste. Soll ich dir den Link senden?', 'bot');
                return;
            }

            if (lower.includes('technik') || lower.includes('mikro') || lower.includes('studio')) {
                appendMessage('Ich nehme in einer Studiobricks Kabine mit einem Neumann U87 auf.', 'bot');
                return;
            }

            if (lower.includes('hallo') || lower.includes('hi') || lower.includes('moin')) {
                appendMessage('Hallo! Wie kann ich deinem Projekt helfen?', 'bot');
                return;
            }

            if (lower.includes('kontakt') || lower.includes('mail') || lower.includes('email') || lower.includes('telefon')) {
                appendMessage(`Du erreichst mich per E-Mail (${safeEmail}) oder telefonisch unter ${safePhone}.`, 'bot');
                return;
            }

            appendMessage('Das habe ich nicht ganz verstanden. Wähle lieber eine der Optionen unten oder schreibe mir direkt eine Mail.', 'bot');
        }

        function handleSubmit(event) {
            event.preventDefault();
            if (!inputField) {
                return;
            }
            const text = inputField.value.trim();
            if (!text) {
                return;
            }
            inputField.value = '';
            handleUser(text, handleKeyword);
        }

        function toggleChat(open) {
            if (!chatWindow) {
                return;
            }
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

        function updateFabPosition() {
            if (!fab) {
                return;
            }
            const blocker = document.querySelector('.has-saved-demos, .gemerkte-demos-container');
            if (blocker) {
                fab.classList.add('scb-shifted');
            } else {
                fab.classList.remove('scb-shifted');
            }
        }

        if (fab && chatWindow) {
            fab.addEventListener('click', () => toggleChat(true));
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => toggleChat(false));
        }

        if (inputForm) {
            inputForm.addEventListener('submit', handleSubmit);
        }

        const observer = new MutationObserver(updateFabPosition);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });

        ensureFontAwesome();
        updateFabPosition();
    })();
    JS;
}
