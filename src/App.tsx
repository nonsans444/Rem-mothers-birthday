/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Heart,
  Sparkles,
  RotateCcw,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Printer,
  Calendar,
  Share2,
  Check,
  BookOpen,
  X,
  Flame,
  ChevronRight,
  ChevronLeft,
  Wind,
  Music,
  Gift,
} from 'lucide-react';

// Strict Color Palette Tokens (Pink, Grey, Black only)
const CONFETTI_PALETTE = [
  '#FF5C8A', // Signature pink
  '#F8C8D8', // Blush pink
  '#F28DAE', // Soft rose
  '#C2185B', // Deep rose
  '#D9D9DE', // Light grey
  '#B5B5BC', // Mid grey
  '#6B6B73', // Graphite
  '#1E1E22', // Dark slate
];

// Traditional Polish Birthday Song ("Sto lat, sto lat, niech żyje, żyje nam!")
interface MusicNote {
  time: number; // in beats
  duration: number; // in beats
  pitch: number; // Hz
  vol?: number;
  isBass?: boolean;
}

const C3 = 130.81, E3 = 164.81, F3 = 174.61, G3 = 196.00, A3 = 220.00, B3 = 246.94;
const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;

const STO_LAT_SCORE: MusicNote[] = [
  // Measure 1: "Sto lat"
  { time: 0, duration: 0.9, pitch: G4, vol: 0.22 },
  { time: 1, duration: 1.8, pitch: E4, vol: 0.25 },
  { time: 0, duration: 1.5, pitch: C3, vol: 0.14, isBass: true },
  { time: 1, duration: 0.7, pitch: G3, vol: 0.08 },
  { time: 1, duration: 0.7, pitch: C4, vol: 0.08 },
  { time: 2, duration: 0.7, pitch: G3, vol: 0.08 },
  { time: 2, duration: 0.7, pitch: C4, vol: 0.08 },

  // Measure 2: "sto lat"
  { time: 3, duration: 0.9, pitch: G4, vol: 0.22 },
  { time: 4, duration: 1.8, pitch: E4, vol: 0.25 },
  { time: 3, duration: 1.5, pitch: C3, vol: 0.14, isBass: true },
  { time: 4, duration: 0.7, pitch: G3, vol: 0.08 },
  { time: 4, duration: 0.7, pitch: C4, vol: 0.08 },
  { time: 5, duration: 0.7, pitch: G3, vol: 0.08 },
  { time: 5, duration: 0.7, pitch: C4, vol: 0.08 },

  // Measure 3: "niech ży-je"
  { time: 6, duration: 0.45, pitch: G4, vol: 0.2 },
  { time: 6.5, duration: 0.45, pitch: A4, vol: 0.22 },
  { time: 7, duration: 0.9, pitch: G4, vol: 0.22 },
  { time: 8, duration: 0.9, pitch: F4, vol: 0.2 },
  { time: 6, duration: 1.5, pitch: G3, vol: 0.14, isBass: true },
  { time: 7, duration: 0.7, pitch: D4, vol: 0.08 },
  { time: 8, duration: 0.7, pitch: D4, vol: 0.08 },

  // Measure 4: "ży-je nam!"
  { time: 9, duration: 0.9, pitch: E4, vol: 0.2 },
  { time: 10, duration: 1.8, pitch: D4, vol: 0.24 },
  { time: 9, duration: 1.5, pitch: G3, vol: 0.14, isBass: true },
  { time: 10, duration: 0.7, pitch: B3, vol: 0.08 },
  { time: 11, duration: 0.7, pitch: B3, vol: 0.08 },

  // Measure 5: "Sto lat"
  { time: 12, duration: 0.9, pitch: F4, vol: 0.22 },
  { time: 13, duration: 1.8, pitch: D4, vol: 0.25 },
  { time: 12, duration: 1.5, pitch: G3, vol: 0.14, isBass: true },
  { time: 13, duration: 0.7, pitch: B3, vol: 0.08 },
  { time: 14, duration: 0.7, pitch: B3, vol: 0.08 },

  // Measure 6: "sto lat"
  { time: 15, duration: 0.9, pitch: F4, vol: 0.22 },
  { time: 16, duration: 1.8, pitch: D4, vol: 0.25 },
  { time: 15, duration: 1.5, pitch: G3, vol: 0.14, isBass: true },
  { time: 16, duration: 0.7, pitch: B3, vol: 0.08 },
  { time: 17, duration: 0.7, pitch: B3, vol: 0.08 },

  // Measure 7: "niech ży-je"
  { time: 18, duration: 0.45, pitch: F4, vol: 0.2 },
  { time: 18.5, duration: 0.45, pitch: G4, vol: 0.22 },
  { time: 19, duration: 0.9, pitch: F4, vol: 0.22 },
  { time: 20, duration: 0.9, pitch: E4, vol: 0.2 },
  { time: 18, duration: 1.5, pitch: C3, vol: 0.14, isBass: true },
  { time: 19, duration: 0.7, pitch: C4, vol: 0.08 },
  { time: 20, duration: 0.7, pitch: C4, vol: 0.08 },

  // Measure 8: "ży-je nam!"
  { time: 21, duration: 0.9, pitch: D4, vol: 0.2 },
  { time: 22, duration: 1.8, pitch: C4, vol: 0.26 },
  { time: 21, duration: 1.5, pitch: C3, vol: 0.14, isBass: true },
  { time: 22, duration: 0.7, pitch: E4, vol: 0.08 },
  { time: 23, duration: 0.7, pitch: E4, vol: 0.08 },

  // Measure 9: "Jesz-cze raz"
  { time: 24, duration: 0.9, pitch: G4, vol: 0.22 },
  { time: 25, duration: 1.8, pitch: E4, vol: 0.25 },
  { time: 24, duration: 1.5, pitch: C3, vol: 0.14, isBass: true },
  { time: 25, duration: 0.7, pitch: G3, vol: 0.08 },
  { time: 26, duration: 0.7, pitch: G3, vol: 0.08 },

  // Measure 10: "jesz-cze raz"
  { time: 27, duration: 0.9, pitch: G4, vol: 0.22 },
  { time: 28, duration: 1.8, pitch: E4, vol: 0.25 },
  { time: 27, duration: 1.5, pitch: C3, vol: 0.14, isBass: true },
  { time: 28, duration: 0.7, pitch: G3, vol: 0.08 },
  { time: 29, duration: 0.7, pitch: G3, vol: 0.08 },

  // Measure 11: "niech ży-je"
  { time: 30, duration: 0.45, pitch: G4, vol: 0.2 },
  { time: 30.5, duration: 0.45, pitch: A4, vol: 0.22 },
  { time: 31, duration: 0.9, pitch: G4, vol: 0.22 },
  { time: 32, duration: 0.9, pitch: F4, vol: 0.2 },
  { time: 30, duration: 1.5, pitch: F3, vol: 0.14, isBass: true },
  { time: 31, duration: 0.7, pitch: A3, vol: 0.08 },
  { time: 32, duration: 0.7, pitch: A3, vol: 0.08 },

  // Measure 12: "ży-je nam!"
  { time: 33, duration: 0.9, pitch: E4, vol: 0.2 },
  { time: 34, duration: 1.8, pitch: D4, vol: 0.24 },
  { time: 33, duration: 1.5, pitch: G3, vol: 0.14, isBass: true },
  { time: 34, duration: 0.7, pitch: B3, vol: 0.08 },
  { time: 35, duration: 0.7, pitch: B3, vol: 0.08 },

  // Measure 13: "niech ży-je"
  { time: 36, duration: 0.9, pitch: G4, vol: 0.22 },
  { time: 37, duration: 0.9, pitch: A4, vol: 0.24 },
  { time: 38, duration: 0.9, pitch: B4, vol: 0.25 },
  { time: 36, duration: 1.5, pitch: F3, vol: 0.14, isBass: true },
  { time: 37, duration: 0.7, pitch: G3, vol: 0.12, isBass: true },
  { time: 38, duration: 0.7, pitch: G3, vol: 0.12, isBass: true },

  // Measure 14: "NAM!"
  { time: 39, duration: 2.8, pitch: C5, vol: 0.3 },
  { time: 39, duration: 2.5, pitch: C3, vol: 0.18, isBass: true },
  { time: 40, duration: 0.9, pitch: E4, vol: 0.1 },
  { time: 40, duration: 0.9, pitch: G4, vol: 0.1 },
  { time: 41, duration: 0.9, pitch: E4, vol: 0.1 },
  { time: 41, duration: 0.9, pitch: G4, vol: 0.1 },

  // Measure 15 & 16: Bell flourish & ring
  { time: 42, duration: 0.6, pitch: C4, vol: 0.14 },
  { time: 43, duration: 0.6, pitch: E4, vol: 0.16 },
  { time: 44, duration: 0.6, pitch: G4, vol: 0.18 },
  { time: 45, duration: 2.2, pitch: C5, vol: 0.24 },
  { time: 46, duration: 2.5, pitch: E5, vol: 0.18 },
];

class AudioService {
  private ctx: AudioContext | null = null;
  private isStoLatPlaying = false;
  private stoLatTimer: number | null = null;
  private activeOscs: OscillatorNode[] = [];
  private stoLatGain: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft page turn rustle sound
  playPageTurn() {
    try {
      this.init();
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.12;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch {
      // Ignored
    }
  }

  // Cool, magical cinematic sound when extinguishing the candle:
  // Natural breath whoosh + celestial descending crystal chime cascade + deep warm sub-bass resonance + sparkle flutter
  playExtinguish() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Natural breath whoosh (bandpassed filtered white noise sweeping down)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.5);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.28;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(520, now);
      filter.frequency.exponentialRampToValueAtTime(70, now + 0.45);

      const whooshGain = this.ctx.createGain();
      whooshGain.gain.setValueAtTime(0.42, now);
      whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      noise.connect(filter);
      filter.connect(whooshGain);
      whooshGain.connect(this.ctx.destination);
      noise.start(now);

      // 2. Sparkling celestial chime cascade (fairy dust / wishing crystal notes)
      const shimmerNotes = [2093.0, 1760.0, 1396.91, 1046.5, 880.0, 659.25, 523.25]; // C7, A6, F6, C6, A5, E5, C5
      shimmerNotes.forEach((freq, idx) => {
        const noteTime = now + 0.06 + idx * 0.05;
        const osc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        noteGain.gain.setValueAtTime(0.0001, noteTime);
        noteGain.gain.linearRampToValueAtTime(0.18, noteTime + 0.005);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.5);

        osc.connect(noteGain);
        noteGain.connect(this.ctx!.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.55);
      });

      // 3. Cinematic warm resonant sub-harmonic bell (wishing aura / intimate dusk transition)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(110.0, now + 0.12); // A2 deep warm chord
      subOsc.frequency.exponentialRampToValueAtTime(55.0, now + 1.4);

      subGain.gain.setValueAtTime(0.0001, now + 0.12);
      subGain.gain.linearRampToValueAtTime(0.28, now + 0.2);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now + 0.12);
      subOsc.stop(now + 1.55);
    } catch {
      // Ignored
    }
  }

  // Gentle crystal chime for illuminated letter
  playLetterChime(index: number) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freqs = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const freq = freqs[index % freqs.length];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.9);
    } catch {
      // Ignored
    }
  }

  // Magical celebratory chime
  playMagicalChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      chord.forEach((freq, idx) => {
        setTimeout(() => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 1.25);
        }, idx * 110);
      });
    } catch {
      // Ignored
    }
  }

  // Play traditional Polish accordion reed note with warm bellows tremolo
  private playAccordionReed(freq: number, startAt: number, duration: number, volume = 0.12) {
    if (!this.ctx) return;
    const now = startAt;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    // Warm low-pass filter to simulate acoustic accordion reed
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, now);
    filter.Q.setValueAtTime(1.6, now);

    // Bellows LFO vibrato
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(4.8, now);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(2.2, now);
    lfo.connect(osc.frequency);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.04);
    gain.gain.setValueAtTime(volume * 0.9, now + Math.max(duration - 0.04, 0.08));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    if (this.stoLatGain) {
      gain.connect(this.stoLatGain);
    } else {
      gain.connect(this.ctx.destination);
    }

    osc.start(now);
    lfo.start(now);
    const stopTime = now + duration + 0.08;
    osc.stop(stopTime);
    lfo.stop(stopTime);
    this.activeOscs.push(osc);
  }

  // Play an acoustic music-box celesta bell note
  private playBellNote(freq: number, startAt: number, duration: number, volume = 0.2, isBass = false) {
    if (!this.ctx) return;
    const now = startAt;

    // Fundamental
    const osc1 = this.ctx.createOscillator();
    osc1.type = isBass ? 'triangle' : 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Shimmer overtone (2nd harmonic)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.002, now);

    // Sparkle (3rd harmonic)
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3.004, now);

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(volume, now + 0.008);
    noteGain.gain.exponentialRampToValueAtTime(volume * 0.45, now + 0.18);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(duration, 0.65));

    const overtoneGain = this.ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.linearRampToValueAtTime(volume * 0.25, now + 0.008);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.7);

    const sparkleGain = this.ctx.createGain();
    sparkleGain.gain.setValueAtTime(0.0001, now);
    sparkleGain.gain.linearRampToValueAtTime(volume * 0.08, now + 0.006);
    sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.4);

    osc1.connect(noteGain);
    osc2.connect(overtoneGain);
    osc3.connect(sparkleGain);

    if (this.stoLatGain) {
      noteGain.connect(this.stoLatGain);
      overtoneGain.connect(this.stoLatGain);
      sparkleGain.connect(this.stoLatGain);
    } else {
      noteGain.connect(this.ctx.destination);
      overtoneGain.connect(this.ctx.destination);
      sparkleGain.connect(this.ctx.destination);
    }

    const stopTime = now + Math.max(duration, 0.65) + 0.05;
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(stopTime);
    osc2.stop(stopTime);
    osc3.stop(stopTime);

    this.activeOscs.push(osc1, osc2, osc3);
  }

  // Play full score of Polish "Sto lat, sto lat, niech żyje nam!"
  // Celesta bells + accordion accompaniment in 3/4 waltz rhythm
  private scheduleStoLatRound() {
    if (!this.ctx || !this.isStoLatPlaying) return;
    const beatSec = 0.52; // ~115 BPM 3/4 celebratory waltz tempo
    const startTime = this.ctx.currentTime + 0.05;

    STO_LAT_SCORE.forEach((note) => {
      const noteStart = startTime + note.time * beatSec;
      const noteDur = note.duration * beatSec;
      this.playBellNote(note.pitch, noteStart, noteDur, note.vol || 0.2, !!note.isBass);

      // Add warm Polish accordion reed accompaniment to melody notes
      if (!note.isBass) {
        this.playAccordionReed(note.pitch, noteStart, noteDur, (note.vol || 0.2) * 0.48);
      }
    });

    const totalRoundDurationMs = 48 * beatSec * 1000 + 400; // ~25.3 seconds

    this.stoLatTimer = window.setTimeout(() => {
      if (this.isStoLatPlaying) {
        this.scheduleStoLatRound();
      }
    }, totalRoundDurationMs);
  }

  // Triumphant Finale ("Niech ży-je NAM!") played when candles & letters finish
  playStoLatFinale() {
    try {
      this.init();
      if (!this.ctx) return;
      const beatSec = 0.48;
      const now = this.ctx.currentTime + 0.05;

      // "Niech ży-je..."
      this.playBellNote(G4, now, beatSec * 0.9, 0.24);
      this.playBellNote(A4, now + beatSec, beatSec * 0.9, 0.26);
      this.playBellNote(B4, now + beatSec * 2, beatSec * 0.9, 0.28);
      // "...NAM!"
      this.playBellNote(C5, now + beatSec * 3, beatSec * 3.2, 0.35);
      this.playBellNote(C3, now + beatSec * 3, beatSec * 3.0, 0.2, true);
      this.playBellNote(E4, now + beatSec * 3.5, beatSec * 1.5, 0.15);
      this.playBellNote(G4, now + beatSec * 3.5, beatSec * 1.5, 0.15);
      this.playBellNote(E5, now + beatSec * 4.2, beatSec * 2.0, 0.22);
    } catch {
      // Ignored
    }
  }

  // Toggle Polish Traditional Birthday Music ("Sto lat")
  toggleStoLat(enable: boolean) {
    try {
      this.init();
      if (!this.ctx) return;

      if (enable && !this.isStoLatPlaying) {
        this.isStoLatPlaying = true;
        this.stoLatGain = this.ctx.createGain();
        this.stoLatGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        this.stoLatGain.gain.linearRampToValueAtTime(0.85, this.ctx.currentTime + 1.2);
        this.stoLatGain.connect(this.ctx.destination);

        this.scheduleStoLatRound();
      } else if (!enable && this.isStoLatPlaying) {
        this.isStoLatPlaying = false;
        if (this.stoLatTimer) {
          clearTimeout(this.stoLatTimer);
          this.stoLatTimer = null;
        }
        if (this.stoLatGain) {
          this.stoLatGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
          setTimeout(() => {
            this.activeOscs.forEach((o) => {
              try {
                o.stop();
              } catch {}
            });
            this.activeOscs = [];
            this.stoLatGain = null;
          }, 650);
        }
      }
    } catch {
      // Ignored
    }
  }
}

const audio = new AudioService();

export default function App() {
  // Theme state: dark (black-and-pink) by default
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kamila_theme') === 'light';
    }
    return false;
  });

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Book physical state:
  // isBookOpen: controls whether the book spread is open
  // isCoverSwinging: controls the 3D rotating cover animation
  const [isBookOpen, setIsBookOpen] = useState<boolean>(false);
  const [isCoverSwinging, setIsCoverSwinging] = useState<boolean>(false);

  // Candle & Light state:
  // isCandleLit: true while the candle burns. Touching candle sets to false (turns off the light).
  const [isCandleLit, setIsCandleLit] = useState<boolean>(true);
  
  // Sequential reveal of letters K-A-M-I-L-A
  const [revealedLettersCount, setRevealedLettersCount] = useState<number>(0);
  const [isLetterSequenceFinished, setIsLetterSequenceFinished] = useState<boolean>(false);

  // Current Chapter inside the book (0: Candle & K-A-M-I-L-A, 1: Seriale & Sceny, 2: List od Amelie & Napisy)
  const [currentChapter, setCurrentChapter] = useState<number>(0);

  // Share tooltip
  const [showShareToast, setShowShareToast] = useState<boolean>(false);

  // Canvas ref for confetti
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas ref for subtle slow-rising floating pink hearts
  const heartsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spawnHeartBurstRef = useRef<(() => void) | null>(null);

  // Sync theme to root class
  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('kamila_theme', 'light');
    } else {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('kamila_theme', 'dark');
    }
  }, [isLightMode]);

  // Subtle slow-rising pink hearts particle loop when book spread is open
  useEffect(() => {
    if (!isBookOpen) return;
    const canvas = heartsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const HEART_COLORS = ['#FF5C8A', '#F8C8D8', '#F28DAE', '#C2185B'];

    interface FloatingHeart {
      x: number;
      y: number;
      size: number;
      color: string;
      speedY: number;
      speedX: number;
      wobbleSpeed: number;
      wobbleAmp: number;
      wobbleOffset: number;
      alpha: number;
      maxAlpha: number;
      rotation: number;
      rotSpeed: number;
    }

    const hearts: FloatingHeart[] = [];

    const createHeart = (customY?: number): FloatingHeart => ({
      x: Math.random() * (width - 40) + 20,
      y: customY !== undefined ? customY : height + 15,
      size: Math.random() * 10 + 9,
      color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      speedY: Math.random() * 0.45 + 0.35,
      speedX: (Math.random() - 0.5) * 0.25,
      wobbleSpeed: Math.random() * 0.025 + 0.015,
      wobbleAmp: Math.random() * 1.6 + 0.6,
      wobbleOffset: Math.random() * Math.PI * 2,
      alpha: 0,
      maxAlpha: Math.random() * 0.45 + 0.25,
      rotation: (Math.random() - 0.5) * 0.35,
      rotSpeed: (Math.random() - 0.5) * 0.008,
    });

    // Populate initial gentle floating hearts
    for (let i = 0; i < 18; i++) {
      hearts.push(createHeart(height - Math.random() * (height * 0.85)));
    }

    // Register burst spawner for interactive buttons
    spawnHeartBurstRef.current = () => {
      for (let i = 0; i < 16; i++) {
        hearts.push({
          x: width / 2 + (Math.random() - 0.5) * (width * 0.6),
          y: height - Math.random() * (height * 0.4),
          size: Math.random() * 14 + 10,
          color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
          speedY: Math.random() * 0.8 + 0.5,
          speedX: (Math.random() - 0.5) * 0.6,
          wobbleSpeed: Math.random() * 0.03 + 0.02,
          wobbleAmp: Math.random() * 2 + 1,
          wobbleOffset: Math.random() * Math.PI * 2,
          alpha: 0.1,
          maxAlpha: Math.random() * 0.55 + 0.35,
          rotation: (Math.random() - 0.5) * 0.4,
          rotSpeed: (Math.random() - 0.5) * 0.015,
        });
      }
    };

    let timer = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      timer++;
      // Spawn new slow-rising hearts periodically from bottom of book spread
      if (timer % 24 === 0 && hearts.length < 32) {
        hearts.push(createHeart());
      }

      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.wobbleOffset += h.wobbleSpeed;
        h.x += Math.sin(h.wobbleOffset) * h.wobbleAmp + h.speedX;
        h.y -= h.speedY;
        h.rotation += h.rotSpeed;

        // Smooth fade-in near bottom and fade-out near top of the spread
        if (h.y > height * 0.75) {
          h.alpha = Math.min(h.maxAlpha, h.alpha + 0.015);
        } else if (h.y < height * 0.28) {
          h.alpha = Math.max(0, h.alpha - 0.007);
        } else {
          h.alpha = h.maxAlpha;
        }

        // Draw classic romantic smooth heart shape
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rotation);
        ctx.globalAlpha = Math.max(0, Math.min(1, h.alpha));
        ctx.fillStyle = h.color;

        const s = h.size;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.28);
        ctx.bezierCurveTo(-s * 0.5, -s * 0.38, -s, s * 0.22, 0, s);
        ctx.bezierCurveTo(s, s * 0.22, s * 0.5, -s * 0.38, 0, s * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Cull when ascended above book
        if (h.y < -30 || (h.y < height * 0.28 && h.alpha <= 0)) {
          hearts.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isBookOpen]);

  // Handle traditional Polish birthday song ("Sto lat") toggle
  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    audio.toggleStoLat(nextState);
  };

  // Birthday Countdown calculation for 18 October
  const birthdayInfo = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let bday = new Date(currentYear, 9, 18, 0, 0, 0); // Month 9 is October (0-indexed)

    const isToday =
      now.getMonth() === 9 && now.getDate() === 18;

    if (now > bday && !isToday) {
      bday = new Date(currentYear + 1, 9, 18, 0, 0, 0);
    }

    const diff = bday.getTime() - now.getTime();
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
    const minutes = Math.max(0, Math.floor((diff / 1000 / 60) % 60));

    return { isToday, days, hours, minutes };
  }, []);

  // 6 Letters of K-A-M-I-L-A with strict pink/grey tones
  const kamilaLetters = [
    {
      letter: 'K',
      toneName: 'Pudrowy Róż (#F8C8D8)',
      hex: '#F8C8D8',
      title: 'Kojąca obecność',
      description: 'Ciepło, które wycisza każdy niepokój. Twój głos i uśmiech sprawiają, że cały świat staje się bezpieczny i łagodny.',
    },
    {
      letter: 'A',
      toneName: 'Aksamitny Róż (#F28DAE)',
      hex: '#F28DAE',
      title: 'Anielska cierpliwość',
      description: 'Zdolność słuchania bez osądzania i niezmienna gotowość, by podać pomocną dłoń o każdej porze dnia i nocy.',
    },
    {
      letter: 'M',
      toneName: 'Sygnowany Róż (#FF5C8A)',
      hex: '#FF5C8A',
      title: 'Mądrość i matczyne serce',
      description: 'Niezawodna życiowa intuicja. Zawsze wiesz, kiedy potrzeba mądrej rady, a kiedy po prostu czułego uścisku.',
    },
    {
      letter: 'I',
      toneName: 'Głęboka Fuksja (#C2185B)',
      hex: '#C2185B',
      title: 'Iskra domowego ciepła',
      description: 'Magia, dzięki której stół zamienia się w serce domu, a zwykły obiad w najpiękniejsze rodzinne wspomnienie.',
    },
    {
      letter: 'L',
      toneName: 'Srebrzysty Grafit (#B5B5BC)',
      hex: '#B5B5BC',
      title: 'Lekarstwo na zmartwienia',
      description: 'Twoja herbata z cytryną i proste słowa potrafią rozproszyć najczarniejsze chmury i przywrócić wiarę w jutro.',
    },
    {
      letter: 'A',
      toneName: 'Głęboka Czerń (#0B0B0D)',
      hex: '#FF5C8A',
      title: 'Absolutnie niezastąpiona',
      description: 'Prawdziwy fundament naszej rodziny. Nie ma na świecie nikogo takiego jak Ty, Mamo. Dziękujemy, że jesteś.',
    },
  ];

  // Confetti burst on canvas
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      vRot: number;
      opacity: number;
      shape: 'rect' | 'circle';
    }> = [];

    for (let i = 0; i < 160; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 220,
        y: canvas.height * 0.45 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 16 - 6,
        color: CONFETTI_PALETTE[Math.floor(Math.random() * CONFETTI_PALETTE.length)],
        size: Math.random() * 8 + 5,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
      });
    }

    let frameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.38;
        p.vx *= 0.985;
        p.rotation += p.vRot;
        p.opacity -= 0.008;

        if (p.opacity > 0 && p.y < canvas.height + 40) {
          alive++;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      if (alive > 0) {
        frameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    render();
  };

  const [isWishMade, setIsWishMade] = useState<boolean>(false);
  const [showWishToast, setShowWishToast] = useState<boolean>(false);

  // REAL 3D BOOK OPENING ANIMATION
  const handleOpenBook = () => {
    if (isCoverSwinging || isBookOpen) return;
    setIsCoverSwinging(true);

    audio.playPageTurn();
    setTimeout(() => audio.playMagicalChime(), 450);

    // After the cover has swung open in 3D, switch state smoothly
    setTimeout(() => {
      setIsBookOpen(true);
      setIsCoverSwinging(false);
    }, 1400);
  };

  // Close book back into closed hardcover view
  const handleCloseBook = () => {
    if (isCoverSwinging) return;
    setIsCoverSwinging(true);
    audio.playPageTurn();
    
    // Set book state back
    setTimeout(() => {
      setIsBookOpen(false);
      setIsCoverSwinging(false);
      setIsCandleLit(true);
      setRevealedLettersCount(0);
      setIsLetterSequenceFinished(false);
      setCurrentChapter(0);
    }, 1000);
  };

  // Extinguish the realistic candle in the cake (Turn off the light)
  const handleExtinguishCandle = () => {
    if (!isCandleLit) return;
    setIsCandleLit(false);

    // ALWAYS play the cool sound when extinguishing the light on user interaction
    audio.playExtinguish();
    setSoundEnabled(true);

    if (spawnHeartBurstRef.current) {
      spawnHeartBurstRef.current();
    }

    // Sequential reveal of letters K-A-M-I-L-A with crystal chimes
    setRevealedLettersCount(0);
    setIsLetterSequenceFinished(false);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setRevealedLettersCount(count);
      audio.playLetterChime(count - 1);

      if (count >= 6) {
        clearInterval(interval);
        setIsLetterSequenceFinished(true);
        triggerConfetti();
        setTimeout(() => audio.playStoLatFinale(), 350);
      }
    }, 650);
  };

  // Relight candle on the cake
  const handleRelightCandle = () => {
    setIsCandleLit(true);
    setRevealedLettersCount(0);
    setIsLetterSequenceFinished(false);
    audio.playMagicalChime();
    if (spawnHeartBurstRef.current) {
      spawnHeartBurstRef.current();
    }
  };

  // Make a heartfelt wish in silence
  const handleMakeWish = () => {
    setIsWishMade(true);
    setShowWishToast(true);
    audio.playMagicalChime();
    triggerConfetti();
    if (spawnHeartBurstRef.current) {
      spawnHeartBurstRef.current();
    }
    setTimeout(() => setShowWishToast(false), 3500);
  };

  // Share action
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'M jak Mama – Księga Życzeń dla Kamili',
        text: 'Wyjątkowy podarunek urodzinowy dla Mamy Kamili przygotowany z miłością przez Amelie.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  // Letter copy in Polish (140 words)
  const letterParagraphs = [
    "Droga Kamilo,",
    "Gdyby nasze życie było serialem, każdy kolejny odcinek zaczynałby się przy Twoim stole. Bo dom to nie cztery ściany z cegieł – dom to Ty, Twój łagodny uśmiech i bezgraniczne ciepło, którym otulasz nas każdego dnia.",
    "Dziękujemy Ci za anielską cierpliwość, za mądrość, która rozprasza każdą wątpliwość, i za herbatę z cytryną, która leczy największe zmartwienia. To Ty pokazujesz nam, że szczęście nie kryje się w wielkich gestach, lecz w zwykłych, codziennych chwilach spędzonych razem.",
    "Życzymy Ci niegasnącego zdrowia, spokoju w sercu i czasu tylko dla siebie. Niech każda chwila przynosi Ci powody do szczerego śmiechu, a każdy kolejny rozdział Twojego życia pisze same pogodne scenariusze.",
    "Sto lat, Droga Kamilo!",
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#FF5C8A] selection:text-black transition-colors duration-500 overflow-x-hidden relative">
      {/* Background canvas for confetti */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* TOP COMPACT GIFT TOOLBAR */}
      <header className="w-full max-w-5xl mx-auto px-4 py-3 flex items-center justify-between z-30 border-b border-[var(--border-line)]/50 no-print">
        <div className="flex items-center gap-2">
          <span className="font-serif-display font-bold text-xl text-[#FF5C8A]">M</span>
          <span className="text-xs uppercase tracking-widest font-semibold text-[var(--text-muted)]">
            Podarunek dla Kamili · od Amelie
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isBookOpen && (
            <button
              onClick={handleCloseBook}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[#FF5C8A] border border-[var(--border-line)] transition-all"
              title="Zamknij księgę"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Zamknij księgę</span>
            </button>
          )}

          <button
            onClick={toggleSound}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
              soundEnabled
                ? 'bg-[#FF5C8A] text-black border-[#FF5C8A] shadow-[0_0_15px_rgba(255,92,138,0.5)]'
                : 'border-[var(--border-line)] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--surface-elevated)]'
            }`}
            title={soundEnabled ? 'Zatrzymaj tradycyjne „Sto lat”' : 'Włącz tradycyjną polską melodię urodzinową („Sto lat”)'}
            aria-label="Tradycyjna polska muzyka urodzinowa"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                <span>Sto lat: Gra melodia 🎵</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Muzyka: „Sto lat”</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="p-2 rounded-full border border-[var(--border-line)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
            title={isLightMode ? 'Włącz tryb aksamitny (nocny)' : 'Włącz tryb jasny'}
            aria-label="Przełącz motyw"
          >
            {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full border border-[var(--border-line)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all relative"
            title="Podziel się podarunkiem"
            aria-label="Udostępnij"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Share toast feedback */}
      {showShareToast && (
        <div className="fixed top-16 right-6 z-50 bg-[#1E1E22] border border-[#FF5C8A] text-[#F2F2F4] px-4 py-2 rounded-lg text-xs font-medium shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-[#FF5C8A]" />
          <span>Skopiowano link do podarunku!</span>
        </div>
      )}

      {/* =========================================================================
          THE 3D BOOK EXPERIENCE
         ========================================================================= */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-8 book-scene">
        
        {/* BOOK CONTAINER */}
        <div
          className={`w-full transition-all duration-1000 ${
            isBookOpen || isCoverSwinging ? 'max-w-5xl' : 'max-w-md sm:max-w-lg'
          }`}
        >
          {/* THE BOOK SHELL */}
          <div className="relative rounded-2xl leather-outer-shell overflow-hidden">
            
            {/* BOOK SPINE ON THE FAR LEFT (Visible in 3D) */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-9 leather-spine z-30 pointer-events-none" />

            {/* PINK BOOKMARK RIBBON (HANGING FROM THE BOTTOM) */}
            <div className="absolute left-14 -bottom-6 w-5 h-16 bg-[#FF5C8A] shadow-[0_4px_14px_rgba(255,92,138,0.6)] z-40 rounded-b-sm transform skew-x-3 pointer-events-none" />

            {/* ===================================================================
                THE 3D FRONT COVER (PHYSICALLY HINGED ON LEFT SPINE)
               =================================================================== */}
            {(!isBookOpen || isCoverSwinging) && (
              <div
                onClick={handleOpenBook}
                className={`cursor-pointer group select-none min-h-[560px] sm:min-h-[620px] p-8 sm:p-12 flex flex-col justify-between relative z-20 book-cover-hinge leather-cover ${
                  isCoverSwinging ? 'is-open' : ''
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleOpenBook();
                }}
                aria-label="Dotknij, aby otworzyć księgę dla Mamy Kamili przygotowaną przez Amelie"
              >
                {/* FRONT SIDE OF THE HARDCOVER */}
                <div className="book-cover-frontside flex flex-col justify-between h-full relative z-10">
                  {/* Authentic Leather Stitched Edge Seam & Filigree Borders */}
                  <div className="absolute inset-2 sm:inset-3 leather-stitched-border rounded-xl pointer-events-none" />
                  <div className="absolute inset-4 sm:inset-6 border border-[#FF5C8A]/35 rounded-lg pointer-events-none" />

                  {/* Antique Brass Corner Plates with Filigree */}
                  <div className="absolute top-2.5 left-2.5 w-9 h-9 border-t-2 border-l-2 border-[#D9D9DE]/70 rounded-tl-sm pointer-events-none flex items-start justify-start p-1 select-none">
                    <span className="text-[#FF5C8A] text-xs">❖</span>
                  </div>
                  <div className="absolute top-2.5 right-2.5 w-9 h-9 border-t-2 border-r-2 border-[#D9D9DE]/70 rounded-tr-sm pointer-events-none flex items-start justify-end p-1 select-none">
                    <span className="text-[#FF5C8A] text-xs">❖</span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 w-9 h-9 border-b-2 border-l-2 border-[#D9D9DE]/70 rounded-bl-sm pointer-events-none flex items-end justify-start p-1 select-none">
                    <span className="text-[#FF5C8A] text-xs">❖</span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 w-9 h-9 border-b-2 border-r-2 border-[#D9D9DE]/70 rounded-br-sm pointer-events-none flex items-end justify-end p-1 select-none">
                    <span className="text-[#FF5C8A] text-xs">❖</span>
                  </div>

                  {/* Cover Header */}
                  <div className="text-center space-y-3 pt-6 z-10">
                    <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-[#FF5C8A]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Księga Życzeń · 18 Października</span>
                    </div>

                    <h1 className="font-serif-display text-4xl sm:text-6xl font-bold tracking-tight text-[#F2F2F4] leading-tight">
                      Dla Mamy <span className="text-[#FF5C8A]">Kamili</span>
                    </h1>

                    <p className="font-serif-display italic text-lg sm:text-2xl text-[#B5B5BC]">
                      Odcinek Specjalny: „M jak Mama”
                    </p>
                  </div>

                  {/* Center Embossed Wax Seal */}
                  <div className="my-6 flex flex-col items-center justify-center z-10">
                    <div className="w-24 h-24 rounded-full bg-[#1E1E22] border-2 border-[#FF5C8A] shadow-[0_0_35px_rgba(255,92,138,0.4)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Heart className="w-10 h-10 text-[#FF5C8A] fill-[#FF5C8A]" />
                    </div>
                    <div className="font-cursive text-2xl text-[#F8C8D8] mt-3">
                      Wszystkiego Najlepszego
                    </div>
                  </div>

                  {/* Attribution & Invitation */}
                  <div className="text-center space-y-3 z-10 border-t border-[#2A2A2E] pt-5">
                    <div className="text-xs uppercase tracking-wider font-semibold text-[#6B6B73]">
                      Podarunek stworzony z miłością przez
                    </div>
                    <div className="font-serif-display text-2xl font-bold text-[#FF5C8A]">
                      Amelie
                    </div>

                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF5C8A] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(255,92,138,0.6)] group-hover:bg-[#F28DAE] transition-all transform group-hover:scale-105">
                        <BookOpen className="w-4 h-4" />
                        <span>Dotknij, aby otworzyć księgę</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* INSIDE OF THE FRONT COVER (Visible as it swings open 180deg) */}
                <div className="book-cover-backside absolute inset-0 bg-[#121215] border-r-2 border-[#2A2A2E] p-8 sm:p-12 flex flex-col justify-center items-center text-center">
                  <div className="max-w-xs space-y-4">
                    <div className="w-12 h-12 rounded-full border border-[#FF5C8A]/40 flex items-center justify-center mx-auto text-[#FF5C8A]">
                      <Heart className="w-6 h-6 fill-current" />
                    </div>
                    <div className="font-serif-display italic text-2xl text-[#F28DAE]">
                      „Dla najwspanialszej Mamy na świecie”
                    </div>
                    <p className="font-cursive text-xl text-[#B5B5BC]">
                      Z miłością i wdzięcznością,<br />
                      Twoja Amelie
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================
                THE OPENED BOOK SPREAD (INSIDE THE BOOK)
               =================================================================== */}
            {isBookOpen && (
              <div
                className={`min-h-[580px] sm:min-h-[640px] flex flex-col justify-between p-6 sm:p-10 z-10 transition-colors duration-700 paper-grain-texture relative ${
                  !isCandleLit && currentChapter === 0
                    ? 'bg-[#0E0E11]' // Intimate dusk atmosphere when light is extinguished
                    : 'bg-[#151518]'
                }`}
              >
                {/* Central Gutter Crease Shadow (Authentic Book Spine Fold) */}
                <div className="book-gutter-crease hidden md:block" />
                {/* Book Header / Breadcrumb */}
                <div className="flex items-center justify-between border-b border-[var(--border-line)] pb-4 text-xs font-semibold text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#FF5C8A]">Księga Życzeń</span>
                    <span>·</span>
                    <span>Dla Mamy Kamili od <strong className="text-[var(--text-primary)]">Amelie</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Chapter selector tabs */}
                    <div className="inline-flex rounded-lg bg-[var(--surface-elevated)] p-1 border border-[var(--border-line)]">
                      <button
                        onClick={() => setCurrentChapter(0)}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          currentChapter === 0
                            ? 'bg-[#FF5C8A] text-black font-bold'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        Świeca & Imię
                      </button>
                      <button
                        onClick={() => setCurrentChapter(1)}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          currentChapter === 1
                            ? 'bg-[#FF5C8A] text-black font-bold'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        Sceny z Domu
                      </button>
                      <button
                        onClick={() => setCurrentChapter(2)}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          currentChapter === 2
                            ? 'bg-[#FF5C8A] text-black font-bold'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        List od Amelie
                      </button>
                    </div>
                  </div>
                </div>

                {/* SPREAD CONTENT BY CHAPTER */}
                <div className="my-6">
                  {/* ===============================================================
                      CHAPTER 0: REALISTIC CANDLE RITUAL & K-A-M-I-L-A ILLUMINATION
                     =============================================================== */}
                  {currentChapter === 0 && (
                    <div className="space-y-8 animate-fade-in">
                      {/* Step Header */}
                      <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-[#FF5C8A]">
                          <Flame className="w-3.5 h-3.5 fill-current" />
                          <span>Rytuał Urodzinowy Kamili</span>
                        </div>
                        <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-[var(--text-primary)]">
                          {isCandleLit ? 'Święty Płomień Życzenia' : 'Światło Zostało Zgaszone'}
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
                          {isCandleLit
                            ? 'Pomyśl w sercu najcichsze marzenie. Następnie dotknij płomienia świecy na ekranie, aby zgasić światło i obudzić barwy Twojego imienia.'
                            : 'Płomień zgasł, a Twoje życzenie popłynęło prosto do nieba. Zobacz, jak rozbłyskują litery Twojego imienia:'}
                        </p>
                      </div>

                      {/* THE ULTRA-REALISTIC CANDLE (TOUCH TO TURN OFF LIGHT) */}
                      <div className="py-4 flex flex-col items-center justify-center select-none relative">
                        {/* Ambient warm table aura when burning */}
                        {isCandleLit && (
                          <div className="absolute w-80 h-80 rounded-full bg-[#FF5C8A]/18 blur-3xl pointer-events-none animate-aura-pulse" />
                        )}

                        <div
                          onClick={handleExtinguishCandle}
                          className="cursor-pointer group flex flex-col items-center focus:outline-none"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') handleExtinguishCandle();
                          }}
                          aria-label={isCandleLit ? 'Dotknij świecy, aby zgasić płomień i światło' : 'Świeca jest zgaszona'}
                        >
                          <svg
                            className="w-52 h-72 sm:w-60 sm:h-80 overflow-visible"
                            viewBox="0 0 220 280"
                            aria-hidden="true"
                          >
                            <defs>
                              {/* Wax body realistic shading gradient */}
                              <linearGradient id="waxPillarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#18181B" />
                                <stop offset="25%" stopColor="#2E2E36" />
                                <stop offset="60%" stopColor="#222228" />
                                <stop offset="90%" stopColor="#352830" />
                                <stop offset="100%" stopColor="#141416" />
                              </linearGradient>

                              {/* Top molten wax pool radial gradient */}
                              <radialGradient id="moltenPoolGrad" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#4A343D" />
                                <stop offset="60%" stopColor="#282830" />
                                <stop offset="100%" stopColor="#1A1A1E" />
                              </radialGradient>

                              {/* Outer luminous flame gradient (Pink to deep rose) */}
                              <radialGradient id="outerFlameGrad" cx="50%" cy="80%" r="60%">
                                <stop offset="0%" stopColor="#FFFFFF" />
                                <stop offset="25%" stopColor="#FFF0F5" />
                                <stop offset="55%" stopColor="#FF5C8A" />
                                <stop offset="85%" stopColor="#C2185B" />
                                <stop offset="100%" stopColor="transparent" />
                              </radialGradient>

                              {/* Inner hot white core */}
                              <linearGradient id="innerHotCore" x1="0%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stopColor="#FFFFFF" />
                                <stop offset="100%" stopColor="#FFF8FA" />
                              </linearGradient>

                              {/* Blue combustion root base */}
                              <radialGradient id="blueBaseGrad" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#6C8CFF" stopOpacity="0.85" />
                                <stop offset="65%" stopColor="#8A4FFF" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                              </radialGradient>
                            </defs>

                            {/* Ceramic / Metallic Saucer Stand */}
                            <ellipse cx="110" cy="262" rx="85" ry="14" fill="#0E0E10" stroke="#2A2A2E" strokeWidth="2" />
                            <ellipse cx="110" cy="258" rx="74" ry="10" fill="#1C1C20" stroke="#4A4A52" strokeWidth="1" />
                            <ellipse cx="110" cy="255" rx="60" ry="7" fill="#141416" />

                            {/* Realistic Wax Pillar Body */}
                            <path
                              d="M 70 140 C 70 134, 150 134, 150 140 L 150 252 C 150 258, 70 258, 70 252 Z"
                              fill="url(#waxPillarGrad)"
                              stroke="#2A2A2E"
                              strokeWidth="1.2"
                            />

                            {/* Realistic Wax Drips down the sides */}
                            {/* Drip 1 (left) */}
                            <path
                              d="M 74 140 Q 77 165 78 185 Q 76 195 72 192 Q 70 170 71 140 Z"
                              fill="#2E2E36"
                              opacity="0.9"
                            />
                            {/* Drip 2 (center-left highlight) */}
                            <path
                              d="M 95 140 Q 97 158 97 172 Q 95 180 93 176 Q 92 155 93 140 Z"
                              fill="#3E3E48"
                              opacity="0.75"
                            />
                            {/* Drip 3 (right long drip) */}
                            <path
                              d="M 144 140 Q 142 165 144 195 Q 148 206 149 198 Q 148 160 146 140 Z"
                              fill="#382E34"
                              opacity="0.85"
                            />

                            {/* Top Molten Pool of Liquid Wax */}
                            <ellipse cx="110" cy="140" rx="40" ry="9" fill="url(#moltenPoolGrad)" stroke="#3A3A42" strokeWidth="1" />
                            
                            {/* Molten wax reflection highlights */}
                            {isCandleLit && (
                              <ellipse cx="110" cy="141" rx="18" ry="4" fill="#FF5C8A" opacity="0.3" filter="blur(1px)" />
                            )}

                            {/* Braided Dark Cotton Wick with Curve */}
                            <path
                              d="M 110 140 Q 108 126 112 118"
                              fill="none"
                              stroke="#111113"
                              strokeWidth="2.8"
                              strokeLinecap="round"
                            />

                            {/* Glowing Ember Tip */}
                            <circle
                              cx="112"
                              cy="118"
                              r="2"
                              fill={isCandleLit ? "#FF3366" : "#4A4A52"}
                              filter={isCandleLit ? "drop-shadow(0 0 4px #FF5C8A)" : "none"}
                            />

                            {/* ========================================================
                                FLAME (OR RISING SMOKE WHEN EXTINGUISHED)
                               ======================================================== */}
                            {isCandleLit ? (
                              <g
                                className="animate-realistic-flame"
                                style={{ transformOrigin: "110px 118px" }}
                              >
                                {/* Blue base of flame (clean combustion) */}
                                <ellipse cx="111" cy="117" rx="10" ry="6" fill="url(#blueBaseGrad)" />

                                {/* Outer teardrop flame (incandescent rose/pink body) */}
                                <path
                                  d="M 112 118 C 90 108, 84 72, 110 40 C 136 72, 130 108, 112 118 Z"
                                  fill="url(#outerFlameGrad)"
                                />

                                {/* Inner brilliant white-hot core */}
                                <path
                                  className="animate-inner-core"
                                  d="M 112 118 C 102 112, 100 88, 111 65 C 122 88, 120 112, 112 118 Z"
                                  fill="url(#innerHotCore)"
                                  style={{ transformOrigin: "111px 118px" }}
                                />
                              </g>
                            ) : (
                              /* Delicate rising smoke curls */
                              <g
                                className="animate-smoke-wisp"
                                style={{ transformOrigin: "112px 118px" }}
                              >
                                <path
                                  d="M 112 118 Q 106 95 115 78 T 107 45 T 116 20"
                                  fill="none"
                                  stroke="#B5B5BC"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                  opacity="0.7"
                                />
                                <circle cx="112" cy="104" r="3" fill="#6B6B73" opacity="0.4" />
                                <circle cx="116" cy="85" r="4.5" fill="#D9D9DE" opacity="0.3" />
                                <circle cx="108" cy="60" r="6" fill="#F2F2F4" opacity="0.2" />
                              </g>
                            )}
                          </svg>

                          {/* Action badge under candle */}
                          <div className="mt-3">
                            {isCandleLit ? (
                              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF5C8A]/20 border border-[#FF5C8A] text-[#FF5C8A] text-xs font-bold uppercase tracking-wider group-hover:bg-[#FF5C8A] group-hover:text-black transition-all shadow-[0_0_20px_rgba(255,92,138,0.35)]">
                                <Flame className="w-4 h-4 fill-current animate-bounce" />
                                <span>Dotknij świecy, aby zgasić światło</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-line)] text-xs text-[var(--text-secondary)] font-medium">
                                <Check className="w-4 h-4 text-[#FF5C8A]" />
                                <span>Światło zgaszone · Marzenie płynie do gwiazd</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Re-light button if candle extinguished */}
                        {!isCandleLit && (
                          <button
                            onClick={handleRelightCandle}
                            className="mt-3 text-xs text-[var(--text-muted)] hover:text-[#FF5C8A] flex items-center gap-1.5 underline underline-offset-4 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Zapal świecę ponownie</span>
                          </button>
                        )}
                      </div>

                      {/* SEQUENTIAL ILLUMINATION OF K-A-M-I-L-A */}
                      <div className="space-y-4 pt-4 border-t border-[var(--border-line)]">
                        <div className="text-center">
                          <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                            Barwy Szczęścia Kamili
                          </h3>
                          <p className="text-xs text-[var(--text-muted)]">
                            {isCandleLit
                              ? 'Zgaś płomień powyżej, aby odkryć każdą literę imienia...'
                              : 'Każda litera reprezentuje jeden wyjątkowy odcień Twojej dobroci:'}
                          </p>
                        </div>

                        {/* 6 Letters Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {kamilaLetters.map((item, idx) => {
                            const isRevealed = !isCandleLit && idx < revealedLettersCount;
                            return (
                              <div
                                key={idx}
                                className={`rounded-xl p-5 border transition-all duration-700 flex flex-col justify-between ${
                                  isRevealed
                                    ? 'bg-[var(--surface-raised)] border-[#FF5C8A] shadow-[0_0_25px_rgba(255,92,138,0.25)] -translate-y-1'
                                    : isCandleLit
                                    ? 'bg-[var(--surface-raised)]/70 border-[var(--border-line)]'
                                    : 'bg-[var(--surface-raised)]/40 border-[var(--border-line)] opacity-50'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span
                                      className={`font-serif-display text-5xl font-black leading-none transition-all duration-700 ${
                                        isRevealed ? 'text-[#FF5C8A] scale-110 drop-shadow-[0_0_12px_rgba(255,92,138,0.5)]' : 'text-[var(--text-muted)]'
                                      }`}
                                    >
                                      {item.letter}
                                    </span>
                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                      {item.toneName}
                                    </span>
                                  </div>

                                  <h4 className="font-serif-display text-xl font-bold text-[var(--text-primary)] mb-1">
                                    {item.title}
                                  </h4>

                                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Turn page prompt */}
                        {isLetterSequenceFinished && (
                          <div className="pt-6 flex justify-center">
                            <button
                              onClick={() => setCurrentChapter(1)}
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF5C8A] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,92,138,0.5)] hover:bg-[#F28DAE] transition-all"
                            >
                              <span>Przejdź do Rozdziału I: Sceny z Domu</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ===============================================================
                      CHAPTER 1: DWA SERIALE & NAJLEPSZE SCENY Z DOMU
                     =============================================================== */}
                  {currentChapter === 1 && (
                    <div className="space-y-10 animate-fade-in">
                      {/* Section A: Dwa seriale, jedna prawda */}
                      <div className="space-y-4">
                        <div className="text-center space-y-1">
                          <div className="text-xs uppercase tracking-widest font-bold text-[#FF5C8A]">
                            Rozdział I · Prawdy z Ulubionych Seriali
                          </div>
                          <h3 className="font-serif-display text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                            Dwa seriale, jedna prawda
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-[var(--surface-raised)] border border-[var(--border-line)] rounded-xl p-5 space-y-2">
                            <span className="font-serif-display text-2xl font-bold text-[#FF5C8A]">01</span>
                            <h4 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
                              Wspólny stół to serce domu
                            </h4>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              Dom tworzą ludzie, nie ściany. Przy Twoim stole każdy kłopot maleje o połowę, a każda radość smakuje podwójnie.
                            </p>
                          </div>

                          <div className="bg-[var(--surface-raised)] border border-[var(--border-line)] rounded-xl p-5 space-y-2">
                            <span className="font-serif-display text-2xl font-bold text-[#FF5C8A]">02</span>
                            <h4 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
                              Codzienność to wielka sztuka
                            </h4>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              Prawdziwe historie nie rodzą się na wielkich scenach, lecz w małych gestach – w zaparzonej herbacie i cichym spojrzeniu pełnym troski.
                            </p>
                          </div>

                          <div className="bg-[var(--surface-raised)] border border-[var(--border-line)] rounded-xl p-5 space-y-2">
                            <span className="font-serif-display text-2xl font-bold text-[#FF5C8A]">03</span>
                            <h4 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
                              Po każdej burzy wstaje słońce
                            </h4>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              Choć życie pisze nieprzewidziane scenariusze, Twoja obecność daje nam pewność, że jutro przyniesie dobrą nadzieję.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Section B: Sceny z domu Kamili */}
                      <div className="space-y-4 pt-6 border-t border-[var(--border-line)]">
                        <div className="text-center space-y-1">
                          <div className="text-xs uppercase tracking-widest font-bold text-[#FF5C8A]">
                            Pamiętnik Chwil
                          </div>
                          <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                            Ulubione sceny z domu Kamili
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-line)] flex flex-col justify-between">
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold text-[#FF5C8A] tracking-wider">Scena 1 · Poranek</span>
                              <h4 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
                                Poranna herbata z cytryną
                              </h4>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                Cichy świt w kuchni, zapach świeżo parzonej herbaty i chwila spokoju przed rozpoczęciem dnia. To Twój rytuał, który wprowadza ład w cały dom.
                              </p>
                            </div>
                            <div className="font-cursive text-lg text-[#F8C8D8] mt-3">
                              „Najpierw wypijmy herbatę, potem wszystko się ułoży.”
                            </div>
                          </div>

                          <div className="p-5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-line)] flex flex-col justify-between">
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold text-[#FF5C8A] tracking-wider">Scena 2 · Południe</span>
                              <h4 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
                                Niedzielny stół i zapach ciasta
                              </h4>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                Gdy z piekarnika dochodzi słodki zapach, a stół nakryty jest dla wszystkich, których kochasz. Nikt nie potrafi tak ugościć i stworzyć święta ze zwykłej niedzieli.
                              </p>
                            </div>
                            <div className="font-cursive text-lg text-[#F8C8D8] mt-3">
                              „Zjedzcie jeszcze kawałek, specjalnie dla Was upiekłam.”
                            </div>
                          </div>

                          <div className="p-5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-line)] flex flex-col justify-between">
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold text-[#FF5C8A] tracking-wider">Scena 3 · Popołudnie</span>
                              <h4 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
                                Rozmowy, które leczą wszystko
                              </h4>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                Wystarczy jedno Twoje spojrzenie, by wiedzieć, co leży na sercu. Potrafisz wysłuchać tak, że każdy ciężar staje się lżejszy.
                              </p>
                            </div>
                            <div className="font-cursive text-lg text-[#F8C8D8] mt-3">
                              „Pamiętaj, że z każdej sytuacji jest dobre wyjście.”
                            </div>
                          </div>

                          <div className="p-5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-line)] flex flex-col justify-between">
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold text-[#FF5C8A] tracking-wider">Scena 4 · Wieczór</span>
                              <h4 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
                                Bezpieczna przystań o zmierzchu
                              </h4>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                Ciepłe światło w oknie, znajomy odgłos kroków i świadomość, że jest takie miejsce na ziemi, do którego zawsze można wrócić i być sobą.
                              </p>
                            </div>
                            <div className="font-cursive text-lg text-[#F8C8D8] mt-3">
                              „Najważniejsze, że jesteśmy razem.”
                            </div>
                          </div>
                        </div>

                        {/* Navigation buttons */}
                        <div className="pt-6 flex items-center justify-between">
                          <button
                            onClick={() => setCurrentChapter(0)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--border-line)] text-xs text-[var(--text-secondary)] hover:text-[#FF5C8A]"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Wróć do Świecy</span>
                          </button>

                          <button
                            onClick={() => setCurrentChapter(2)}
                            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#FF5C8A] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#F28DAE] shadow-[0_0_15px_rgba(255,92,138,0.4)]"
                          >
                            <span>Przejdź do Listu od Amelie</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ===============================================================
                      CHAPTER 2: HEARTFELT LETTER FROM AMELIE & CREDITS
                     =============================================================== */}
                  {currentChapter === 2 && (
                    <div className="space-y-10 animate-fade-in">
                      {/* The Letter */}
                      <div className="max-w-2xl mx-auto bg-[var(--surface-raised)] border border-[var(--border-line)] rounded-2xl p-6 sm:p-10 space-y-6 shadow-2xl relative">
                        <div className="flex items-center justify-between border-b border-[var(--border-line)] pb-4">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-[#FF5C8A] fill-current" />
                            <span className="text-xs uppercase tracking-widest font-bold text-[#FF5C8A]">
                              Rozdział II · List od Amelie
                            </span>
                          </div>
                          <span className="text-xs text-[var(--text-muted)]">18 Października</span>
                        </div>

                        <div className="space-y-4 text-sm sm:text-base text-[var(--text-primary)] leading-relaxed font-serif-display text-justify sm:text-left">
                          {letterParagraphs.map((para, i) => (
                            <p
                              key={i}
                              className={
                                i === 0
                                  ? 'text-2xl sm:text-3xl font-bold text-[#FF5C8A]'
                                  : i === letterParagraphs.length - 1
                                  ? 'font-bold text-xl sm:text-2xl text-[#FF5C8A] pt-2'
                                  : ''
                              }
                            >
                              {para}
                            </p>
                          ))}
                        </div>

                        {/* Signature */}
                        <div className="border-t border-[var(--border-line)] pt-5 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                              Podarunek z całego serca
                            </div>
                            <div className="font-cursive text-2xl font-bold text-[#FF5C8A]">
                              Z bezgraniczną miłością, Amelie
                            </div>
                          </div>

                          <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-line)] text-xs text-[var(--text-secondary)] hover:text-[#FF5C8A] no-print"
                            title="Wydrukuj list na pamiątkę"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Drukuj</span>
                          </button>
                        </div>
                      </div>

                      {/* Traditional Polish Birthday Song ("Sto lat") Player Banner */}
                      <div className="max-w-2xl mx-auto p-4 rounded-xl bg-[var(--surface-raised)] border border-[#FF5C8A]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg select-none transition-all ${
                              soundEnabled
                                ? 'bg-[#FF5C8A] text-black shadow-[0_0_20px_rgba(255,92,138,0.6)] animate-pulse'
                                : 'bg-[#1E1E22] text-[#B5B5BC] border border-[var(--border-line)]'
                            }`}
                          >
                            🎵
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-bold text-[#FF5C8A] tracking-wider">
                              Tradycyjna Polska Melodia Urodzinowa
                            </div>
                            <div className="font-serif-display font-bold text-lg text-[var(--text-primary)]">
                              „Sto lat, sto lat, niech żyje, żyje nam!”
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)]">
                              Nostalgiczna aranżacja w stylu pozytywki celestowej
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={toggleSound}
                          className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                            soundEnabled
                              ? 'bg-[#FF5C8A] text-black shadow-[0_0_18px_rgba(255,92,138,0.6)] hover:bg-[#F28DAE]'
                              : 'bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:border-[#FF5C8A] border border-[var(--border-line)]'
                          }`}
                        >
                          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                          <span>{soundEnabled ? 'Zatrzymaj melodię' : 'Zagraj „Sto lat”'}</span>
                        </button>
                      </div>

                      {/* TV Series End Credits */}
                      <div className="max-w-2xl mx-auto text-center space-y-6 pt-6 border-t border-[var(--border-line)]">
                        <div className="text-xs uppercase tracking-widest font-bold text-[#FF5C8A]">
                          Napisy Końcowe · Odcinek Specjalny
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="text-right text-[var(--text-muted)]">W roli głównej:</div>
                          <div className="text-left font-bold text-[var(--text-primary)]">Kamila</div>

                          <div className="text-right text-[var(--text-muted)]">Scenariusz:</div>
                          <div className="text-left font-bold text-[var(--text-primary)]">Bezwarunkowa Miłość</div>

                          <div className="text-right text-[var(--text-muted)]">Reżyseria życia:</div>
                          <div className="text-left font-bold text-[var(--text-primary)]">Kamila</div>

                          <div className="text-right text-[var(--text-muted)]">Ciepło i bezpieczeństwo:</div>
                          <div className="text-left font-bold text-[var(--text-primary)]">Kamila</div>

                          <div className="text-right text-[var(--text-muted)]">Najpyszniejsze obiady świata:</div>
                          <div className="text-left font-bold text-[var(--text-primary)]">Kamila</div>

                          <div className="text-right text-[var(--text-muted)]">Pomysł & Realizacja podarunku:</div>
                          <div className="text-left font-bold text-[#FF5C8A]">Amelie</div>

                          <div className="text-right text-[var(--text-muted)]">Produkcja:</div>
                          <div className="text-left font-bold text-[var(--text-primary)]">Amelie & Twoja Rodzina</div>
                        </div>

                        {/* Ciąg dalszy nastąpi */}
                        <div className="pt-4">
                          <div className="font-serif-display italic text-3xl sm:text-4xl font-bold text-[#FF5C8A]">
                            Ciąg dalszy nastąpi…
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            Bo najpiękniejsze wspólne sceny wciąż są przed nami.
                          </p>
                        </div>

                        {/* Back navigation */}
                        <div className="pt-4 flex justify-center gap-3">
                          <button
                            onClick={() => setCurrentChapter(1)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--border-line)] text-xs text-[var(--text-secondary)] hover:text-[#FF5C8A]"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Wróć do Scen z Domu</span>
                          </button>

                          <button
                            onClick={handleCloseBook}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-line)] text-xs text-[var(--text-primary)] hover:border-[#FF5C8A] hover:text-[#FF5C8A]"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>Zamknij księgę na okładkę</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SPREAD FOOTER */}
                <div className="pt-4 border-t border-[var(--border-line)]/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[var(--text-muted)] gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#FF5C8A]" />
                    <span>
                      {birthdayInfo.isToday
                        ? 'Dziś są urodziny Kamili! Sto lat!'
                        : `18 Października · Pozostało ${birthdayInfo.days} dni`}
                    </span>
                  </div>

                  <div>
                    Podarunek dla Mamy Kamili · Przygotowany z miłością przez <span className="text-[#FF5C8A] font-semibold">Amelie</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full text-center py-4 text-xs text-[var(--text-muted)] border-t border-[var(--border-line)]/40 no-print">
        Dedykowane wspaniałej Mamie Kamili · Autor podarunku: <strong className="text-[var(--text-primary)]">Amelie</strong> · 18 Października
      </footer>
    </div>
  );
}
