const SC_STATE_KEY = 'sc_state_v2';
const SC_LEGACY_KEY = 'sc_chat_state';
const SC_LEGACY_PREFIX = 'sc_chat_state_';
const SC_RESET_PARAM = 'reset-chat';
const SC_CONTACT_PREFILL_KEY = 'sc_contact_prefill_v1';
const SC_HAS_VISITED_KEY = 'sc_has_visited_v1';
const SC_PREFILL_MAX_AGE = 2 * 60 * 60 * 1000;

const getDefaultState = () => ({
    isOpen: false,
    currentStepId: 'start',
    history: [],
    navStack: [],
    context: {
        wordCount: 0,
        briefingStarted: false,
        briefing: {
            einsatz: '',
            tonalitaet: '',
            laenge: '',
            laufzeit: '',
            deadline: '',
            aussprache: ''
        },
        returnToStepId: ''
    },
    flags: {
        welcomed: false
    }
});

const normalizeState = (state) => {
    if (!state || typeof state !== 'object') {
        return getDefaultState();
    }
    return {
        isOpen: Boolean(state.isOpen),
        currentStepId: typeof state.currentStepId === 'string' ? state.currentStepId : 'start',
        history: Array.isArray(state.history) ? state.history : [],
        navStack: Array.isArray(state.navStack) ? state.navStack : [],
        context: {
            ...(state.context && typeof state.context === 'object' ? state.context : {}),
            wordCount: typeof state.context?.wordCount === 'number' ? state.context.wordCount : 0,
            briefingStarted: Boolean(state.context?.briefingStarted),
            returnToStepId: typeof state.context?.returnToStepId === 'string' ? state.context.returnToStepId : '',
            briefing: {
                einsatz: typeof state.context?.briefing?.einsatz === 'string' ? state.context.briefing.einsatz : '',
                tonalitaet: typeof state.context?.briefing?.tonalitaet === 'string' ? state.context.briefing.tonalitaet : '',
                laenge: typeof state.context?.briefing?.laenge === 'string' ? state.context.briefing.laenge : '',
                laufzeit: typeof state.context?.briefing?.laufzeit === 'string' ? state.context.briefing.laufzeit : '',
                deadline: typeof state.context?.briefing?.deadline === 'string' ? state.context.briefing.deadline : '',
                aussprache: typeof state.context?.briefing?.aussprache === 'string' ? state.context.briefing.aussprache : ''
            }
        },
        flags: {
            welcomed: Boolean(state.flags?.welcomed)
        }
    };
};

const loadState = () => {
    try {
        const raw = sessionStorage.getItem(SC_STATE_KEY);
        if (!raw) {
            return null;
        }
        return normalizeState(JSON.parse(raw));
    } catch (error) {
        return null;
    }
};

const saveState = (state) => {
    try {
        sessionStorage.setItem(SC_STATE_KEY, JSON.stringify(state));
    } catch (error) {
        // Ignore storage failures.
    }
};

const clearState = () => {
    try {
        sessionStorage.removeItem(SC_STATE_KEY);
    } catch (error) {
        // Ignore.
    }
};

const clearLegacyState = () => {
    try {
        sessionStorage.removeItem(SC_LEGACY_KEY);
        sessionStorage.removeItem('sc_chat_open');
        sessionStorage.removeItem('sc_current_step');
        sessionStorage.removeItem('sc_word_count');
        Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith(SC_LEGACY_PREFIX)) {
                sessionStorage.removeItem(key);
            }
        });
    } catch (error) {
        // Ignore.
    }
};

const migrateLegacyState = () => {
    if (sessionStorage.getItem(SC_STATE_KEY)) {
        return null;
    }
    const raw = sessionStorage.getItem(SC_LEGACY_KEY);
    if (!raw) {
        return null;
    }
    let parsed = null;
    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        sessionStorage.removeItem(SC_LEGACY_KEY);
        return null;
    }
    const nextState = getDefaultState();
    if (parsed && typeof parsed === 'object') {
        if (typeof parsed.isOpen === 'boolean') {
            nextState.isOpen = parsed.isOpen;
        }
        if (typeof parsed.currentStepId === 'string') {
            nextState.currentStepId = parsed.currentStepId;
        } else if (typeof parsed.currentStep === 'string') {
            nextState.currentStepId = parsed.currentStep;
        }
        if (typeof parsed.wordCount === 'number') {
            nextState.context.wordCount = parsed.wordCount;
        }
        if (typeof parsed.lastBotText === 'string') {
            nextState.history.push({
                role: 'bot',
                text: parsed.lastBotText,
                ts: Date.now()
            });
        }
    }
    const legacyWordCount = Number.parseInt(sessionStorage.getItem('sc_word_count'), 10);
    if (!Number.isNaN(legacyWordCount)) {
        nextState.context.wordCount = legacyWordCount;
    }
    saveState(nextState);
    sessionStorage.removeItem(SC_LEGACY_KEY);
    return nextState;
};

const formatDuration = (wordCount) => {
    const totalSeconds = Math.round((wordCount / 130) * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const renderContactCard = (state, sc_vars, helpers) => {
    const wrapper = document.createElement('div');

    const actions = document.createElement('div');
    actions.className = 'studio-connect-copy-row';

    const formBtn = document.createElement('button');
    formBtn.type = 'button';
    formBtn.className = 'studio-connect-copy is-primary sc-contact-btn';
    formBtn.innerHTML = '<span class="sc-contact-icon"><i class="fa-solid fa-file-pen" aria-hidden="true"></i></span><span class="sc-contact-label">Kontaktformular</span><span class="sc-contact-spacer" aria-hidden="true"></span>';
    formBtn.addEventListener('click', () => {
        helpers.registerInteraction();
        window.location.href = '/kontakt/';
    });
    actions.appendChild(formBtn);

    let hasCopyAction = false;
    if (sc_vars.email) {
        const emailBtn = document.createElement('button');
        emailBtn.type = 'button';
        emailBtn.className = 'studio-connect-copy is-copy sc-contact-btn';
        emailBtn.innerHTML = `<span class="sc-contact-icon"><i class="fa-solid fa-envelope" aria-hidden="true"></i></span><span class="sc-contact-label">E-Mail: ${sc_vars.email}</span><span class="sc-contact-spacer" aria-hidden="true"></span>`;
        emailBtn.addEventListener('click', () => {
            helpers.registerInteraction();
            window.location.href = `mailto:${sc_vars.email}`;
            if (helpers.showToast) {
                helpers.showToast('E-Mail-Programm geöffnet');
            }
        });
        actions.appendChild(emailBtn);
    }

    if (sc_vars.phone) {
        const phoneBtn = document.createElement('button');
        phoneBtn.type = 'button';
        phoneBtn.className = 'studio-connect-copy is-copy sc-contact-btn';
        phoneBtn.innerHTML = `<span class="sc-contact-icon"><i class="fa-solid fa-phone" aria-hidden="true"></i></span><span class="sc-contact-label">Telefon: ${sc_vars.phone}</span><span class="sc-contact-spacer" aria-hidden="true"></span>`;
        phoneBtn.addEventListener('click', () => {
            helpers.registerInteraction();
            helpers.copyToClipboard(sc_vars.phone, 'Telefonnummer kopiert');
        });
        actions.appendChild(phoneBtn);
        hasCopyAction = true;
    }

    const whatsappValue = sc_vars.whatsapp || sc_vars.phone;
    if (whatsappValue) {
        const whatsappBtn = document.createElement('button');
        whatsappBtn.type = 'button';
        whatsappBtn.className = 'studio-connect-copy is-copy sc-contact-btn';
        whatsappBtn.innerHTML = `<span class="sc-contact-icon"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></span><span class="sc-contact-label">WhatsApp: ${whatsappValue}</span><span class="sc-contact-spacer" aria-hidden="true"></span>`;
        whatsappBtn.addEventListener('click', () => {
            helpers.registerInteraction();
            const digits = whatsappValue.replace(/\D/g, '');
            if (digits) {
                const popup = window.open(`https://wa.me/${encodeURIComponent(digits)}`, '_blank', 'noopener');
                if (!popup) {
                    helpers.copyToClipboard(whatsappValue, 'WhatsApp-Nummer kopiert');
                }
            } else {
                helpers.copyToClipboard(whatsappValue, 'WhatsApp-Nummer kopiert');
            }
        });
        actions.appendChild(whatsappBtn);
        hasCopyAction = true;
    }

    if (!sc_vars.email && !sc_vars.phone && !sc_vars.whatsapp) {
        const fallback = document.createElement('div');
        fallback.textContent = 'Keine Kontaktinfos hinterlegt.';
        wrapper.appendChild(fallback);
    }

    wrapper.appendChild(actions);
    if (hasCopyAction) {
        const hint = document.createElement('div');
        hint.className = 'studio-connect-copy-hint';
        hint.textContent = 'Tippe, um die Daten zu kopieren.';
        wrapper.appendChild(hint);
    }
    return wrapper;
};

const renderWordCalculator = (state, onStatePatch, helpers) => {
    const wrapper = document.createElement('div');
    wrapper.id = 'studio-connect-calculator';
    wrapper.className = 'studio-connect-calculator is-visible';
    const returnToStepId = state.context?.returnToStepId || '';
    const shouldAutoProceed = Boolean(returnToStepId);

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = '10000';
    input.id = 'studio-connect-words';
    input.className = 'studio-connect-input';

    const output = document.createElement('div');
    output.id = 'studio-connect-result';
    output.className = 'studio-connect-result is-success';

    const cta = document.createElement('button');
    cta.type = 'button';
    cta.id = 'studio-connect-calculator-cta';
    cta.className = 'studio-connect-option-btn';
    cta.textContent = 'Angebot anfragen';

    const updateOutput = (value) => {
        const clamped = Math.min(10000, Math.max(0, value));
        output.textContent = `⏱ Ca. ${formatDuration(clamped)} Min bei moderatem Sprechtempo.`;
        return clamped;
    };

    const currentValue = typeof state.context.wordCount === 'number' ? state.context.wordCount : 0;
    input.value = currentValue;
    updateOutput(currentValue);

    let debounceTimer = null;
    let autoProceedTimer = null;
    const scheduleSave = (value) => {
        if (debounceTimer) {
            window.clearTimeout(debounceTimer);
        }
        debounceTimer = window.setTimeout(() => {
            onStatePatch({ context: { ...state.context, wordCount: value } }, { silent: true });
        }, 300);
    };

    const commitValue = (value, { clampInput } = { clampInput: false }) => {
        const clamped = Math.min(10000, Math.max(0, value));
        if (clampInput) {
            input.value = clamped;
        }
        updateOutput(clamped);
        onStatePatch({ context: { ...state.context, wordCount: clamped } }, { silent: true });
    };

    const scheduleAutoProceed = (value) => {
        if (!shouldAutoProceed) {
            return;
        }
        if (autoProceedTimer) {
            window.clearTimeout(autoProceedTimer);
        }
        if (value < 1 || value > 10000) {
            return;
        }
        autoProceedTimer = window.setTimeout(() => {
            if (!wrapper.isConnected) {
                return;
            }
            if (helpers.proceedFromCalculator) {
                helpers.proceedFromCalculator();
            }
        }, 600);
    };

    input.addEventListener('input', () => {
        helpers.registerInteraction();
        const rawValue = Number.parseInt(input.value, 10);
        const safeValue = Number.isNaN(rawValue) ? 0 : rawValue;
        updateOutput(safeValue);
        scheduleSave(safeValue);
        scheduleAutoProceed(safeValue);
    });

    input.addEventListener('blur', () => {
        const rawValue = Number.parseInt(input.value, 10);
        const safeValue = Number.isNaN(rawValue) ? 0 : rawValue;
        commitValue(safeValue, { clampInput: true });
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            input.blur();
        }
    });

    cta.addEventListener('click', () => {
        helpers.registerInteraction();
        window.location.href = '/kontakt/#kontaktformular_direkt';
    });

    wrapper.appendChild(input);
    wrapper.appendChild(output);
    if (!shouldAutoProceed) {
        wrapper.appendChild(cta);
    }

    return wrapper;
};

class StudioBot {
    constructor(settings) {
        const defaults = {
            vdsLink: 'https://www.sprecherverband.de/wp-content/uploads/2025/02/VDS_Gagenkompass_2025.pdf',
            gagenrechnerLink: 'https://dev.pascal-krell.de/gagenrechner/',
            siteUrl: window.location.origin,
            avatar_url: '',
            nav_links: {}
        };
        this.settings = { ...defaults, ...settings };
        this.widget = document.getElementById('sc-widget');
        this.panel = document.getElementById('sc-container');
        this.launcher = document.getElementById('sc-launcher');
        this.body = document.getElementById('sc-body');
        this.dock = document.getElementById('sc-dock');
        this.headerSubtext = document.getElementById('studio-connect-subtext');
        this.toast = document.getElementById('studio-connect-toast');
        this.homeButton = document.getElementById('sc-reset');
        this.closeButton = document.getElementById('studio-connect-close');
        this.launcherIcon = this.launcher ? this.launcher.querySelector('i') : null;
        this.avatarUrl = this.settings.avatar_url || defaults.avatar_url;
        this.isOpen = false;
        this.hasInteraction = false;
        this.lastRenderedHistoryLength = 0;
        this.ui = {
            isTyping: false,
            typingTimer: null,
            typingRow: null,
            optionsDisabled: false
        };
        this.activeTypewriter = null;
        this.interactionChain = Promise.resolve();
        this.homeTooltip = null;
        this.hideHomeTooltip = null;
        this.soundEngine = new SoundController();
        this.logicTree = this.buildLogicTree();
        this.resetRequested = new URLSearchParams(window.location.search).has(SC_RESET_PARAM);
        this.isAutoProceeding = false;

        if (this.resetRequested) {
            clearState();
            clearLegacyState();
            this.removeResetParam();
        } else {
            const migratedState = migrateLegacyState();
            if (migratedState) {
                this.state = migratedState;
            }
        }

        this.state = this.state || loadState() || getDefaultState();
        this.state = normalizeState(this.state);
        this.ensureValidStep();
        if (this.widget) {
            this.widget.classList.add('sc-widget-root');
        }

        this.refreshDomReferences();
        this.bindEvents();
        this.applyOpenState(this.state.isOpen, true);
        this.renderApp();
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
            rechte: this.getStepConfig('rechte'),
            rechte_beispiele: this.getStepConfig('rechte_beispiele'),
            kontakt: this.getStepConfig('kontakt'),
            briefing: this.getStepConfig('briefing'),
            briefing_einsatz: this.getStepConfig('briefing_einsatz'),
            briefing_laufzeit: this.getStepConfig('briefing_laufzeit'),
            briefing_tonalitaet: this.getStepConfig('briefing_tonalitaet'),
            briefing_laenge: this.getStepConfig('briefing_laenge'),
            briefing_deadline: this.getStepConfig('briefing_deadline'),
            briefing_aussprache: this.getStepConfig('briefing_aussprache'),
            briefing_summary: this.getStepConfig('briefing_summary')
        };
    }

    getStepConfig(stepId) {
        switch (stepId) {
            case 'start':
                return {
                    id: 'start',
                    text: 'Hi! Ich bin Pascals Studio-Assistent 🎙️ – bereit für Dein Projekt. Womit darf ich Dir helfen?',
                    options: [
                        {
                            label: 'Briefing-Check (30 Sek.)',
                            userPromptText: 'Ich möchte kurz ein Briefing durchgehen.',
                            nextId: 'briefing'
                        },
                        { label: 'Casting & Demos', userPromptText: 'Kann ich Hörproben / Demos hören?', nextId: 'demos' },
                        { label: 'Preise & Buyouts', userPromptText: 'Womit muss ich preislich rechnen?', nextId: 'preise' },
                        { label: 'Technik-Setup', userPromptText: 'Wie ist das Studio von Pascal ausgestattet?', nextId: 'technik' },
                        { label: 'Ablauf der Zusammenarbeit', userPromptText: 'Wie läuft die Zusammenarbeit ab?', nextId: 'ablauf' },
                        {
                            label: 'Einsatz & Rechte',
                            userPromptText: 'Kannst Du mir kurz Nutzungsrechte & Einsatz erklären?',
                            nextId: 'rechte'
                        },
                        { label: 'Kontakt', userPromptText: 'Wie erreiche ich Pascal am schnellsten?', nextId: 'kontakt' }
                    ]
                };
            case 'demos':
                const navLinks = this.settings.nav_links || {};
                return {
                    id: 'demos',
                    text: 'Gerne! Welche Demo-Kategorie möchtest Du hören? Ich leite Dich zur passenden Seite.',
                    options: [
                        { label: 'Werbung', userPromptText: 'Ich möchte Werbung-Demos hören.', action: 'hardlink', target: navLinks.werbung },
                        { label: 'Webvideo', userPromptText: 'Gibt es Webvideo-Demos?', action: 'hardlink', target: navLinks.webvideo },
                        { label: 'Telefonansage', userPromptText: 'Hast Du Telefonansagen als Demo?', action: 'hardlink', target: navLinks.telefonansage },
                        { label: 'Podcast', userPromptText: 'Kann ich Podcast-Demos hören?', action: 'hardlink', target: navLinks.podcast },
                        { label: 'Imagefilm', userPromptText: 'Ich suche Imagefilm-Demos.', action: 'hardlink', target: navLinks.imagefilm },
                        { label: 'Erklärvideo', userPromptText: 'Gibt es Erklärvideo-Demos?', action: 'hardlink', target: navLinks.erklaervideo },
                        { label: 'E-Learning', userPromptText: 'Kann ich E-Learning-Demos hören?', action: 'hardlink', target: navLinks.elearning }
                    ]
                };
            case 'preise':
                return {
                    id: 'preise',
                    text: 'Die Kalkulation erfolgt transparent nach VDS-Standards. Du bekommst klare Buyouts, saubere Deliverables und verlässliche Timing-Zusagen. Womit soll ich starten?',
                    options: [
                        { label: 'VDS-Gagenliste', userPromptText: 'Kannst Du mir die VDS-Gagenliste zeigen?', action: 'vdslink' },
                        { label: 'Gagenrechner', userPromptText: 'Kannst Du den Gagenrechner öffnen?', action: 'gagenrechner' },
                        { label: 'Wort-Rechner', userPromptText: 'Wie lange dauert mein Text ungefähr?', nextId: 'rechner' },
                        { label: 'Direkt anfragen', userPromptText: 'Ich möchte direkt anfragen.', nextId: 'kontakt' }
                    ]
                };
            case 'technik':
                return {
                    id: 'technik',
                    text: 'Profi-Setup für Broadcast-Qualität: Neumann TLM 102 Mikrofon, RME Babyface Pro Interface & akustisch optimierte Studioumgebung. DAW: Logic Pro X auf Mac Studio.\n\nGeräuscharmes Recording, sauberer Noise Floor und Lieferung als WAV/MP3 – inklusive klarer Dateibenennung und kurzen Abstimmungswegen.',
                    options: [
                        { label: 'Ablauf der Zusammenarbeit', userPromptText: 'Wie läuft die Zusammenarbeit ab?', nextId: 'ablauf' },
                        { label: 'Kontakt', userPromptText: 'Wie erreiche ich Pascal am schnellsten?', nextId: 'kontakt' }
                    ]
                };
            case 'ablauf':
                return {
                    id: 'ablauf',
                    text: 'So läuft die Zusammenarbeit ab:\n\n• Anfrage & kurzer Skript-Check (Timing, Aussprache, Stil)\n• Angebot mit klaren Nutzungsrechten & Timing\n• Aufnahme – meist innerhalb 24h\n• Lieferung als WAV/MP3 inkl. sauberer Dateibenennung\n• Feedbackrunde mit klar geregelten Revisionen\n\nMicro-Tipp: Kurze Sätze und klare Betonungen helfen für einen natürlichen Flow.',
                    options: [
                        { label: 'Projekt anfragen', userPromptText: 'Ich möchte ein Projekt anfragen.', action: 'form' }
                    ]
                };
            case 'rechner':
                return {
                    id: 'rechner',
                    text: 'Gib die Wortanzahl ein – ich rechne live die ungefähre Dauer (mm:ss) bei moderatem Tempo.',
                    action: 'calculator',
                    options: [
                        { label: 'Kontakt', userPromptText: 'Wie erreiche ich Pascal am schnellsten?', nextId: 'kontakt' }
                    ]
                };
            case 'rechte':
                return {
                    id: 'rechte',
                    text: 'Kurz erklärt: Produktion ist die Aufnahme selbst – Nutzung regelt, wo und wie lange der Spot/Clip laufen darf.\n\n• Einsatzorte wie Website, Social Organic, Social Ads, YouTube PreRoll oder Radio/TV regional zählen unterschiedlich.\n• Nutzungsrechte hängen von Reichweite, Mediaspend und Zeitraum ab.\n• Je klarer der Einsatz, desto fairer kann Pascal kalkulieren.\n\nJe mehr Informationen Pascal hat, desto genauer kann er Dir ein individuelles Angebot erstellen.',
                    options: [
                        { label: 'Beispiele sehen', userPromptText: 'Hast Du Beispiele für typische Einsätze?', nextId: 'rechte_beispiele' },
                        { label: 'Kontakt', userPromptText: 'Ich möchte kurz Rücksprache halten.', nextId: 'kontakt' }
                    ]
                };
            case 'rechte_beispiele':
                return {
                    id: 'rechte_beispiele',
                    text: 'Typische Einsatz-Szenarien:\n\n• Website + organische Social Posts (3–6 Monate)\n• Social Ads (Meta/YouTube) mit festem Budget\n• YouTube PreRoll national (6 Monate)\n• Regionales Radio/TV (4 Wochen)\n• Podcast-Intro/Outro (1 Jahr)\n\nWenn Du mir kurz den Einsatz nennst (Plattform + Zeitraum), kann Pascal Dir die passende Lizenz schnell einordnen.',
                    options: [
                        { label: 'Beispiele', userPromptText: 'Zeig mir Beispiele.', nextId: 'rechte_beispiele' },
                        { label: 'Kontakt', userPromptText: 'Bitte kalkuliere mir das kurz.', nextId: 'kontakt' },
                    ]
                };
            case 'kontakt':
                return {
                    id: 'kontakt',
                    text: 'Du erreichst Pascal am schnellsten über die unten stehenden Kontaktwege.',
                    options: []
                };
            case 'briefing':
                return {
                    id: 'briefing',
                    text: 'Super – in 30 Sekunden haben wir die wichtigsten Infos. Los geht’s:',
                    options: []
                };
            case 'briefing_einsatz':
                return {
                    id: 'briefing_einsatz',
                    text: 'Wofür ist die Aufnahme gedacht (Einsatz)?',
                    options: [
                        { label: 'Website / Imagefilm', briefingKey: 'einsatz', briefingValue: 'Website / Imagefilm', nextId: 'briefing_tonalitaet' },
                        { label: 'Social Organic (ohne Ads)', briefingKey: 'einsatz', briefingValue: 'Social Organic (ohne Ads)', nextId: 'briefing_tonalitaet' },
                        { label: 'Social Ads / Paid', briefingKey: 'einsatz', briefingValue: 'Social Ads / Paid', nextId: 'briefing_laufzeit' },
                        { label: 'YouTube / Online Video', briefingKey: 'einsatz', briefingValue: 'YouTube / Online Video', nextId: 'briefing_tonalitaet' },
                        { label: 'Radio / TV', briefingKey: 'einsatz', briefingValue: 'Radio / TV', nextId: 'briefing_laufzeit' },
                        { label: 'Noch unsicher', briefingKey: 'einsatz', briefingValue: 'Noch unsicher', nextId: 'briefing_tonalitaet' }
                    ]
                };
            case 'briefing_laufzeit':
                return {
                    id: 'briefing_laufzeit',
                    text: 'Wie lange soll der Spot / die Kampagne aktiv sein?',
                    options: [
                        { label: '2–4 Wochen', briefingKey: 'laufzeit', briefingValue: '2–4 Wochen', nextId: 'briefing_tonalitaet' },
                        { label: '2–4 Monate', briefingKey: 'laufzeit', briefingValue: '2–4 Monate', nextId: 'briefing_tonalitaet' },
                        { label: '6 Monate', briefingKey: 'laufzeit', briefingValue: '6 Monate', nextId: 'briefing_tonalitaet' },
                        { label: '1 Jahr', briefingKey: 'laufzeit', briefingValue: '1 Jahr', nextId: 'briefing_tonalitaet' },
                        { label: 'Noch unklar', briefingKey: 'laufzeit', briefingValue: 'Noch unklar', nextId: 'briefing_tonalitaet' }
                    ]
                };
            case 'briefing_tonalitaet':
                return {
                    id: 'briefing_tonalitaet',
                    text: 'Welche Tonalität passt am besten?',
                    options: [
                        { label: 'Warm & vertrauensvoll', briefingKey: 'tonalitaet', briefingValue: 'Warm & vertrauensvoll', nextId: 'briefing_laenge' },
                        { label: 'Modern & dynamisch', briefingKey: 'tonalitaet', briefingValue: 'Modern & dynamisch', nextId: 'briefing_laenge' },
                        { label: 'Sachlich & seriös', briefingKey: 'tonalitaet', briefingValue: 'Sachlich & seriös', nextId: 'briefing_laenge' },
                        { label: 'Werblich & energetisch', briefingKey: 'tonalitaet', briefingValue: 'Werblich & energetisch', nextId: 'briefing_laenge' },
                        { label: 'Humorvoll / locker', briefingKey: 'tonalitaet', briefingValue: 'Humorvoll / locker', nextId: 'briefing_laenge' }
                    ]
                };
            case 'briefing_laenge':
                return {
                    id: 'briefing_laenge',
                    text: 'Wie lang ist Dein Text ungefähr?',
                    options: [
                        { label: 'Kurz (bis ~30 Sek.)', briefingKey: 'laenge', briefingValue: 'Kurz (bis ~30 Sek.)', nextId: 'briefing_deadline' },
                        { label: 'Mittel (30–90 Sek.)', briefingKey: 'laenge', briefingValue: 'Mittel (30–90 Sek.)', nextId: 'briefing_deadline' },
                        { label: 'Lang (90 Sek.–3 Min.)', briefingKey: 'laenge', briefingValue: 'Lang (90 Sek.–3 Min.)', nextId: 'briefing_deadline' },
                        { label: 'Sehr lang (3+ Min.)', briefingKey: 'laenge', briefingValue: 'Sehr lang (3+ Min.)', nextId: 'briefing_deadline' },
                        {
                            label: 'Ich nutze den Wort-Rechner',
                            briefingKey: 'laenge',
                            briefingValue: 'Ich nutze den Wort-Rechner',
                            nextId: 'rechner',
                            returnToStepId: 'briefing_deadline'
                        }
                    ]
                };
            case 'briefing_deadline':
                return {
                    id: 'briefing_deadline',
                    text: 'Bis wann brauchst Du das Ergebnis?',
                    options: [
                        { label: 'Heute / ASAP', briefingKey: 'deadline', briefingValue: 'Heute / ASAP', nextId: 'briefing_aussprache' },
                        { label: '24 Stunden', briefingKey: 'deadline', briefingValue: '24 Stunden', nextId: 'briefing_aussprache' },
                        { label: '2–3 Tage', briefingKey: 'deadline', briefingValue: '2–3 Tage', nextId: 'briefing_aussprache' },
                        { label: 'Termin / später', briefingKey: 'deadline', briefingValue: 'Termin / später', nextId: 'briefing_aussprache' }
                    ]
                };
            case 'briefing_aussprache':
                return {
                    id: 'briefing_aussprache',
                    text: 'Gibt es schwierige Namen, Marken oder Fremdwörter?',
                    options: [
                        { label: 'Nein', briefingKey: 'aussprache', briefingValue: 'Nein', nextId: 'briefing_summary' },
                        { label: 'Ja – schicke ich mit', briefingKey: 'aussprache', briefingValue: 'Ja – schicke ich mit', nextId: 'briefing_summary' },
                        { label: 'Unsicher', briefingKey: 'aussprache', briefingValue: 'Unsicher', nextId: 'briefing_summary' }
                    ]
                };
            case 'briefing_summary':
                return {
                    id: 'briefing_summary',
                    text: '',
                    options: [
                        { label: 'Jetzt anfragen', userPromptText: 'Jetzt anfragen.', action: 'briefing_contact' },
                        { label: 'Einsatz & Rechte', userPromptText: 'Einsatz & Rechte.', nextId: 'rechte' },
                    ]
                };
            default:
                return {
                    id: 'start',
                    text: 'Hi! Ich bin Pascals Studio-Assistent 🎙️ – bereit für Dein Projekt. Womit darf ich Dir helfen?',
                    options: [
                        {
                            label: 'Briefing-Check (30 Sek.)',
                            userPromptText: 'Ich möchte kurz ein Briefing durchgehen.',
                            nextId: 'briefing'
                        },
                        { label: 'Casting & Demos', userPromptText: 'Kann ich Hörproben / Demos hören?', nextId: 'demos' },
                        { label: 'Preise & Buyouts', userPromptText: 'Womit muss ich preislich rechnen?', nextId: 'preise' },
                        { label: 'Technik-Setup', userPromptText: 'Wie ist das Studio von Pascal ausgestattet?', nextId: 'technik' },
                        { label: 'Ablauf der Zusammenarbeit', userPromptText: 'Wie läuft die Zusammenarbeit ab?', nextId: 'ablauf' },
                        {
                            label: 'Einsatz & Rechte',
                            userPromptText: 'Kannst Du mir kurz Nutzungsrechte & Einsatz erklären?',
                            nextId: 'rechte'
                        },
                        { label: 'Kontakt', userPromptText: 'Wie erreiche ich Pascal am schnellsten?', nextId: 'kontakt' }
                    ]
                };
        }
    }

    bindEvents() {
        if (this.launcher) {
            this.launcher.addEventListener('click', () => {
                this.registerInteraction();
                if (this.isOpen) {
                    this.closePanel();
                    return;
                }
                this.openPanel();
            });
        }

        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.registerInteraction();
                this.closePanel();
            });
        }

        if (this.homeButton) {
            this.homeButton.addEventListener('click', (event) => {
                event.preventDefault();
                this.resetConversation();
                this.applyOpenState(true, true);
            });
            this.setupHomeButtonHover();
        }

        if (this.messages) {
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
                this.copyToClipboard(value, 'Kopiert');
            });
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isOpen) {
                this.closePanel();
            }
        });

        window.addEventListener('beforeunload', () => saveState(this.state));
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                saveState(this.state);
            }
        });
    }

    renderApp() {
        if (!this.messages || !this.dock) {
            return;
        }
        this.clearTypewriter();
        this.ensureValidStep();
        this.updateHeaderSubtext(this.state.currentStepId);
        this.messages.innerHTML = '';
        if (this.ui.typingRow) {
            this.ui.typingRow = null;
        }

        const previousLength = this.lastRenderedHistoryLength;
        if (this.state.history.length < this.lastRenderedHistoryLength) {
            this.lastRenderedHistoryLength = this.state.history.length;
        }

        this.state.history.forEach((entry, index) => {
            const { row, bubble } = this.createMessageRow(entry.role);
            if (entry.role === 'bot') {
                bubble.innerHTML = this.createCopyMarkup(entry.text);
            } else {
                bubble.textContent = entry.text;
            }
            bubble.dataset.index = String(index);
            this.messages.appendChild(row);
        });

        if (this.state.history.length > this.lastRenderedHistoryLength) {
            const lastEntry = this.state.history[this.state.history.length - 1];
            if (lastEntry && lastEntry.role === 'bot') {
                this.soundEngine.play('msg_in');
            }
            this.lastRenderedHistoryLength = this.state.history.length;
        }

        this.dock.innerHTML = '';
        const step = this.logicTree[this.state.currentStepId];
        const shouldShowBack = step && step.id !== 'start';
        if (shouldShowBack) {
            const backButton = this.createBackButton();
            this.dock.appendChild(backButton);
        }

        if (step && step.id === 'kontakt') {
            const card = renderContactCard(this.state, this.settings, {
                copyToClipboard: this.copyToClipboard.bind(this),
                registerInteraction: this.registerInteraction.bind(this),
                showToast: this.showToast.bind(this)
            });
            this.dock.appendChild(card);
        } else if (step && step.id === 'rechner') {
            const calculator = renderWordCalculator(
                this.state,
                (patch, options) => this.patchState(patch, options),
                {
                    registerInteraction: this.registerInteraction.bind(this),
                    proceedFromCalculator: this.handleCalculatorProceed.bind(this)
                }
            );
            this.dock.appendChild(calculator);
            const rechnerOptions = this.getRechnerOptions();
            if (rechnerOptions && rechnerOptions.length) {
                const optionsContainer = document.createElement('div');
                optionsContainer.id = 'studio-connect-options';
                optionsContainer.className = 'studio-connect-options';
                optionsContainer.addEventListener('click', (event) => {
                    const button = event.target.closest('.studio-connect-option-btn');
                    if (!button) {
                        return;
                    }
                    const option = {
                        label: button.dataset.label || button.textContent,
                        userLabel: button.dataset.userLabel || undefined,
                        userPromptText: button.dataset.userPromptText || undefined,
                        nextId: button.dataset.nextId || undefined,
                        action: button.dataset.action || undefined,
                        target: button.dataset.target || undefined,
                        briefingKey: button.dataset.briefingKey || undefined,
                        briefingValue: button.dataset.briefingValue || undefined,
                        returnToStepId: button.dataset.returnToStepId || undefined
                    };
                    this.handleOption(option);
                });
                this.dock.appendChild(optionsContainer);
                this.options = optionsContainer;
                rechnerOptions.forEach((option) => this.appendOption(option));
                this.applyOptionsDisabled();
            }
        } else if (step) {
            const optionsContainer = document.createElement('div');
            optionsContainer.id = 'studio-connect-options';
            optionsContainer.className = 'studio-connect-options';
            optionsContainer.addEventListener('click', (event) => {
                const button = event.target.closest('.studio-connect-option-btn');
                if (!button) {
                    return;
                }
                    const option = {
                        label: button.dataset.label || button.textContent,
                        userLabel: button.dataset.userLabel || undefined,
                        userPromptText: button.dataset.userPromptText || undefined,
                        nextId: button.dataset.nextId || undefined,
                        action: button.dataset.action || undefined,
                        target: button.dataset.target || undefined,
                        briefingKey: button.dataset.briefingKey || undefined,
                        briefingValue: button.dataset.briefingValue || undefined,
                        returnToStepId: button.dataset.returnToStepId || undefined
                    };
                this.handleOption(option);
            });
            this.dock.appendChild(optionsContainer);
            this.options = optionsContainer;
            this.getFilteredOptions(step.options).forEach((option) => this.appendOption(option));
            this.applyOptionsDisabled();
        }

        if (this.ui.isTyping) {
            this.showTypingIndicator();
        }

        if (this.state.history.length > previousLength) {
            const rows = this.messages.querySelectorAll('.studio-connect-message');
            const lastRow = rows[rows.length - 1];
            if (lastRow && lastRow.classList.contains('bot')) {
                const bubble = lastRow.querySelector('.studio-connect-bubble');
                if (bubble) {
                    bubble.classList.add('is-revealing');
                }
            }
        }

        this.scrollToBottom();
    }

    patchState(patch, options = {}) {
        this.state = {
            ...this.state,
            ...patch
        };
        saveState(this.state);
        if (!options.silent) {
            this.renderApp();
        }
    }

    handleOption(option) {
        if (this.ui.optionsDisabled) {
            return;
        }
        this.queueInteraction(option);
    }

    async queueInteraction(option) {
        this.interactionChain = this.interactionChain.then(() => this.runInteraction(option)).catch(() => {});
        return this.interactionChain;
    }

    async runInteraction(option) {
        this.registerInteraction();
        this.clearTypingState();
        this.soundEngine.play('click');
        const label = option.userPromptText || option.userLabel || option.label;
        this.pushMessage('user', label);
        this.applyOptionContext(option);
        this.setOptionsDisabled(true);
        this.renderAndSave();

        const shouldDelayForReply = Boolean(option.nextId)
            || (option.action && !['briefing_contact', 'hardlink', 'back'].includes(option.action));
        if (shouldDelayForReply) {
            await this.delay(150 + Math.floor(Math.random() * 101));
        }

        if (option.action === 'briefing_contact') {
            this.setContactPrefillFromBriefing();
            if (isContactPage()) {
                window.location.hash = '#kontaktformular_direkt';
                applyContactPrefill();
            } else {
                window.location.href = '/kontakt/#kontaktformular_direkt';
            }
            this.setOptionsDisabled(false);
            return;
        }

        if (option.action === 'anchor' && option.target) {
            this.triggerAnchor(option.target);
        }

        if (option.action === 'hardlink' && option.target) {
            saveState(this.state);
            window.location.href = option.target;
            this.setOptionsDisabled(false);
            return;
        }

        if (option.action === 'back') {
            this.handleBack();
            this.setOptionsDisabled(false);
            return;
        }

        if (option.action) {
            const actionHandled = await this.handleContactAction(option.action);
            if (actionHandled === 'halt') {
                this.setOptionsDisabled(false);
                return;
            }
        }

        if (option.nextId) {
            await this.advanceToStep(option.nextId);
            this.setOptionsDisabled(false);
            return;
        }

        const nonRepeatActions = ['anchor', 'hardlink', 'form', 'email', 'phone', 'whatsapp', 'vdslink', 'gagenrechner', 'briefing_contact'];
        if (option.action && !nonRepeatActions.includes(option.action)) {
            await this.advanceToStep(this.state.currentStepId, { repeatCurrent: true });
        }

        this.setOptionsDisabled(false);
    }

    async advanceToStep(stepId, options = {}) {
        const { repeatCurrent = false, skipStack = false, suppressBotMessage = false } = options;
        const nextStep = repeatCurrent ? this.logicTree[this.state.currentStepId] : this.logicTree[stepId];
        if (!nextStep) {
            return;
        }
        if (!repeatCurrent && !skipStack && nextStep.id !== this.state.currentStepId) {
            this.state.navStack = [...this.state.navStack, this.state.currentStepId];
        }
        this.state.currentStepId = nextStep.id;
        if (suppressBotMessage) {
            this.renderAndSave();
            return;
        }
        if (nextStep.id === 'briefing') {
            await this.startBriefingFlow();
            return;
        }
        const messageText = nextStep.id === 'briefing_summary' ? this.buildBriefingSummaryMessage() : nextStep.text;
        await this.showBotMessage(messageText);
    }

    async startBriefingFlow() {
        const briefingStep = this.logicTree.briefing;
        if (!briefingStep) {
            return;
        }
        await this.showBotMessage(briefingStep.text);
        if (this.state.context?.briefingStarted) {
            return;
        }
        this.state.context = {
            ...this.state.context,
            briefingStarted: true
        };
        await this.delay(150 + Math.floor(Math.random() * 101));
        await this.advanceToStep('briefing_einsatz');
    }

    createBackButton() {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'studio-connect-option-btn studio-connect-back-btn';
        button.textContent = 'Zurück';
        button.addEventListener('click', () => this.handleBack());
        return button;
    }

    handleBack() {
        this.registerInteraction();
        this.clearTypingState();
        if (!this.state.navStack.length) {
            this.state.currentStepId = 'start';
            saveState(this.state);
            this.renderApp();
            return;
        }
        const nextStack = [...this.state.navStack];
        const previousStep = nextStack.pop();
        this.state.navStack = nextStack;
        this.state.currentStepId = previousStep || 'start';
        saveState(this.state);
        this.renderApp();
    }

    pushMessage(role, text) {
        const entry = {
            role,
            text,
            ts: Date.now()
        };
        this.state.history.push(entry);
    }

    clearTypingState() {
        if (this.ui.typingTimer) {
            window.clearTimeout(this.ui.typingTimer);
        }
        this.ui.typingTimer = null;
        this.ui.isTyping = false;
        this.removeTypingIndicator();
    }

    clearTypewriter() {
        if (!this.activeTypewriter) {
            return;
        }
        if (this.activeTypewriter.timer) {
            window.clearTimeout(this.activeTypewriter.timer);
        }
        if (this.activeTypewriter.row && this.activeTypewriter.row.parentNode) {
            this.activeTypewriter.row.parentNode.removeChild(this.activeTypewriter.row);
        }
        this.activeTypewriter = null;
    }

    getTypingDelay() {
        return 250 + Math.floor(Math.random() * 201);
    }

    showTypingIndicator() {
        if (!this.messages || this.ui.typingRow) {
            return;
        }
        const { row, bubble } = this.createMessageRow('bot');
        row.classList.add('is-typing');
        bubble.classList.add('is-typing');
        bubble.innerHTML = '<span class="studio-connect-typing-dots"><span></span><span></span><span></span></span>';
        this.messages.appendChild(row);
        this.ui.typingRow = row;
        this.scheduleScrollIntoView(row);
    }

    removeTypingIndicator() {
        if (!this.ui.typingRow) {
            return;
        }
        if (this.ui.typingRow.parentNode) {
            this.ui.typingRow.parentNode.removeChild(this.ui.typingRow);
        }
        this.ui.typingRow = null;
        this.scrollToBottom();
    }

    async showBotMessage(text, { withTypingDots = true } = {}) {
        if (!text) {
            return;
        }
        if (!this.messages) {
            this.pushMessage('bot', text);
            this.renderAndSave();
            return;
        }
        const wasDisabled = this.ui.optionsDisabled;
        if (!wasDisabled) {
            this.setOptionsDisabled(true);
        }
        this.clearTypewriter();
        this.clearTypingState();
        if (withTypingDots) {
            this.ui.isTyping = true;
            this.showTypingIndicator();
            await this.delay(this.getTypingDelay());
            this.ui.isTyping = false;
            this.removeTypingIndicator();
        }
        await this.runTypewriter(text);
        if (!wasDisabled) {
            this.setOptionsDisabled(false);
        }
    }

    runTypewriter(text) {
        return new Promise((resolve) => {
            if (!this.messages) {
                resolve();
                return;
            }
            const { row, bubble } = this.createMessageRow('bot');
            bubble.style.whiteSpace = 'pre-line';
            bubble.textContent = '';
            this.messages.appendChild(row);
            this.scheduleScrollIntoView(row);

            const maxTypeChars = 180;
            const fullText = text;
            const typeText = fullText.slice(0, maxTypeChars);
            const remainingText = fullText.slice(maxTypeChars);
            let position = 0;
            const step = () => {
                position += 1;
                bubble.textContent = typeText.slice(0, position);
                this.scheduleScrollIntoView(row);
                if (position < typeText.length) {
                    const delay = 12 + Math.floor(Math.random() * 15);
                    this.activeTypewriter.timer = window.setTimeout(step, delay);
                    return;
                }
                if (remainingText) {
                    bubble.textContent = `${typeText}${remainingText}`;
                }
                if (row.parentNode) {
                    row.parentNode.removeChild(row);
                }
                this.activeTypewriter = null;
                this.pushMessage('bot', fullText);
                this.renderAndSave();
                resolve();
            };
            this.activeTypewriter = { row, timer: window.setTimeout(step, 12) };
        });
    }

    renderAndSave() {
        saveState(this.state);
        this.renderApp();
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

    setupHomeButtonHover() {
        if (!this.homeButton) {
            return;
        }
        let tooltip = document.getElementById('sc-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'sc-tooltip';
            tooltip.className = 'sc-tooltip';
            tooltip.setAttribute('role', 'tooltip');
            tooltip.textContent = 'Neustart';
        }
        const defaultLabel = tooltip.textContent.trim() || 'Neustart';
        const hoverLabel = 'Zum Start zurück';
        this.homeTooltip = tooltip;
        const host = this.widget || document.body;
        if (!host.contains(tooltip)) {
            host.appendChild(tooltip);
        }
        const maxWidth = Math.max(
            this.measureButtonWidth(tooltip, defaultLabel),
            this.measureButtonWidth(tooltip, hoverLabel)
        );
        if (Number.isFinite(maxWidth) && maxWidth > 0) {
            tooltip.style.minWidth = `${Math.ceil(maxWidth)}px`;
        }
        const showTooltip = () => {
            if (!this.isOpen) {
                return;
            }
            tooltip.textContent = hoverLabel;
            this.positionHomeTooltip();
            tooltip.classList.add('is-visible');
        };
        const hideTooltip = () => {
            tooltip.textContent = defaultLabel;
            tooltip.classList.remove('is-visible');
        };
        this.hideHomeTooltip = hideTooltip;
        this.homeButton.addEventListener('mouseenter', showTooltip);
        this.homeButton.addEventListener('mouseleave', hideTooltip);
        this.homeButton.addEventListener('focus', showTooltip);
        this.homeButton.addEventListener('blur', hideTooltip);
        window.addEventListener('scroll', () => {
            if (tooltip.classList.contains('is-visible')) {
                this.positionHomeTooltip();
            }
        }, true);
        window.addEventListener('resize', () => {
            if (tooltip.classList.contains('is-visible')) {
                this.positionHomeTooltip();
            }
        });
    }

    measureButtonWidth(button, text) {
        const clone = button.cloneNode(true);
        clone.textContent = text;
        clone.style.position = 'absolute';
        clone.style.visibility = 'hidden';
        clone.style.pointerEvents = 'none';
        clone.style.left = '-9999px';
        clone.style.top = '-9999px';
        document.body.appendChild(clone);
        const width = clone.getBoundingClientRect().width;
        document.body.removeChild(clone);
        return width;
    }

    triggerAnchor(target) {
        const anchor = document.querySelector(`a[href*="${target}"]`);
        if (anchor) {
            anchor.click();
            return;
        }
        window.location.hash = target;
    }

    updateHeaderSubtext(stepId) {
        const map = {
            start: 'Studio-Assistenz',
            demos: 'Casting & Demos',
            preise: 'Preise & Buyouts',
            technik: 'Technik-Setup',
            rechte: 'Einsatz & Rechte',
            rechte_beispiele: 'Einsatz-Beispiele',
            kontakt: 'Kontakt',
            rechner: 'Wort-Rechner',
            ablauf: 'Ablauf der Zusammenarbeit',
            briefing: 'Briefing-Check',
            briefing_einsatz: 'Briefing-Check',
            briefing_laufzeit: 'Briefing-Check',
            briefing_tonalitaet: 'Briefing-Check',
            briefing_laenge: 'Briefing-Check',
            briefing_deadline: 'Briefing-Check',
            briefing_aussprache: 'Briefing-Check',
            briefing_summary: 'Briefing-Check'
        };
        if (this.headerSubtext && map[stepId]) {
            this.headerSubtext.textContent = map[stepId];
        }
    }

    positionHomeTooltip() {
        if (!this.homeButton || !this.homeTooltip) {
            return;
        }
        const buttonRect = this.homeButton.getBoundingClientRect();
        const left = buttonRect.left + buttonRect.width / 2 - 8;
        const top = buttonRect.top - 10;
        this.homeTooltip.style.left = `${left}px`;
        this.homeTooltip.style.top = `${top}px`;
    }

    async openPanel() {
        this.state.isOpen = true;
        this.applyOpenState(true);
        const greeted = await this.maybeShowGreeting();
        if (!greeted) {
            saveState(this.state);
            this.renderApp();
        }
        window.setTimeout(() => {
            const firstButton = this.panel ? this.panel.querySelector('button') : null;
            if (firstButton) {
                firstButton.focus();
            }
        }, 0);
    }

    closePanel() {
        this.state.isOpen = false;
        this.applyOpenState(false, true);
        if (this.hideHomeTooltip) {
            this.hideHomeTooltip();
        }
        saveState(this.state);
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

    scheduleScrollIntoView(row) {
        if (!this.chatArea) {
            return;
        }
        requestAnimationFrame(() => {
            this.chatArea.scrollTop = this.chatArea.scrollHeight;
            if (row && typeof row.scrollIntoView === 'function') {
                row.scrollIntoView({ block: 'end' });
            }
        });
    }

    createCopyMarkup(text) {
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const phoneRegex = /(\+?\d[\d\s().-]{6,}\d)/g;
        const lines = text.split('\n');
        let markup = '';
        let inList = false;
        const closeList = () => {
            if (inList) {
                markup += '</ul>';
                inList = false;
            }
        };
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('•')) {
                if (!inList) {
                    markup += '<ul class="sc-list">';
                    inList = true;
                }
                const itemText = trimmed.replace(/^•\s*/, '');
                markup += `<li>${this.escapeHtml(itemText)}</li>`;
                return;
            }
            closeList();
            if (trimmed === '') {
                markup += '<br>';
                return;
            }
            markup += `${this.escapeHtml(line)}${index < lines.length - 1 ? '<br>' : ''}`;
        });
        closeList();
        let withEmails = markup;
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

    appendOption(option) {
        if (!this.options) {
            return;
        }
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'studio-connect-option-btn';
        button.textContent = option.label;
        button.dataset.label = option.label;
        if (option.userLabel) {
            button.dataset.userLabel = option.userLabel;
        }
        if (option.userPromptText) {
            button.dataset.userPromptText = option.userPromptText;
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
        if (option.briefingKey) {
            button.dataset.briefingKey = option.briefingKey;
        }
        if (option.briefingValue) {
            button.dataset.briefingValue = option.briefingValue;
        }
        if (option.returnToStepId) {
            button.dataset.returnToStepId = option.returnToStepId;
        }
        this.options.appendChild(button);
    }

    async handleContactAction(action) {
        if (action === 'email') {
            if (this.settings.email) {
                window.location.href = `mailto:${this.settings.email}`;
                return 'halt';
            }
            await this.showBotMessage('Bitte im Backend eine E-Mail-Adresse hinterlegen, dann kann ich sie Dir anbieten.');
            return 'halt';
        }

        if (action === 'phone') {
            if (this.settings.phone) {
                window.location.href = `tel:${this.settings.phone}`;
                return 'halt';
            }
            await this.showBotMessage('Bitte im Backend eine Telefonnummer hinterlegen, dann leite ich Dich direkt weiter.');
            return 'halt';
        }

        if (action === 'whatsapp') {
            const phone = this.settings.whatsapp || '';
            const digits = phone.replace(/\D/g, '');
            if (digits) {
                window.open(`https://wa.me/${encodeURIComponent(digits)}`, '_blank', 'noopener');
            } else {
                await this.showBotMessage('Bitte im Backend eine WhatsApp-Nummer hinterlegen, dann öffne ich den Chat.');
                return 'halt';
            }
            return 'halt';
        }

        if (action === 'vdslink') {
            if (this.settings.vdsLink) {
                window.open(this.settings.vdsLink, '_blank', 'noopener');
            } else {
                await this.showBotMessage('Der VDS-Link fehlt noch im Backend. Sobald er drin ist, öffne ich ihn hier.');
                return 'halt';
            }
            return 'halt';
        }

        if (action === 'gagenrechner') {
            if (this.settings.gagenrechnerLink) {
                window.open(this.settings.gagenrechnerLink, '_blank', 'noopener');
            } else {
                await this.showBotMessage('Der Gagenrechner-Link fehlt noch im Backend. Sobald er drin ist, öffne ich ihn hier.');
                return 'halt';
            }
            return 'halt';
        }

        if (action === 'form') {
            const baseUrl = (this.settings.siteUrl || '/').replace(/\/$/, '');
            window.location.href = `${baseUrl}/kontakt/`;
            return 'halt';
        }

        return null;
    }

    updateLauncherState() {
        if (!this.launcherIcon) {
            return;
        }
        if (this.isOpen) {
            this.launcherIcon.classList.remove('fa-life-ring');
            this.launcherIcon.classList.add('fa-times');
        } else {
            this.launcherIcon.classList.remove('fa-times');
            this.launcherIcon.classList.add('fa-life-ring');
        }
    }

    resetConversation() {
        clearState();
        clearLegacyState();
        this.state = getDefaultState();
        this.state.isOpen = true;
        this.clearTypingState();
        this.applyOpenState(true, true);
        this.maybeShowGreeting().then((greeted) => {
            if (!greeted) {
                this.renderAndSave();
            }
        });
    }

    refreshDomReferences() {
        this.messages = document.getElementById('studio-connect-messages');
        this.chatArea = document.getElementById('studio-connect-chat-area');
        this.options = document.getElementById('studio-connect-options');
        this.body = document.getElementById('sc-body');
        this.dock = document.getElementById('sc-dock');
    }

    applyOpenState(isOpen, silent = false) {
        if (!this.widget || !this.panel) {
            return;
        }
        this.widget.classList.toggle('is-open', isOpen);
        this.panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        this.isOpen = isOpen;
        this.updateLauncherState();
        if (!isOpen && this.hideHomeTooltip) {
            this.hideHomeTooltip();
        }
        if (!silent && isOpen) {
            this.soundEngine.play('open');
        }
    }

    copyToClipboard(value, message) {
        if (!value) {
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(value).then(() => {
                this.showToast(message);
            }).catch(() => {
                this.execCopyFallback(value, message);
            });
            return;
        }
        this.execCopyFallback(value, message);
    }

    execCopyFallback(value, message) {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
        } catch (error) {
            // Ignore.
        }
        document.body.removeChild(textarea);
        this.showToast(message);
    }

    async maybeShowGreeting() {
        if (this.state.flags?.welcomed || this.state.history.length > 0) {
            return false;
        }
        let hasVisited = false;
        try {
            hasVisited = localStorage.getItem(SC_HAS_VISITED_KEY) === '1';
        } catch (error) {
            hasVisited = false;
        }
        const greetingText = hasVisited
            ? 'Willkommen zurück! Wie kann ich Dir dieses Mal weiterhelfen?'
            : this.logicTree.start?.text || '';
        this.state.currentStepId = 'start';
        if (!hasVisited) {
            try {
                localStorage.setItem(SC_HAS_VISITED_KEY, '1');
            } catch (error) {
                // Ignore.
            }
        }
        this.state.flags = { ...this.state.flags, welcomed: true };
        await this.showBotMessage(greetingText);
        return true;
    }

    ensureValidStep() {
        if (!this.logicTree[this.state.currentStepId]) {
            this.state.currentStepId = 'start';
        }
    }

    removeResetParam() {
        const url = new URL(window.location.href);
        url.searchParams.delete(SC_RESET_PARAM);
        window.history.replaceState({}, document.title, url.toString());
    }

    setOptionsDisabled(disabled) {
        this.ui.optionsDisabled = Boolean(disabled);
        if (this.options) {
            this.applyOptionsDisabled();
        }
    }

    applyOptionsDisabled() {
        if (this.options) {
            this.options.classList.toggle('is-disabled', this.ui.optionsDisabled);
        }
        if (!this.dock) {
            return;
        }
        this.dock.querySelectorAll('.studio-connect-option-btn').forEach((button) => {
            button.disabled = this.ui.optionsDisabled;
        });
    }

    applyOptionContext(option) {
        const briefingKey = option.briefingKey;
        const briefingValue = option.briefingValue;
        if (briefingKey && typeof briefingValue === 'string') {
            const nextBriefing = {
                ...(this.state.context?.briefing || {})
            };
            nextBriefing[briefingKey] = briefingValue;
            if (briefingKey === 'einsatz' && !['Social Ads / Paid', 'Radio / TV'].includes(briefingValue)) {
                nextBriefing.laufzeit = '';
            }
            this.state.context = {
                ...this.state.context,
                briefing: nextBriefing
            };
        }
        if (option.returnToStepId) {
            this.state.context = {
                ...this.state.context,
                returnToStepId: option.returnToStepId
            };
        } else if (this.state.currentStepId === 'briefing_laenge') {
            this.clearReturnToStepId();
        }
        if (this.state.currentStepId === 'rechner' && option.nextId) {
            this.clearReturnToStepId();
        }
    }

    clearReturnToStepId() {
        if (this.state.context?.returnToStepId) {
            this.state.context = {
                ...this.state.context,
                returnToStepId: ''
            };
        }
    }

    async handleCalculatorProceed() {
        if (this.isAutoProceeding) {
            return;
        }
        const returnToStepId = this.state.context?.returnToStepId;
        if (!returnToStepId) {
            return;
        }
        this.isAutoProceeding = true;
        this.clearReturnToStepId();
        await this.advanceToStep(returnToStepId);
        this.isAutoProceeding = false;
    }

    getRechnerOptions() {
        const options = [];
        if (this.state.context?.returnToStepId) {
            options.push({
                label: 'Weiter im Briefing',
                userPromptText: 'Weiter im Briefing.',
                nextId: this.state.context.returnToStepId
            });
            return options;
        }
        options.push({ label: 'Kontakt', userPromptText: 'Wie erreiche ich Pascal am schnellsten?', nextId: 'kontakt' });
        return options;
    }

    buildBriefingSummaryMessage() {
        const briefing = this.state.context?.briefing || {};
        const einsatz = briefing.einsatz || 'Keine Angabe';
        const tonalitaet = briefing.tonalitaet || 'Keine Angabe';
        const laenge = briefing.laenge || 'Keine Angabe';
        const deadline = briefing.deadline || 'Keine Angabe';
        const aussprache = briefing.aussprache || 'Keine Angabe';
        const lines = [
            'Perfekt – so kann Pascal Dein Projekt schnell und passend einschätzen:',
            '',
            `• Einsatz: ${einsatz}`,
        ];
        if (briefing.laufzeit) {
            lines.push(`• Laufzeit: ${briefing.laufzeit}`);
        }
        lines.push(
            `• Tonalität: ${tonalitaet}`,
            `• Länge: ${laenge}`,
            `• Deadline: ${deadline}`,
            `• Aussprache: ${aussprache}`,
            '',
            'Tippe auf „Jetzt anfragen“ – ich bringe Dich direkt zum Kontaktformular und übernehme Deine Briefing-Angaben als Vorlage.'
        );
        return lines.join('\n');
    }

    buildBriefingContactTemplate() {
        const briefing = this.state.context?.briefing || {};
        const einsatz = briefing.einsatz || 'Keine Angabe';
        const tonalitaet = briefing.tonalitaet || 'Keine Angabe';
        const laenge = briefing.laenge || 'Keine Angabe';
        const deadline = briefing.deadline || 'Keine Angabe';
        const aussprache = briefing.aussprache || 'Keine Angabe';
        const wordCount = typeof this.state.context?.wordCount === 'number' ? this.state.context.wordCount : 0;
        const lines = [
            'Hallo Pascal,',
            'hier sind die Briefing-Infos:',
            `- Einsatz: ${einsatz}`,
        ];
        if (briefing.laufzeit) {
            lines.push(`- Laufzeit: ${briefing.laufzeit}`);
        }
        lines.push(
            `- Tonalität: ${tonalitaet}`,
            `- Länge: ${laenge}`,
            `- Deadline: ${deadline}`,
            `- Aussprache: ${aussprache}`
        );
        if (wordCount > 0) {
            lines.push(`- Wortanzahl/geschätzte Dauer: ${wordCount} Wörter (~${formatDuration(wordCount)} Min.)`);
        }
        lines.push('', 'Möchtest Du mir noch etwas zum Projekt sagen?', 'Zusatzinfos: ');
        lines.push('Danke!');
        return lines.join('\n');
    }

    setContactPrefillFromBriefing() {
        try {
            const text = this.buildBriefingContactTemplate();
            const payload = {
                text,
                ts: Date.now(),
                source: 'briefing'
            };
            localStorage.setItem(SC_CONTACT_PREFILL_KEY, JSON.stringify(payload));
        } catch (error) {
            // Ignore.
        }
    }

    getFilteredOptions(options = []) {
        return options.filter((option) => option.action !== 'back');
    }

    delay(ms) {
        return new Promise((resolve) => {
            window.setTimeout(resolve, ms);
        });
    }
}

class SoundController {
    constructor() {
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

function isContactPage() {
    const href = window.location.href.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    return href.includes('#kontaktformular_direkt') || path.includes('kontakt');
}

function getPrefillPayload() {
    let payload = null;
    try {
        const raw = localStorage.getItem(SC_CONTACT_PREFILL_KEY);
        if (!raw) {
            return null;
        }
        payload = JSON.parse(raw);
    } catch (error) {
        localStorage.removeItem(SC_CONTACT_PREFILL_KEY);
        return null;
    }

    if (!payload || typeof payload.text !== 'string' || typeof payload.ts !== 'number') {
        localStorage.removeItem(SC_CONTACT_PREFILL_KEY);
        return null;
    }

    if (Date.now() - payload.ts > SC_PREFILL_MAX_AGE) {
        localStorage.removeItem(SC_CONTACT_PREFILL_KEY);
        return null;
    }

    return payload;
}

function findContactForm() {
    return document.querySelector('form#fluentform_3')
        || document.querySelector('form.fluentform[data-form_id="3"]')
        || document.querySelector('form[data-form_id="3"]');
}

function findContactMessageField(form) {
    if (!form) {
        return null;
    }
    const selectors = [
        'textarea[name="message"]',
        'textarea[name="nachricht"]',
        'textarea[name*="message" i]',
        'textarea[placeholder*="Nachricht" i]',
        'textarea.ff-el-form-control'
    ];
    for (const selector of selectors) {
        const field = form.querySelector(selector);
        if (field) {
            return field;
        }
    }
    const textareas = Array.from(form.querySelectorAll('textarea'));
    if (!textareas.length) {
        return null;
    }
    const getSizeScore = (textarea) => {
        const rows = Number.parseInt(textarea.getAttribute('rows'), 10);
        const rowScore = Number.isNaN(rows) ? 0 : rows * 20;
        return Math.max(textarea.scrollHeight || 0, textarea.offsetHeight || 0, rowScore);
    };
    return textareas.sort((a, b) => getSizeScore(b) - getSizeScore(a))[0];
}

function attemptContactPrefill(payload) {
    const form = findContactForm();
    if (!form) {
        return false;
    }
    const textarea = findContactMessageField(form);
    if (!textarea) {
        return false;
    }
    const existing = (textarea.value || '').trim();
    if (existing.length > 10) {
        localStorage.removeItem(SC_CONTACT_PREFILL_KEY);
        return true;
    }
    textarea.value = payload.text;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    if (typeof textarea.focus === 'function') {
        textarea.focus({ preventScroll: true });
    }
    if (typeof textarea.scrollIntoView === 'function') {
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    localStorage.removeItem(SC_CONTACT_PREFILL_KEY);
    return true;
}

function applyContactPrefill() {
    const payload = getPrefillPayload();
    if (!payload) {
        return;
    }

    if (attemptContactPrefill(payload)) {
        return;
    }

    const observer = new MutationObserver(() => {
        if (attemptContactPrefill(payload)) {
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 3000);
}

const initContactPrefill = () => {
    if (!isContactPage()) {
        return;
    }

    applyContactPrefill();
};

document.addEventListener('DOMContentLoaded', () => {
    let studioConnectBot = null;
    const startChat = () => {
        if (studioConnectBot) {
            studioConnectBot.refreshDomReferences();
            studioConnectBot.resetConversation();
            return;
        }
        studioConnectBot = new StudioBot(window.sc_vars || {});
    };
    if (document.getElementById('sc-widget')) {
        startChat();
    }
    initContactPrefill();
});
