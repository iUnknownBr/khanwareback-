const ver = "V4.0.1";

// Utility class for safer event handling
class SafeEventEmitter {
    constructor() {
        this.events = new Map();
    }

    on(events, callback) {
        if (typeof events === 'string') events = [events];
        events.forEach(event => {
            if (!this.events.has(event)) {
                this.events.set(event, new Set());
            }
            this.events.get(event).add(callback);
        });
    }

    off(events, callback) {
        if (typeof events === 'string') events = [events];
        events.forEach(event => {
            if (this.events.has(event)) {
                this.events.get(event).delete(callback);
            }
        });
    }

    emit(event, ...args) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in event ${event}:`, error);
                }
            });
        }
    }
}

// Device detection using feature detection
const device = {
    mobile: () => window.matchMedia("(max-width: 768px)").matches,
    apple: () => /Mac|iPad|iPhone|iPod/.test(navigator.platform),
    touchDevice: () => 'ontouchstart' in window
};

// Feature management
const featureManager = {
    features: {
        questionSpoof: true,
        videoSpoof: true,
        showAnswers: false,
        autoAnswer: false,
        customBanner: false,
        nextRecommendation: false,
        repeatQuestion: false,
        minuteFarmer: false,
        rgbLogo: false
    },
    configs: {
        autoAnswerDelay: 3,
        customUsername: "",
        customPfp: ""
    },
    setFeature(path, value) {
        const parts = path.split('.');
        let obj = this;
        while (parts.length > 1) {
            obj = obj[parts.shift()];
        }
        obj[parts[0]] = value;
    }
};

// Toast notifications
class ToastManager {
    static async showToast(message, duration = 5000) {
        if (typeof Toastify === 'undefined') {
            console.error('Toastify not loaded');
            return;
        }

        Toastify({
            text: message,
            duration: duration,
            gravity: "bottom",
            position: "center",
            stopOnFocus: true,
            style: { background: "#000000" }
        }).showToast();
    }
}

// UI Elements Management
class UIManager {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.elements = {};
    }

    createWatermark() {
        const watermark = document.createElement('div');
        Object.assign(watermark.style, {
            position: 'fixed',
            top: '0',
            left: device.mobile() ? '55%' : '85%',
            width: '150px',
            height: '30px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            fontSize: '15px',
            fontFamily: 'Montserrat, sans-serif',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'default',
            userSelect: 'none',
            padding: '0 10px',
            borderRadius: '10px',
            zIndex: '1001',
            transition: 'transform 0.3s ease'
        });

        watermark.innerHTML = `
            <span style="text-shadow: -1px 0.5px 0 #72ff72, -2px 0px 0 #2f672e;">kd</span>
            <span style="color:gray; padding-left:2px; font-family: Arial, sans-serif; font-size:10px">${ver}</span>
        `;

        this.setupDraggable(watermark);
        this.elements.watermark = watermark;
        document.body.appendChild(watermark);
        return watermark;
    }

    createOptionsMenu() {
        const menu = document.createElement('div');
        Object.assign(menu.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '400px',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            borderRadius: '10px',
            zIndex: '1001',
            padding: '20px',
            display: 'none',
            flexDirection: 'column',
            overflowY: 'auto'
        });

        menu.innerHTML = this.createOptionsMenuContent();
        this.setupOptionsHandlers(menu);
        this.elements.optionsMenu = menu;
        document.body.appendChild(menu);
        return menu;
    }

    setupDraggable(element) {
        let isDragging = false;
        let offset = { x: 0, y: 0 };

        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            offset.x = e.clientX - element.offsetLeft;
            offset.y = e.clientY - element.offsetTop;
            element.style.transform = 'scale(0.9)';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const x = Math.max(0, Math.min(e.clientX - offset.x, window.innerWidth - element.offsetWidth));
            const y = Math.max(0, Math.min(e.clientY - offset.y, window.innerHeight - element.offsetHeight));

            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            element.style.transform = 'scale(1)';
        });
    }

    createOptionsMenuContent() {
        return `
            <style>
                input[type="checkbox"] {
                    appearance: none;
                    width: 15px;
                    height: 15px;
                    background-color: #3a3a3b;
                    border: 1px solid #acacac;
                    border-radius: 3px;
                    margin-right: 5px;
                    cursor: pointer;
                }
                input[type="checkbox"]:checked {
                    background-color: #540b8a;
                    border-color: #720fb8;
                }
                label {
                    display: flex;
                    align-items: center;
                    color: #3a3a3b;
                    padding-top: 3px;
                }
            </style>
            <div class="options-content">
                <!-- Features -->
                <div class="feature-group">
                    <label>
                        <input type="checkbox" id="questionSpoof" ${featureManager.features.questionSpoof ? 'checked' : ''}>
                        Question Spoof
                    </label>
                    <label>
                        <input type="checkbox" id="videoSpoof" ${featureManager.features.videoSpoof ? 'checked' : ''}>
                        Video Spoof
                    </label>
                    <!-- Add other features -->
                </div>
                <button id="closeOptions" style="margin-top: 20px; padding: 10px; background: #540b8a; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;
    }

    setupOptionsHandlers(menu) {
        // Setup checkbox handlers
        menu.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                featureManager.setFeature(`features.${e.target.id}`, e.target.checked);
                this.playToggleSound();
            });
        });

        // Close button handler
        menu.querySelector('#closeOptions').addEventListener('click', () => {
            menu.style.display = 'none';
        });
    }

    async playToggleSound() {
        try {
            const audio = new Audio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/5os0bypi.wav');
            await audio.play();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }
}

// Feature implementations
class FeatureImplementation {
    static setupQuestionSpoof() {
        const originalFetch = window.fetch;
        window.fetch = async function(input, init) {
            try {
                if (!featureManager.features.questionSpoof) {
                    return originalFetch.apply(this, arguments);
                }

                const response = await originalFetch.apply(this, arguments);
                const clone = response.clone();
                const text = await clone.text();

                try {
                    const data = JSON.parse(text);
                    if (data?.data?.assessmentItem?.item?.itemData) {
                        // Modify question data
                        const itemData = JSON.parse(data.data.assessmentItem.item.itemData);
                        if (itemData.question.content[0] === itemData.question.content[0].toUpperCase()) {
                            itemData.question.content = "by iUnknownBR & m4nst3in [[☃ radio 1]]";
                            itemData.question.widgets = {
                                "radio 1": {
                                    options: {
                                        choices: [
                                            { content: "✅ Resposta correta.", correct: true },
                                            { content: "❎ Resposta incorreta.", correct: false }
                                        ]
                                    }
                                }
                            };
                            data.data.assessmentItem.item.itemData = JSON.stringify(itemData);
                            ToastManager.showToast("🔓 Questão exploitada.", 1000);
                            return new Response(JSON.stringify(data), response);
                        }
                    }
                } catch (e) {
                    console.error('Error processing question:', e);
                }

                return response;
            } catch (error) {
                console.error('Fetch error:', error);
                return originalFetch.apply(this, arguments);
            }
        };
    }

    static setupVideoSpoof() {
        const originalFetch = window.fetch;
        window.fetch = async function(input, init) {
            try {
                if (!featureManager.features.videoSpoof) {
                    return originalFetch.apply(this, arguments);
                }

                let body = init?.body;
                if (body && body.includes('"operationName":"updateUserVideoProgress"')) {
                    const bodyObj = JSON.parse(body);
                    if (bodyObj.variables?.input) {
                        const duration = bodyObj.variables.input.durationSeconds;
                        bodyObj.variables.input.secondsWatched = duration;
                        bodyObj.variables.input.lastSecondWatched = duration;
                        init.body = JSON.stringify(bodyObj);
                        ToastManager.showToast("🔓 Vídeo exploitado.", 1000);
                    }
                }

                return originalFetch.apply(this, [input, init]);
            } catch (error) {
                console.error('Video spoof error:', error);
                return originalFetch.apply(this, arguments);
            }
        };
    }

    // Add other feature implementations here
}

// Main application class
class KhanDestroyer {
    constructor() {
        this.eventEmitter = new SafeEventEmitter();
        this.uiManager = new UIManager(this.eventEmitter);
    }

    async initialize() {
        if (!this.checkValidDomain()) {
            this.redirectToKhan();
            return;
        }

        await this.loadDependencies();
        this.setupUI();
        this.setupFeatures();
        await ToastManager.showToast("🍃 Khan Destroyer habilitado com sucesso.");
    }

    checkValidDomain() {
        return /^https?:\/\/pt\.khanacademy\.org/.test(window.location.href);
    }

    redirectToKhan() {
        alert("❌ KhanDestroyer Failed to Inject!\n\nVocê precisa executar o KhanDestroyer no site do Khan Academy!");
        window.location.href = "https://pt.khanacademy.org/";
    }

    async loadDependencies() {
        // Load required CSS and JS files
        await Promise.all([
            this.loadScript('https://cdn.jsdelivr.net/npm/toastify-js'),
            this.loadStyle('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css')
        ]);
    }

    async loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async loadStyle(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    setupUI() {
        this.uiManager.createWatermark();
        this.uiManager.createOptionsMenu();
    }

    setupFeatures() {
        FeatureImplementation.setupQuestionSpoof();
        FeatureImplementation.setupVideoSpoof();
        // Setup other features
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new KhanDestroyer();
    app.initialize().catch(console.error);
});

// Export for global access if needed
window.KhanDestroyer = KhanDestroyer;