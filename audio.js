window.p = window.parent || window;
window.p.__audCtx = window.p.__audCtx || new (window.AudioContext || window.webkitAudioContext)();
window.ctx = window.p.__audCtx;

window.p.__masterGain = window.p.__masterGain || window.ctx.createGain();
window.p.__masterGain.connect(window.ctx.destination);

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
            this.gain.connect(window.p.__masterGain);
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
            this.src.onended = () => {
                this.src = null;
                this.playing = false;
            };
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

if (!window.Synth) {
    window.Synth = class {
        constructor(cfg = {}) {
            // Options: 'sine', 'square', 'sawtooth', 'triangle'
            this.type = cfg.type || 'sine'; 
            this.vol = cfg.volume ?? 0.5;

            this.notes = {
                'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
                'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
                'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
                'G5': 783.99, 'A5': 880.00, 'B5': 987.77, 'C6': 1046.50
            };
        }

        playNote(noteOrFreq, duration = 0.3) {
            if (window.isMuted) return;
            if (window.ctx.state === "suspended") window.ctx.resume();

            let frequency = typeof noteOrFreq === 'number' ? noteOrFreq : this.notes[noteOrFreq];
            if (!frequency) {
                console.warn(`Note "${noteOrFreq}" not found in dictionary. Try passing a raw frequency number.`);
                return;
            }

            const osc = window.ctx.createOscillator();
            const gainNode = window.ctx.createGain();

            osc.connect(gainNode);
            gainNode.connect(window.p.__masterGain);

            osc.type = this.type;
            osc.frequency.value = frequency;

            const now = window.ctx.currentTime;
            
            // Linear Envelope: prevents clicking sounds at the beginning and end of notes
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(this.vol, now + 0.02); // Quick fade-in (attack)
            gainNode.gain.setValueAtTime(this.vol, now + duration - 0.05);
            gainNode.gain.linearRampToValueAtTime(0, now + duration); // Quick fade-out (release)

            osc.start(now);
            osc.stop(now + duration);
        }
    };
}

window.setKAVolume = function(volumeValue) {
    window.p.__masterGain.gain.setValueAtTime(volumeValue, window.ctx.currentTime);
};

window.toggleKAMute = function() {
    window.isMuted = !window.isMuted;
    window.setKAVolume(window.isMuted ? 0 : 1);
    return window.isMuted;
};
