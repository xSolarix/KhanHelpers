// sound-engine.js (Save this on GitHub to replace your current audio.js)
window.p = window.parent || window;
window.p.__audCtx = window.p.__audCtx || new (window.AudioContext || window.webkitAudioContext)();
window.ctx = window.p.__audCtx;
window.isMuted = window.isMuted !== undefined ? window.isMuted : false;

if (!window.Sound) {
    window.Sound = class {
        constructor(cfg) {
            this.b64 = cfg.base64.startsWith("data:") ? cfg.base64 : "data:audio/mpeg;base64," + cfg.base64;
            this.vol = cfg.volume ?? 1;
            this.loop = cfg.loop || false;
            this.ready = false;
            this.playing = false;
            this.gain = window.ctx.createGain();
            this.gain.connect(window.ctx.destination);
        }
        async init() {
            try {
                const cleanB64 = this.b64.replace(/\s/g, ''); 
                const bin = atob(cleanB64.split(",")[1]);
                const len = bin.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = bin.charCodeAt(i);
                }
                this.buf = await window.ctx.decodeAudioData(bytes.buffer);
                this.ready = true;
            } catch (error) {
                console.error("Sound Initialization Failed: Check your Base64 string format.", error);
            }
        }
        play() {
            if (!this.ready || window.isMuted) return;
            if (window.ctx.state === "suspended") window.ctx.resume();
            this.stop();
            this.gain.gain.value = this.vol;
            this.src = window.ctx.createBufferSource();
            this.src.buffer = this.buf;
            this.src.connect(this.gain);
            this.src.loop = this.loop;
            this.src.onended = () => { this.src = null; this.playing = false; };
            this.src.start(0);
            this.playing = true;
        }
        stop() {
            if (this.src) {
                try { this.src.stop(); } catch (e) {}
                this.src = null;
            }
            this.playing = false;
        }
    };
}
