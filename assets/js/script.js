if (window.__SCP_PORTAL_BOOTED__) {
    console.info('[StudioConnect] Portal bereits initialisiert.');
} else {
window.__SCP_PORTAL_BOOTED__ = true;

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
const SC_LAUNCHER_HINT_SHOWN_KEY = 'sc_launcher_hint_shown';
const SC_LAUNCHER_HINT_DISMISSED_KEY = 'sc_launcher_hint_dismissed';
const SC_DYK_COUNT_KEY = 'sc_dyk_count';
const SC_DYK_LAST_KEY = 'sc_dyk_last';
const SC_DYK_SEEN_IDS_KEY = 'sc_dyk_seen_ids';
const PROACTIVE_DELAY_MS = 14000;
const DYK_INITIAL_DELAY_MS = 75000;
const DYK_IDLE_MS = 25000;
const DYK_MIN_INTERVAL_MS = 300000;
const DYK_MAX_PER_SESSION = 3;
const DYK_CHECK_INTERVAL_MS = 10000;
const SC_LAUNCHER_HINT_SOUND_URL = 'https://dev.pascal-krell.de/wp-content/uploads/2026/02/Studio-Assistenz_Launcher-Blop-Sound.mp3';
const SC_LAST_VISIT_TS_KEY = 'sc_last_visit_ts';
const SC_GENERAL_HINT_DONE_KEY = 'sc_general_hint_done';
const SC_TOOL_HINT_DONE_PREFIX = 'sc_tool_hint_done__';
const SC_GENERAL_HINT_RECENCY_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;
const SC_RECENT_TOPICS_KEY = 'sc_recent_topics';
const SC_CONTEXT_TIPS_SEEN_PREFIX = 'sc_context_tips_seen__';

const TOPIC_CONTENT = {
    sa_quickstart: {
        messages: [
            'Schnelleinstieg: Skript einfügen → Analyse starten → die 3 wichtigsten Werte prüfen (Sprechdauer, Tempo, Pausen).',
            'Danach: Rhythmus und CTA checken – das bringt sofort mehr Wirkung im Voice-Take.'
        ],
        options: [
            { label: 'Analyseboxen', topicKey: 'sa_analyseboxen' },
            { label: 'Teleprompter', topicKey: 'sa_teleprompter' },
            { label: 'PDF Export', topicKey: 'sa_pdf' },
            { label: 'Sprechdauer & Tempo', topicKey: 'sa_sprechdauer' }
        ]
    },
    sa_analyseboxen: {
        messages: [
            'Analyseboxen sind Deine Checkliste: Sie zeigen Dir sofort, wo Lesefluss und Betonung kippen könnten.',
            'Tipp: Erst die Basics (Tempo/Pausen/CTA), dann Detailboxen – so sparst Du Zeit.'
        ],
        options: [
            { label: 'Schnellstart', topicKey: 'sa_quickstart' },
            { label: 'Sprechdauer & Tempo', topicKey: 'sa_sprechdauer' },
            { label: 'Teleprompter', topicKey: 'sa_teleprompter' }
        ]
    },
    sa_teleprompter: {
        messages: [
            'Teleprompter ist am stärksten mit kurzen Sinnblöcken und klar gesetzten Pausenmarken im Skript.',
            'Setze pro Zeile nur einen Schwerpunkt, damit Timing und Betonung in der Aufnahme stabil bleiben.'
        ],
        options: [
            { label: 'Schnellstart', topicKey: 'sa_quickstart' },
            { label: 'Analyseboxen', topicKey: 'sa_analyseboxen' }
        ]
    },
    sa_pdf: {
        messages: [
            'PDF Export sichert den aktuellen Analyse-Stand für Freigabe, Abnahme und späteren Vergleich.',
            'Exportiere immer nach der finalen Korrekturschleife, damit Kennzahlen und Empfehlungen zusammenpassen.'
        ],
        options: [
            { label: 'Schnellstart', topicKey: 'sa_quickstart' },
            { label: 'Analyseboxen', topicKey: 'sa_analyseboxen' }
        ]
    },
    sa_sprechdauer: {
        messages: [
            'Sprechdauer und Tempo zuerst kalibrieren, weil sie direkt auf Schnitt, Musikbett und CTA-Timing wirken.',
            'Für Versionen mit gleichem Inhalt lieber über Tempo feinjustieren als Inhalte zu kürzen.'
        ],
        options: [
            { label: 'Schnellstart', topicKey: 'sa_quickstart' },
            { label: 'PDF Export', topicKey: 'sa_pdf' }
        ]
    },

    gr_rechte: {
        messages: [
            'Nutzungsrechte sind der größte Preishebel: Gebiet + Laufzeit + Kanäle bestimmen den Buyout.',
            'Praxis-Tipp: Wenn der Kunde „Social“ sagt, kläre ob Ads (Paid) dabei sind – das ist ein Unterschied.'
        ],
        options: [
            { label: 'Preisdetails', topicKey: 'gr_preisdetails' },
            { label: 'Häufige Fehler', topicKey: 'gr_fehler' },
            { label: 'PDF Export', topicKey: 'gr_pdf' }
        ]
    },
    gr_preisdetails: {
        messages: [
            'Preisdetails erklären den Rechenweg: Basis + Rechte + Add-ons = Endsumme.',
            'Tipp: Rechte zuerst finalisieren – Add-ons erst danach, sonst rechnest Du doppelt.'
        ],
        options: [
            { label: 'Nutzungsrechte', topicKey: 'gr_rechte' },
            { label: 'Häufige Fehler', topicKey: 'gr_fehler' }
        ]
    },
    gr_fehler: {
        messages: [
            'Die häufigsten Fehler sind vermischte Laufzeiten, unklare Kanäle und nicht getrennte Paid/Organic-Nutzung.',
            'Arbeite immer in dieser Reihenfolge: Projektart → Rechte → Add-ons, dann bleibt die Kalkulation belastbar.'
        ],
        options: [
            { label: 'Nutzungsrechte', topicKey: 'gr_rechte' },
            { label: 'Preisdetails', topicKey: 'gr_preisdetails' }
        ]
    },
    gr_pdf: {
        messages: [
            'PDF Export ist ideal für interne Freigaben, weil alle Preisbausteine und Rechte kompakt dokumentiert sind.',
            'Versioniere Exporte mit Datum, damit Änderungsrunden mit Kunden nachvollziehbar bleiben.'
        ],
        options: [
            { label: 'Preisdetails', topicKey: 'gr_preisdetails' },
            { label: 'Nutzungsrechte', topicKey: 'gr_rechte' }
        ]
    },

    sf_suche: {
        messages: [
            'Schneller finden: Starte mit 1–2 Filtern (z.B. „Remote“ + „Source-Connect“) und verfeinere erst dann.',
            'Wenn 0 Treffer: entferne zuerst „Ausstattung“ – die ist meist der härteste Filter.'
        ],
        options: [
            { label: 'Karte & Standort', topicKey: 'sf_karte' },
            { label: 'Häufige Probleme', topicKey: 'sf_probleme' },
            { label: 'Studio hinzufügen', topicKey: 'sf_studio_hinzufuegen' }
        ]
    },
    sf_karte: {
        messages: [
            'Standort: Wenn Dein Browser den Standort blockiert, nutze stattdessen Filter + Trefferliste.',
            'Datenschutz: Standort wird nur für die Anzeige genutzt – nichts wird dauerhaft gespeichert.'
        ],
        options: [
            { label: 'Suche & Filter', topicKey: 'sf_suche' },
            { label: 'Häufige Probleme', topicKey: 'sf_probleme' }
        ]
    },
    sf_probleme: {
        messages: [
            '0 Treffer ist fast immer „zu eng gefiltert“. Nimm 2 Filter raus und taste Dich wieder vor.',
            'Tipp: Erst Leistung (z.B. „Remote Recording“), dann Equipment – so bleibt die Liste sinnvoll.'
        ],
        options: [
            { label: 'Suche & Filter', topicKey: 'sf_suche' },
            { label: 'Karte & Standort', topicKey: 'sf_karte' },
            { label: 'Studio hinzufügen', topicKey: 'sf_studio_hinzufuegen' }
        ]
    },
    sf_studio_hinzufuegen: {
        title: 'Studio hinzufügen',
        messages: [
            'Du kannst Dein Studio direkt über den Button „Studio eintragen“ einreichen.',
            'Nach dem Absenden prüfe ich die Angaben und schalte den Eintrag anschließend frei.',
            'Tipp: Adresse, Website und Leistungen vollständig angeben – dann geht’s am schnellsten.'
        ],
        options: [
            { label: 'Studio eintragen', action: 'open_studio_submit_modal' }
        ]
    },
    gen_prices: {
        messages: [
            'Preise hängen primär an Einsatz, Laufzeit und Kanälen; die reine Aufnahme ist selten der größte Anteil.',
            'Kläre vorab Paid/Organic und Gebiet, damit die erste Kalkulation direkt verwertbar ist.'
        ],
        options: [
            { label: 'Kontakt', topicKey: 'gen_contact' }
        ]
    },
    gen_contact: {
        messages: [
            'Mit kurzem Briefing (Einsatz, Laufzeit, Kanal) sind Rückmeldung und Angebot deutlich schneller präzise.',
            'Schicke bei Bedarf ein Referenzbeispiel mit, damit Tonalität und Zielbild sofort klar sind.'
        ],
        options: []
    }
};


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
        const formUrl = sc_vars.contact_form_url || '/kontakt/';
        window.location.href = formUrl;
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
            helpers.copyToClipboard(sc_vars.email, '', emailBtn);
        });
        actions.appendChild(emailBtn);
        hasCopyAction = true;
    }

    if (sc_vars.phone) {
        const phoneBtn = document.createElement('button');
        phoneBtn.type = 'button';
        phoneBtn.className = 'studio-connect-copy is-copy sc-contact-btn';
        phoneBtn.innerHTML = `<span class="sc-contact-icon"><i class="fa-solid fa-phone" aria-hidden="true"></i></span><span class="sc-contact-label">Telefon: ${sc_vars.phone}</span><span class="sc-contact-spacer" aria-hidden="true"></span>`;
        phoneBtn.addEventListener('click', () => {
            helpers.registerInteraction();
            helpers.copyToClipboard(sc_vars.phone, '', phoneBtn);
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
            helpers.copyToClipboard(whatsappValue, '', whatsappBtn);
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


const renderCallbackForm = (helpers) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'sc-callback-form';

    const info = document.createElement('div');
    info.className = 'sc-callback-hint';
    info.textContent = 'Wir verwenden die Angaben nur zur Rückmeldung auf Deine Anfrage.';

    const grid = document.createElement('div');
    grid.className = 'sc-callback-grid';

    const name = document.createElement('input');
    name.type = 'text';
    name.name = 'name';
    name.placeholder = 'Name';
    name.className = 'sc-callback-input';

    const nameError = document.createElement('div');
    nameError.className = 'sc-callback-field-error';

    const phone = document.createElement('input');
    phone.type = 'tel';
    phone.name = 'phone';
    phone.placeholder = 'Telefonnummer';
    phone.className = 'sc-callback-input';

    const phoneError = document.createElement('div');
    phoneError.className = 'sc-callback-field-error';

    const time = document.createElement('input');
    time.type = 'time';
    time.name = 'time';
    time.className = 'sc-callback-input';

    const timeError = document.createElement('div');
    timeError.className = 'sc-callback-field-error';

    const note = document.createElement('textarea');
    note.name = 'note';
    note.className = 'sc-callback-textarea';
    note.placeholder = 'Kurze Notiz (optional)';
    note.maxLength = 240;

    const status = document.createElement('div');
    status.className = 'sc-callback-status';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'studio-connect-option-btn';
    button.textContent = 'Rückruf wünschen';
    button.disabled = true;

    const nameWrap = document.createElement('div');
    nameWrap.className = 'sc-callback-field sc-callback-field--full';
    nameWrap.appendChild(name);
    nameWrap.appendChild(nameError);

    const phoneWrap = document.createElement('div');
    phoneWrap.className = 'sc-callback-field';
    phoneWrap.appendChild(phone);
    phoneWrap.appendChild(phoneError);

    const timeWrap = document.createElement('div');
    timeWrap.className = 'sc-callback-field';
    timeWrap.appendChild(time);
    timeWrap.appendChild(timeError);

    grid.appendChild(nameWrap);
    grid.appendChild(phoneWrap);
    grid.appendChild(timeWrap);

    const setStatus = (message, type) => {
        status.className = `sc-callback-status ${type ? `is-${type}` : ''}`.trim();
        status.textContent = message || '';
    };

    const setFieldError = (input, errorEl, message, touched) => {
        const show = Boolean(touched && message);
        errorEl.textContent = show ? message : '';
        input.classList.toggle('is-invalid', show);
    };

    const validateCallbackForm = () => {
        const values = {
            name: (name.value || '').trim(),
            phone: (phone.value || '').trim(),
            time: (time.value || '').trim()
        };
        const errors = {
            name: values.name.length >= 2 ? '' : 'Mind. 2 Zeichen erforderlich.',
            phone: /^[0-9+\-\s()]{7,}$/.test(values.phone) ? '' : 'Bitte gültige Telefonnummer eingeben.',
            time: /^([01]\d|2[0-3]):[0-5]\d$/.test(values.time) ? '' : 'Bitte HH:MM Format verwenden.'
        };
        const isValid = !errors.name && !errors.phone && !errors.time;
        return { values, errors, isValid };
    };

    const touched = { name: false, phone: false, time: false };
    const updateValidationUi = () => {
        const result = validateCallbackForm();
        setFieldError(name, nameError, result.errors.name, touched.name);
        setFieldError(phone, phoneError, result.errors.phone, touched.phone);
        setFieldError(time, timeError, result.errors.time, touched.time);
        button.disabled = !result.isValid;
        return result;
    };

    [name, phone, time].forEach((input) => {
        input.addEventListener('input', () => {
            helpers.registerInteraction();
            touched[input.name] = true;
            updateValidationUi();
        });
        input.addEventListener('blur', () => {
            touched[input.name] = true;
            updateValidationUi();
        });
        input.addEventListener('change', () => {
            touched[input.name] = true;
            updateValidationUi();
        });
    });

    button.addEventListener('click', async () => {
        helpers.registerInteraction();
        setStatus('', '');

        touched.name = true;
        touched.phone = true;
        touched.time = true;
        const validation = updateValidationUi();
        if (!validation.isValid) {
            setStatus('Bitte die markierten Felder prüfen.', 'error');
            return;
        }

        const noteValue = (note.value || '').trim().slice(0, 240);
        button.disabled = true;
        const previousText = button.textContent;
        button.textContent = 'Wird gesendet…';

        try {
            const body = new URLSearchParams();
            body.set('action', 'scp_callback_request');
            body.set('security', helpers.nonce || '');
            body.set('name', validation.values.name);
            body.set('phone', validation.values.phone);
            body.set('time', validation.values.time);
            body.set('note', noteValue);
            body.set('page_url', window.location.href);

            const response = await fetch(helpers.ajaxUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: body.toString()
            });
            const payload = await response.json();

            if (!response.ok || !payload.success) {
                throw new Error(payload?.data?.message || 'Senden fehlgeschlagen.');
            }

            setStatus(payload.data?.message || 'Danke! Rückrufwunsch ist eingegangen.', 'success');
            name.value = '';
            phone.value = '';
            time.value = '';
            note.value = '';
            touched.name = false;
            touched.phone = false;
            touched.time = false;
            button.textContent = 'Gesendet ✓';
            window.setTimeout(() => {
                button.textContent = previousText;
                updateValidationUi();
            }, 1200);
        } catch (error) {
            setStatus(error.message || 'Senden fehlgeschlagen. Bitte später erneut versuchen.', 'error');
            button.textContent = previousText;
            updateValidationUi();
        }
    });

    wrapper.appendChild(info);
    wrapper.appendChild(grid);
    wrapper.appendChild(note);
    wrapper.appendChild(button);
    wrapper.appendChild(status);
    updateValidationUi();
    return wrapper;
};


class StudioBot {
    constructor(settings) {
        const defaults = {
            vdsLink: 'https://www.sprecherverband.de/wp-content/uploads/2025/02/VDS_Gagenkompass_2025.pdf',
            gagenrechnerLink: `${window.location.origin}/extras/gagenrechner/`,
            studiofinderLink: `${window.location.origin}/extras/studio-finder/`,
            skriptanalyseLink: `${window.location.origin}/extras/skript-analyse-fuer-sprecher-und-autoren/`,
            siteUrl: window.location.origin,
            avatar_url: '',
            nav_links: {},
            module_links: {}
        };
        this.settings = { ...defaults, ...settings };
        this.settings.module_links = {
            studiofinder: settings?.module_links?.studiofinder || defaults.studiofinderLink,
            gagenrechner: settings?.module_links?.gagenrechner || defaults.gagenrechnerLink,
            skriptanalyse: settings?.module_links?.skriptanalyse || defaults.skriptanalyseLink
        };
        this.pageContext = this.getPageContext();
        this.shouldShowGeneralByRecency = this.computeGeneralRecencyEligibility();
        this.widget = document.getElementById('sc-widget');
        this.panel = document.getElementById('sc-container');
        this.launcher = document.getElementById('sc-launcher');
        this.body = document.getElementById('sc-body');
        this.topicHeader = document.getElementById('sc-topic-header');
        this.dock = document.getElementById('sc-dock');
        this.headerSubtext = document.getElementById('studio-connect-subtext');
        this.toast = document.getElementById('studio-connect-toast');
        this.homeButton = document.getElementById('sc-reset');
        this.closeButton = document.getElementById('studio-connect-close');
        this.headerActions = this.panel ? this.panel.querySelector('.studio-connect-header-actions') : null;
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
            isClosing: false,
            launchSound: null,
            soundBlocked: false,
            hintSoundPlayedForThisShow: false,
            launchSoundRetryDone: false,
            launchSoundUnlocked: false,
            launchSoundTimer: null,
            skipGreetingOnce: false,
            pendingTopicKey: null,
            pendingTopicRetryCount: 0,
            activeTopicKey: null,
            msgQueueTimers: [],
            msgQueueRunId: 0,
            pendingDeepLinkStepId: null,
            listenersBound: false,
            didYouKnow: {
                openSince: 0,
                lastHintAt: 0,
                shownCount: 0,
                idleSince: Date.now(),
                lastInteractionAt: Date.now(),
                timerId: null,
                isEmitting: false,
                seenIds: []
            }
        };
        this.activeTypewriter = null;
        this.interactionChain = Promise.resolve();
        this.homeTooltip = null;
        this.hideHomeTooltip = null;
        this.soundEngine = new SoundController();
        this.logicTree = this.buildLogicTree();
        this.resetRequested = new URLSearchParams(window.location.search).has(SC_RESET_PARAM);
        this.isAutoProceeding = false;
        this.recentSteps = this.loadRecentSteps();
        this.frictionCount = this.loadSessionNumber(SC_FRICTION_COUNTER_KEY);
        this.frictionPanelShown = false;
        this.proactiveTimeout = null;
        this.searchPopoverOpen = false;
        this.searchPopover = null;
        this.searchInput = null;
        this.searchResults = null;
        this.searchTrigger = null;
        this.handleDocumentMouseDown = null;
        this.hintOverlay = null;

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
        this.ensureValidStep();
        if (this.widget) {
            this.widget.classList.add('sc-widget-root');
        }

        this.refreshDomReferences();
        this.setupHeaderSearch();
        this.bindEvents();
        this.applyOpenState(this.state.isOpen, true);
        this.renderApp();
        this.startPulseCycle();
        this.initDidYouKnow();
        this.scheduleProactiveBubble();
    }

    buildLogicTree() {
        return {
            start: this.getStepConfig('start'),
            callback: this.getStepConfig('callback'),
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
            sa_hub: this.getStepConfig('sa_hub'),
            gr_hub: this.getStepConfig('gr_hub'),
            sf_hub: this.getStepConfig('sf_hub'),
            sa_quickstart: this.getStepConfig('sa_quickstart'),
            sa_teleprompter: this.getStepConfig('sa_teleprompter'),
            sa_pdf: this.getStepConfig('sa_pdf'),
            sa_analyseboxen: this.getStepConfig('sa_analyseboxen'),
            sa_sprechdauer: this.getStepConfig('sa_sprechdauer'),
            sa_projekte: this.getStepConfig('sa_projekte'),
            sa_premium: this.getStepConfig('sa_premium'),
            gr_projektart: this.getStepConfig('gr_projektart'),
            gr_rechte: this.getStepConfig('gr_rechte'),
            gr_optionen: this.getStepConfig('gr_optionen'),
            gr_preisdetails: this.getStepConfig('gr_preisdetails'),
            gr_pdf: this.getStepConfig('gr_pdf'),
            gr_reset: this.getStepConfig('gr_reset'),
            gr_fehler: this.getStepConfig('gr_fehler'),
            sf_suche: this.getStepConfig('sf_suche'),
            sf_karte: this.getStepConfig('sf_karte'),
            sf_premium: this.getStepConfig('sf_premium'),
            sf_studio_hinzufuegen: this.getStepConfig('sf_studio_hinzufuegen'),
            sf_probleme: this.getStepConfig('sf_probleme')
        };
    }

    getStartOptions() {
        const options = [
            {
                label: 'Briefing-Check (30 Sek.)',
                userPromptText: 'Ich möchte kurz ein Briefing durchgehen.',
                nextId: 'briefing'
            },
            { label: 'Casting & Demos', userPromptText: 'Demos öffnen.', nextId: 'demos' },
            { label: 'Preise & Buyouts', userPromptText: 'Womit muss ich preislich rechnen?', nextId: 'preise' },
            { label: 'Technik-Setup', userPromptText: 'Wie ist das Studio von Pascal ausgestattet?', nextId: 'technik' },
            { label: 'Ablauf der Zusammenarbeit', userPromptText: 'Wie läuft die Zusammenarbeit ab?', nextId: 'ablauf' },
            {
                label: 'Einsatz & Rechte',
                userPromptText: 'Ich möchte Nutzungsrechte und Einsätze sehen.',
                nextId: 'rechte'
            },
            { label: 'Kontakt', userPromptText: 'Kontaktwege anzeigen.', nextId: 'kontakt' },
            { label: 'Rückruf gewünscht', userPromptText: 'Ich wünsche einen Rückruf.', nextId: 'callback' }
        ];

        if (this.pageContext.moduleKey === 'studiofinder') {
            options.push({ label: 'Studio-Finder Hilfe', userPromptText: 'Studio-Finder Hilfe öffnen.', nextId: 'sf_hub' });
        } else if (this.pageContext.moduleKey === 'gagenrechner') {
            options.push({ label: 'Gagenrechner Hilfe', userPromptText: 'Gagenrechner Hilfe öffnen.', nextId: 'gr_hub' });
        } else if (this.pageContext.moduleKey === 'skriptanalyse') {
            options.push({ label: 'Skript-Analyse Hilfe', userPromptText: 'Skript-Analyse Hilfe öffnen.', nextId: 'sa_hub' });
        }

        return options;
    }

    getStepConfig(stepId) {
        switch (stepId) {
            case 'start':
                return {
                    id: 'start',
                    text: 'Hi! Ich bin Pascals Studio-Assistent 🎙️ – bereit für Dein Projekt. Womit darf ich Dir helfen?',
                    options: this.getStartOptions()
                };
            case 'demos':
                const navLinks = this.settings.nav_links || {};
                return {
                    id: 'demos',
                    text: 'Gerne! Welche Demo-Kategorie möchtest Du hören? Ich leite Dich zur passenden Seite.',
                    options: [
                        { label: 'Werbung', userPromptText: 'Ich möchte Werbung-Demos hören.', action: 'hardlink', target: navLinks.werbung },
                        { label: 'Webvideo', userPromptText: 'Gibt es Webvideo-Demos?', action: 'hardlink', target: navLinks.webvideo },
                        { label: 'Telefonansage', userPromptText: 'Telefonansage-Demos öffnen.', action: 'hardlink', target: navLinks.telefonansage },
                        { label: 'Podcast', userPromptText: 'Podcast-Demos öffnen.', action: 'hardlink', target: navLinks.podcast },
                        { label: 'Imagefilm', userPromptText: 'Ich suche Imagefilm-Demos.', action: 'hardlink', target: navLinks.imagefilm },
                        { label: 'Erklärvideo', userPromptText: 'Gibt es Erklärvideo-Demos?', action: 'hardlink', target: navLinks.erklaervideo },
                        { label: 'E-Learning', userPromptText: 'E-Learning-Demos öffnen.', action: 'hardlink', target: navLinks.elearning }
                    ]
                };
            case 'preise':
                return {
                    id: 'preise',
                    text: 'Die Kalkulation erfolgt transparent nach VDS-Standards. Du bekommst klare Buyouts, saubere Deliverables und verlässliche Timing-Zusagen. Womit soll ich starten?',
                    options: [
                        { label: 'VDS-Gagenliste', userPromptText: 'VDS-Gagenliste anzeigen.', action: 'vdslink' },
                        { label: 'Gagenrechner', userPromptText: 'Gagenrechner öffnen.', action: 'gagenrechner' },
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
                        { label: 'Kontakt', userPromptText: 'Kontaktwege anzeigen.', nextId: 'kontakt' }
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
                        { label: 'Kontakt', userPromptText: 'Kontaktwege anzeigen.', nextId: 'kontakt' }
                    ]
                };
            case 'rechte':
                return {
                    id: 'rechte',
                    text: 'Kurz erklärt: Produktion ist die Aufnahme selbst – Nutzung regelt, wo und wie lange der Spot/Clip laufen darf.\n\n• Einsatzorte wie Website, Social Organic, Social Ads, YouTube PreRoll oder Radio/TV regional zählen unterschiedlich.\n• Nutzungsrechte hängen von Reichweite, Mediaspend und Zeitraum ab.\n• Je klarer der Einsatz, desto fairer kann Pascal kalkulieren.\n\nJe mehr Informationen Pascal hat, desto genauer kann er Dir ein individuelles Angebot erstellen.',
                    options: [
                        { label: 'Beispiele sehen', userPromptText: 'Typische Einsätze anzeigen.', nextId: 'rechte_beispiele' },
                        { label: 'Kontakt', userPromptText: 'Ich möchte kurz Rücksprache halten.', nextId: 'kontakt' }
                    ]
                };
            case 'rechte_beispiele':
                return {
                    id: 'rechte_beispiele',
                    text: 'Typische Einsatz-Szenarien:\n\n• Website + organische Social Posts (3–6 Monate)\n• Social Ads (Meta/YouTube) mit festem Budget\n• YouTube PreRoll national (6 Monate)\n• Regionales Radio/TV (4 Wochen)\n• Podcast-Intro/Outro (1 Jahr)\n\nWähle oben den passenden Einsatz aus oder tippe auf „Kontakt“, dann ordnet Pascal die Lizenz passend ein.',
                    options: [
                        { label: 'Beispiele', userPromptText: 'Zeig mir Beispiele.', nextId: 'rechte_beispiele' },
                        { label: 'Kontakt', userPromptText: 'Kontakt öffnen.', nextId: 'kontakt' },
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
            case 'callback':
                return {
                    id: 'callback',
                    text: 'Trag Deine Daten ein - ich melde mich schnellstmöglich zurück.',
                    action: 'callback_form',
                    options: [
                        { label: 'Kontakt', userPromptText: 'Kontakt anzeigen.', nextId: 'kontakt' }
                    ]
                };
            case 'sa_hub':
                return {
                    id: 'sa_hub',
                    text: 'Hilfecenter Skript-Analyse: Die wichtigsten Funktionen auf einen Blick.',
                    options: [
                        { label: 'Schnellstart', userPromptText: 'Schnellstart öffnen.', nextId: 'sa_quickstart' },
                        { label: 'Teleprompter', userPromptText: 'Teleprompter öffnen.', nextId: 'sa_teleprompter' },
                        { label: 'PDF Export', userPromptText: 'PDF Export öffnen.', nextId: 'sa_pdf' },
                        { label: 'Analyseboxen erklärt', userPromptText: 'Analyseboxen erklärt.', nextId: 'sa_analyseboxen' },
                        { label: 'Sprechdauer & Tempo', userPromptText: 'Sprechdauer & Tempo.', nextId: 'sa_sprechdauer' },
                        { label: 'Projekte speichern/laden', userPromptText: 'Projekte speichern/laden.', nextId: 'sa_projekte' },
                        { label: 'Premium – Überblick', userPromptText: 'Premium Überblick.', nextId: 'sa_premium' },
                    ]
                };
            case 'gr_hub':
                return {
                    id: 'gr_hub',
                    text: 'Hilfecenter Gagenrechner: Schnell zu den wichtigsten Themen.',
                    options: [
                        { label: 'Projektart wählen', userPromptText: 'Projektart wählen.', nextId: 'gr_projektart' },
                        { label: 'Nutzungsrechte & Buyouts', userPromptText: 'Nutzungsrechte & Buyouts.', nextId: 'gr_rechte' },
                        { label: 'Optionen & Add-ons', userPromptText: 'Optionen & Add-ons.', nextId: 'gr_optionen' },
                        { label: 'Preisdetails (Rechenweg)', userPromptText: 'Preisdetails öffnen.', nextId: 'gr_preisdetails' },
                        { label: 'PDF Export', userPromptText: 'PDF Export öffnen.', nextId: 'gr_pdf' },
                        { label: 'Zurücksetzen (System Clear)', userPromptText: 'Zurücksetzen erklären.', nextId: 'gr_reset' },
                        { label: 'Häufige Fehler', userPromptText: 'Häufige Fehler anzeigen.', nextId: 'gr_fehler' },
                    ]
                };
            case 'sf_hub':
                return {
                    id: 'sf_hub',
                    text: 'Hilfecenter Studio-Finder: Orientierung für Suche, Karte und Daten.',
                    options: [
                        { label: 'Suche & Filter', userPromptText: 'Suche & Filter öffnen.', nextId: 'sf_suche' },
                        { label: 'Karte & Standort', userPromptText: 'Karte & Standort öffnen.', nextId: 'sf_karte' },
                        { label: 'Premium-Studios', userPromptText: 'Premium-Studios anzeigen.', nextId: 'sf_premium' },
                        { label: 'Studio hinzufügen', userPromptText: 'Studio hinzufügen.', topicKey: 'sf_studio_hinzufuegen' },
                        { label: 'Häufige Probleme', userPromptText: 'Häufige Probleme.', nextId: 'sf_probleme' },
                    ]
                };
            case 'sa_quickstart':
                return { ...this.buildModuleTopicStep('sa_hub', 'skriptanalyse', [
                    'Direkt ein Skript einfügen oder laden.',
                    'Analyse starten und Kennzahlen im oberen Bereich prüfen.',
                    'Kritische Stellen zuerst überarbeiten, dann erneut prüfen.',
                    'Texte in kurzen Absätzen verbessern Lesbarkeit und Rhythmus.',
                    'Ergebnisse optional als PDF dokumentieren.'
                ]), id: 'sa_quickstart' };
            case 'sa_teleprompter':
                return { ...this.buildModuleTopicStep('sa_hub', 'skriptanalyse', [
                    'Studio-Mode reduziert Ablenkung und fokussiert den Text.',
                    'Tempo schrittweise erhöhen, bis es natürlich klingt.',
                    'Kurze Blickpausen helfen für ruhigen Lesefluss.',
                    'Schwierige Namen vorher markieren und langsam anfahren.',
                    'Bei langen Passagen mit Abschnitten arbeiten.'
                ]), id: 'sa_teleprompter' };
            case 'sa_pdf':
                return { ...this.buildModuleTopicStep('sa_hub', 'skriptanalyse', [
                    'PDF bündelt Analysewerte und Textstand kompakt.',
                    'Vor Versand Datum und Versionsstand prüfen.',
                    'Für Freigaben kurze Notiz zum Einsatzzweck ergänzen.',
                    'Export nach größeren Änderungen erneut erstellen.',
                    'Dateinamen klar halten für Teams und Kunden.'
                ]), id: 'sa_pdf' };
            case 'sa_analyseboxen':
                return { ...this.buildModuleTopicStep('sa_hub', 'skriptanalyse', [
                    'Lesbarkeit zeigt, wie leicht der Text erfassbar ist.',
                    'Pausen- und Satzstruktur steuern Verständlichkeit.',
                    'Füllwörter reduzieren, um Fokus zu erhöhen.',
                    'Betonungsmarker helfen bei dynamischen Passagen.',
                    'Unklare Begriffe früh vereinheitlichen.'
                ]), id: 'sa_analyseboxen' };
            case 'sa_sprechdauer':
                return { ...this.buildModuleTopicStep('sa_hub', 'skriptanalyse', [
                    'Sprechdauer basiert auf Tempo und Textlänge.',
                    'Für Werbung eher straffer, für Erklärungen ruhiger kalkulieren.',
                    'Satzlängen beeinflussen reale Aufnahmezeit deutlich.',
                    'Pausen nicht unterschätzen, sie tragen zur Wirkung bei.',
                    'Mehrere Takes für Sicherheit einplanen.'
                ]), id: 'sa_sprechdauer' };
            case 'sa_projekte':
                return { ...this.buildModuleTopicStep('sa_hub', 'skriptanalyse', [
                    'Projektstände regelmäßig speichern.',
                    'Versionen sauber benennen (Datum/Zweck).',
                    'Beim Laden auf richtigen Textstand achten.',
                    'Export als Backup vor größeren Anpassungen nutzen.',
                    'Teamwork: eindeutige Verantwortlichkeiten festlegen.'
                ]), id: 'sa_projekte' };
            case 'sa_premium':
                return { ...this.buildModuleTopicStep('sa_hub', 'skriptanalyse', [
                    'Premium bündelt erweiterte Analyse- und Workflow-Funktionen.',
                    'Zusatztools unterstützen längere oder komplexe Skripte.',
                    'Export- und Projektfunktionen werden erweitert nutzbar.',
                    'Für Agenturen lohnt sich Premium bei hoher Frequenz.',
                    'Vor Upgrade kurz Feature-Abgleich mit Bedarf machen.'
                ]), id: 'sa_premium' };
            case 'gr_projektart':
                return { ...this.buildModuleTopicStep('gr_hub', 'gagenrechner', [
                    'Projektart zuerst festlegen, sie ist die Rechenbasis.',
                    'Werbung, Social, Erklärfilm und E-Learning unterscheiden sich.',
                    'Plattform und Einsatzgebiet gleich zu Beginn definieren.',
                    'Unscharfe Projektangaben führen oft zu falscher Spanne.',
                    'Im Zweifel konservativ einstufen und später verfeinern.'
                ]), id: 'gr_projektart' };
            case 'gr_rechte':
                return { ...this.buildModuleTopicStep('gr_hub', 'gagenrechner', [
                    'Gebiet, Laufzeit und Medien bestimmen die Nutzungsrechte.',
                    'Typische Kombinationen: DACH + 12 Monate + Social Ads.',
                    'Buyouts steigen mit Reichweite und Dauer deutlich an.',
                    'Paid Media getrennt von rein organischer Nutzung betrachten.',
                    'Bei Unsicherheit lieber etwas großzügiger kalkulieren.'
                ]), id: 'gr_rechte' };
            case 'gr_optionen':
                return { ...this.buildModuleTopicStep('gr_hub', 'gagenrechner', [
                    'Add-ons wie Express-Lieferung oder Zusatzversionen separat erfassen.',
                    'Mehrsprachigkeit und Schnittvarianten früh berücksichtigen.',
                    'Revisionen transparent als Option einplanen.',
                    'Sonderwünsche mit Aufwand und Timing koppeln.',
                    'Optionen immer nachvollziehbar dokumentieren.'
                ]), id: 'gr_optionen' };
            case 'gr_preisdetails':
                return { ...this.buildModuleTopicStep('gr_hub', 'gagenrechner', [
                    'Preisdetails zeigen den Rechenweg pro Baustein.',
                    'Basisvergütung und Nutzungsanteil getrennt betrachten.',
                    'Zwischensummen helfen bei Abstimmung mit Auftraggebern.',
                    'Bei Änderungen nur betroffene Bausteine neu prüfen.',
                    'So bleiben Angebote konsistent und erklärbar.'
                ]), id: 'gr_preisdetails' };
            case 'gr_pdf':
                return { ...this.buildModuleTopicStep('gr_hub', 'gagenrechner', [
                    'PDF exportiert die aktuelle Kalkulation als Nachweis.',
                    'Vor Versand Parameter und Datum prüfen.',
                    'Datei für interne Freigaben versionieren.',
                    'Mehrere Varianten separat exportieren.',
                    'PDF eignet sich gut als Angebotsanhang.'
                ]), id: 'gr_pdf' };
            case 'gr_reset':
                return { ...this.buildModuleTopicStep('gr_hub', 'gagenrechner', [
                    'System Clear setzt Eingaben auf Ausgangszustand zurück.',
                    'Vor Reset bei Bedarf PDF sichern.',
                    'Reset hilft bei widersprüchlichen Parameterständen.',
                    'Nach Reset Projektart zuerst erneut wählen.',
                    'So bleibt die Kalkulation sauber aufgebaut.'
                ]), id: 'gr_reset' };
            case 'gr_fehler':
                return { ...this.buildModuleTopicStep('gr_hub', 'gagenrechner', [
                    'Häufig: falsches Einsatzgebiet oder Laufzeit übersehen.',
                    'Paid/Organic nicht vermischen.',
                    'Projektart nicht mitten im Prozess wechseln.',
                    'Add-ons doppelt vermeiden.',
                    'Ergebnis vor Export kurz gegen Briefing prüfen.'
                ]), id: 'gr_fehler' };
            case 'sf_suche':
                return { ...this.buildModuleTopicStep('sf_hub', 'studiofinder', [
                    'Suche startet mit Genre, Ort oder Ausstattung.',
                    'Filter schrittweise setzen statt alles auf einmal.',
                    'Trefferliste nach Relevanz und Verfügbarkeit prüfen.',
                    'Bei zu wenigen Treffern einzelne Filter lösen.',
                    'Favoriten intern notieren für Vergleich.'
                ]), id: 'sf_suche' };
            case 'sf_karte':
                return { ...this.buildModuleTopicStep('sf_hub', 'studiofinder', [
                    'Karte zeigt Studios im räumlichen Kontext.',
                    'Standortfreigabe verbessert Nähe-Sortierung.',
                    'Datenschutz: Standortdaten nur zur Suche verwenden.',
                    'Ohne Freigabe funktioniert die Karte weiterhin manuell.',
                    'Zoomen hilft bei Ballungsräumen mit vielen Treffern.'
                ]), id: 'sf_karte' };
            case 'sf_premium':
                return { ...this.buildModuleTopicStep('sf_hub', 'studiofinder', [
                    'Premium-Studios sind erweitert kuratiert und markiert.',
                    'Details zu Ausstattung und Services besonders prüfen.',
                    'Für enge Deadlines Premium-Angebote priorisieren.',
                    'Vergleich trotzdem mit Standard-Treffern durchführen.',
                    'Kontaktwege pro Studio direkt dokumentieren.'
                ]), id: 'sf_premium' };
            case 'sf_studio_hinzufuegen':
                return { ...this.buildModuleTopicStep('sf_hub', 'studiofinder', [
                    'Du vermisst ein Studio? Schick uns die wichtigsten Daten zur Prüfung.',
                    'Nenne Name, Ort, Website und relevante Leistungen für die Suche.',
                    'Mit Referenzen oder Beispiel-Links wird die Freigabe meist schneller.'
                ]), id: 'sf_studio_hinzufuegen' };
            case 'sf_probleme':
                return { ...this.buildModuleTopicStep('sf_hub', 'studiofinder', [
                    'Leere Treffer: Filter zu streng oder Schreibweise prüfen.',
                    'Karte lädt nicht: Standortberechtigung und Browser prüfen.',
                    'Langsame Suche: Filter reduzieren und neu starten.',
                    'Ungenaue Ergebnisse: Ort präzisieren.',
                ]), id: 'sf_probleme' };
            default:
                return {
                    id: 'start',
                    text: 'Hi! Ich bin Pascals Studio-Assistent 🎙️ – bereit für Dein Projekt. Womit darf ich Dir helfen?',
                    options: this.getStartOptions()
                };
        }
    }


    buildModuleTopicStep(hubStepId, moduleTarget, points) {
        const bullets = (points || []).map((point) => `• ${point}`);
        return {
            id: '',
            text: bullets.join('\n'),
            options: [
                { label: 'Zur Übersicht', userPromptText: 'Zur Übersicht.', nextId: hubStepId },
                { label: 'Kontakt', userPromptText: 'Kontakt anzeigen.', nextId: 'kontakt' }
            ]
        };
    }

    bindEvents() {
        if (this.ui.listenersBound) {
            return;
        }
        this.ui.listenersBound = true;
        if (this.launcher) {
            this.launcher.addEventListener('click', async () => {
                this.registerInteraction();
                if (this.ui.soundBlocked && !this.ui.launchSoundRetryDone) {
                    this.playLauncherHintSound(true);
                }
                if (this.isOpen) {
                    await this.closePanel();
                    return;
                }
                this.openPanel();
            });
        }

        if (this.closeButton) {
            this.closeButton.addEventListener('click', async () => {
                this.registerInteraction();
                await this.closePanel();
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
                this.copyToClipboard(value, 'Kopiert', target);
            });
        }

        if (this.panel) {
            const markIdle = () => this.markPortalInteraction();
            this.panel.addEventListener('click', markIdle, true);
            this.panel.addEventListener('input', markIdle, true);
            this.panel.addEventListener('keydown', markIdle, true);
            this.panel.addEventListener('scroll', markIdle, true);
        }

        document.addEventListener('keydown', async (event) => {
            if (event.key !== 'Escape') {
                return;
            }
            if (this.searchPopoverOpen) {
                this.hideSearchPopover();
                return;
            }
            if (this.isOpen) {
                await this.closePanel();
            }
        });

        this.handleDocumentMouseDown = (event) => {
            if (!this.searchPopoverOpen) {
                return;
            }
            if (this.searchPopover && this.searchPopover.contains(event.target)) {
                return;
            }
            if (this.searchTrigger && this.searchTrigger.contains(event.target)) {
                return;
            }
            this.hideSearchPopover();
        };
        document.addEventListener('mousedown', this.handleDocumentMouseDown);

        window.addEventListener('beforeunload', () => saveState(this.state));
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.hideProactiveBubble();
        saveState(this.state);
            }
        });

        window.addEventListener('scroll', () => {
            if (!this.proactiveBubble) {
                return;
            }
            const shouldHide = window.scrollY > 400;
            this.proactiveBubble.classList.toggle('is-scrolled-out', shouldHide);
        }, { passive: true });
    }

    renderApp() {
        if (!this.messages || !this.dock) {
            return;
        }
        this.clearTypewriter();
        this.ensureValidStep();
        this.updateHeaderLocation(this.state.currentStepId);
        this.renderTopicHeader();
        this.messages.innerHTML = '';
        if (this.ui.typingRow) {
            this.ui.typingRow = null;
        }

        const previousLength = this.lastRenderedHistoryLength;
        if (this.state.history.length < this.lastRenderedHistoryLength) {
            this.lastRenderedHistoryLength = this.state.history.length;
        }

        this.state.history.forEach((entry, index) => {
            const { row, bubble, bubbleWrap } = this.createMessageRow(entry.role);
            if (entry.role === 'bot') {
                bubble.innerHTML = this.createCopyMarkup(entry.text);
            } else {
                bubble.textContent = entry.text;
            }
            if (!entry.ts && !entry.timestamp && !entry.createdAt) {
                entry.ts = Date.now();
            }
            const meta = this.createMessageMeta(entry.role, entry.ts || entry.timestamp || entry.createdAt);
            bubble.dataset.index = String(index);
            bubbleWrap.appendChild(meta);
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
        const shouldShowBack = Boolean(this.ui.activeTopicKey) || (step && step.id !== 'start');
        if (shouldShowBack) {
            const backButton = this.createBackButton();
            this.dock.appendChild(backButton);
        }

        if (this.renderTopicOptionsIfNeeded()) {
            if (this.ui.isTyping) {
                this.showTypingIndicator();
            }
            this.scrollToBottom();
            return;
        }

        if (step && step.id === 'start') {
            this.renderStartEnhancements();
        }

        if (step && step.id === 'kontakt') {
            const card = renderContactCard(this.state, this.settings, {
                copyToClipboard: this.copyToClipboard.bind(this),
                registerInteraction: this.registerInteraction.bind(this),
                showToast: this.showToast.bind(this),
                ajaxUrl: this.settings.ajax_url || '/wp-admin/admin-ajax.php',
                contextKey: this.pageContext?.contextKey || 'general'
            });
            this.dock.appendChild(card);
        } else if (step && step.id === 'callback') {
            const callbackForm = renderCallbackForm({
                registerInteraction: this.registerInteraction.bind(this),
                ajaxUrl: this.settings.ajax_url || '/wp-admin/admin-ajax.php',
                nonce: this.settings.callback_nonce || ''
            });
            this.dock.appendChild(callbackForm);
            if (step.options && step.options.length) {
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
                        topicKey: button.dataset.topicKey || undefined,
                        stepId: button.dataset.stepId || undefined,
                        fallbackIds: button.dataset.fallbackIds ? button.dataset.fallbackIds.split('|').filter(Boolean) : undefined,
                        target: button.dataset.target || undefined,
                        briefingKey: button.dataset.briefingKey || undefined,
                        briefingValue: button.dataset.briefingValue || undefined,
                        returnToStepId: button.dataset.returnToStepId || undefined
                    };
                    if (option.topicKey) {
                this.showTopic(option.topicKey, { replaceChat: true });
                return;
            }
            this.handleOption(option);
                });
                this.dock.appendChild(optionsContainer);
                this.options = optionsContainer;
                this.getFilteredOptions(step.options).forEach((option) => this.appendOption(option));
                this.applyOptionsDisabled();
            }
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
                        topicKey: button.dataset.topicKey || undefined,
                        stepId: button.dataset.stepId || undefined,
                        fallbackIds: button.dataset.fallbackIds ? button.dataset.fallbackIds.split('|').filter(Boolean) : undefined,
                        target: button.dataset.target || undefined,
                        briefingKey: button.dataset.briefingKey || undefined,
                        briefingValue: button.dataset.briefingValue || undefined,
                        returnToStepId: button.dataset.returnToStepId || undefined
                    };
                    if (option.topicKey) {
                this.showTopic(option.topicKey, { replaceChat: true });
                return;
            }
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
                        topicKey: button.dataset.topicKey || undefined,
                        stepId: button.dataset.stepId || undefined,
                        fallbackIds: button.dataset.fallbackIds ? button.dataset.fallbackIds.split('|').filter(Boolean) : undefined,
                        target: button.dataset.target || undefined,
                        briefingKey: button.dataset.briefingKey || undefined,
                        briefingValue: button.dataset.briefingValue || undefined,
                        returnToStepId: button.dataset.returnToStepId || undefined
                    };
                if (option.topicKey) {
                this.showTopic(option.topicKey, { replaceChat: true });
                return;
            }
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

        if (option.topicKey) {
            await this.showTopic(option.topicKey, { replaceChat: true });
            this.setOptionsDisabled(false);
            return;
        }

        if (option.stepId && !option.nextId) {
            const targetStepId = this.resolveExistingStep(option.stepId, option.fallbackIds || []);
            if (targetStepId) {
                await this.advanceToStep(targetStepId);
            }
            this.setOptionsDisabled(false);
            return;
        }

        if (option.action) {
            const actionHandled = await this.handleContactAction(option);
            if (actionHandled === 'halt') {
                this.setOptionsDisabled(false);
                return;
            }
        }

        if (option.nextId) {
            if (this.getTopicContent(option.nextId)) {
                await this.showTopic(option.nextId, { replaceChat: true });
            } else {
                await this.advanceToStep(option.nextId);
            }
            this.setOptionsDisabled(false);
            return;
        }

        const nonRepeatActions = ['anchor', 'hardlink', 'form', 'email', 'phone', 'whatsapp', 'vdslink', 'gagenrechner', 'briefing_contact', 'open_module_tool'];
        if (option.action && !nonRepeatActions.includes(option.action)) {
            await this.advanceToStep(this.state.currentStepId, { repeatCurrent: true });
        }

        this.setOptionsDisabled(false);
    }

    async advanceToStep(stepId, options = {}) {
        const { repeatCurrent = false, skipStack = false, suppressBotMessage = false } = options;
        this.clearMessageQueue();
        const nextStep = repeatCurrent ? this.logicTree[this.state.currentStepId] : this.logicTree[stepId];
        if (!nextStep) {
            return;
        }
        if (!repeatCurrent && !skipStack && nextStep.id !== this.state.currentStepId) {
            this.pushCurrentViewToNavStack();
        }
        this.state.currentStepId = nextStep.id;
        this.ui.activeTopicKey = null;
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
        button.addEventListener('click', () => this.goBack());
        return button;
    }

    handleBack() {
        this.goBack();
    }

    goBack() {
        this.registerInteraction();
        this.clearTypingState();
        this.clearMessageQueue();
        if (!this.state.navStack.length) {
            this.state.currentStepId = 'start';
            this.ui.activeTopicKey = null;
            saveState(this.state);
            this.renderApp();
            return;
        }
        const nextStack = [...this.state.navStack];
        const previousEntry = this.normalizeNavEntry(nextStack.pop());
        this.state.navStack = nextStack;
        this.incrementFriction('back');
        if (previousEntry.type === 'topic' && previousEntry.key) {
            this.showTopic(previousEntry.key, { replaceChat: true, fromBack: true });
            return;
        }
        this.ui.activeTopicKey = null;
        this.state.currentStepId = previousEntry.type === 'step' && previousEntry.id ? previousEntry.id : 'start';
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

    clearMessageQueue() {
        (this.ui.msgQueueTimers || []).forEach((timerId) => window.clearTimeout(timerId));
        this.ui.msgQueueTimers = [];
        this.ui.msgQueueRunId += 1;
    }

    appendBotMessage(text, { animate = false, queueRunId = null } = {}) {
        if (!text) {
            return;
        }
        if (queueRunId !== null && queueRunId !== this.ui.msgQueueRunId) {
            return;
        }
        this.pushMessage('bot', text);
        saveState(this.state);
        if (!this.messages) {
            this.renderApp();
            return;
        }
        const { row, bubble, bubbleWrap } = this.createMessageRow('bot');
        bubble.innerHTML = this.createCopyMarkup(text);
        if (animate) {
            row.classList.add('sc-msg-appear');
            window.requestAnimationFrame(() => {
                row.classList.add('is-visible');
            });
        }
        const meta = this.createMessageMeta('bot', Date.now());
        bubbleWrap.appendChild(meta);
        this.messages.appendChild(row);
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
            const punctuationPausePattern = /[.,?!]/;
            const step = () => {
                position += 1;
                bubble.textContent = typeText.slice(0, position);
                this.scheduleScrollIntoView(row);
                if (position < typeText.length) {
                    const typedChar = typeText.charAt(position - 1);
                    const baseDelay = 12 + Math.floor(Math.random() * 15);
                    const delay = punctuationPausePattern.test(typedChar) ? baseDelay + 220 : baseDelay;
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
            const avatarWrapper = document.createElement('div');
            avatarWrapper.className = 'sc-avatar-wrapper sc-glow-pulse';
            const avatar = document.createElement('img');
            avatar.className = 'studio-connect-avatar';
            avatar.src = this.avatarUrl;
            avatar.alt = 'Studio Helfer Avatar';
            avatar.loading = 'eager';
            avatar.decoding = 'async';
            avatar.fetchPriority = 'high';
            avatarWrapper.appendChild(avatar);
            row.appendChild(avatarWrapper);
        }
        const bubbleWrap = document.createElement('div');
        bubbleWrap.className = type === 'user' ? 'sc-bubble-wrap sc-bubble-wrap--user' : 'sc-bubble-wrap';
        const bubble = document.createElement('div');
        bubble.className = `studio-connect-bubble ${type}`;
        bubbleWrap.appendChild(bubble);
        row.appendChild(bubbleWrap);
        return { row, bubble, bubbleWrap };
    }

    formatMessageTime(timestamp) {
        const ts = Number(timestamp) || Date.now();
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    createMessageMeta(role, timestamp) {
        const meta = document.createElement('div');
        const isUser = role === 'user';
        meta.className = `sc-msg-meta ${isUser ? 'sc-msg-meta--user' : 'sc-msg-meta--bot'}`;
        meta.textContent = `${isUser ? 'Du' : 'Studi'} · ${this.formatMessageTime(timestamp)}`;
        return meta;
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

    getStepLabel(stepId) {
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
            callback: 'Rückruf gewünscht',
            sa_hub: 'Skript-Analyse Hilfe',
            gr_hub: 'Gagenrechner Hilfe',
            sf_hub: 'Studio-Finder Hilfe',
            sa_quickstart: 'Schnellstart',
            sa_teleprompter: 'Teleprompter',
            sa_pdf: 'PDF Export',
            sa_analyseboxen: 'Analyseboxen erklärt',
            sa_sprechdauer: 'Sprechdauer & Tempo',
            sa_projekte: 'Projekte speichern/laden',
            sa_premium: 'Premium – Überblick',
            gr_projektart: 'Projektart wählen',
            gr_rechte: 'Nutzungsrechte & Buyouts',
            gr_optionen: 'Optionen & Add-ons',
            gr_preisdetails: 'Preisdetails',
            gr_pdf: 'PDF Export',
            gr_reset: 'Zurücksetzen',
            gr_fehler: 'Häufige Fehler',
            sf_suche: 'Suche & Filter',
            sf_karte: 'Karte & Standort',
            sf_premium: 'Premium-Studios',
            sf_studio_hinzufuegen: 'Studio hinzufügen',
            sf_probleme: 'Häufige Probleme',
            gen_prices: 'Preise & Buyouts',
            gen_contact: 'Kontakt'
        };
        return map[stepId] || 'Start';
    }

    updateHeaderLocation(stepId) {
        if (this.headerSubtext) {
            const activeTopic = this.getTopicContent(this.ui.activeTopicKey);
            const locationLabel = activeTopic?.title || this.getStepLabel(stepId);
            this.headerSubtext.textContent = `Du bist hier: ${locationLabel || 'Start'}`;
        }
    }

    getSearchIndex() {
        return [
            { stepId: 'briefing', label: 'Briefing-Check', keywords: ['briefing', 'checkliste', 'fragebogen', 'projektstart'] },
            { stepId: 'demos', label: 'Casting & Demos', keywords: ['demos', 'casting', 'hoerprobe', 'hörprobe', 'samples'] },
            { stepId: 'preise', label: 'Preise & Buyouts', keywords: ['preise', 'buyout', 'kosten', 'budget', 'gage'] },
            { stepId: 'technik', label: 'Technik-Setup', keywords: ['technik', 'studio', 'equipment', 'setup', 'aufnahme'] },
            { stepId: 'ablauf', label: 'Ablauf der Zusammenarbeit', keywords: ['ablauf', 'prozess', 'lieferung', 'timing'] },
            { stepId: 'rechte', label: 'Einsatz & Rechte', keywords: ['rechte', 'nutzung', 'einsatz', 'lizenz', 'buyout'] },
            { stepId: 'kontakt', label: 'Kontakt', keywords: ['kontakt', 'anfragen', 'mail', 'telefon', 'whatsapp'] },
            { stepId: 'callback', label: 'Rückruf gewünscht', keywords: ['rückruf', 'telefon', 'uhrzeit', 'anrufen'] },
            { stepId: 'rechner', label: 'Wort-Rechner', keywords: ['rechner', 'wortanzahl', 'dauer', 'sprechzeit'] }
        ];
    }

    setupHeaderSearch() {
        if (!this.headerActions || this.searchTrigger) {
            return;
        }
        const searchButton = document.createElement('button');
        searchButton.type = 'button';
        searchButton.className = 'studio-connect-close sc-header-icon';
        searchButton.setAttribute('aria-label', 'Stichwortsuche öffnen');
        searchButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"></circle><path d="M16.2 16.2L21 21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>';
        searchButton.addEventListener('click', () => {
            this.registerInteraction();
            this.toggleSearchPopover();
        });
        this.headerActions.insertBefore(searchButton, this.closeButton || null);
        this.searchTrigger = searchButton;

        const popover = document.createElement('div');
        popover.className = 'sc-search-popover';
        popover.setAttribute('aria-hidden', 'true');
        popover.innerHTML = '<input type="search" class="sc-search-popover__input" placeholder="Stichwort eingeben…" aria-label="Stichwortsuche" /><div class="sc-search-popover__results"></div>';
        this.headerActions.appendChild(popover);
        this.searchPopover = popover;
        this.searchInput = popover.querySelector('.sc-search-popover__input');
        this.searchResults = popover.querySelector('.sc-search-popover__results');

        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.renderSearchResults(this.searchInput.value || '');
            });
        }

        if (this.searchResults) {
            this.searchResults.addEventListener('click', async (event) => {
                const target = event.target.closest('[data-step-id]');
                if (!target) {
                    return;
                }
                const stepId = target.dataset.stepId;
                if (!stepId || !this.logicTree[stepId]) {
                    return;
                }
                this.registerInteraction();
                await this.advanceToStep(stepId);
                this.hideSearchPopover();
            });
        }
    }

    toggleSearchPopover() {
        if (this.searchPopoverOpen) {
            this.hideSearchPopover();
            return;
        }
        this.showSearchPopover();
    }

    showSearchPopover() {
        if (!this.searchPopover || !this.searchInput) {
            return;
        }
        this.searchPopoverOpen = true;
        this.searchPopover.classList.add('is-open');
        this.searchPopover.setAttribute('aria-hidden', 'false');
        this.renderSearchResults(this.searchInput.value || '');
        window.setTimeout(() => this.searchInput.focus(), 0);
    }

    hideSearchPopover() {
        if (!this.searchPopover) {
            return;
        }
        this.searchPopoverOpen = false;
        this.searchPopover.classList.remove('is-open');
        this.searchPopover.setAttribute('aria-hidden', 'true');
    }

    renderSearchResults(query) {
        if (!this.searchResults) {
            return;
        }
        const value = (query || '').trim().toLowerCase();
        if (!value) {
            this.searchResults.innerHTML = '<div class="sc-search-popover__empty">Tippe ein Stichwort…</div>';
            return;
        }
        const tokens = value.split(/\s+/).filter(Boolean);
        const items = this.getSearchIndex().filter((item) => {
            const haystack = [item.label, ...(item.keywords || [])].join(' ').toLowerCase();
            return tokens.every((token) => haystack.includes(token));
        });
        if (!items.length) {
            this.searchResults.innerHTML = '<div class="sc-search-popover__empty">Keine Treffer</div>';
            return;
        }
        this.searchResults.innerHTML = items
            .map((item) => `<button type="button" class="sc-search-popover__result" data-step-id="${item.stepId}">${this.escapeHtml(item.label)}</button>`)
            .join('');
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
        if (this.ui.isClosing || !this.panel) {
            return;
        }
        const hasPendingDeepLink = Boolean(this.ui.pendingDeepLinkStepId);
        const hasPendingTopic = Boolean(this.ui.pendingTopicKey);
        this.panel.classList.remove('sc-is-closing');
        this.state.isOpen = true;
        this.hideProactiveBubble();
        this.applyOpenState(true);
        const greeted = (hasPendingDeepLink || hasPendingTopic) ? false : await this.maybeShowGreeting();
        if (!greeted) {
            saveState(this.state);
            this.renderApp();
        }
        this.applyDeepLinkIfAny();
        this.applyPendingTopic();
        window.setTimeout(() => {
            const firstButton = this.panel ? this.panel.querySelector('button') : null;
            if (firstButton) {
                firstButton.focus();
            }
        }, 0);
    }

    async closePanel() {
        if (this.ui.isClosing || !this.panel) {
            return;
        }
        this.hideSearchPopover();
        this.ui.isClosing = true;
        this.panel.classList.add('sc-is-closing');

        await new Promise((resolve) => {
            let done = false;
            const finish = () => {
                if (done) {
                    return;
                }
                done = true;
                this.panel.removeEventListener('transitionend', onTransitionEnd);
                resolve();
            };
            const onTransitionEnd = (event) => {
                if (event.target === this.panel) {
                    finish();
                }
            };
            this.panel.addEventListener('transitionend', onTransitionEnd);
            window.setTimeout(finish, 240);
        });

        this.state.isOpen = false;
        this.applyOpenState(false, true);
        this.panel.classList.remove('sc-is-closing');
        if (this.hideHomeTooltip) {
            this.hideHomeTooltip();
        }
        this.ui.isClosing = false;
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
        this.markPortalInteraction();
        this.unlockLauncherHintSound();
    }

    markPortalInteraction() {
        if (!this.ui?.didYouKnow) {
            return;
        }
        const now = Date.now();
        this.ui.didYouKnow.idleSince = now;
        this.ui.didYouKnow.lastInteractionAt = now;
    }

    unlockLauncherHintSound() {
        if (this.ui.launchSoundUnlocked) {
            return;
        }
        const sound = this.ensureLauncherHintSound();
        if (!sound) {
            return;
        }
        sound.muted = true;
        const playback = sound.play();
        if (playback && typeof playback.then === 'function') {
            playback.then(() => {
                sound.pause();
                sound.currentTime = 0;
                sound.muted = false;
                this.ui.launchSoundUnlocked = true;
                this.ui.soundBlocked = false;
            }).catch(() => {
                sound.muted = false;
                this.ui.soundBlocked = true;
            });
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

    scrollToBottom(smooth = false) {
        if (!this.chatArea) {
            return;
        }
        requestAnimationFrame(() => {
            if (smooth && typeof this.chatArea.scrollTo === 'function') {
                this.chatArea.scrollTo({ top: this.chatArea.scrollHeight, behavior: 'smooth' });
                return;
            }
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
        if (option.topicKey) {
            button.dataset.topicKey = option.topicKey;
        }
        if (option.stepId) {
            button.dataset.stepId = option.stepId;
        }
        if (option.fallbackIds && option.fallbackIds.length) {
            button.dataset.fallbackIds = option.fallbackIds.join('|');
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


    getTopicMeta(topicKey = '') {
        const labelMap = {
            sa: 'Skript-Analyse',
            gr: 'Gagenrechner',
            sf: 'Studio-Finder',
            gen: 'Allgemein'
        };
        const prefix = (topicKey || '').split('_')[0] || 'gen';
        return {
            toolLabel: labelMap[prefix] || 'Allgemein',
            topicLabel: this.getStepLabel(topicKey)
        };
    }

    getRecentTopics() {
        try {
            const raw = sessionStorage.getItem(SC_RECENT_TOPICS_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed.filter((key) => this.getTopicContent(key)).slice(0, 3) : [];
        } catch (error) {
            return [];
        }
    }

    updateRecentTopics(topicKey) {
        if (!topicKey || !this.getTopicContent(topicKey)) {
            return;
        }
        try {
            const current = this.getRecentTopics().filter((item) => item !== topicKey);
            const next = [topicKey, ...current].slice(0, 3);
            sessionStorage.setItem(SC_RECENT_TOPICS_KEY, JSON.stringify(next));
        } catch (error) {
            // Ignore.
        }
    }

    getContextTipConfig(topicKey = '') {
        const content = this.getTopicContent(topicKey);
        const text = ((content?.messages || []).join(' ') || '').toLowerCase();
        if ((topicKey === 'gr_rechte' || topicKey === 'gr_preisdetails') && /(paid|ads|social|meta)/i.test(text)) {
            return { key: 'gr_paid_social', text: 'Tipp: Paid Social → Nutzungsrechte prüfen', topicKey: 'gr_rechte' };
        }
        if (topicKey === 'sa_teleprompter') {
            return { key: 'sa_teleprompter_mode', text: 'Tipp: Studio-Mode nutzen', topicKey: 'sa_teleprompter' };
        }
        if ((topicKey === 'sf_probleme' || topicKey === 'sf_suche') && /(0\s*treffer|filter)/i.test(text)) {
            return { key: 'sf_filter_reduzieren', text: 'Tipp: Filter reduzieren', topicKey: 'sf_suche' };
        }
        return null;
    }

    hasSeenContextTip(tipKey) {
        if (!tipKey) {
            return true;
        }
        try {
            return sessionStorage.getItem(`${SC_CONTEXT_TIPS_SEEN_PREFIX}${tipKey}`) === '1';
        } catch (error) {
            return false;
        }
    }

    markContextTipSeen(tipKey) {
        if (!tipKey) {
            return;
        }
        try {
            sessionStorage.setItem(`${SC_CONTEXT_TIPS_SEEN_PREFIX}${tipKey}`, '1');
        } catch (error) {
            // Ignore.
        }
    }

    maybeShowContextTip(topicKey, { immediate = false } = {}) {
        if (!this.topicHeader || !topicKey) {
            return;
        }
        const tip = this.getContextTipConfig(topicKey);
        if (!tip || this.hasSeenContextTip(tip.key)) {
            return;
        }

        const idleFor = Date.now() - (this.ui.didYouKnow?.idleSince || Date.now());
        if (!immediate && idleFor < 20000) {
            return;
        }

        const container = this.topicHeader.querySelector('.sc-topic-header__tips');
        if (!container) {
            return;
        }
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'sc-chip sc-chip--compact sc-context-tip';
        chip.textContent = tip.text;
        chip.addEventListener('click', () => {
            this.registerInteraction();
            this.showTopic(tip.topicKey, { replaceChat: true });
        });
        container.appendChild(chip);
        this.markContextTipSeen(tip.key);
    }

    renderTopicHeader() {
        if (!this.topicHeader) {
            return;
        }
        this.topicHeader.innerHTML = '';
        this.topicHeader.classList.remove('is-visible');
    }


    renderTopicOptionsIfNeeded() {
        const sourceTopic = this.getTopicContent(this.ui.activeTopicKey);
        const topic = sourceTopic ? this.getRenderableTopic(sourceTopic, this.ui.activeTopicKey) : null;
        if (!topic || !this.dock) {
            return false;
        }
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
                topicKey: button.dataset.topicKey || undefined,
                stepId: button.dataset.stepId || undefined,
                fallbackIds: button.dataset.fallbackIds ? button.dataset.fallbackIds.split('|').filter(Boolean) : undefined,
                target: button.dataset.target || undefined,
                briefingKey: button.dataset.briefingKey || undefined,
                briefingValue: button.dataset.briefingValue || undefined,
                returnToStepId: button.dataset.returnToStepId || undefined
            };
            if (option.topicKey) {
                this.showTopic(option.topicKey, { replaceChat: true });
                return;
            }
            this.handleOption(option);
        });
        this.dock.appendChild(optionsContainer);
        this.options = optionsContainer;
        this.getTopicOptions(topic.options || []).forEach((option) => this.appendOption(option));
        this.applyOptionsDisabled();
        return true;
    }

    async handleContactAction(option) {
        const action = option?.action;
        const target = option?.target || '';
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

        if (action === 'open_module_tool') {
            const links = this.settings.module_links || {};
            const url = links[target] || links[this.pageContext.moduleKey] || '';
            if (url) {
                window.open(url, '_blank', 'noopener');
            }
            return 'halt';
        }

        if (action === 'open_studio_submit_modal') {
            const trigger = this.findStudioSubmitModalTrigger();
            if (trigger) {
                trigger.click();
            }
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
        this.topicHeader = document.getElementById('sc-topic-header');
        this.dock = document.getElementById('sc-dock');
    }

    getChatMessagesEl() {
        if (!this.messages) {
            this.refreshDomReferences();
        }
        return this.messages || null;
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
        if (isOpen) {
            this.startDidYouKnowScheduler();
        } else {
            this.stopDidYouKnowScheduler();
        }
        alignLauncherToSavedButton();
    }

    copyToClipboard(value, message, triggerEl = null) {
        if (!value) {
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(value).then(() => {
                if (message) { this.showToast(message); }
                this.showCopyToast(triggerEl);
            }).catch(() => {
                this.execCopyFallback(value, message, triggerEl);
            });
            return;
        }
        this.execCopyFallback(value, message, triggerEl);
    }

    execCopyFallback(value, message, triggerEl = null) {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        let didCopy = false;
        try {
            didCopy = document.execCommand('copy');
        } catch (error) {
            didCopy = false;
        }
        document.body.removeChild(textarea);
        if (message) { this.showToast(message); }
        this.showCopyToast(triggerEl, didCopy ? 'In Zwischenablage kopiert' : 'Kopieren nicht möglich');
    }

    showCopyToast(anchorEl, text = 'In Zwischenablage kopiert') {
        const existingToast = document.querySelector('.sc-copy-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'sc-copy-toast';
        const message = (text || 'In Zwischenablage kopiert').trim();
        if (message === 'In Zwischenablage kopiert') {
            toast.innerHTML = 'In Zwischenablage kopiert <span class="sc-copy-toast-check">✓</span>';
        } else {
            toast.textContent = message;
        }

        const rect = anchorEl && typeof anchorEl.getBoundingClientRect === 'function'
            ? anchorEl.getBoundingClientRect()
            : null;
        const left = rect ? rect.left + (rect.width / 2) : window.innerWidth / 2;
        const top = rect ? rect.top - 10 : window.innerHeight / 2;

        toast.style.left = `${left}px`;
        toast.style.top = `${top}px`;

        document.body.appendChild(toast);

        window.requestAnimationFrame(() => {
            toast.classList.add('is-visible');
        });

        window.setTimeout(() => {
            toast.classList.remove('is-visible');
            window.setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 180);
        }, 1200);
    }

    async maybeShowGreeting() {
        if (this.ui.skipGreetingOnce) {
            this.ui.skipGreetingOnce = false;
            this.state.flags = { ...this.state.flags, welcomed: true };
            return false;
        }
        if (this.ui.pendingDeepLinkStepId) {
            return false;
        }
        if (this.ui.pendingTopicKey) {
            return false;
        }
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
        options.push({ label: 'Kontakt', userPromptText: 'Kontaktwege anzeigen.', nextId: 'kontakt' });
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
        lines.push('', 'Optional: Ergänze im Kontaktformular weitere Projektinfos.', 'Zusatzinfos: ');
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
            [
                SC_RECENT_STEPS_KEY,
                SC_PROACTIVE_SHOWN_KEY,
                SC_FRICTION_COUNTER_KEY,
                SC_GENERAL_HINT_DONE_KEY,
                `${SC_TOOL_HINT_DONE_PREFIX}skriptanalyse`,
                `${SC_TOOL_HINT_DONE_PREFIX}gagenrechner`,
                `${SC_TOOL_HINT_DONE_PREFIX}studiofinder`
            ].forEach((key) => sessionStorage.removeItem(key));
        } catch (error) {
            // Ignore.
        }
        this.recentSteps = [];
        this.frictionCount = 0;
    }

    initDidYouKnow() {
        const didYouKnow = this.ui.didYouKnow;
        didYouKnow.openSince = Date.now();
        didYouKnow.idleSince = Date.now();
        didYouKnow.lastInteractionAt = Date.now();
        didYouKnow.shownCount = this.loadSessionNumber(SC_DYK_COUNT_KEY);
        didYouKnow.lastHintAt = this.loadSessionNumber(SC_DYK_LAST_KEY);
        try {
            const parsed = JSON.parse(sessionStorage.getItem(SC_DYK_SEEN_IDS_KEY) || '[]');
            didYouKnow.seenIds = Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            didYouKnow.seenIds = [];
        }
    }

    startDidYouKnowScheduler() {
        const didYouKnow = this.ui.didYouKnow;
        if (!didYouKnow) {
            return;
        }
        didYouKnow.openSince = Date.now();
        didYouKnow.idleSince = Date.now();
        didYouKnow.lastInteractionAt = Date.now();
        if (didYouKnow.timerId) {
            window.clearInterval(didYouKnow.timerId);
        }
        didYouKnow.timerId = window.setInterval(() => {
            this.maybeShowDidYouKnow();
        }, DYK_CHECK_INTERVAL_MS);
    }

    stopDidYouKnowScheduler() {
        const didYouKnow = this.ui.didYouKnow;
        if (!didYouKnow || !didYouKnow.timerId) {
            return;
        }
        window.clearInterval(didYouKnow.timerId);
        didYouKnow.timerId = null;
    }

    getDidYouKnowContext() {
        const stepId = this.state?.currentStepId || '';
        const context = this.getPageContext();
        if (stepId.startsWith('sa_') || context.moduleKey === 'skriptanalyse') {
            return 'sa';
        }
        if (stepId.startsWith('gr_') || context.moduleKey === 'gagenrechner') {
            return 'gr';
        }
        if (stepId.startsWith('sf_') || context.moduleKey === 'studiofinder') {
            return 'sf';
        }
        return 'general';
    }

    getDidYouKnowPool(contextKey) {
        return {
            sa: [
                { id: 'sa_teleprompter', text: 'Wusstest Du schon…? Der Teleprompter hilft Dir beim Feinschliff, wenn Du Deinen Text in kurzen Sinnblöcken strukturierst.' },
                { id: 'sa_pdf', text: 'Wusstest Du schon…? Du kannst Analyse-Ergebnisse als PDF sichern und später mit dem Team teilen.' },
                { id: 'sa_tempo', text: 'Wusstest Du schon…? Schon kleine Tempo-Anpassungen verändern die Sprechdauer deutlich – teste 2 Varianten direkt nacheinander.' },
                { id: 'sa_analyseboxen', text: 'Wusstest Du schon…? Die Analyseboxen sind ideal, um Pausen und Betonungen vor der Aufnahme sichtbar zu machen.' }
            ],
            gr: [
                { id: 'gr_rechte', text: 'Wusstest Du schon…? Nutzungsrechte haben oft mehr Einfluss auf den Endpreis als die reine Produktionszeit.' },
                { id: 'gr_laufzeit', text: 'Wusstest Du schon…? Laufzeit und Gebiet sauber zu definieren macht Angebote vergleichbar und fair kalkulierbar.' },
                { id: 'gr_details', text: 'Wusstest Du schon…? In den Preisdetails siehst Du schnell, welche Faktoren den größten Anteil ausmachen.' },
                { id: 'gr_pdf', text: 'Wusstest Du schon…? Mit dem PDF-Export kannst Du den aktuellen Stand direkt intern freigeben lassen.' }
            ],
            sf: [
                { id: 'sf_suche', text: 'Wusstest Du schon…? Mit weniger, aber präzisen Filtern findest Du oft schneller passende Studios.' },
                { id: 'sf_karte', text: 'Wusstest Du schon…? Mit aktivierter Standortfreigabe wird die Nähe-Sortierung deutlich genauer.' },
                { id: 'sf_premium', text: 'Wusstest Du schon…? Premium-Badges helfen bei der Vorauswahl, wenn Du verlässliche Setups priorisieren willst.' },
            ],
            general: [
                { id: 'general_focus', text: 'Wusstest Du schon…? Je genauer Dein Ziel in 1–2 Sätzen beschrieben ist, desto schneller komme ich zum passenden nächsten Schritt.' }
            ]
        }[contextKey] || [];
    }

    maybeShowDidYouKnow() {
        const didYouKnow = this.ui.didYouKnow;
        if (!didYouKnow || !this.isOpen || didYouKnow.isEmitting) {
            return;
        }
        if (this.ui.activeTopicKey) {
            this.maybeShowContextTip(this.ui.activeTopicKey);
        }
        const now = Date.now();
        if ((now - didYouKnow.openSince) < DYK_INITIAL_DELAY_MS) {
            return;
        }
        if ((now - didYouKnow.idleSince) < DYK_IDLE_MS) {
            return;
        }
        if ((now - (didYouKnow.lastInteractionAt || 0)) < DYK_IDLE_MS) {
            return;
        }
        if (this.ui.pendingTopicKey || this.proactiveBubble || this.ui.isTyping) {
            return;
        }
        if (didYouKnow.shownCount >= DYK_MAX_PER_SESSION) {
            return;
        }
        if (didYouKnow.lastHintAt && (now - didYouKnow.lastHintAt) < DYK_MIN_INTERVAL_MS) {
            return;
        }

        const contextKey = this.getDidYouKnowContext();
        const pool = this.getDidYouKnowPool(contextKey);
        if (!pool.length) {
            return;
        }
        const unseen = pool.filter((item) => !didYouKnow.seenIds.includes(item.id));
        const candidates = unseen.length ? unseen : pool;
        const picked = candidates[Math.floor(Math.random() * candidates.length)];
        if (!picked || !picked.text) {
            return;
        }

        didYouKnow.isEmitting = true;
        this.showBotMessage(picked.text, { withTypingDots: false }).then(() => {
            didYouKnow.isEmitting = false;
            didYouKnow.shownCount += 1;
            didYouKnow.lastHintAt = Date.now();
            didYouKnow.idleSince = Date.now();
            didYouKnow.lastInteractionAt = Date.now();
            didYouKnow.seenIds = [...didYouKnow.seenIds, picked.id].slice(-24);
            this.persistSessionNumber(SC_DYK_COUNT_KEY, didYouKnow.shownCount);
            this.persistSessionNumber(SC_DYK_LAST_KEY, didYouKnow.lastHintAt);
            try {
                sessionStorage.setItem(SC_DYK_SEEN_IDS_KEY, JSON.stringify(didYouKnow.seenIds));
            } catch (error) {
                // Ignore.
            }
        }).catch(() => {
            didYouKnow.isEmitting = false;
        });
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
        const rawPath = window.location.pathname || '/';
        const path = this.normalizePath(rawPath);
        const toolMap = {
            '/extras/skript-analyse-fuer-sprecher-und-autoren': 'skriptanalyse',
            '/extras/gagenrechner': 'gagenrechner',
            '/extras/studio-finder': 'studiofinder'
        };
        const contextKey = toolMap[path] || 'general';
        return {
            contextKey,
            moduleKey: contextKey
        };
    }

    normalizePath(path = '/') {
        const normalized = String(path || '/').toLowerCase();
        const trimmed = normalized.replace(/\/+$/, '');
        return trimmed || '/';
    }

    computeGeneralRecencyEligibility() {
        let previousVisitTs = 0;
        const now = Date.now();
        try {
            previousVisitTs = parseInt(localStorage.getItem(SC_LAST_VISIT_TS_KEY) || '0', 10) || 0;
            localStorage.setItem(SC_LAST_VISIT_TS_KEY, String(now));
        } catch (error) {
            return true;
        }
        return !previousVisitTs || (now - previousVisitTs) > SC_GENERAL_HINT_RECENCY_THRESHOLD_MS;
    }

    getToolHintDoneKey(context = this.pageContext) {
        const contextKey = context?.moduleKey || 'general';
        return `${SC_TOOL_HINT_DONE_PREFIX}${contextKey}`;
    }

    markSessionHintDone(context = this.pageContext) {
        const contextKey = context?.moduleKey || 'general';
        try {
            if (contextKey === 'general') {
                sessionStorage.setItem(SC_GENERAL_HINT_DONE_KEY, '1');
            } else if (this.isToolPage(context)) {
                sessionStorage.setItem(this.getToolHintDoneKey(context), '1');
            }
        } catch (error) {
            // Ignore.
        }
    }

    isSessionHintDone(context = this.pageContext) {
        const contextKey = context?.moduleKey || 'general';
        try {
            if (contextKey === 'general') {
                return sessionStorage.getItem(SC_GENERAL_HINT_DONE_KEY) === '1';
            }
            if (this.isToolPage(context)) {
                return sessionStorage.getItem(this.getToolHintDoneKey(context)) === '1';
            }
        } catch (error) {
            return false;
        }
        return false;
    }

    getLauncherHintStorageKey(type = 'shown', context = this.pageContext) {
        const contextKey = context?.moduleKey || 'general';
        const prefix = type === 'dismissed' ? SC_LAUNCHER_HINT_DISMISSED_KEY : SC_LAUNCHER_HINT_SHOWN_KEY;
        return `${prefix}__${contextKey}`;
    }

    createRecentChip(stepId, className = 'sc-chip') {
        if (!this.logicTree[stepId]) {
            return null;
        }
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = className;
        btn.textContent = this.getStepLabel(stepId);
        btn.addEventListener('click', () => this.handleOption({ label: `Zuletzt: ${this.getStepLabel(stepId)}`, userPromptText: `Zurück zu ${this.getStepLabel(stepId)}`, nextId: stepId }));
        return btn;
    }

    renderStartEnhancements() {
        if (!this.dock) {
            return;
        }
        const recentVisible = this.recentSteps
            .slice(0, 3)
            .map((id) => this.createRecentChip(id, 'sc-chip sc-chip--compact'))
            .filter(Boolean);

        if (!recentVisible.length) {
            return;
        }

        const wrap = document.createElement('div');
        wrap.className = 'sc-start-tools';

        const recentRow = document.createElement('div');
        recentRow.className = 'sc-recent-row';
        recentRow.innerHTML = '<span class="sc-recent-label"><i class="fa-regular fa-clock" aria-hidden="true"></i>Zuletzt genutzt</span>';

        const chips = document.createElement('div');
        chips.className = 'sc-chip-wrap';
        recentVisible.forEach((chip) => chips.appendChild(chip));

        recentRow.appendChild(chips);
        wrap.appendChild(recentRow);

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
        const briefing = document.createElement('button');
        briefing.type = 'button';
        briefing.className = 'sc-chip';
        briefing.textContent = '60-Sekunden Briefing';
        briefing.addEventListener('click', () => this.handleOption({ label: 'Briefing starten', userPromptText: 'Ich starte das Briefing.', nextId: 'briefing' }));
        actions.appendChild(briefing);
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

    getProactiveText(context) {
        const copyByContext = {
            skriptanalyse: {
                title: 'Kurze Hilfe zur Skript-Analyse?',
                subtitle: 'Wähle ein Thema – ich zeige Dir den schnellsten Einstieg.'
            },
            gagenrechner: {
                title: 'Hilfe zum Gagenrechner?',
                subtitle: 'Klick ein Thema – ich erkläre Dir die wichtigsten Stellschrauben.'
            },
            studiofinder: {
                title: 'Studio-Finder Hilfe?',
                subtitle: 'Filter, Karte & Tipps – wähle ein Thema für den Schnellstart.'
            },
            general: {
                title: 'Hi! Brauchst Du Hilfe?',
                subtitle: 'Klick – ich führe Dich zu den wichtigsten Infos.'
            }
        };
        const contextKey = copyByContext[context?.moduleKey] ? context.moduleKey : 'general';
        const copy = copyByContext[contextKey];
        return `${copy.title} ${copy.subtitle}`;
    }

    getGreeting() {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 11) {
            return 'Guten Morgen!';
        }
        if (hour >= 11 && hour < 18) {
            return 'Hallo!';
        }
        if (hour >= 18 && hour < 22) {
            return 'Guten Abend!';
        }
        return 'Noch wach?';
    }

    scheduleProactiveBubble() {
        if (this.proactiveTimeout) {
            window.clearTimeout(this.proactiveTimeout);
        }
        if (this.isOpen) {
            return;
        }
        const context = this.getPageContext();
        if (!this.canShowLauncherHint(context)) {
            return;
        }
        const delay = this.isToolPage(context) ? PROACTIVE_DELAY_MS : 0;
        this.proactiveTimeout = window.setTimeout(() => this.showProactiveBubble(), delay);
    }

    isToolPage(context = this.pageContext) {
        return ['gagenrechner', 'studiofinder', 'skriptanalyse'].includes(context?.moduleKey);
    }

    canShowLauncherHint(context = this.pageContext) {
        if (this.isOpen) {
            return false;
        }
        const contextKey = context?.moduleKey || 'general';
        if (contextKey === 'general') {
            if (!this.shouldShowGeneralByRecency) {
                return false;
            }
            return !this.isSessionHintDone(context);
        }
        if (this.isToolPage(context)) {
            return !this.isSessionHintDone(context);
        }
        return false;
    }

    getProactiveSeenKey(context = this.pageContext) {
        const path = (window.location.pathname || '/').replace(/[^a-z0-9/_-]/gi, '_').toLowerCase();
        return `${SC_PROACTIVE_SHOWN_KEY}:${context?.moduleKey || 'general'}:${path}`;
    }

    ensureLauncherHintSound() {
        if (this.ui.launchSound) {
            return this.ui.launchSound;
        }
        try {
            this.ui.launchSound = new Audio(SC_LAUNCHER_HINT_SOUND_URL);
            this.ui.launchSound.preload = 'auto';
            this.ui.launchSound.volume = 0.22;
            this.ui.launchSound.currentTime = 0;
        } catch (error) {
            this.ui.launchSound = null;
        }
        return this.ui.launchSound;
    }

    playLauncherHintSound(isUserTriggered = false) {
        if (this.ui.launchSoundTimer) {
            window.clearTimeout(this.ui.launchSoundTimer);
        }
        this.ui.launchSoundTimer = window.setTimeout(() => {
            try {
                const sound = this.ensureLauncherHintSound();
                if (!sound) {
                    return;
                }
                sound.muted = false;
                sound.volume = 0.22;
                sound.currentTime = 0;
                const playback = sound.play();
                if (playback && typeof playback.catch === 'function') {
                    playback.catch(() => {
                        this.ui.soundBlocked = true;
                    });
                }
                if (isUserTriggered) {
                    this.ui.soundBlocked = false;
                    this.ui.launchSoundRetryDone = true;
                }
            } catch (error) {
                // Ignore autoplay/runtime failures.
            }
        }, 80);
    }

    showProactiveBubble() {
        if (this.isOpen || this.proactiveBubble) {
            return;
        }
        const context = this.getPageContext();
        if (!this.canShowLauncherHint(context)) {
            return;
        }
        const shouldPersist = !this.isToolPage(context);
        if (shouldPersist) {
            try {
                if (sessionStorage.getItem(this.getProactiveSeenKey(context)) === '1') {
                    return;
                }
            } catch (error) {
                // Ignore.
            }
        }

        const proactiveText = this.getProactiveText(context);
        const overlay = document.createElement('div');
        overlay.className = 'sc-proactive-overlay';

        const bubble = document.createElement('div');
        bubble.className = 'sc-proactive-bubble';

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'sc-proactive-close';
        closeButton.setAttribute('aria-label', 'Schließen');
        closeButton.textContent = '×';

        const mainButton = document.createElement('button');
        mainButton.type = 'button';
        mainButton.className = 'sc-proactive-main';

        const avatarWrapper = document.createElement('span');
        avatarWrapper.className = 'sc-avatar-wrapper sc-glow-pulse sc-proactive-avatar-wrap';

        const avatar = document.createElement('img');
        avatar.className = 'studio-connect-avatar';
        avatar.src = this.avatarUrl;
        avatar.alt = 'Studio Assistenz Avatar';
        avatar.loading = 'eager';
        avatar.decoding = 'async';
        avatar.fetchPriority = 'high';
        avatarWrapper.appendChild(avatar);

        const content = document.createElement('span');
        content.className = 'sc-proactive-content';

        const label = document.createElement('span');
        label.className = 'sc-proactive-label';
        label.textContent = 'Studio Assistenz';

        const text = document.createElement('span');
        text.className = 'sc-proactive-text';
        text.textContent = proactiveText;

        content.appendChild(label);
        content.appendChild(text);
        mainButton.appendChild(avatarWrapper);
        mainButton.appendChild(content);
        bubble.appendChild(closeButton);
        bubble.appendChild(mainButton);

        const quickLinks = this.createProactiveQuickLinks(context);
        if (quickLinks) {
            bubble.appendChild(quickLinks);
        }

        mainButton.addEventListener('click', () => {
            this.markSessionHintDone(context);
            this.state.currentStepId = 'start';
            this.renderAndSave();
            window.requestAnimationFrame(() => {
                this.openPanel();
                this.hideProactiveBubble();
            });
            this.persistProactiveShown(context);
        });
        closeButton.addEventListener('click', () => {
            this.markSessionHintDone(context);
            bubble.classList.add('sc-fade-out');
            window.setTimeout(() => this.hideProactiveBubble(), 300);
            this.persistProactiveShown(context);
        });
        document.body.appendChild(overlay);
        document.body.appendChild(bubble);
        requestAnimationFrame(() => bubble.classList.add('is-visible'));
        this.hintOverlay = overlay;
        this.proactiveBubble = bubble;
        this.persistProactiveShown(context);
        if (window.scrollY > 400) {
            bubble.classList.add('is-scrolled-out');
        }
        if (this.launcher) {
            this.launcher.classList.add('is-shaking');
            window.setTimeout(() => this.launcher.classList.remove('is-shaking'), 460);
        }
        this.ui.hintSoundPlayedForThisShow = false;
        if (!this.ui.hintSoundPlayedForThisShow) {
            this.playLauncherHintSound();
            this.ui.hintSoundPlayedForThisShow = true;
        }
    }

    createProactiveQuickLinks(context) {
        const linksByModule = {
            general: [
                { label: 'Preise & Buyouts', topicKey: 'gen_prices' },
                { label: 'Kontakt', topicKey: 'gen_contact' }
            ],
            gagenrechner: [
                { label: 'Nutzungsrechte', topicKey: 'gr_rechte' },
                { label: 'Preisdetails', topicKey: 'gr_preisdetails' }
            ],
            studiofinder: [
                { label: 'Suche & Filter', topicKey: 'sf_suche' },
                { label: 'Karte & Standort', topicKey: 'sf_karte' }
            ],
            skriptanalyse: [
                { label: 'Schnellstart', topicKey: 'sa_quickstart' },
                { label: 'Analyseboxen', topicKey: 'sa_analyseboxen' }
            ]
        };
        const links = linksByModule[context.moduleKey];
        if (!links) {
            return null;
        }
        const wrap = document.createElement('div');
        wrap.className = 'sc-proactive-links';
        links.slice(0, 2).forEach((item) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'sc-proactive-link';
            button.textContent = item.label;
            button.dataset.topic = item.topicKey;
            button.addEventListener('click', () => {
                this.markSessionHintDone(context);
                this.hideProactiveBubble();
                this.openPortalToTopic(item.topicKey);
                this.persistProactiveShown(context);
            });
            wrap.appendChild(button);
        });
        return wrap;
    }

    stepExists(stepId) {
        return Boolean(stepId && this.logicTree[stepId]);
    }

    resolveStepId(preferredStepId, fallbackStepIds = []) {
        const candidates = [preferredStepId, ...fallbackStepIds, 'start'];
        return candidates.find((candidate) => this.stepExists(candidate)) || 'start';
    }

    resolveExistingStep(preferredStepId, fallbackStepIds = []) {
        const candidates = [preferredStepId, ...fallbackStepIds];
        return candidates.find((candidate) => this.stepExists(candidate)) || null;
    }

    getTopicContent(topicKey) {
        if (!topicKey) {
            return null;
        }
        return TOPIC_CONTENT[topicKey] || null;
    }

    getTopicOptions(options = []) {
        return options.filter((option) => {
            if ((option.label || '').trim().toLowerCase() === 'zurück') {
                return false;
            }
            if (option.action) {
                return true;
            }
            if (option.topicKey) {
                return Boolean(this.getTopicContent(option.topicKey));
            }
            if (option.stepId) {
                return Boolean(this.resolveExistingStep(option.stepId, option.fallbackIds || []));
            }
            return false;
        }).map((option) => {
            if (option.stepId) {
                const resolvedStepId = this.resolveExistingStep(option.stepId, option.fallbackIds || []);
                return {
                    ...option,
                    nextId: resolvedStepId || undefined
                };
            }
            return option;
        });
    }

    canOpenStudioSubmitModal() {
        return Boolean(this.findStudioSubmitModalTrigger());
    }

    findStudioSubmitModalTrigger() {
        const candidateNeedles = ['studio eintragen', 'neues studio', 'studio hinzufügen'];
        const candidates = document.querySelectorAll('button, a');
        return Array.from(candidates).find((candidate) => {
            if (!(candidate instanceof HTMLElement)) {
                return false;
            }
            if (candidate.closest('#sc-widget')) {
                return false;
            }
            const text = (candidate.textContent || '').trim().toLowerCase();
            return candidateNeedles.some((needle) => text.includes(needle));
        }) || null;
    }

    getRenderableTopic(topic, topicKey) {
        const nextTopic = {
            ...topic,
            messages: Array.isArray(topic.messages) ? [...topic.messages] : [],
            options: Array.isArray(topic.options) ? [...topic.options] : []
        };

        if (topicKey === 'sf_studio_hinzufuegen' && !this.canOpenStudioSubmitModal()) {
            nextTopic.options = nextTopic.options.filter((option) => option.action !== 'open_studio_submit_modal');
            nextTopic.messages.push('Falls Du den Button nicht siehst: scrolle auf der Seite zum Bereich „Studio eintragen“ und öffne dort das Formular.');
        }

        return nextTopic;
    }

    pushCurrentViewToNavStack() {
        const stack = Array.isArray(this.state.navStack) ? [...this.state.navStack] : [];
        if (this.ui.activeTopicKey) {
            stack.push({ type: 'topic', key: this.ui.activeTopicKey });
        } else if (this.state.currentStepId && this.state.currentStepId !== 'start') {
            stack.push({ type: 'step', id: this.state.currentStepId });
        } else {
            stack.push({ type: 'start' });
        }
        this.state.navStack = stack;
    }

    normalizeNavEntry(entry) {
        if (!entry) {
            return { type: 'start' };
        }
        if (typeof entry === 'string') {
            if (entry === 'start') {
                return { type: 'start' };
            }
            if (this.getTopicContent(entry)) {
                return { type: 'topic', key: entry };
            }
            return { type: 'step', id: entry };
        }
        if (entry.type === 'topic' && typeof entry.key === 'string') {
            return { type: 'topic', key: entry.key };
        }
        if (entry.type === 'step' && typeof entry.id === 'string') {
            return { type: 'step', id: entry.id };
        }
        return { type: 'start' };
    }

    applyDeepLinkIfAny() {
        if (!this.ui.pendingDeepLinkStepId) {
            return false;
        }
        const targetStepId = this.ui.pendingDeepLinkStepId;
        this.ui.pendingDeepLinkStepId = null;
        this.ui.activeTopicKey = null;
        this.state.currentStepId = targetStepId;
        this.state.flags = { ...this.state.flags, welcomed: true };
        this.renderAndSave();
        return true;
    }

    async openPortalToStep(stepId, fallbackStepIds = []) {
        const targetStepId = this.resolveStepId(stepId, fallbackStepIds);
        this.clearMessageQueue();
        this.ui.pendingTopicKey = null;
        this.ui.pendingTopicRetryCount = 0;
        this.ui.activeTopicKey = null;
        this.ui.pendingDeepLinkStepId = targetStepId;
        this.ui.skipGreetingOnce = true;
        if (this.isOpen) {
            this.applyDeepLinkIfAny();
            return;
        }
        await this.openPanel();
        window.queueMicrotask(() => this.applyDeepLinkIfAny());
    }

    clearChatMessages() {
        this.state.history = [];
        this.lastRenderedHistoryLength = 0;
    }

    isOnlyGreetingHistory() {
        const welcomeText = this.logicTree.start?.text || '';
        return this.state.history.length === 1
            && this.state.history[0]?.role === 'bot'
            && this.state.history[0]?.text === welcomeText;
    }

    async showTopic(topicKey, { replaceChat = false, fromBack = false, animateMessages = false, _retry = 0 } = {}) {
        const resolvedTopicKey = this.getTopicContent(topicKey) ? topicKey : 'gen_prices';
        const sourceTopic = this.getTopicContent(resolvedTopicKey);
        const topic = sourceTopic ? this.getRenderableTopic(sourceTopic, resolvedTopicKey) : null;
        if (!topic) {
            return false;
        }
        let chatEl = this.getChatMessagesEl();
        if (!chatEl) {
            this.renderApp();
            if (_retry < 2) {
                return new Promise((resolve) => {
                    window.requestAnimationFrame(async () => {
                        resolve(await this.showTopic(topicKey, { replaceChat, fromBack, animateMessages, _retry: _retry + 1 }));
                    });
                });
            }
            return false;
        }

        this.clearMessageQueue();
        if (!fromBack) {
            this.pushCurrentViewToNavStack();
        }

        this.ui.pendingTopicKey = null;
        this.ui.pendingTopicRetryCount = 0;
        this.ui.skipGreetingOnce = false;
        this.ui.pendingDeepLinkStepId = null;
        this.ui.activeTopicKey = resolvedTopicKey;
        this.updateRecentTopics(resolvedTopicKey);
        this.state.currentStepId = 'start';
        this.state.flags = { ...this.state.flags, welcomed: true };

        if (replaceChat || !this.state.history.length || this.isOnlyGreetingHistory()) {
            this.clearChatMessages();
        }

        const shouldQueueMessages = replaceChat || animateMessages;
        if (shouldQueueMessages) {
            this.renderAndSave();
            const queueRunId = this.ui.msgQueueRunId;
            (topic.messages || []).forEach((message, index) => {
                const timerId = window.setTimeout(() => {
                    if (queueRunId !== this.ui.msgQueueRunId) {
                        return;
                    }
                    this.appendBotMessage(message, { animate: true, queueRunId });
                    this.scrollToBottom(true);
                }, 140 * index);
                this.ui.msgQueueTimers.push(timerId);
            });
            return true;
        }

        (topic.messages || []).forEach((message) => this.pushMessage('bot', message));
        this.renderAndSave();
        this.scrollToBottom();
        return true;
    }

    applyPendingTopic() {
        if (!this.ui.pendingTopicKey) {
            return false;
        }
        const topicKey = this.ui.pendingTopicKey;
        this.showTopic(topicKey, { replaceChat: true });
        return true;
    }

    async openPortalToTopic(topicKey) {
        if (!topicKey) {
            return;
        }
        this.clearMessageQueue();
        this.ui.pendingDeepLinkStepId = null;
        this.ui.pendingTopicKey = topicKey;
        this.ui.pendingTopicRetryCount = 0;
        this.ui.skipGreetingOnce = true;
        if (this.isOpen) {
            window.requestAnimationFrame(() => this.showTopic(topicKey, { replaceChat: true }));
            return;
        }
        await this.openPanel();
        window.requestAnimationFrame(() => this.showTopic(topicKey, { replaceChat: true }));
    }

    hideProactiveBubble() {
        if (this.proactiveBubble && this.proactiveBubble.parentNode) {
            this.proactiveBubble.parentNode.removeChild(this.proactiveBubble);
        }
        if (this.hintOverlay && this.hintOverlay.parentNode) {
            this.hintOverlay.parentNode.removeChild(this.hintOverlay);
        }
        this.hintOverlay = null;
        this.proactiveBubble = null;
        this.ui.hintSoundPlayedForThisShow = false;
    }

    persistProactiveShown(context = this.pageContext) {
        if (this.isToolPage(context)) {
            return;
        }
        try {
            sessionStorage.setItem(this.getProactiveSeenKey(context), '1');
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
    try {
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
    } catch (error) {
        console.error('[StudioConnect] Init fehlgeschlagen.', error);
    }
});

}
