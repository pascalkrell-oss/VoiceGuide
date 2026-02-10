const SC_STATE_KEY = 'sc_state_v2';
const SC_LEGACY_KEY = 'sc_chat_state';
const SC_LEGACY_PREFIX = 'sc_chat_state_';
const SC_RESET_PARAM = 'reset-chat';
const SC_CONTACT_PREFILL_KEY = 'sc_contact_prefill_v1';
const SC_HAS_VISITED_KEY = 'sc_has_visited_v1';
const SC_PREFILL_MAX_AGE = 2 * 60 * 60 * 1000;
const SC_LAUNCHER_DEFAULTS = {
    right: '30px',
    bottom: '30px',
    left: 'auto'
};

const SC_RECENT_STEPS_KEY = 'sc_recent_steps';
const SC_PROACTIVE_SHOWN_KEY = 'sc_proactive_shown';
const SC_FRICTION_COUNTER_KEY = 'sc_friction_counter';
const SC_QUICKACTIONS_CONTEXT_KEY = 'sc_quickactions_context';
const SC_CHECKLIST_KEY = 'sc_checklist';
const SC_ASSIST_STRIP_EXPANDED_KEY = 'sc_assist_strip_expanded';
const RESPONSE_TIME_TEXT = 'Antwort i.d.R. innerhalb von 24h';
const PROACTIVE_DELAY_MS = 14000;

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
        checklist: {
            medium: [],
            laufzeit: '',
            gebiet: '',
            deadline: '',
            format: '',
            aussprache: '',
            spotumfang: '',
            mediumGebiet: '',
            deadlineFlexibel: false,
            tonalitaet: [],
            zielgruppe: '',
            schnitt: '',
            revisionen: '',
            musikSfx: false
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
            },
            checklist: {
                medium: Array.isArray(state.context?.checklist?.medium) ? state.context.checklist.medium : [],
                laufzeit: typeof state.context?.checklist?.laufzeit === 'string' ? state.context.checklist.laufzeit : '',
                gebiet: typeof state.context?.checklist?.gebiet === 'string' ? state.context.checklist.gebiet : '',
                deadline: typeof state.context?.checklist?.deadline === 'string' ? state.context.checklist.deadline : '',
                format: typeof state.context?.checklist?.format === 'string' ? state.context.checklist.format : '',
                aussprache: typeof state.context?.checklist?.aussprache === 'string' ? state.context.checklist.aussprache : '',
                spotumfang: typeof state.context?.checklist?.spotumfang === 'string' ? state.context.checklist.spotumfang : '',
                mediumGebiet: typeof state.context?.checklist?.mediumGebiet === 'string' ? state.context.checklist.mediumGebiet : '',
                deadlineFlexibel: Boolean(state.context?.checklist?.deadlineFlexibel),
                tonalitaet: Array.isArray(state.context?.checklist?.tonalitaet) ? state.context.checklist.tonalitaet : [],
                zielgruppe: typeof state.context?.checklist?.zielgruppe === 'string' ? state.context.checklist.zielgruppe : '',
                schnitt: typeof state.context?.checklist?.schnitt === 'string' ? state.context.checklist.schnitt : '',
                revisionen: typeof state.context?.checklist?.revisionen === 'string' ? state.context.checklist.revisionen : '',
                musikSfx: Boolean(state.context?.checklist?.musikSfx)
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
            optionsDisabled: false,
            isResetting: false,
            assistStripExpanded: false,
            checklistDetailsExpanded: false
        };
        this.activeTypewriter = null;
        this.interactionChain = Promise.resolve();
        this.homeTooltip = null;
        this.hideHomeTooltip = null;
        this.soundEngine = new SoundController();
        this.logicTree = this.buildLogicTree();
        this.resetRequested = new URLSearchParams(window.location.search).has(SC_RESET_PARAM);
        this.isAutoProceeding = false;
        this.quickActionsFocused = false;
        this.quickActions = [];
        this.recentSteps = this.loadRecentSteps();
        this.frictionCount = this.loadSessionNumber(SC_FRICTION_COUNTER_KEY);
        this.frictionPanelShown = false;
        this.proactiveTimeout = null;

        if (this.resetRequested) {
            clearState();
            clearLegacyState();
            this.clearSessionEnhancements();
            this.removeResetParam();
        } else {
            const migratedState = migrateLegacyState();
            if (migratedState) {
                this.state = migratedState;
            }
        }

        this.state = this.state || loadState() || getDefaultState();
        this.state = normalizeState(this.state);
        try {
            this.ui.assistStripExpanded = sessionStorage.getItem(SC_ASSIST_STRIP_EXPANDED_KEY) === '1';
        } catch (error) {
            this.ui.assistStripExpanded = false;
        }
        try {
            const rawChecklist = sessionStorage.getItem(SC_CHECKLIST_KEY);
            if (rawChecklist) {
                this.state.context.checklist = { ...this.state.context.checklist, ...JSON.parse(rawChecklist) };
            }
        } catch (error) {
            // Ignore.
        }
        this.ensureValidStep();
        if (this.widget) {
            this.widget.classList.add('sc-widget-root');
        }

        this.refreshDomReferences();
        this.bindEvents();
        this.applyOpenState(this.state.isOpen, true);
        this.renderApp();
        this.startPulseCycle();
        this.scheduleProactiveBubble();
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
            briefing_summary: this.getStepConfig('briefing_summary'),
            checkliste: this.getStepConfig('checkliste')
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
                        { label: 'Kontakt', userPromptText: 'Wie erreiche ich Pascal am schnellsten?', nextId: 'kontakt' },
                        { label: 'Projekt-Checkliste', userPromptText: 'Ich möchte die Projekt-Checkliste ausfüllen.', nextId: 'checkliste' }
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

            case 'checkliste':
                return {
                    id: 'checkliste',
                    text: 'Projekt-Checkliste: Trage die wichtigsten Eckdaten ein. Danach erstelle ich einen Kontakt-Prefill.',
                    options: []
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
            this.homeButton.addEventListener('click', async (event) => {
                event.preventDefault();
                await this.resetConversationSmooth();
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

            this.messages.addEventListener('click', (event) => {
                const actionBtn = event.target.closest('[data-msg-action]');
                if (!actionBtn) {
                    return;
                }
                const messageText = actionBtn.dataset.messageText || '';
                if (!messageText) {
                    return;
                }
                this.registerInteraction();
                const action = actionBtn.dataset.msgAction;
                if (action === 'copy') {
                    this.copyToClipboard(messageText, 'Kopiert ✓');
                    return;
                }
                if (action === 'email') {
                    const subject = encodeURIComponent('Studio Assistenz – Info');
                    const body = encodeURIComponent(`Hallo,\n\nhier ist die Info aus der Studio Assistenz:\n\n${messageText}\n\nSeite: ${window.location.href}`);
                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                }
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
                this.hideProactiveBubble();
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

        if (step && step.id === 'start') {
            this.renderStartEnhancements();
        }

        if (step && step.id === 'kontakt') {
            const card = renderContactCard(this.state, this.settings, {
                copyToClipboard: this.copyToClipboard.bind(this),
                registerInteraction: this.registerInteraction.bind(this),
                showToast: this.showToast.bind(this)
            });
            this.dock.appendChild(card);
        } else if (step && step.id === 'checkliste') {
            this.renderChecklistForm();
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
        this.trackRecentStep(nextStep.id);
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
        this.incrementFriction('back');
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
            start: 'Start',
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
            briefing_summary: 'Briefing-Check',
            checkliste: 'Projekt-Checkliste'
        };
        if (this.headerSubtext) {
            const label = map[stepId] || 'Start';
            this.headerSubtext.textContent = `Du bist hier: ${label}`;
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
        this.hideProactiveBubble();
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
        const plainText = this.stripHtmlToText(withEmails);
        return `${withEmails}<div class="sc-msg-actions"><button type="button" class="sc-msg-action" data-msg-action="copy" data-message-text="${this.escapeHtml(plainText)}">Kopieren</button><button type="button" class="sc-msg-action" data-msg-action="email" data-message-text="${this.escapeHtml(plainText)}">E-Mail</button></div>`;
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
        this.clearSessionEnhancements();
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

    async waitForResetAnimation(target, duration = 240) {
        if (!target) {
            await this.delay(duration);
            return;
        }
        await new Promise((resolve) => {
            let finished = false;
            const finish = () => {
                if (finished) {
                    return;
                }
                finished = true;
                target.removeEventListener('transitionend', onTransitionEnd);
                resolve();
            };
            const onTransitionEnd = (event) => {
                if (event.target === target) {
                    finish();
                }
            };
            target.addEventListener('transitionend', onTransitionEnd);
            window.setTimeout(finish, duration + 40);
        });
    }

    async resetConversationSmooth() {
        if (this.ui?.isResetting) {
            return;
        }
        this.ui.isResetting = true;
        const resetTarget = this.chatArea || this.messages;
        try {
            if (resetTarget) {
                resetTarget.classList.add('sc-is-resetting');
            }
            await this.waitForResetAnimation(resetTarget, 240);

            clearState();
            clearLegacyState();
            this.clearSessionEnhancements();
            this.state = getDefaultState();
            this.state.isOpen = true;
            this.clearTypingState();
            this.clearTypewriter();
            this.lastRenderedHistoryLength = 0;
            if (this.messages) {
                this.messages.innerHTML = '';
            }

            if (resetTarget) {
                resetTarget.classList.remove('sc-is-resetting');
            }

            this.applyOpenState(true, true);
            const greeted = await this.maybeShowGreeting();
            if (!greeted) {
                this.renderAndSave();
            }
        } finally {
            if (resetTarget) {
                resetTarget.classList.remove('sc-is-resetting');
            }
            this.ui.isResetting = false;
        }
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
        alignLauncherToSavedButton();
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
        this.quickActionsFocused = false;
        this.quickActions = [];
        this.recentSteps = this.loadRecentSteps();
        this.frictionCount = this.loadSessionNumber(SC_FRICTION_COUNTER_KEY);
        this.frictionPanelShown = false;
        this.proactiveTimeout = null;
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



    stripHtmlToText(text) {
        return (text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    loadSessionNumber(key) {
        try {
            return Number.parseInt(sessionStorage.getItem(key) || '0', 10) || 0;
        } catch (error) {
            return 0;
        }
    }

    persistSessionNumber(key, value) {
        try {
            sessionStorage.setItem(key, String(value));
        } catch (error) {
            // Ignore.
        }
    }

    loadRecentSteps() {
        try {
            const raw = sessionStorage.getItem(SC_RECENT_STEPS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    saveRecentSteps() {
        try {
            sessionStorage.setItem(SC_RECENT_STEPS_KEY, JSON.stringify(this.recentSteps.slice(0, 3)));
        } catch (error) {
            // Ignore.
        }
    }

    trackRecentStep(stepId) {
        if (!stepId || stepId === 'start') {
            return;
        }
        this.recentSteps = [stepId, ...this.recentSteps.filter((id) => id !== stepId)].slice(0, 3);
        this.saveRecentSteps();
    }

    clearSessionEnhancements() {
        try {
            [SC_RECENT_STEPS_KEY, SC_PROACTIVE_SHOWN_KEY, SC_FRICTION_COUNTER_KEY, SC_QUICKACTIONS_CONTEXT_KEY, SC_CHECKLIST_KEY, SC_ASSIST_STRIP_EXPANDED_KEY].forEach((key) => sessionStorage.removeItem(key));
        } catch (error) {
            // Ignore.
        }
        this.recentSteps = [];
        this.frictionCount = 0;
    }

    incrementFriction(reason) {
        this.frictionCount += 1;
        this.persistSessionNumber(SC_FRICTION_COUNTER_KEY, this.frictionCount);
        if (this.frictionCount >= 3 && !this.frictionPanelShown) {
            this.frictionPanelShown = true;
            this.renderApp();
        }
    }

    getPageContext() {
        const path = (window.location.pathname || '').toLowerCase();
        const map = [
            { match: ['/gagenrechner'], key: 'gagenrechner', label: 'Gagenrechner', actions: [{ id: 'rechner_help', title: 'So funktioniert der Rechner', stepId: 'rechner' }, { id: 'rechte', title: 'Nutzungsrechte & Buyouts', stepId: 'rechte' }, { id: 'kontakt', title: 'Angebot erstellen lassen', stepId: 'kontakt' }] },
            { match: ['/kontakt'], key: 'kontakt', label: 'Kontakt', actions: [{ id: 'briefing', title: 'Was brauche ich fürs Briefing?', stepId: 'briefing' }, { id: 'ablauf', title: 'Antwortzeiten & Ablauf', stepId: 'ablauf' }] },
            { match: ['/sprecher-leistungen', '/leistungen'], key: 'leistungen', label: 'Leistungen', actions: [{ id: 'demos', title: 'Leistung auswählen', stepId: 'demos' }, { id: 'preise', title: 'Preisfragen', stepId: 'preise' }] },
            { match: ['/studio', '/equipment'], key: 'technik', label: 'Studio/Technik', actions: [{ id: 'technik', title: 'Technik-Setup', stepId: 'technik' }, { id: 'ablauf', title: 'Formate & Lieferung', stepId: 'ablauf' }] }
        ];
        const hit = map.find((entry) => entry.match.some((part) => path.includes(part)));
        if (hit) {
            return hit;
        }
        return { key: 'allgemein', label: 'Allgemein', actions: [{ id: 'preise', title: 'Preisfragen', stepId: 'preise' }, { id: 'kontakt', title: 'Kontakt', stepId: 'kontakt' }, { id: 'ablauf', title: 'Ablauf', stepId: 'ablauf' }] };
    }

    isBusinessHours() {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();
        return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
    }

    setAssistStripExpanded(expanded) {
        this.ui.assistStripExpanded = Boolean(expanded);
        try {
            sessionStorage.setItem(SC_ASSIST_STRIP_EXPANDED_KEY, this.ui.assistStripExpanded ? '1' : '0');
        } catch (error) {
            // Ignore.
        }
    }

    createAssistChip(action, className = 'sc-chip') {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = className;
        btn.textContent = action.title;
        btn.dataset.stepId = action.stepId;
        btn.dataset.assistItem = '1';
        btn.addEventListener('click', () => this.handleOption({ label: action.title, userPromptText: action.title, nextId: action.stepId }));
        return btn;
    }

    createRecentChip(stepId, className = 'sc-chip') {
        if (!this.logicTree[stepId]) {
            return null;
        }
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = className;
        btn.textContent = this.logicTree[stepId].id;
        btn.dataset.assistItem = '1';
        btn.addEventListener('click', () => this.handleOption({ label: `Zuletzt: ${stepId}`, userPromptText: `Zurück zu ${stepId}`, nextId: stepId }));
        return btn;
    }

    renderAssistStrip(context, wrap) {
        const strip = document.createElement('div');
        strip.className = `sc-assist-strip${this.ui.assistStripExpanded ? ' is-expanded' : ''}`;
        const headRow = document.createElement('div');
        headRow.className = 'sc-assist-strip__row';

        const helpLabel = document.createElement('span');
        helpLabel.className = 'sc-assist-strip__label';
        helpLabel.textContent = 'Schnellhilfe';
        headRow.appendChild(helpLabel);

        const quickChips = document.createElement('div');
        quickChips.className = 'sc-assist-strip__chips';
        context.actions.slice(0, 3).forEach((action) => quickChips.appendChild(this.createAssistChip(action)));
        headRow.appendChild(quickChips);

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'sc-assist-strip__toggle';
        toggle.setAttribute('aria-expanded', this.ui.assistStripExpanded ? 'true' : 'false');
        toggle.innerHTML = `<span>Mehr</span><i class="fa-solid fa-chevron-${this.ui.assistStripExpanded ? 'up' : 'down'}" aria-hidden="true"></i>`;
        toggle.addEventListener('click', () => {
            const next = !this.ui.assistStripExpanded;
            this.setAssistStripExpanded(next);
            this.renderApp();
        });
        headRow.appendChild(toggle);
        strip.appendChild(headRow);

        const recentVisible = this.recentSteps.slice(0, 2).map((id) => this.createRecentChip(id)).filter(Boolean);
        if (recentVisible.length) {
            const recentRow = document.createElement('div');
            recentRow.className = 'sc-assist-strip__row sc-assist-strip__row--recent';
            recentRow.innerHTML = '<span class="sc-assist-strip__label"><i class="fa-regular fa-clock" aria-hidden="true"></i>Zuletzt</span>';
            const chips = document.createElement('div');
            chips.className = 'sc-assist-strip__chips';
            recentVisible.forEach((chip) => chips.appendChild(chip));
            recentRow.appendChild(chips);
            strip.appendChild(recentRow);
        }

        const panel = document.createElement('div');
        panel.className = 'sc-assist-strip__panel';

        const fullHelp = document.createElement('div');
        fullHelp.className = 'sc-assist-strip__expand-row';
        fullHelp.innerHTML = `<span class="sc-assist-strip__label">Alle Schnellhilfen (${context.label})</span>`;
        const fullHelpChips = document.createElement('div');
        fullHelpChips.className = 'sc-assist-strip__chips';
        context.actions.slice(0, 8).forEach((action) => fullHelpChips.appendChild(this.createAssistChip(action, 'sc-chip sc-chip--compact')));
        fullHelp.appendChild(fullHelpChips);
        panel.appendChild(fullHelp);

        const fullRecent = this.recentSteps.slice(0, 3).map((id) => this.createRecentChip(id, 'sc-chip sc-chip--compact')).filter(Boolean);
        if (fullRecent.length) {
            const recentExpand = document.createElement('div');
            recentExpand.className = 'sc-assist-strip__expand-row';
            recentExpand.innerHTML = '<span class="sc-assist-strip__label">Zuletzt genutzt</span>';
            const fullRecentChips = document.createElement('div');
            fullRecentChips.className = 'sc-assist-strip__chips';
            fullRecent.forEach((chip) => fullRecentChips.appendChild(chip));
            recentExpand.appendChild(fullRecentChips);
            panel.appendChild(recentExpand);
        }

        strip.appendChild(panel);
        wrap.appendChild(strip);
        return strip;
    }

    renderStartEnhancements() {
        if (!this.dock) {
            return;
        }
        const wrap = document.createElement('div');
        wrap.className = 'sc-start-tools';
        const status = document.createElement('div');
        status.className = 'sc-status-line';
        status.textContent = `${RESPONSE_TIME_TEXT} · ${this.isBusinessHours() ? 'Heute verfügbar' : 'Melde mich bald'}`;
        wrap.appendChild(status);

        const context = this.getPageContext();
        this.quickActions = context.actions;
        const assistStrip = this.renderAssistStrip(context, wrap);

        const search = document.createElement('div');
        search.className = 'sc-searchbar';
        search.innerHTML = '<input class="sc-search" type="search" placeholder="Stichwort suchen…" aria-label="Stichwort suchen" />';
        const noResult = document.createElement('div');
        noResult.className = 'sc-no-results';
        noResult.innerHTML = '<span>Keine Treffer.</span><button type="button" class="sc-chip sc-chip--compact sc-quick-contact">Schnellkontakt</button>';
        noResult.style.display = 'none';
        noResult.querySelector('.sc-quick-contact').addEventListener('click', () => this.handleOption({ label: 'Schnellkontakt', userPromptText: 'Schnellkontakt.', nextId: 'kontakt' }));
        search.appendChild(noResult);
        wrap.appendChild(search);

        if (this.frictionCount >= 3 && !sessionStorage.getItem('sc_friction_panel_dismissed')) {
            const panel = this.renderFrictionPanel();
            wrap.appendChild(panel);
        }

        const filterTargets = () => Array.from(this.dock.querySelectorAll('.studio-connect-option-btn, [data-assist-item="1"]'));
        const input = search.querySelector('.sc-search');
        input.addEventListener('input', () => {
            const q = (input.value || '').trim().toLowerCase();
            if (!q) {
                filterTargets().forEach((el) => { el.style.display = ''; });
                noResult.style.display = 'none';
                return;
            }
            let hits = 0;
            filterTargets().forEach((el) => {
                const visible = (el.textContent || '').toLowerCase().includes(q);
                el.style.display = visible ? '' : 'none';
                if (visible) {
                    hits += 1;
                }
            });
            noResult.style.display = hits ? 'none' : 'flex';
            if (hits > 0 && !this.ui.assistStripExpanded) {
                this.setAssistStripExpanded(true);
                assistStrip.classList.add('is-expanded');
            }
            if (!hits) {
                this.incrementFriction('search_no_results');
                if (this.ui.assistStripExpanded) {
                    this.setAssistStripExpanded(false);
                    assistStrip.classList.remove('is-expanded');
                }
            }
        });

        this.dock.insertBefore(wrap, this.dock.firstChild);
    }

    renderFrictionPanel() {
        const panel = document.createElement('div');
        panel.className = 'sc-friction-panel';
        panel.innerHTML = '<button type="button" class="sc-friction-close" aria-label="Schließen">×</button><strong>Ich finde nichts</strong><div class="sc-friction-actions"></div>';
        const actions = panel.querySelector('.sc-friction-actions');
        const contact = document.createElement('button');
        contact.type = 'button';
        contact.className = 'sc-chip';
        contact.textContent = 'Schnellkontakt';
        contact.addEventListener('click', () => this.handleOption({ label: 'Schnellkontakt', userPromptText: 'Schnellkontakt', nextId: 'kontakt' }));
        actions.appendChild(contact);
        const checklist = document.createElement('button');
        checklist.type = 'button';
        checklist.className = 'sc-chip';
        checklist.textContent = '60-Sekunden Briefing';
        checklist.addEventListener('click', () => this.handleOption({ label: 'Checkliste', userPromptText: 'Ich nutze die Checkliste.', nextId: 'checkliste' }));
        actions.appendChild(checklist);
        if (this.settings.phone) {
            const phone = document.createElement('button');
            phone.type = 'button';
            phone.className = 'sc-chip';
            phone.textContent = `Telefon: ${this.settings.phone}`;
            phone.addEventListener('click', () => this.copyToClipboard(this.settings.phone, 'Telefonnummer kopiert'));
            actions.appendChild(phone);
        }
        if (this.settings.whatsapp) {
            const wa = document.createElement('button');
            wa.type = 'button';
            wa.className = 'sc-chip';
            wa.textContent = 'WhatsApp';
            wa.addEventListener('click', () => window.open(`https://wa.me/${this.settings.whatsapp.replace(/\D/g, '')}`, '_blank', 'noopener'));
            actions.appendChild(wa);
        }
        panel.querySelector('.sc-friction-close').addEventListener('click', () => {
            panel.remove();
            try { sessionStorage.setItem('sc_friction_panel_dismissed', '1'); } catch (error) {}
        });
        return panel;
    }

    buildChecklistPrefill(payload) {
        const pick = (value) => value || 'nicht angegeben';
        return [
            'Projekt-Checkliste (Kurzbriefing)',
            `Einsatz/Medium: ${(payload.medium || []).join(', ') || 'nicht angegeben'}`,
            `Gebiet: ${pick(payload.gebiet)}`,
            `Laufzeit: ${pick(payload.laufzeit)}`,
            `Deadline: ${payload.deadlineFlexibel ? 'flexibel' : pick(payload.deadline)}`,
            `Format: ${pick(payload.format)}`,
            `Spotlänge/Umfang: ${pick(payload.spotumfang)}`,
            `Tonalität/Stil: ${(payload.tonalitaet || []).join(', ') || 'nicht angegeben'}`,
            `Zielgruppe: ${pick(payload.zielgruppe)}`,
            `Schnittwünsche: ${pick(payload.schnitt)}`,
            `Revisionen/Pickups: ${pick(payload.revisionen)}`,
            `Musik/SFX vorhanden: ${payload.musikSfx ? 'Ja' : 'Nein'}`,
            `Aussprache/Glossar: ${pick(payload.aussprache)}`
        ].join('\n');
    }

    renderChecklistForm() {
        if (!this.dock) {
            return;
        }
        const checklist = this.state.context?.checklist || {};
        const selectedMedium = Array.isArray(checklist.medium) ? checklist.medium : [];
        const selectedTone = Array.isArray(checklist.tonalitaet) ? checklist.tonalitaet : [];

        const card = document.createElement('div');
        card.className = 'sc-checklist';
        card.innerHTML = `
            <div class="sc-checklist__progress">
                <div>
                    <strong>Projekt-Checkliste</strong>
                    <p class="sc-checklist__progress-text">0/10 erledigt</p>
                </div>
                <div class="sc-checklist__progress-actions">
                    <button type="button" class="sc-chip sc-chip--compact" data-checklist-action="basics">Basics wählen</button>
                    <button type="button" class="sc-chip sc-chip--compact" data-checklist-action="reset">Zurücksetzen</button>
                </div>
                <div class="sc-checklist__progressbar"><span></span></div>
            </div>
            <div class="sc-checklist__inline-info" style="display:none;"></div>
            <section class="sc-checklist__section is-open" data-section="basics">
                <button type="button" class="sc-checklist__section-head" data-toggle-section="basics"><span>Basics</span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button>
                <div class="sc-checklist__section-body sc-checklist__grid">
                    <label class="sc-checklist__field sc-checklist__field--full"><span>Einsatz/Medium</span><div class="sc-checklist-medium">
                        ${['Web','Social','TV','Radio','Intern','Kino','Podcast','E-Learning'].map((item) => `<button type="button" class="sc-chip sc-chip--compact ${selectedMedium.includes(item) ? 'is-active' : ''}" data-medium="${this.escapeHtml(item)}">${item}</button>`).join('')}
                    </div></label>
                    <label class="sc-checklist__field"><span>Gebiet</span><select name="gebiet"><option value="">Bitte wählen</option><option ${checklist.gebiet === 'Lokal/Regional' ? 'selected' : ''}>Lokal/Regional</option><option ${checklist.gebiet === 'DACH' ? 'selected' : ''}>DACH</option><option ${checklist.gebiet === 'Europa' ? 'selected' : ''}>Europa</option><option ${checklist.gebiet === 'Weltweit' ? 'selected' : ''}>Weltweit</option></select></label>
                    <label class="sc-checklist__field"><span>Laufzeit</span><select name="laufzeit"><option value="">Bitte wählen</option><option ${checklist.laufzeit === '3 Monate' ? 'selected' : ''}>3 Monate</option><option ${checklist.laufzeit === '6 Monate' ? 'selected' : ''}>6 Monate</option><option ${checklist.laufzeit === '1 Jahr' ? 'selected' : ''}>1 Jahr</option><option ${checklist.laufzeit === '2 Jahre' ? 'selected' : ''}>2 Jahre</option><option ${checklist.laufzeit === 'unbegrenzt' ? 'selected' : ''}>unbegrenzt</option></select></label>
                    <label class="sc-checklist__field"><span>Deadline</span><input type="date" name="deadline" value="${this.escapeHtml(checklist.deadline || '')}"><label class="sc-checklist__toggle"><input type="checkbox" name="deadlineFlexibel" ${checklist.deadlineFlexibel ? 'checked' : ''}> flexibel</label></label>
                    <label class="sc-checklist__field"><span>Format</span><select name="format"><option value="">Bitte wählen</option><option ${checklist.format === 'WAV 48kHz/24bit' ? 'selected' : ''}>WAV 48kHz/24bit</option><option ${checklist.format === 'WAV 44.1kHz/16bit' ? 'selected' : ''}>WAV 44.1kHz/16bit</option><option ${checklist.format === 'MP3 320' ? 'selected' : ''}>MP3 320</option></select></label>
                    <label class="sc-checklist__field"><span>Spotlänge/Umfang</span><input type="text" name="spotumfang" placeholder="z.B. 30 Sek / 1200 Wörter" value="${this.escapeHtml(checklist.spotumfang || '')}"></label>
                </div>
            </section>
            <section class="sc-checklist__section ${this.ui.checklistDetailsExpanded ? 'is-open' : ''}" data-section="details">
                <button type="button" class="sc-checklist__section-head" data-toggle-section="details"><span>Details</span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button>
                <div class="sc-checklist__section-body sc-checklist__grid">
                    <label class="sc-checklist__field sc-checklist__field--full"><span>Aussprache/Glossar</span><textarea name="aussprache" rows="2" placeholder="Namen, Marken, Begriffe">${this.escapeHtml(checklist.aussprache || '')}</textarea><small>Upload-Hinweis: Glossar/Script gern später per Mail mitschicken.</small></label>
                    <label class="sc-checklist__field sc-checklist__field--full"><span>Tonalität/Stil</span><div class="sc-checklist-medium">
                        ${['neutral','werblich','empathisch','energetic','seriös','humorvoll','erklärend'].map((item) => `<button type="button" class="sc-chip sc-chip--compact ${selectedTone.includes(item) ? 'is-active' : ''}" data-tone="${this.escapeHtml(item)}">${item}</button>`).join('')}
                    </div></label>
                    <label class="sc-checklist__field"><span>Zielgruppe</span><input type="text" name="zielgruppe" value="${this.escapeHtml(checklist.zielgruppe || '')}"></label>
                    <label class="sc-checklist__field"><span>Schnittwünsche</span><select name="schnitt"><option value="">Bitte wählen</option><option ${checklist.schnitt === 'clean' ? 'selected' : ''}>clean</option><option ${checklist.schnitt === 'leicht bearbeitet' ? 'selected' : ''}>leicht bearbeitet</option><option ${checklist.schnitt === 'voll produziert' ? 'selected' : ''}>voll produziert</option></select></label>
                    <label class="sc-checklist__field"><span>Revisionen/Pickups</span><select name="revisionen"><option value="">Bitte wählen</option><option ${checklist.revisionen === '1 Runde inkl.' ? 'selected' : ''}>1 Runde inkl.</option><option ${checklist.revisionen === '2 Runden' ? 'selected' : ''}>2 Runden</option><option ${checklist.revisionen === 'nach Aufwand' ? 'selected' : ''}>nach Aufwand</option></select></label>
                    <label class="sc-checklist__field"><span>Musik/SFX vorhanden?</span><label class="sc-checklist__toggle"><input type="checkbox" name="musikSfx" ${checklist.musikSfx ? 'checked' : ''}> Ja, Material liegt vor</label><small>Hinweis: Falls nein, klären wir Optionen beim Angebot.</small></label>
                </div>
            </section>
            <div class="sc-checklist__actions">
                <button type="button" class="sc-chip sc-chip--compact" data-checklist-action="prefill">Kontakt-Prefill erstellen</button>
                <button type="button" class="studio-connect-option-btn" data-checklist-action="request">Jetzt anfragen</button>
                <button type="button" class="sc-chip sc-chip--compact" data-checklist-action="copy">In Zwischenablage kopieren</button>
            </div>
        `;

        const syncChecklist = () => {
            const medium = Array.from(card.querySelectorAll('[data-medium].is-active')).map((el) => el.dataset.medium);
            const tonalitaet = Array.from(card.querySelectorAll('[data-tone].is-active')).map((el) => el.dataset.tone);
            const payload = {
                ...(this.state.context?.checklist || {}),
                medium,
                gebiet: card.querySelector('[name="gebiet"]').value.trim(),
                laufzeit: card.querySelector('[name="laufzeit"]').value.trim(),
                deadline: card.querySelector('[name="deadline"]').value.trim(),
                deadlineFlexibel: card.querySelector('[name="deadlineFlexibel"]').checked,
                format: card.querySelector('[name="format"]').value.trim(),
                spotumfang: card.querySelector('[name="spotumfang"]').value.trim(),
                aussprache: card.querySelector('[name="aussprache"]').value.trim(),
                tonalitaet,
                zielgruppe: card.querySelector('[name="zielgruppe"]').value.trim(),
                schnitt: card.querySelector('[name="schnitt"]').value.trim(),
                revisionen: card.querySelector('[name="revisionen"]').value.trim(),
                musikSfx: card.querySelector('[name="musikSfx"]').checked
            };
            this.state.context = { ...this.state.context, checklist: payload };
            saveState(this.state);
            try { sessionStorage.setItem(SC_CHECKLIST_KEY, JSON.stringify(payload)); } catch (error) {}
            const checklistPoints = [
                payload.medium.length > 0,
                Boolean(payload.gebiet),
                Boolean(payload.laufzeit),
                Boolean(payload.deadline) || payload.deadlineFlexibel,
                Boolean(payload.format),
                Boolean(payload.spotumfang),
                Boolean(payload.aussprache),
                payload.tonalitaet.length > 0,
                Boolean(payload.zielgruppe),
                Boolean(payload.schnitt || payload.revisionen || payload.musikSfx)
            ].filter(Boolean).length;
            const progressText = card.querySelector('.sc-checklist__progress-text');
            progressText.textContent = `${checklistPoints}/10 erledigt`;
            card.querySelector('.sc-checklist__progressbar span').style.width = `${Math.min(100, checklistPoints * 10)}%`;
            return payload;
        };

        const showInlineInfo = (text) => {
            const info = card.querySelector('.sc-checklist__inline-info');
            info.textContent = text;
            info.style.display = text ? 'block' : 'none';
        };

        card.querySelectorAll('[data-medium],[data-tone]').forEach((btn) => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('is-active');
                syncChecklist();
            });
        });
        card.querySelectorAll('input,textarea,select').forEach((el) => {
            el.addEventListener('input', syncChecklist);
            el.addEventListener('change', syncChecklist);
        });
        card.querySelectorAll('[data-toggle-section]').forEach((toggle) => {
            toggle.addEventListener('click', () => {
                const section = card.querySelector(`[data-section="${toggle.dataset.toggleSection}"]`);
                section.classList.toggle('is-open');
                if (toggle.dataset.toggleSection === 'details') {
                    this.ui.checklistDetailsExpanded = section.classList.contains('is-open');
                }
            });
        });

        card.querySelector('[data-checklist-action="basics"]').addEventListener('click', () => {
            ['Web', 'Social', 'TV'].forEach((value) => {
                const chip = card.querySelector(`[data-medium="${value}"]`);
                if (chip) {
                    chip.classList.add('is-active');
                }
            });
            showInlineInfo('Basics vorausgewählt – passe die Angaben bei Bedarf an.');
            syncChecklist();
        });

        card.querySelector('[data-checklist-action="reset"]').addEventListener('click', () => {
            card.querySelectorAll('[data-medium],[data-tone]').forEach((chip) => chip.classList.remove('is-active'));
            card.querySelectorAll('input[type="text"],input[type="date"],textarea').forEach((el) => { el.value = ''; });
            card.querySelectorAll('select').forEach((el) => { el.value = ''; });
            card.querySelectorAll('input[type="checkbox"]').forEach((el) => { el.checked = false; });
            showInlineInfo('Checkliste zurückgesetzt.');
            syncChecklist();
        });

        const savePrefill = (payload) => {
            const text = this.buildChecklistPrefill(payload);
            try {
                localStorage.setItem(SC_CONTACT_PREFILL_KEY, JSON.stringify({ text, ts: Date.now(), source: 'checklist' }));
            } catch (error) {
                // Ignore.
            }
            return text;
        };

        card.querySelector('[data-checklist-action="prefill"]').addEventListener('click', () => {
            const payload = syncChecklist();
            savePrefill(payload);
            showInlineInfo('Kontakt-Prefill erstellt.');
        });

        card.querySelector('[data-checklist-action="copy"]').addEventListener('click', () => {
            const payload = syncChecklist();
            const text = savePrefill(payload);
            this.copyToClipboard(text, 'Prefill kopiert');
        });

        card.querySelector('[data-checklist-action="request"]').addEventListener('click', () => {
            const payload = syncChecklist();
            if (!payload.medium.length && !payload.gebiet && !payload.laufzeit) {
                showInlineInfo('Trage kurz 2–3 Punkte ein (Einsatz, Gebiet, Laufzeit), dann wird’s ein perfektes Briefing.');
                return;
            }
            savePrefill(payload);
            showInlineInfo('');
            this.handleOption({ label: 'Anfrage aus Checkliste', userPromptText: 'Alles vollständig – jetzt anfragen.', nextId: 'kontakt' });
        });

        syncChecklist();
        this.dock.insertBefore(card, this.dock.firstChild);
    }

    getProactiveText(context) {
        if (context.key === 'gagenrechner') {
            return 'Fragen zum Gagenrechner?';
        }
        if (context.key === 'kontakt') {
            return 'Soll ich beim Briefing helfen?';
        }
        if (context.key === 'leistungen') {
            return 'Unsicher, welche Leistung passt?';
        }
        return 'Brauchst Du Hilfe bei Deinem Projekt?';
    }

    scheduleProactiveBubble() {
        this.proactiveTimeout = window.setTimeout(() => this.showProactiveBubble(), PROACTIVE_DELAY_MS);
    }

    showProactiveBubble() {
        if (this.isOpen) {
            return;
        }
        try {
            if (sessionStorage.getItem(SC_PROACTIVE_SHOWN_KEY) === '1') {
                return;
            }
        } catch (error) {
            // Ignore.
        }
        const context = this.getPageContext();
        const bubble = document.createElement('div');
        bubble.className = 'sc-proactive-bubble';
        bubble.innerHTML = `<button type="button" class="sc-proactive-close" aria-label="Schließen">×</button><button type="button" class="sc-proactive-main"><span class="sc-proactive-avatar">🎙️</span><span>${this.getProactiveText(context)}</span></button>`;
        bubble.querySelector('.sc-proactive-main').addEventListener('click', () => {
            this.quickActionsFocused = true;
            this.state.currentStepId = 'start';
            this.renderAndSave();
            this.openPanel();
            this.hideProactiveBubble();
            this.persistProactiveShown();
        });
        bubble.querySelector('.sc-proactive-close').addEventListener('click', () => {
            this.hideProactiveBubble();
            this.persistProactiveShown();
        });
        document.body.appendChild(bubble);
        requestAnimationFrame(() => bubble.classList.add('is-visible'));
        this.proactiveBubble = bubble;
    }

    hideProactiveBubble() {
        if (this.proactiveBubble && this.proactiveBubble.parentNode) {
            this.proactiveBubble.parentNode.removeChild(this.proactiveBubble);
        }
        this.proactiveBubble = null;
    }

    persistProactiveShown() {
        try {
            sessionStorage.setItem(SC_PROACTIVE_SHOWN_KEY, '1');
        } catch (error) {
            // Ignore.
        }
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

const debounce = (fn, wait = 100) => {
    let timer;
    return (...args) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), wait);
    };
};

const getFirstVisibleSavedButton = () => {
    const selectors = ['.saved-demos', '[class*="gemerkte"]', '[data-saved-demos]', '#saved-demos'];
    for (const selector of selectors) {
        const elements = Array.from(document.querySelectorAll(selector));
        for (const element of elements) {
            if (element.getClientRects().length > 0) {
                return element;
            }
        }
    }
    return null;
};

const resetLauncherPosition = (launcher) => {
    launcher.style.left = SC_LAUNCHER_DEFAULTS.left;
    launcher.style.right = SC_LAUNCHER_DEFAULTS.right;
    launcher.style.bottom = SC_LAUNCHER_DEFAULTS.bottom;
    launcher.style.top = 'auto';
    launcher.style.margin = '0';
};

const alignLauncherToSavedButton = () => {
    const launcher = document.querySelector('.studio-connect-launcher');
    if (!launcher) {
        return;
    }
    const savedButton = getFirstVisibleSavedButton();
    if (!savedButton) {
        resetLauncherPosition(launcher);
        return;
    }
    const rect = savedButton.getBoundingClientRect();
    const gap = 14;
    const launcherRect = launcher.getBoundingClientRect();
    const launcherWidth = launcherRect.width || 44;
    const launcherHeight = launcherRect.height || 44;
    const left = rect.right + gap;
    const savedStyles = window.getComputedStyle(savedButton);
    const savedBottomPx = parseFloat(savedStyles.bottom);
    const savedPosition = savedStyles.position;
    let baseBottom = Math.round(window.innerHeight - rect.bottom);
    if (savedPosition === 'fixed' && Number.isFinite(savedBottomPx)) {
        baseBottom = savedBottomPx;
    }
    launcher.style.left = `${left}px`;
    launcher.style.right = 'auto';
    launcher.style.bottom = savedPosition === 'fixed' && Number.isFinite(savedBottomPx)
        ? `${savedBottomPx}px`
        : `${Math.max(12, baseBottom)}px`;
    if (left + launcherWidth > window.innerWidth - 12) {
        resetLauncherPosition(launcher);
        launcher.style.bottom = `${Math.max(12, baseBottom - (launcherHeight + gap))}px`;
    }
    launcher.style.top = 'auto';
    launcher.style.margin = '0';
};

const initLauncherAlignment = () => {
    alignLauncherToSavedButton();
    const debouncedAlign = debounce(alignLauncherToSavedButton, 100);
    window.addEventListener('resize', debouncedAlign);
    const observer = new MutationObserver(debouncedAlign);
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
};

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
        textarea.value = `${existing}

---
${payload.text}`;
    } else {
        textarea.value = payload.text;
    }
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
    initLauncherAlignment();
});
