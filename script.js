// VibeCoding - Web Audio Engine
class VibeCodingEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.stems = {
            drums: { buffer: null, source: null, gain: null, enabled: false },
            bass: { buffer: null, source: null, gain: null, enabled: false },
            pad: { buffer: null, source: null, gain: null, enabled: false },
            arp: { buffer: null, source: null, gain: null, enabled: false }
        };
        this.currentKey = 'c';
        this.isPlaying = false;
        this.fadeTime = 2.0; // Seconds for fade in/out
    }

    // Initialize Web Audio Context
    init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);

        // Create gain nodes for each stem
        Object.keys(this.stems).forEach(stemName => {
            this.stems[stemName].gain = this.audioContext.createGain();
            this.stems[stemName].gain.gain.value = 0; // Start silent
            this.stems[stemName].gain.connect(this.masterGain);
        });
    }

    // Load audio file
    async loadAudio(stemName, key) {
        const url = `audio/key-${key}/${stemName}.ogg`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.stems[stemName].buffer = audioBuffer;
            return true;
        } catch (error) {
            console.error(`Error loading ${stemName} for key ${key}:`, error);
            return false;
        }
    }

    // Load all audio for a key
    async loadKey(key) {
        this.currentKey = key;
        updateStatus('Loading audio files...');

        const loadPromises = Object.keys(this.stems).map(stemName =>
            this.loadAudio(stemName, key)
        );

        const results = await Promise.all(loadPromises);
        const allLoaded = results.every(result => result === true);

        if (allLoaded) {
            updateStatus('Ready to play');
            return true;
        } else {
            updateStatus('Error loading some audio files. Check console for details.');
            return false;
        }
    }

    // Start playback for a stem
    playStem(stemName) {
        const stem = this.stems[stemName];

        if (!stem.buffer) {
            console.error(`No buffer loaded for ${stemName}`);
            return;
        }

        // Stop existing source if playing
        if (stem.source) {
            stem.source.stop();
        }

        // Create new source
        stem.source = this.audioContext.createBufferSource();
        stem.source.buffer = stem.buffer;
        stem.source.loop = true;
        stem.source.connect(stem.gain);
        stem.source.start(0);
    }

    // Stop playback for a stem
    stopStem(stemName) {
        const stem = this.stems[stemName];
        if (stem.source) {
            stem.source.stop();
            stem.source = null;
        }
    }

    // Fade in a stem
    fadeIn(stemName, targetVolume = 0.8) {
        const stem = this.stems[stemName];
        const currentTime = this.audioContext.currentTime;

        stem.gain.gain.cancelScheduledValues(currentTime);
        stem.gain.gain.setValueAtTime(stem.gain.gain.value, currentTime);
        stem.gain.gain.linearRampToValueAtTime(targetVolume, currentTime + this.fadeTime);
    }

    // Fade out a stem
    fadeOut(stemName) {
        const stem = this.stems[stemName];
        const currentTime = this.audioContext.currentTime;

        stem.gain.gain.cancelScheduledValues(currentTime);
        stem.gain.gain.setValueAtTime(stem.gain.gain.value, currentTime);
        stem.gain.gain.linearRampToValueAtTime(0, currentTime + this.fadeTime);

        // Stop the source after fade completes
        setTimeout(() => {
            if (!stem.enabled) {
                this.stopStem(stemName);
            }
        }, this.fadeTime * 1000);
    }

    // Toggle a stem on/off
    toggleStem(stemName, enabled) {
        this.stems[stemName].enabled = enabled;

        if (!this.isPlaying) return;

        if (enabled) {
            this.playStem(stemName);
            const volumeSlider = document.getElementById(`${stemName}Volume`);
            const targetVolume = volumeSlider ? parseFloat(volumeSlider.value) : 0.8;
            this.fadeIn(stemName, targetVolume);
        } else {
            this.fadeOut(stemName);
        }
    }

    // Set stem volume
    setStemVolume(stemName, volume) {
        const stem = this.stems[stemName];
        if (stem.enabled && this.isPlaying) {
            const currentTime = this.audioContext.currentTime;
            stem.gain.gain.cancelScheduledValues(currentTime);
            stem.gain.gain.setValueAtTime(stem.gain.gain.value, currentTime);
            stem.gain.gain.linearRampToValueAtTime(volume, currentTime + 0.1);
        }
    }

    // Set master volume
    setMasterVolume(volume) {
        const currentTime = this.audioContext.currentTime;
        this.masterGain.gain.cancelScheduledValues(currentTime);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, currentTime);
        this.masterGain.gain.linearRampToValueAtTime(volume, currentTime + 0.1);
    }

    // Start all enabled stems
    start() {
        if (this.isPlaying) return;

        this.isPlaying = true;

        Object.keys(this.stems).forEach(stemName => {
            const stem = this.stems[stemName];
            if (stem.enabled) {
                this.playStem(stemName);
                const volumeSlider = document.getElementById(`${stemName}Volume`);
                const targetVolume = volumeSlider ? parseFloat(volumeSlider.value) : 0.8;
                this.fadeIn(stemName, targetVolume);
            }
        });

        updateStatus('Playing...');
    }

    // Stop all stems
    stop() {
        if (!this.isPlaying) return;

        this.isPlaying = false;

        Object.keys(this.stems).forEach(stemName => {
            this.fadeOut(stemName);
        });

        updateStatus('Stopped');
    }
}

// Global engine instance
const engine = new VibeCodingEngine();

// UI Helper Functions
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

function updateVolumeDisplay(sliderId, value) {
    const valueSpan = document.querySelector(`#${sliderId}`).nextElementSibling;
    if (valueSpan) {
        valueSpan.textContent = `${Math.round(value * 100)}%`;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Play/Pause Button
    const playPauseBtn = document.getElementById('playPause');
    playPauseBtn.addEventListener('click', async () => {
        if (!engine.audioContext) {
            engine.init();
            await engine.loadKey(engine.currentKey);
        }

        if (!engine.isPlaying) {
            engine.start();
            playPauseBtn.textContent = 'Stop';
            playPauseBtn.classList.add('playing');
        } else {
            engine.stop();
            playPauseBtn.textContent = 'Start';
            playPauseBtn.classList.remove('playing');
        }
    });

    // Key Selector
    const keySelect = document.getElementById('keySelect');
    keySelect.addEventListener('change', async (e) => {
        const wasPlaying = engine.isPlaying;

        if (wasPlaying) {
            engine.stop();
        }

        await engine.loadKey(e.target.value);

        if (wasPlaying) {
            setTimeout(() => {
                engine.start();
            }, engine.fadeTime * 1000);
        }
    });

    // Master Volume
    const masterVolume = document.getElementById('masterVolume');
    const masterVolumeValue = document.getElementById('masterVolumeValue');
    masterVolume.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (engine.audioContext) {
            engine.setMasterVolume(value);
        }
        masterVolumeValue.textContent = `${Math.round(value * 100)}%`;
    });

    // Stem Controls
    document.querySelectorAll('.toggle-stem').forEach(button => {
        const stemName = button.dataset.stem;
        const indicator = document.querySelector(`.stem-indicator[data-stem="${stemName}"]`);

        button.addEventListener('click', () => {
            const isEnabled = !engine.stems[stemName].enabled;
            engine.toggleStem(stemName, isEnabled);

            if (isEnabled) {
                button.textContent = 'On';
                button.classList.add('active');
                if (engine.isPlaying) {
                    indicator.classList.add('playing');
                }
            } else {
                button.textContent = 'Off';
                button.classList.remove('active');
                indicator.classList.remove('playing');
            }
        });
    });

    // Stem Volume Sliders
    document.querySelectorAll('.stem-volume').forEach(slider => {
        const stemName = slider.id.replace('Volume', '');

        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            engine.setStemVolume(stemName, value);
            updateVolumeDisplay(slider.id, value);
        });
    });

    updateStatus('Click Start to begin');
});
