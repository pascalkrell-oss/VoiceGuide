<?php
/**
 * Plugin Name: Pascal Krell Studio Connect
 * Description: Regelbasiertes Support- & Booking-Widget als Floating Action Button für Pascal Krell.
 * Version: 1.0.0
 * Author: Pascal Krell Studio
 * License: GPL-2.0+
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Registrierung der Plugin-Einstellungen.
 */
function pk_studio_register_settings(): void
{
    register_setting('pk_studio_settings', 'pk_studio_contact_email', [
        'type' => 'string',
        'sanitize_callback' => 'sanitize_email',
        'default' => '',
    ]);

    register_setting('pk_studio_settings', 'pk_studio_contact_phone', [
        'type' => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default' => '',
    ]);

    register_setting('pk_studio_settings', 'pk_studio_vds_link', [
        'type' => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default' => '',
    ]);
}
add_action('admin_init', 'pk_studio_register_settings');

/**
 * Einstellungsseite im WordPress-Backend hinzufügen.
 */
function pk_studio_add_settings_page(): void
{
    add_options_page(
        'Pascal Krell Studio Connect',
        'Pascal Krell Studio Connect',
        'manage_options',
        'pk-studio-connect',
        'pk_studio_render_settings_page'
    );
}
add_action('admin_menu', 'pk_studio_add_settings_page');

/**
 * Ausgabe der Einstellungsseite.
 */
function pk_studio_render_settings_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }

    ?>
    <div class="wrap">
        <h1>Pascal Krell Studio Connect Einstellungen</h1>
        <form method="post" action="options.php">
            <?php settings_fields('pk_studio_settings'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="pk_studio_contact_email">E-Mail Adresse für Kontakt</label></th>
                    <td>
                        <input type="email" id="pk_studio_contact_email" name="pk_studio_contact_email"
                               class="regular-text" value="<?php echo esc_attr(get_option('pk_studio_contact_email', '')); ?>" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="pk_studio_contact_phone">Telefonnummer</label></th>
                    <td>
                        <input type="text" id="pk_studio_contact_phone" name="pk_studio_contact_phone"
                               class="regular-text" value="<?php echo esc_attr(get_option('pk_studio_contact_phone', '')); ?>" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="pk_studio_vds_link">Link zur VDS-Gagenliste</label></th>
                    <td>
                        <input type="url" id="pk_studio_vds_link" name="pk_studio_vds_link"
                               class="regular-text" value="<?php echo esc_attr(get_option('pk_studio_vds_link', '')); ?>" />
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

/**
 * Styles und Skripte registrieren und lokalisieren.
 */
function pk_studio_enqueue_assets(): void
{
    $settings = [
        'email' => get_option('pk_studio_contact_email', ''),
        'phone' => get_option('pk_studio_contact_phone', ''),
        'vdsLink' => get_option('pk_studio_vds_link', ''),
    ];

    wp_register_style(
        'pk-studio-fontawesome',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
        [],
        '6.5.1'
    );
    wp_enqueue_style('pk-studio-fontawesome');

    wp_register_style('pk-studio-interface', false);
    wp_enqueue_style('pk-studio-interface');
    wp_add_inline_style('pk-studio-interface', pk_studio_get_inline_styles());

    wp_register_script('pk-studio-interface', '', [], null, true);
    wp_enqueue_script('pk-studio-interface');
    wp_localize_script('pk-studio-interface', 'PKStudioSettings', $settings);
    wp_add_inline_script('pk-studio-interface', pk_studio_get_inline_script());
}
add_action('wp_enqueue_scripts', 'pk_studio_enqueue_assets');

/**
 * Frontend-Markup ausgeben.
 */
function pk_studio_render_widget(): void
{
    ?>
    <div id="pk-studio-widget" aria-live="polite">
        <button id="pk-studio-fab" type="button" aria-label="Studio Connect öffnen">
            <i class="fa-solid fa-headset" aria-hidden="true"></i>
        </button>

        <div id="pk-studio-panel" aria-hidden="true">
            <div class="pk-studio-header">
                <div>
                    <div class="pk-studio-title">
                        <i class="fa-solid fa-headset" aria-hidden="true"></i>
                        <span>Studio Connect</span>
                    </div>
                    <div class="pk-studio-subtitle">Support &amp; Booking</div>
                </div>
                <button id="pk-studio-close" type="button" aria-label="Chat schließen">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
            </div>
            <div class="pk-studio-content" id="pk-studio-content">
                <div class="pk-studio-messages" id="pk-studio-messages"></div>
            </div>
            <div class="pk-studio-options" id="pk-studio-options"></div>
            <div class="pk-studio-calculator" id="pk-studio-calculator" aria-hidden="true">
                <label for="pk-studio-words" class="pk-studio-label">Wortanzahl eingeben</label>
                <div class="pk-studio-input-row">
                    <input id="pk-studio-words" type="number" min="0" inputmode="numeric" placeholder="z.B. 520" />
                    <button id="pk-studio-calc" type="button">Berechnen</button>
                </div>
                <div class="pk-studio-result" id="pk-studio-result"></div>
            </div>
        </div>
    </div>
    <?php
}
add_action('wp_footer', 'pk_studio_render_widget');

/**
 * Inline-Styles für das Widget.
 */
function pk_studio_get_inline_styles(): string
{
    return <<<CSS
#pk-studio-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    transition: bottom 0.3s ease;
}

#pk-studio-widget.pk-studio-shifted {
    bottom: 90px;
}

#pk-studio-fab {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    border: none;
    background: #1a93ee;
    color: #ffffff;
    font-size: 22px;
    box-shadow: 0 12px 32px rgba(26, 147, 238, 0.35);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
}

#pk-studio-fab:hover {
    background: #167fd0;
}

#pk-studio-panel {
    position: absolute;
    bottom: 76px;
    right: 0;
    width: 360px;
    height: 550px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 18px;
    box-shadow: 0 18px 40px rgba(15, 20, 26, 0.2);
    opacity: 0;
    visibility: hidden;
    transform: translateY(24px);
    transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
}

#pk-studio-panel.is-open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
}

.pk-studio-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: #0f141a;
    border-radius: 14px;
    padding: 12px 14px;
}

.pk-studio-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;
    color: #ffffff;
}

.pk-studio-title i {
    color: #1a93ee;
}

.pk-studio-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.75);
    margin-top: 4px;
}

#pk-studio-close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
}

#pk-studio-close:hover {
    background: rgba(255, 255, 255, 0.22);
}

.pk-studio-content {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.pk-studio-messages {
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    padding-right: 6px;
}

.pk-studio-bubble {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: 16px;
    font-size: 15px;
    line-height: 1.5;
}

.pk-studio-bubble.pk-studio-bot {
    background: #f0f2f5;
    color: #333333;
    align-self: flex-start;
}

.pk-studio-bubble.pk-studio-user {
    background: #1a93ee;
    color: #ffffff;
    align-self: flex-end;
}

.pk-studio-option {
    border: none;
    background: #1a93ee;
    color: #ffffff;
    border-radius: 20px;
    padding: 10px 14px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease;
}

.pk-studio-option:hover {
    background: #167fd0;
}

.pk-studio-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.pk-studio-calculator {
    display: none;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid rgba(148, 163, 184, 0.35);
}

.pk-studio-calculator.is-visible {
    display: flex;
}

.pk-studio-label {
    font-size: 12px;
    color: #4b5563;
}

.pk-studio-input-row {
    display: flex;
    gap: 8px;
}

#pk-studio-words {
    flex: 1;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.6);
    padding: 10px 12px;
    font-size: 14px;
}

#pk-studio-calc {
    border: none;
    border-radius: 20px;
    padding: 10px 14px;
    background: #1a93ee;
    color: #ffffff;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s ease;
}

#pk-studio-calc:hover {
    background: #167fd0;
}

.pk-studio-result {
    font-size: 14px;
    color: #0f172a;
}

@media (max-width: 480px) {
    #pk-studio-widget {
        bottom: 12px;
        right: 12px;
    }

    #pk-studio-panel {
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        width: 100%;
        max-height: 100vh;
        border-radius: 16px 16px 0 0;
    }

    #pk-studio-fab {
        width: 52px;
        height: 52px;
    }
}
CSS;
}

/**
 * Inline-Script für die Logik.
 */
function pk_studio_get_inline_script(): string
{
    $script = <<<'JS'
(() => {
    const widget = document.getElementById('pk-studio-widget');
    if (!widget) {
        return;
    }

    const fab = document.getElementById('pk-studio-fab');
    const panel = document.getElementById('pk-studio-panel');
    const messages = document.getElementById('pk-studio-messages');
    const optionsContainer = document.getElementById('pk-studio-options');
    const closeButton = document.getElementById('pk-studio-close');
    const calculator = document.getElementById('pk-studio-calculator');
    const wordsInput = document.getElementById('pk-studio-words');
    const calcButton = document.getElementById('pk-studio-calc');
    const result = document.getElementById('pk-studio-result');

    const logicTree = {
        start: {
            id: 'start',
            text: 'Moin! Willkommen im Studio. Wobei kann ich dich unterstützen?',
            options: [
                { label: '🎧 Demos finden', nextId: 'demos' },
                { label: '💰 Gagen & Preise', nextId: 'gagen' },
                { label: '🎙 Technik & Regie', nextId: 'technik' },
                { label: '⚡ Verfügbarkeit', nextId: 'verfuegbarkeit' },
                { label: '⏱ Wort-Rechner', nextId: 'rechner' }
            ]
        },
        demos: {
            id: 'demos',
            text: 'Welchen Stil suchst du?',
            options: [
                { label: 'Werbung / TVC', action: 'anchor', nextId: 'start', target: '#werbung' },
                { label: 'Image / Corporate', action: 'anchor', nextId: 'start', target: '#image' },
                { label: 'E-Learning / Explainer', action: 'anchor', nextId: 'start', target: '#elearning' },
                { label: 'Stimmen-Alter?', nextId: 'alter' }
            ]
        },
        alter: {
            id: 'alter',
            text: 'Meine Range liegt bei 25-45 Jahren. Markant, frisch bis seriös.',
            options: [
                { label: 'Zurück', nextId: 'start' }
            ]
        },
        gagen: {
            id: 'gagen',
            text: 'Ich arbeite transparent nach VDS-Gagenliste oder individueller Vereinbarung.',
            options: [
                { label: 'Was ist VDS?', nextId: 'vds' },
                { label: 'TV / Funk Spot', nextId: 'gagen-tv' },
                { label: 'Imagefilm / Web', nextId: 'gagen-image' }
            ]
        },
        vds: {
            id: 'vds',
            text: 'Verband Deutscher Sprecher. Das ist der Industriestandard.',
            options: [
                { label: 'Zur VDS-Liste', action: 'vdslink' },
                { label: 'Zurück', nextId: 'gagen' }
            ]
        },
        'gagen-tv': {
            id: 'gagen-tv',
            text: 'Hier gelten Buyouts. Soll ich dir die Liste zeigen?',
            options: [
                { label: 'VDS-Liste öffnen', action: 'vdslink' },
                { label: 'Zurück', nextId: 'gagen' }
            ]
        },
        'gagen-image': {
            id: 'gagen-image',
            text: 'Oft inklusive (je nach Nutzung). Hast du ein Budget?',
            options: [
                { label: 'Anfrage senden', nextId: 'kontakt' },
                { label: 'Zurück', nextId: 'gagen' }
            ]
        },
        technik: {
            id: 'technik',
            text: 'Studio Hamburg. Neumann TLM 102 & RME Interface. Akustisch trocken.',
            options: [
                { label: 'SessionLinkPRO?', nextId: 'technik-session' },
                { label: 'Zoom / Teams?', nextId: 'technik-zoom' },
                { label: 'File-Delivery?', nextId: 'technik-files' }
            ]
        },
        'technik-session': {
            id: 'technik-session',
            text: 'Ja, vorhanden für Live-Regie.',
            options: [
                { label: 'Zurück', nextId: 'technik' }
            ]
        },
        'technik-zoom': {
            id: 'technik-zoom',
            text: 'Gerne, als Regie-Kanal parallel zur Aufnahme.',
            options: [
                { label: 'Zurück', nextId: 'technik' }
            ]
        },
        'technik-files': {
            id: 'technik-files',
            text: 'WAV 48kHz/24bit, meist innerhalb von 24h.',
            options: [
                { label: 'Zurück', nextId: 'technik' }
            ]
        },
        rechner: {
            id: 'rechner',
            text: 'Wort-Rechner aktiv. Gib die Wortanzahl ein.',
            action: 'calculator',
            options: [
                { label: 'Anfrage senden', nextId: 'kontakt' }
            ]
        },
        verfuegbarkeit: {
            id: 'verfuegbarkeit',
            text: 'In der Regel bin ich werktags von 09:00 - 18:00 buchbar.',
            options: [
                { label: 'Ist es eilig?', nextId: 'eilig' },
                { label: 'Anfrage senden', nextId: 'kontakt' }
            ]
        },
        eilig: {
            id: 'eilig',
            text: 'Express-Lieferung (heute) ist oft möglich. Ruf am besten kurz durch.',
            options: [
                { label: '📞 Anrufen', action: 'phone' },
                { label: 'Zurück', nextId: 'verfuegbarkeit' }
            ]
        },
        kontakt: {
            id: 'kontakt',
            text: 'Lass uns deine Anfrage konkretisieren. Ich melde mich schnell zurück.',
            options: [
                { label: 'E-Mail schreiben', action: 'email' },
                { label: 'Anrufen', action: 'phone' }
            ]
        }
    };

    const state = {
        currentId: 'start'
    };

    const createBubble = (text, type) => {
        const bubble = document.createElement('div');
        bubble.className = `pk-studio-bubble pk-studio-${type}`;
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
    };

    const renderStep = (stepId) => {
        const step = logicTree[stepId];
        if (!step) {
            return;
        }

        state.currentId = stepId;

        createBubble(step.text, 'bot');

        optionsContainer.innerHTML = '';

        calculator.classList.remove('is-visible');
        calculator.setAttribute('aria-hidden', 'true');
        result.textContent = '';
        wordsInput.value = '';

        if (step.action === 'calculator') {
            calculator.classList.add('is-visible');
            calculator.setAttribute('aria-hidden', 'false');
        }

        step.options.forEach((option) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'pk-studio-option';
            button.textContent = option.label;
            button.addEventListener('click', () => handleOption(option));
            optionsContainer.appendChild(button);
        });
    };

    const handleOption = (option) => {
        createBubble(option.label, 'user');

        if (option.action === 'anchor' && option.target) {
            window.location.hash = option.target;
        }

        if (option.action === 'email' && PKStudioSettings.email) {
            window.location.href = `mailto:${PKStudioSettings.email}`;
            return;
        }

        if (option.action === 'phone' && PKStudioSettings.phone) {
            window.location.href = `tel:${PKStudioSettings.phone}`;
            return;
        }

        if (option.action === 'vdslink' && PKStudioSettings.vdsLink) {
            window.open(PKStudioSettings.vdsLink, '_blank', 'noopener');
            return;
        }

        if (option.action === 'vdslink' && !PKStudioSettings.vdsLink) {
            createBubble('Kein VDS-Link hinterlegt. Bitte im Backend ergänzen.', 'bot');
            return;
        }

        if (option.nextId) {
            renderStep(option.nextId);
        }
    };

    const openPanel = () => {
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
    };

    const closePanel = () => {
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
    };

    fab.addEventListener('click', () => {
        if (panel.classList.contains('is-open')) {
            closePanel();
        } else {
            openPanel();
        }
    });

    closeButton.addEventListener('click', closePanel);

    calcButton.addEventListener('click', () => {
        const words = Number.parseFloat(wordsInput.value);
        if (Number.isNaN(words) || words <= 0) {
            result.textContent = 'Bitte eine gültige Wortanzahl eingeben.';
            return;
        }
        const minutes = words / 130;
        result.textContent = `Das sind ca. ${minutes.toFixed(2)} Minuten.`;
    });

    const observeBody = () => {
        const toggleShift = () => {
            const match = document.querySelector(
                '.gemerkte-demos-container, [id*="demo"], [class*="demo"], [id*="merk"], [class*="merk"]'
            );
            widget.classList.toggle('pk-studio-shifted', Boolean(match));
        };

        const observer = new MutationObserver(() => {
            toggleShift();
        });

        observer.observe(document.body, { childList: true, subtree: true });
        toggleShift();
    };

    messages.innerHTML = '';
    renderStep('start');
    observeBody();
})();
JS;

    return $script;
}
