const p = window.parent || window;
p.__audCtx = p.__audCtx || new (window.AudioContext || window.webkitAudioContext)();
const ctx = p.__audCtx;
let isMuted = false;

class Sound {
    constructor(cfg) {
        this.b64 = cfg.base64.startsWith("data:") ? cfg.base64 : "data:audio/mpeg;base64," + cfg.base64;
        this.vol = cfg.volume ?? 1;
        this.loop = cfg.loop || false;
        this.ready = false;
        this.playing = false;
        this.gain = ctx.createGain();
        this.gain.connect(ctx.destination);
    }
    async init() {
        const bin = atob(this.b64.split(",")[1]);
        const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
        this.buf = await ctx.decodeAudioData(bytes.buffer);
        this.ready = true;
    }
    play() {
        if (!this.ready || isMuted) return;
        if (ctx.state === "suspended") ctx.resume();
        this.stop();
        this.gain.gain.value = this.vol;
        this.src = ctx.createBufferSource();
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
}
