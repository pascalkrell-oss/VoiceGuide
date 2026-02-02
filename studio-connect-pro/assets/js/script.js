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
        this.isTyping = false;
        this.isOpen = false;
        this.hasInteraction = false;
        this.soundEngine = new SoundController();
        this.logicTree = this.buildLogicTree();
        this.currentStep = 'start';
        this.restoredFromSession = false;
        this.storageKey = 'sc_chat_state';
        this.skipTyping = false;

        this.restoreState();
        this.refreshDomReferences();
        this.bindEvents();
        this.rebindOptionButtons();
        if (!this.restoredFromSession) {
            this.renderStep('start');
        }
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
            kontakt: this.getStepConfig('kontakt')
        };
    }

    getStepConfig(stepId) {
        switch (stepId) {
            case 'start':
                return {
                    id: 'start',
                    text: 'Moin! Ich bin Dein Studio-Assistent. Womit starten wir?',
                    options: [
                        { label: '🎧 Casting & Demos', nextId: 'demos' },
                        { label: 'Preise & Buyouts', userLabel: 'Preise & Gagen', nextId: 'preise' },
                        { label: 'Technik Check', nextId: 'technik' },
                        { label: '🔄 Ablauf einer Buchung', nextId: 'ablauf' },
                        { label: 'Kontakt', nextId: 'kontakt' }
                    ]
                };
            case 'demos':
                const navLinks = this.settings.nav_links || {};
                return {
                    id: 'demos',
                    text: 'Welche Kategorie interessiert Dich?',
                    options: [
                        { label: 'Werbung', action: 'hardlink', target: navLinks.werbung || '/sprecher-audio-leistungen/werbesprecher/' },
                        { label: 'Webvideo', action: 'hardlink', target: navLinks.webvideo || '/sprecher-audio-leistungen/voiceover-social-media/' },
                        { label: 'Telefonansage', action: 'hardlink', target: navLinks.telefonansage || '/sprecher-audio-leistungen/telefonansagen-warteschleife-mailbox/' },
                        { label: 'Podcast', action: 'hardlink', target: navLinks.podcast || '/sprecher-audio-leistungen/podcast-service-editing-intro-outro-produktion/' },
                        { label: 'Imagefilm', action: 'hardlink', target: navLinks.imagefilm || '/sprecher-audio-leistungen/imagefilm-sprecher/' },
                        { label: 'Erklärvideo', action: 'hardlink', target: navLinks.erklaervideo || '/sprecher-audio-leistungen/erklaervideo-sprecher/' },
                        { label: 'E-Learning', action: 'hardlink', target: navLinks.elearning || '/sprecher-audio-leistungen/e-learning-sprecher/' }
                    ]
                };
            case 'preise':
                return {
                    id: 'preise',
                    text: 'Ich arbeite transparent nach Industriestandard (VDS). Für genaue Kalkulationen nutze bitte mein Online-Tool.',
                    options: [
                        { label: '📄 VDS Gagenliste', action: 'vdslink' },
                        { label: '🧮 Zum Gagenrechner', action: 'gagenrechner' },
                        { label: 'Wort-Rechner', nextId: 'rechner' },
                        { label: '💬 Direkt anfragen', nextId: 'kontakt' }
                    ]
                };
            case 'technik':
                return {
                    id: 'technik',
                    text: 'Profi-Setup für Broadcast-Qualität: Neumann TLM 102 Mikrofon, RME Babyface Pro Interface & High-End Akustikkabine. DAW: Logic Pro X auf Mac Studio.',
                    options: [
                        { label: 'SessionLinkPRO', action: 'form' },
                        { label: 'SourceConnect Now', action: 'form' },
                        { label: 'Test-File anfordern', action: 'form' },
                        { label: 'Kontakt', nextId: 'kontakt' },
                        { label: 'Zurück', nextId: 'start' }
                    ]
                };
            case 'ablauf':
                return {
                    id: 'ablauf',
                    text: 'So läuft eine Buchung bei mir ab:\n\n1. Anfrage & Skript-Check\n2. Angebot & Bestätigung\n3. Aufnahme (meist innerhalb 24h)\n4. Datenlieferung & Abnahme\n5. Rechnung & Nutzungslizenz\n\nTimeline: Vom Erstkontakt bis zur Lieferung meist in 24–48 Stunden (Express möglich).',
                    options: [
                        { label: '⚡ Jetzt Projekt anfragen', action: 'form' },
                        { label: 'Zurück', nextId: 'start' }
                    ]
                };
            case 'rechner':
                return {
                    id: 'rechner',
                    text: 'Wort-Rechner aktiviert. Gib die Wortanzahl ein.',
                    action: 'calculator',
                    options: [
                        { label: 'Kontakt', nextId: 'kontakt' },
                        { label: 'Zurück', nextId: 'start' }
                    ]
                };
            case 'kontakt':
                return {
                    id: 'kontakt',
                    text: 'Wie möchtest Du mich kontaktieren?',
                    options: []
                };
            default:
                return {
                    id: 'start',
                    text: 'Moin! Ich bin Dein Studio-Assistent. Womit starten wir?',
                    options: [
                        { label: '🎧 Casting & Demos', nextId: 'demos' },
                        { label: 'Preise & Buyouts', userLabel: 'Preise & Gagen', nextId: 'preise' },
                        { label: 'Technik Check', nextId: 'technik' },
                        { label: '🔄 Ablauf einer Buchung', nextId: 'ablauf' },
                        { label: 'Kontakt', nextId: 'kontakt' }
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

        if (this.wordsInput) {
            this.wordsInput.addEventListener('input', () => this.updateCalculator());
        }

        if (this.calculatorCta) {
            this.calculatorCta.addEventListener('click', () => {
                this.registerInteraction();
                this.handleContactAction('form');
            });
        }

        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.registerInteraction();
                this.closePanel();
            });
        }

        if (this.messages) {
            this.messages.addEventListener('click', (event) => {
                const target = event.target.closest('[data-copy]');
                const actionTarget = event.target.closest('[data-action]');
                if (actionTarget) {
                    this.registerInteraction();
                    const action = actionTarget.dataset.action;
                    if (action) {
                        this.handleContactAction(action);
                    }
                    return;
                }
                if (!target) {
                    return;
                }
                this.registerInteraction();
                const value = target.dataset.copy || '';
                if (!value) {
                    return;
                }
                this.handleUtilityAction('copy', value);
            });
        }

        window.addEventListener('beforeunload', () => this.persistState());
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.persistState();
            }
        });
    }

    async renderStep(stepId) {
        const step = this.logicTree[stepId];
        if (!step) {
            return;
        }

        this.currentStep = stepId;
        this.updateHeaderSubtext(stepId);
        this.ensureOptionsContainer();
        this.options.classList.add('is-disabled');
        await this.createBubble(step.text, 'bot');
        if (stepId === 'kontakt') {
            this.createContactBubble();
        }
        this.replaceOptions();

        this.calculator.classList.remove('is-visible');
        this.calculator.setAttribute('aria-hidden', 'true');
        this.result.textContent = '';
        this.wordsInput.value = '';

        if (step.action === 'calculator') {
            this.calculator.classList.add('is-visible');
            this.calculator.setAttribute('aria-hidden', 'false');
        }

        step.options.forEach((option) => this.appendOption(option));
        this.persistState();
    }

    async handleOption(option) {
        if (this.isTyping) {
            return;
        }
        this.registerInteraction();
        this.soundEngine.play('click');
        this.replaceOptions();
        const label = option.userLabel || option.label;
        this.createBubble(label, 'user');

        if (option.action === 'anchor' && option.target) {
            this.triggerAnchor(option.target);
        }

        if (option.action === 'hardlink' && option.target) {
            window.location.href = option.target;
            return;
        }

        if (option.action) {
            this.handleContactAction(option.action);
        }

        if (option.nextId) {
            this.renderStep(option.nextId);
            return;
        }

        if (option.action) {
            this.renderStep(this.currentStep);
        }
    }

    createBubble(text, type) {
        const { row, bubble } = this.createMessageRow(type);
        this.messages.appendChild(row);
        this.scrollToBottom();
        if (type === 'bot') {
            if (this.skipTyping) {
                bubble.innerHTML = this.createCopyMarkup(text);
                bubble.dataset.typed = 'true';
                this.skipTyping = false;
                this.persistState();
                return Promise.resolve();
            }
            this.soundEngine.play('msg_in');
            return this.typeWriter(bubble, text);
        }
        bubble.textContent = text;
        this.persistState();
        return Promise.resolve();
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
            this.result.textContent = '';
            return;
        }

        const totalSeconds = Math.round((words / 130) * 60);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const paddedSeconds = String(seconds).padStart(2, '0');
        this.result.textContent = `⏱ Ca. ${minutes}:${paddedSeconds} Min bei moderatem Sprechtempo.`;
    }

    typeWriter(bubble, text) {
        if (bubble.dataset.typed === 'true') {
            bubble.innerHTML = this.createCopyMarkup(text);
            this.persistState();
            return Promise.resolve();
        }
        this.isTyping = true;
        bubble.textContent = '';
        return new Promise((resolve) => {
            let index = 0;
            const typingRow = this.createMessageRow('bot');
            typingRow.bubble.classList.add('studio-connect-typing');
            typingRow.bubble.textContent = '...';
            this.messages.appendChild(typingRow.row);
            this.scrollToBottom();
            const timer = setInterval(() => {
                bubble.textContent += text.charAt(index);
                index += 1;
                this.scrollToBottom();
                if (index >= text.length) {
                    clearInterval(timer);
                    typingRow.row.remove();
                    this.isTyping = false;
                    bubble.classList.remove('studio-connect-typing');
                    bubble.innerHTML = this.createCopyMarkup(text);
                    bubble.dataset.typed = 'true';
                    this.persistState();
                    resolve();
                }
            }, 15);
        });
    }

    createContactBubble() {
        const { row: messageRow, bubble } = this.createMessageRow('bot');
        const label = document.createElement('div');
        label.textContent = 'Wie möchtest Du mich kontaktieren?';
        bubble.appendChild(label);

        const copyRow = document.createElement('div');
        copyRow.className = 'studio-connect-copy-row';

        const formBtn = document.createElement('button');
        formBtn.type = 'button';
        formBtn.className = 'studio-connect-copy';
        formBtn.dataset.action = 'form';
        formBtn.textContent = '📝 Formular';
        copyRow.appendChild(formBtn);

        const emailBtn = document.createElement('button');
        emailBtn.type = 'button';
        emailBtn.className = 'studio-connect-copy';
        emailBtn.textContent = 'E-Mail kopieren';
        if (this.settings.email) {
            emailBtn.dataset.copy = this.settings.email;
        } else {
            emailBtn.disabled = true;
        }
        copyRow.appendChild(emailBtn);

        const phoneBtn = document.createElement('button');
        phoneBtn.type = 'button';
        phoneBtn.className = 'studio-connect-copy';
        phoneBtn.textContent = 'Telefon kopieren';
        if (this.settings.phone) {
            phoneBtn.dataset.copy = this.settings.phone;
        } else {
            phoneBtn.disabled = true;
        }
        copyRow.appendChild(phoneBtn);

        bubble.appendChild(copyRow);

        if (!this.settings.email && !this.settings.phone) {
            const fallback = document.createElement('div');
            fallback.textContent = 'Bitte E-Mail und Telefon im Backend hinterlegen.';
            bubble.appendChild(fallback);
        }

        bubble.dataset.typed = 'true';
        this.messages.appendChild(messageRow);
        this.scrollToBottom();
        this.soundEngine.play('msg_in');
        this.persistState();
    }

    updateHeaderSubtext(stepId) {
        const map = {
            start: 'Hilfe-System und Tipps',
            demos: 'Casting & Demos',
            preise: 'Preise & Gagen',
            technik: 'Technik Check',
            kontakt: 'Kontakt',
            rechner: 'Wort-Rechner',
            ablauf: 'Ablauf einer Buchung'
        };
        if (this.headerSubtext && map[stepId]) {
            this.headerSubtext.textContent = map[stepId];
        }
    }

    openPanel() {
        this.applyOpenState(true);
        this.persistState();
    }

    closePanel() {
        this.applyOpenState(false, true);
        this.persistState();
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

    createCopyMarkup(text) {
        const escaped = this.escapeHtml(text);
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const phoneRegex = /(\+?\d[\d\s().-]{6,}\d)/g;
        let withEmails = escaped.replace(/\n/g, '<br>');
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

    replaceOptions() {
        if (!this.options) {
            return;
        }
        this.options.innerHTML = '';
        this.options.classList.remove('is-disabled');
        this.persistState();
    }

    ensureOptionsContainer() {
        if (!this.options) {
            this.options = document.getElementById('studio-connect-options');
        }
    }

    appendOption(option) {
        if (!this.options) {
            return;
        }
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'studio-connect-option-btn';
        button.textContent = option.label;
        button.addEventListener('click', () => this.handleOption(option));
        button.dataset.label = option.label;
        if (option.userLabel) {
            button.dataset.userLabel = option.userLabel;
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
        this.options.appendChild(button);
    }

    handleContactAction(action) {
        if (action === 'email') {
            if (this.settings.email) {
                window.location.href = `mailto:${this.settings.email}`;
                return true;
            }
            this.createBubble('Bitte eine E-Mail-Adresse im Backend hinterlegen.', 'bot');
            return true;
        }

        if (action === 'phone') {
            if (this.settings.phone) {
                window.location.href = `tel:${this.settings.phone}`;
                return true;
            }
            this.createBubble('Bitte eine Telefonnummer im Backend hinterlegen.', 'bot');
            return true;
        }

        if (action === 'whatsapp') {
            const phone = this.settings.whatsapp || '';
            const digits = phone.replace(/\D/g, '');
            if (digits) {
                window.open(`https://wa.me/${encodeURIComponent(digits)}`, '_blank', 'noopener');
            } else {
                this.createBubble('Bitte eine WhatsApp-Nummer im Backend hinterlegen.', 'bot');
            }
            return true;
        }

        if (action === 'vdslink') {
            if (this.settings.vdsLink) {
                window.open(this.settings.vdsLink, '_blank', 'noopener');
            } else {
                this.createBubble('Kein VDS-Link hinterlegt. Bitte im Backend ergänzen.', 'bot');
            }
            return true;
        }

        if (action === 'gagenrechner') {
            if (this.settings.gagenrechnerLink) {
                window.open(this.settings.gagenrechnerLink, '_blank', 'noopener');
            } else {
                this.createBubble('Kein Gagenrechner-Link hinterlegt. Bitte im Backend ergänzen.', 'bot');
            }
            return true;
        }

        if (action === 'form') {
            const baseUrl = (this.settings.siteUrl || '/').replace(/\/$/, '');
            window.location.href = `${baseUrl}/kontakt/`;
            return true;
        }

        return false;
    }

    updateLauncherState() {
        if (!this.launcherIcon) {
            return;
        }
        if (this.isOpen) {
            this.launcherIcon.classList.remove('fa-question');
            this.launcherIcon.classList.add('fa-times');
        } else {
            this.launcherIcon.classList.remove('fa-times');
            this.launcherIcon.classList.add('fa-question');
        }
    }

    resetConversation() {
        if (this.messages) {
            this.messages.innerHTML = '';
        }
        this.replaceOptions();
        this.calculator.classList.remove('is-visible');
        this.calculator.setAttribute('aria-hidden', 'true');
        this.result.textContent = '';
        this.wordsInput.value = '';
        this.clearState();
        this.renderStep('start');
    }

    refreshDomReferences() {
        this.messages = document.getElementById('studio-connect-messages');
        this.options = document.getElementById('studio-connect-options');
        this.chatArea = document.getElementById('studio-connect-chat-area');
        this.calculator = document.getElementById('studio-connect-calculator');
        this.wordsInput = document.getElementById('studio-connect-words');
        this.result = document.getElementById('studio-connect-result');
        this.calculatorCta = document.getElementById('studio-connect-calculator-cta');
        this.body = document.getElementById('sc-body');
        this.dock = document.getElementById('sc-dock');
    }

    rebindOptionButtons() {
        if (!this.options) {
            return;
        }
        const buttons = this.options.querySelectorAll('.studio-connect-option-btn');
        buttons.forEach((button) => {
            const option = {
                label: button.dataset.label || button.textContent,
                userLabel: button.dataset.userLabel || undefined,
                nextId: button.dataset.nextId || undefined,
                action: button.dataset.action || undefined,
                target: button.dataset.target || undefined
            };
            button.addEventListener('click', () => this.handleOption(option));
        });
    }

    applyOpenState(isOpen, silent = false) {
        this.widget.classList.toggle('is-open', isOpen);
        this.panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        this.isOpen = isOpen;
        this.updateLauncherState();
        if (!silent && isOpen) {
            this.soundEngine.play('open');
        }
    }

    persistState() {
        if (!this.body || !this.dock || this.isTyping) {
            return;
        }
        const state = {
            bodyHtml: this.body.innerHTML,
            dockHtml: this.dock.innerHTML,
            isOpen: this.isOpen,
            currentStep: this.currentStep
        };
        try {
            sessionStorage.setItem(this.storageKey, JSON.stringify(state));
        } catch (error) {
            // Fallback: Kein Storage verfügbar.
        }
    }

    restoreState() {
        if (!this.body || !this.dock) {
            return;
        }
        const rawState = sessionStorage.getItem(this.storageKey);
        if (!rawState) {
            return;
        }
        try {
            const state = JSON.parse(rawState);
            if (state.bodyHtml) {
                this.body.innerHTML = state.bodyHtml;
            }
            if (state.dockHtml) {
                const dock = this.body.querySelector('#sc-dock');
                if (dock) {
                    dock.innerHTML = state.dockHtml;
                }
            }
            this.currentStep = state.currentStep || 'start';
            this.applyOpenState(Boolean(state.isOpen), true);
            this.updateHeaderSubtext(this.currentStep);
            this.restoredFromSession = true;
            this.skipTyping = true;
        } catch (error) {
            this.clearState();
        }
    }

    clearState() {
        try {
            sessionStorage.removeItem(this.storageKey);
        } catch (error) {
            // Ignorieren.
        }
    }

    handleUtilityAction(action, value) {
        switch (action) {
            case 'copy':
                if (!value) {
                    return false;
                }
                navigator.clipboard.writeText(value).then(() => {
                    this.showToast('Kopiert');
                }).catch(() => {
                    this.showToast('Kopiert');
                });
                return true;
            default:
                return false;
        }
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

document.addEventListener('click', (event) => {
    const resetTarget = event.target.closest('#sc-reset');
    if (!resetTarget) {
        return;
    }
    event.preventDefault();
    try {
        sessionStorage.clear();
    } catch (error) {
        // Ignorieren.
    }
    window.location.reload();
});

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
});
