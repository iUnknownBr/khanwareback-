const ver = "V4.0.0";

let device = {
    mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Mobile|Tablet|Kindle|Silk|PlayBook|BB10/i.test(navigator.userAgent),
    apple: /iPhone|iPad|iPod|Macintosh|Mac OS X/i.test(navigator.userAgent)
};

/* User */
// Discaimer: user parameters were managed by the main injector.
// This will not change automatically.
let user = {
    username: "Username",
    nickname: "Nickname",
    UID: 0
}

let loadedPlugins = [];

/* Elements */
const unloader = document.createElement('unloader');
const dropdownMenu = document.createElement('dropDownMenu'); // Changed name for clarity but not functionality
const watermark = document.createElement('watermark');
const statsPanel = document.createElement('statsPanel');
const splashScreen = document.createElement('splashScreen');

/* Globals */
window.features = {
    questionSpoof: true,
    videoSpoof: true,
    showAnswers: false,
    autoAnswer: false,
    customBanner: false,
    nextRecomendation: false,
    repeatQuestion: false,
    minuteFarmer: false,
    rgbLogo: false
};
window.featureConfigs = {
    autoAnswerDelay: 3,
    customUsername: "",
    customPfp: ""
};

/* Misc Styles */
document.head.appendChild(Object.assign(document.createElement("style"),{innerHTML:"@font-face{font-family:'Montserrat';src:url('https://fonts.gstatic.com/s/montserrat/v15/JTURjIg1_i6t8kCHKm45_dJE3gnD-w.ttf')format('truetype')}" }));
document.head.appendChild(Object.assign(document.createElement('style'),{innerHTML:"::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: #f1f1f1; } ::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; } ::-webkit-scrollbar-thumb:hover { background: #555; }"}));
document.querySelector("link[rel~='icon']").href = 'https://i.imgur.com/IHXLnSx.png';

/* Emmiter */
class EventEmitter{constructor(){this.events={}}on(t,e){"string"==typeof t&&(t=[t]),t.forEach(t=>{this.events[t]||(this.events[t]=[]),this.events[t].push(e)})}off(t,e){"string"==typeof t&&(t=[t]),t.forEach(t=>{this.events[t]&&(this.events[t]=this.events[t].filter(t=>t!==e))})}emit(t,...e){this.events[t]&&this.events[t].forEach(t=>{t(...e)})}once(t,e){"string"==typeof t&&(t=[t]);let s=(...i)=>{e(...i),this.off(t,s)};this.on(t,s)}};
const plppdo = new EventEmitter();

new MutationObserver((mutationsList) => { for (let mutation of mutationsList) if (mutation.type === 'childList') plppdo.emit('domChanged'); }).observe(document.body, { childList: true, subtree: true });

/* Misc Functions */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const playAudio = url => { const audio = new Audio(url); audio.play(); };
const checkCollision = (obj1, obj2) => !( obj1.right < obj2.left || obj1.left > obj2.right || obj1.bottom < obj2.top || obj1.top > obj2.bottom );
const findAndClickByClass = className => { const element = document.querySelector(`.${className}`); if (element) { element.click(); sendToast(`⭕ Pressionando ${className}...`, 1000); } }

function sendToast(text, duration=5000, gravity='bottom') { Toastify({ text: text, duration: duration, gravity: gravity, position: "center", stopOnFocus: true, style: { background: "#000000" } }).showToast(); };

async function showSplashScreen() { splashScreen.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background-color:#000;display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;transition:opacity 0.5s ease;user-select:none;color:white;font-family:Montserrat,sans-serif;font-size:30px;text-align:center;"; splashScreen.innerHTML = '<span style="color:white;">KhanDestroyer</span><span style="color:#72ff72;">.SPACE</span>'; document.body.appendChild(splashScreen); setTimeout(() => splashScreen.style.opacity = '1', 10);};
async function hideSplashScreen() { splashScreen.style.opacity = '0'; setTimeout(() => splashScreen.remove(), 1000); };

async function loadScript(url, label) { return fetch(url).then(response => response.text()).then(script => { loadedPlugins.push(label); eval(script); }); }
async function loadCss(url) { return new Promise((resolve) => { const link = document.createElement('link'); link.rel = 'stylesheet'; link.type = 'text/css'; link.href = url; link.onload = () => resolve(); document.head.appendChild(link); }); }

function setupMenu() {
    const setFeatureByPath = (path, value) => { let obj = window; const parts = path.split('.'); while (parts.length > 1) obj = obj[parts.shift()]; obj[parts[0]] = value; }
    function addFeature(features) {
        features.forEach(elements => {
            const feature = document.createElement('feature');
            elements.forEach(attribute => {
                let element = attribute.type === 'nonInput' ? document.createElement('label') : document.createElement('input');
                if (attribute.type === 'nonInput') element.innerHTML = attribute.name;
                else { element.type = attribute.type; element.id = attribute.name; }

                if (attribute.attributes) {
                    attribute.attributes.split(' ').map(attr => attr.split('=')).forEach(([key, value]) => {
                        value = value ? value.replace(/"/g, '') : '';
                        key === 'style' ? element.style.cssText = value : element.setAttribute(key, value);
                    });
                }

                if (attribute.variable) element.setAttribute('setting-data', attribute.variable);
                if (attribute.dependent) element.setAttribute('dependent', attribute.dependent);
                if (attribute.className) element.classList.add(attribute.className);

                if (attribute.labeled) {
                    const label = document.createElement('label');
                    if (attribute.className) label.classList.add(attribute.className);
                    if (attribute.attributes) {
                        attribute.attributes.split(' ').map(attr => attr.split('=')).forEach(([key, value]) => {
                            value = value ? value.replace(/"/g, '') : '';
                            key === 'style' ? label.style.cssText = value : label.setAttribute(key, value);
                        });
                    }
                    label.innerHTML = `${element.outerHTML} ${attribute.label}`;
                    feature.appendChild(label);
                } else {
                    feature.appendChild(element);
                }
            });
            dropdownMenu.appendChild(feature);
        });
    }
    function handleInput(ids, callback = null) {
        (Array.isArray(ids) ? ids.map(id => document.getElementById(id)) : [document.getElementById(ids)])
            .forEach(element => {
                if (!element) return;
                const setting = element.getAttribute('setting-data'),
                    dependent = element.getAttribute('dependent'),
                    handleEvent = (e, value) => {
                        setFeatureByPath(setting, value);
                        if (callback) callback(value, e);
                    };

                if (element.type === 'checkbox') {
                    element.addEventListener('change', (e) => {
                        playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/5os0bypi.wav');
                        handleEvent(e, e.target.checked);
                        if (dependent) dependent.split(',').forEach(dep =>
                            document.querySelectorAll(`.${dep}`).forEach(depEl =>
                                depEl.style.display = e.target.checked ? null : "none"));
                    });
                } else {
                    element.addEventListener('input', (e) => handleEvent(e, e.target.value));
                }
            });
    }
    function setupWatermark() {
        Object.assign(watermark.style, {
            position: 'fixed', top: '0', left: '85%', width: '150px', height: '30px', backgroundColor: 'RGB(0,0,0,0.5)',
            color: 'white', fontSize: '15px', fontFamily: 'Montserrat, sans-serif', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            cursor: 'default', userSelect: 'none', padding: '0 10px',  borderRadius: '10px', zIndex: '1001', transition: 'transform 0.3s ease'
        });
        if (device.mobile) watermark.style.left = '55%'
        watermark.innerHTML = `<span style="text-shadow: -1px 0.5px 0 #72ff72, -2px 0px 0 #2f672e;">kd</span> <span style="color:gray; padding-left:2px; font-family: Arial, sans-serif; font-size:10px">${ver}</span>`;
        document.body.appendChild(watermark);
        let isDragging = false, offsetX, offsetY;
        watermark.addEventListener('mousedown', e => { if (!dropdownMenu.contains(e.target)) { isDragging = true; offsetX = e.clientX - watermark.offsetLeft; offsetY = e.clientY - watermark.offsetTop; watermark.style.transform = 'scale(0.9)'; unloader.style.transform = 'scale(1)'; } });
        watermark.addEventListener('mouseup', () => { isDragging = false; watermark.style.transform = 'scale(1)'; unloader.style.transform = 'scale(0)'; if (checkCollision(watermark.getBoundingClientRect(), unloader.getBoundingClientRect())) unload(); });
        document.addEventListener('mousemove', e => { if (isDragging) { let newX = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - watermark.offsetWidth)); let newY = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - watermark.offsetHeight)); Object.assign(watermark.style, { left: `${newX}px`, top: `${newY}px` }); } });
    }

    // Changed to open a window instead of a dropdown, added close button and title
    function setupWindow() {
        Object.assign(dropdownMenu.style, {
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '350px', height: 'auto', backgroundColor: 'rgba(0,0,0,0.8)',
            borderRadius: '10px', color: 'white', fontSize: '13px', fontFamily: 'Monospace, sans-serif',
            display: 'none', flexDirection: 'column', zIndex: '1001', padding: '10px', cursor: 'default',
            userSelect: 'none', transition: 'opacity 0.3s ease', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', opacity: '0'
        });

        // Add title and close button
        const titleBar = document.createElement('div');
        titleBar.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';
        titleBar.innerHTML = `<h2 style="color: white; margin: 0; font-family: Monospace, sans-serif;"><span style="color: white;">Khan</span><span style="color: #72ff72;">Destroyer</span></h2>
                            <button id="closeButton" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">&times;</button>`;
        dropdownMenu.appendChild(titleBar);

        dropdownMenu.innerHTML += `
            <style>
                input[type="checkbox"] {appearance: none; width: 15px; height: 15px; background-color: #3a3a3b;
                border: 1px solid #acacac; border-radius: 3px; margin-right: 5px; cursor: pointer;}
                input[type="checkbox"]:checked {background-color: #72ff72; border-color: #72ff72;}
                input[type="text"], input[type="number"], input[type="range"] {width: calc(100% - 10px); border: 1px solid #343434;
                    color: white; accent-color: #72ff72; background-color: #72ff72; padding: 3px; border-radius: 3px; background: none;}
                label {display: flex; align-items: center; color: #3a3a3b; padding-top: 3px;}
            </style>
        `;
        document.body.appendChild(dropdownMenu);

        let featuresList = [
            [{ name: 'questionSpoof', type: 'checkbox', variable: 'features.questionSpoof', attributes: 'checked', labeled: true, label: 'Question Exploit' },
                { name: 'videoSpoof', type: 'checkbox', variable: 'features.videoSpoof', attributes: 'checked', labeled: true, label: 'Video Exploit' },
                { name: 'showAnswers', type: 'checkbox', variable: 'features.showAnswers', attributes: 'checked', labeled: true, label: 'Reveal Answer' }],
            [{ name: 'autoAnswer', type: 'checkbox', variable: 'features.autoAnswer', dependent: 'autoAnswerDelay,nextRecomendation,repeatQuestion', labeled: true, label: 'Auto Answer' },
                { name: 'repeatQuestion', className: 'repeatQuestion', type: 'checkbox', variable: 'features.repeatQuestion', attributes: 'style="display:none;"', labeled: true, label: 'Repeat Question' },
                { name: 'nextRecomendation', className: 'nextRecomendation', type: 'checkbox', variable: 'features.nextRecomendation', attributes: 'style="display:none;"', labeled: true, label: 'Recomendations' },
                { name: 'autoAnswerDelay', className: 'autoAnswerDelay', type: 'range', variable: 'featureConfigs.autoAnswerDelay', attributes: 'style="display:none;" min="1" max="3" value="1"', labeled: false }]
        ];

        addFeature(featuresList);
        handleInput(['questionSpoof', 'videoSpoof', 'showAnswers', 'nextRecomendation', 'repeatQuestion']);
        handleInput('autoAnswer', checked => checked && !features.questionSpoof && (document.querySelector('[setting-data="features.questionSpoof"]').checked = features.questionSpoof = true));
        handleInput('autoAnswerDelay', value => value && (featureConfigs.autoAnswerDelay = 4 - value));
        // Close button functionality
        document.getElementById('closeButton').addEventListener('click', () => {
            dropdownMenu.style.opacity = '0';
            setTimeout(() => { dropdownMenu.style.display = 'none'; }, 300);
            playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/rqizlm03.wav');
        });

        watermark.addEventListener('click', () => {
            if (dropdownMenu.style.display === 'none' || dropdownMenu.style.opacity === '0') {
                dropdownMenu.style.display = 'flex';
                dropdownMenu.style.opacity = '1';
                playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/3kd01iyj.wav');
            } else {
                dropdownMenu.style.opacity = '0';
                setTimeout(() => { dropdownMenu.style.display = 'none'; }, 300);
                playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/rqizlm03.wav');
            }
        });
    }
    function loadWidgetBot() {
        if(device.mobile)  return;
        const script = Object.assign(document.createElement('script'), {
            src: 'https://cdn.jsdelivr.net/npm/@widgetbot/crate@3',
            async: true,
            onload: () => {
                const discEmbed = new Crate({ server: '1286573512831533056', channel: '1286573601687867433',
                    location: ['bottom', 'right'], notifications: true, indicator: true, allChannelNotifications: true,
                    defer: false, color: '#000000'
                });
                plppdo.on('domChanged', () => window.location.href.includes("khanacademy.org/profile") ? discEmbed.show() : discEmbed.hide() );
            }
        });
        document.body.appendChild(script);
    }
    setupWatermark(); setupWindow(); loadWidgetBot();
}

/* Main Functions */
function setupMain(){
    function spoofQuestion() {
        const phrases = [ "by iUnknownBR & m4nst3in" ];
        const originalFetch = window.fetch;
        window.fetch = async function (input, init) {
            let body;
            if (input instanceof Request) body = await input.clone().text();
            else if (init && init.body) body = init.body;
            const originalResponse = await originalFetch.apply(this, arguments);
            const clonedResponse = originalResponse.clone();
            try {
                const responseBody = await clonedResponse.text();
                let responseObj = JSON.parse(responseBody);
                if (features.questionSpoof && responseObj?.data?.assessmentItem?.item?.itemData) {
                    let itemData = JSON.parse(responseObj.data.assessmentItem.item.itemData);
                    if(itemData.question.content[0] === itemData.question.content[0].toUpperCase()){
                        itemData.answerArea = { "calculator": false, "chi2Table": false, "periodicTable": false, "tTable": false, "zTable": false }
                        itemData.question.content = phrases[Math.floor(Math.random() * phrases.length)] + `[[☃ radio 1]]`;
                        itemData.question.widgets = { "radio 1": { options: { choices: [ { content: "✅ Resposta correta.", correct: true }, { content: "❎ Resposta incorreta.", correct: false } ] } } };
                        responseObj.data.assessmentItem.item.itemData = JSON.stringify(itemData);
                        sendToast("🔓 Questão exploitada.", 1000);
                        return new Response(JSON.stringify(responseObj), { status: originalResponse.status, statusText: originalResponse.statusText, headers: originalResponse.headers });
                    }
                }
            } catch (e) { }
            return originalResponse;
        };
    }
    function spoofVideo() {
        const originalFetch = window.fetch;
        window.fetch = async function (input, init) {
            let body;
            if (input instanceof Request) body = await input.clone().text();
            else if (init && init.body) body = init.body;
            if (features.videoSpoof && body && body.includes('"operationName":"updateUserVideoProgress"')) {
                try {
                    let bodyObj = JSON.parse(body);
                    if (bodyObj.variables && bodyObj.variables.input) {
                        const durationSeconds = bodyObj.variables.input.durationSeconds;
                        bodyObj.variables.input.secondsWatched = durationSeconds;
                        bodyObj.variables.input.lastSecondWatched = durationSeconds;
                        body = JSON.stringify(bodyObj);
                        if (input instanceof Request) { input = new Request(input, { body: body }); }
                        else init.body = body;
                        sendToast("🔓 Vídeo exploitado.", 1000)
                    }
                } catch (e) { }
            }
            return originalFetch.apply(this, arguments);
        };
    }
    function minuteFarm() {
        const originalFetch = window.fetch;
        window.fetch = async function (input, init = {}) {
            let body;
            if (input instanceof Request) body = await input.clone().text();
            else if (init.body) body = init.body;
            if (features.minuteFarmer && body && input.url.includes("mark_conversions")) {
                try {
                    if (body.includes("termination_event")) { sendToast("🚫 Limitador de tempo bloqueado.", 1000); return; }
                } catch (e) { }
            }
            return originalFetch.apply(this, arguments);
        };
    };
    function spoofUser() {
        plppdo.on('domChanged', () => {
            if(!device.apple){
                const pfpElement = document.querySelector('.avatar-pic');
                const nicknameElement = document.querySelector('.user-deets.editable h2');
                if (nicknameElement) nicknameElement.textContent = featureConfigs.customUsername || user.nickname;
                if (featureConfigs.customPfp && pfpElement) { Object.assign(pfpElement, { src: featureConfigs.customPfp, alt: "Not an image URL"} );pfpElement.style.borderRadius="50%"}
            }
        });
    }
    function answerRevealer() {
        const originalParse = JSON.parse;
        JSON.parse = function (e, t) {
            let body = originalParse(e, t);
            try {
                if (body?.data) {
                    Object.keys(body.data).forEach(key => {
                        const data = body.data[key];
                        if (features.showAnswers && key === "assessmentItem" && data?.item) {
                            const itemData = JSON.parse(data.item.itemData);
                            if (itemData.question && itemData.question.widgets && itemData.question.content[0] === itemData.question.content[0].toUpperCase()) {
                                Object.keys(itemData.question.widgets).forEach(widgetKey => {
                                    const widget = itemData.question.widgets[widgetKey];
                                    if (widget.options && widget.options.choices) {
                                        widget.options.choices.forEach(choice => {
                                            if (choice.correct) {
                                                choice.content = "✅ " + choice.content;
                                                sendToast("🔓 Respostas reveladas.", 1000);
                                            }
                                        });
                                    }
                                });
                                data.item.itemData = JSON.stringify(itemData);
                            }
                        }
                    });
                }
            } catch (e) { }
            return body;
        };
    }
    function rgbLogo() {
        plppdo.on('domChanged', () => {
            const khanLogo = document.querySelector('svg._1rt6g9t').querySelector('path:nth-last-of-type(2)');
            const styleElement = document.createElement('style');
            styleElement.className = "RGBLogo"
            styleElement.textContent = `
                @keyframes colorShift {
                    0% { fill: rgb(255, 0, 0); }
                    33% { fill: rgb(0, 255, 0); }
                    66% { fill: rgb(0, 0, 255); }
                    100% { fill: rgb(255, 0, 0); }
                }   
            `;
            if(features.rgbLogo&&khanLogo){
                if(!document.getElementsByClassName('RGBLogo')[0]) document.head.appendChild(styleElement);
                if(khanLogo.getAttribute('data-darkreader-inline-fill')!=null) khanLogo.removeAttribute('data-darkreader-inline-fill');
                khanLogo.style.animation = 'colorShift 5s infinite';
            }
        })
    }
    function changeBannerText() {
        const phrases = [ "[🌿] Non Skeetless dude.", "[🌿] KhanDestroyer on top.", "[🌿] Nix said hello!", "[🌿] God i wish i had KhanDestroyer.", "[🌿] Get good get KhanDestroyer!", "[🌿] the old KhanDestroyer.space" ];
        setInterval(() => {
            const greeting = document.querySelector('.stp-animated-banner h2');
            if (greeting&&features.customBanner) greeting.textContent = phrases[Math.floor(Math.random() * phrases.length)];
        }, 3000);
    }
    async function autoAnswer() {
        const baseClasses = ["_1r8cd7xe", "_ssxvf9l", "_ek84n5e", "_rz7ls7u", "_1yok8f4", "_1e5cuk2a", "_19uopuu"];
        while (true) {
            if(features.autoAnswer&&features.questionSpoof){
                const classToCheck = [...baseClasses];
                if (features.nextRecomendation) { device.mobile ? classToCheck.push("_ixuggsz") : classToCheck.push("_ek84n5e"); }
                if (features.repeatQuestion) classToCheck.push("_1abyu0ga");
                classToCheck.forEach(async (q) => {
                    findAndClickByClass(q);
                    const element = document.getElementsByClassName(q)[0];
                    if(element&&element.textContent=='Mostrar resumo') { sendToast("🎉 Exercício concluido!", 1000); playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/4x5g14gj.wav'); }
                });
            }
            await delay(featureConfigs.autoAnswerDelay*750);
        }
    }
    spoofQuestion(); spoofVideo(); answerRevealer(); minuteFarm(); spoofUser(); rgbLogo(); changeBannerText(); autoAnswer();
}

/* Inject */
if (!/^https?:\/\/pt\.khanacademy\.org/.test(window.location.href)) { alert("❌ KhanDestroyer Failed to Injected!\n\nVocê precisa executar o KhanDestroyer no site do Khan Academy! (https://pt.khanacademy.org/)"); window.location.href = "https://pt.khanacademy.org/";};

showSplashScreen();

loadScript('https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js', 'darkReaderPlugin')
    .then(()=>{
        DarkReader.setFetchMethod(window.fetch)
        DarkReader.enable();
    })
loadCss('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css', 'toastifyCss');
loadScript('https://cdn.jsdelivr.net/npm/toastify-js', 'toastifyPlugin')
    .then(async () => {
        sendToast("🍃 Khan Destroyer habilitado com sucesso.");
        playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/gcelzszy.wav');
        await delay(500);
        hideSplashScreen();
        setupMenu();
        setupMain();
        console.clear();
    })