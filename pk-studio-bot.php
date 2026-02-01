<?php
/**
 * Plugin Name: Pascal Krell Studio Interface
 * Description: Interaktives Support- & Booking-Widget als Floating Action Button für Pascal Krell.
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
}
add_action('admin_init', 'pk_studio_register_settings');

/**
 * Einstellungsseite im WordPress-Backend hinzufügen.
 */
function pk_studio_add_settings_page(): void
{
    add_options_page(
        'Pascal Krell Studio Interface',
        'Pascal Krell Studio Interface',
        'manage_options',
        'pk-studio-interface',
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
        <h1>Pascal Krell Studio Interface Einstellungen</h1>
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
        <button id="pk-studio-fab" type="button" aria-label="Studio Assistent öffnen">
            <i class="fa-solid fa-microphone-lines" aria-hidden="true"></i>
        </button>

        <div id="pk-studio-panel" aria-hidden="true">
            <div class="pk-studio-header">
                <div>
                    <div class="pk-studio-title">
                        <i class="fa-solid fa-microphone-lines" aria-hidden="true"></i>
                        <span>Pascal Krell</span>
                    </div>
                    <div class="pk-studio-subtitle">Studio Assistent</div>
                </div>
                <button id="pk-studio-reset" type="button" aria-label="Zurück zur Startansicht">
                    <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
                </button>
            </div>
            <div class="pk-studio-content" id="pk-studio-content"></div>
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
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    transition: transform 0.3s ease;
}

#pk-studio-widget.pk-studio-shifted {
    transform: translateY(-90px);
}

#pk-studio-fab {
    width: 56px;
    height: 56px;
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
    transition: transform 0.3s ease;
}

#pk-studio-panel {
    position: absolute;
    bottom: 76px;
    right: 0;
    width: 360px;
    max-height: 580px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 18px;
    background: rgba(255, 255, 255, 0.72);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(15, 23, 42, 0.25);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.4);
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
}

.pk-studio-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;
    color: #0f172a;
}

.pk-studio-title i {
    color: #1a93ee;
}

.pk-studio-subtitle {
    font-size: 13px;
    color: #475569;
    margin-top: 4px;
}

#pk-studio-reset {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    border: none;
    background: rgba(26, 147, 238, 0.12);
    color: #1a93ee;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
}

#pk-studio-reset:hover {
    background: rgba(26, 147, 238, 0.2);
}

.pk-studio-content {
    font-size: 14px;
    color: #0f172a;
    line-height: 1.5;
    min-height: 72px;
    opacity: 1;
    transition: opacity 0.25s ease;
}

.pk-studio-content.is-fading {
    opacity: 0;
}

.pk-studio-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.pk-studio-option {
    border: 1px solid rgba(26, 147, 238, 0.35);
    background: rgba(26, 147, 238, 0.08);
    color: #0f172a;
    border-radius: 16px;
    padding: 8px 12px;
    font-size: 13px;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease;
}

.pk-studio-option:hover {
    transform: translateY(-2px);
    background: rgba(26, 147, 238, 0.16);
}

.pk-studio-calculator {
    display: none;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.65);
    border: 1px solid rgba(148, 163, 184, 0.4);
}

.pk-studio-calculator.is-visible {
    display: flex;
}

.pk-studio-label {
    font-size: 12px;
    color: #64748b;
}

.pk-studio-input-row {
    display: flex;
    gap: 8px;
}

#pk-studio-words {
    flex: 1;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.6);
    padding: 8px 10px;
    font-size: 14px;
}

#pk-studio-calc {
    border: none;
    border-radius: 10px;
    padding: 8px 12px;
    background: #1a93ee;
    color: #ffffff;
    cursor: pointer;
}

.pk-studio-result {
    font-size: 13px;
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
    const content = document.getElementById('pk-studio-content');
    const optionsContainer = document.getElementById('pk-studio-options');
    const resetButton = document.getElementById('pk-studio-reset');
    const calculator = document.getElementById('pk-studio-calculator');
    const wordsInput = document.getElementById('pk-studio-words');
    const calcButton = document.getElementById('pk-studio-calc');
    const result = document.getElementById('pk-studio-result');

    const logicTree = {
        start: {
            id: 'start',
            text: 'Moin! Ich bin dein digitaler Assistent. Wie kann ich dein Projekt unterstützen?',
            options: [
                { label: '🎧 Demos hören', nextId: 'demos' },
                { label: '💰 Preise / Gagen', nextId: 'preise' },
                { label: '🎙 Studio & Technik', nextId: 'studio' },
                { label: '⏱ Wort-Rechner', nextId: 'rechner' },
                { label: '📞 Kontakt / Booking', nextId: 'kontakt' }
            ]
        },
        demos: {
            id: 'demos',
            text: 'Welche Demo-Kategorie interessiert dich?',
            options: [
                { label: 'Werbung', action: 'anchor', nextId: 'start', target: '#demos-werbung' },
                { label: 'Imagefilm', action: 'anchor', nextId: 'start', target: '#demos-imagefilm' },
                { label: 'E-Learning', action: 'anchor', nextId: 'start', target: '#demos-elearning' },
                { label: 'Gaming/Synchron', action: 'anchor', nextId: 'start', target: '#demos-gaming' }
            ]
        },
        preise: {
            id: 'preise',
            text: 'Ich orientiere mich an der VDS-Gagenliste. Für welches Medium?',
            options: [
                { label: 'TV/Radio', nextId: 'preise-tv' },
                { label: 'Online/Social', nextId: 'preise-online' },
                { label: 'Intern', nextId: 'preise-intern' }
            ]
        },
        'preise-tv': {
            id: 'preise-tv',
            text: 'Für TV/Radio sende ich dir gern ein individuelles Angebot nach VDS-Standard.',
            options: [
                { label: 'Angebot anfordern', nextId: 'kontakt' }
            ]
        },
        'preise-online': {
            id: 'preise-online',
            text: 'Online/Social richten sich nach Reichweite & Nutzungsdauer. Lass uns Details klären.',
            options: [
                { label: 'Angebot anfordern', nextId: 'kontakt' }
            ]
        },
        'preise-intern': {
            id: 'preise-intern',
            text: 'Interne Projekte kalkuliere ich fair und transparent nach Umfang.',
            options: [
                { label: 'Angebot anfordern', nextId: 'kontakt' }
            ]
        },
        studio: {
            id: 'studio',
            text: 'Mein Setup in Hamburg: Neumann TLM 102, RME Babyface Pro, Logic Pro X in akustisch optimierter Kabine. Live-Regie?',
            options: [
                { label: 'SessionLinkPRO', nextId: 'studio-session' },
                { label: 'Zoom/Skype', nextId: 'studio-zoom' },
                { label: 'Nein', nextId: 'studio-nein' }
            ]
        },
        'studio-session': {
            id: 'studio-session',
            text: 'SessionLinkPRO läuft stabil & latenzarm. Sende mir einfach deinen Link.',
            options: [
                { label: 'Kontakt aufnehmen', nextId: 'kontakt' }
            ]
        },
        'studio-zoom': {
            id: 'studio-zoom',
            text: 'Zoom/Skype sind möglich – gerne mit lokalen Sicherheits-Backups.',
            options: [
                { label: 'Kontakt aufnehmen', nextId: 'kontakt' }
            ]
        },
        'studio-nein': {
            id: 'studio-nein',
            text: 'Kein Problem – ich liefere dir sauber geschnittene Files.',
            options: [
                { label: 'Kontakt aufnehmen', nextId: 'kontakt' }
            ]
        },
        rechner: {
            id: 'rechner',
            text: 'Wie viele Wörter hat dein Skript? Ich rechne mit 130 Wörtern pro Minute.',
            action: 'calculator',
            options: [
                { label: 'Angebot anfordern', nextId: 'kontakt' }
            ]
        },
        kontakt: {
            id: 'kontakt',
            text: 'Bereit für die Aufnahme?',
            options: [
                { label: 'E-Mail schreiben', action: 'email' },
                { label: 'Anrufen', action: 'phone' },
                { label: 'Rückruf anfordern', action: 'callback' }
            ]
        }
    };

    const state = {
        currentId: 'start'
    };

    const formatDuration = (minutesFloat) => {
        const totalSeconds = Math.round(minutesFloat * 60);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `Ca. ${minutes} Minuten ${seconds} Sekunden.`;
    };

    const applyFade = (callback) => {
        content.classList.add('is-fading');
        window.setTimeout(() => {
            callback();
            content.classList.remove('is-fading');
        }, 200);
    };

    const renderStep = (stepId) => {
        const step = logicTree[stepId];
        if (!step) {
            return;
        }

        state.currentId = stepId;

        applyFade(() => {
            content.innerHTML = step.text;
        });

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

        if (option.action === 'callback') {
            renderStep('kontakt');
            content.innerHTML = 'Danke! Schreib mir kurz wann ich zurückrufen darf.';
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

    resetButton.addEventListener('click', () => {
        renderStep('start');
    });

    calcButton.addEventListener('click', () => {
        const words = Number.parseFloat(wordsInput.value);
        if (Number.isNaN(words) || words <= 0) {
            result.textContent = 'Bitte eine gültige Wortanzahl eingeben.';
            return;
        }
        const minutes = words / 130;
        result.textContent = formatDuration(minutes);
    });

    const observeBody = () => {
        const toggleShift = () => {
            const candidates = document.querySelectorAll('[class*="demo"], [class*="saved"]');
            const hasMatch = Array.from(candidates).some((node) => {
                return node.className && (node.className.includes('demo') || node.className.includes('saved'));
            });
            widget.classList.toggle('pk-studio-shifted', hasMatch);
        };

        const observer = new MutationObserver(() => {
            toggleShift();
        });

        observer.observe(document.body, { childList: true, subtree: true });
        toggleShift();
    };

    renderStep('start');
    observeBody();
})();
JS;

    return $script;
}
