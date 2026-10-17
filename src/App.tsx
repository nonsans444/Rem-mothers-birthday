/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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

// Offline Synthesized Audio (Whoosh, Chimes, Ambient)
class AudioService {
  private ctx: AudioContext | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;

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

  // Breath whoosh when extinguishing the candle
  playExtinguish() {
    try {
      this.init();
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 0.55;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.22;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.55);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch {
      // Ignored
    }
  }

  // Magical chime chord
  playMagicalChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const freqs = [587.33, 739.99, 880.0, 1174.66, 1479.98];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 1.7);
      });
    } catch {
      // Ignored
    }
  }

  // Soft letter illumination chime
  playLetterDing(pitchIndex: number) {
    try {
      this.init();
      if (!this.ctx) return;
      const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const freq = scale[pitchIndex % scale.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.65);
    } catch {
      // Ignored
    }
  }

  toggleAmbient(enable: boolean) {
    try {
      this.init();
      if (!this.ctx) return;

      if (!enable) {
        this.stopAmbient();
        return;
      }

      if (this.isAmbientPlaying) return;
      this.isAmbientPlaying = true;

      const chords = [220.0, 261.63, 329.63];
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.035, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      chords.forEach((freq) => {
        if (!this.ctx || !this.ambientGain) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.connect(this.ambientGain);
        osc.start();
        this.ambientOscs.push(osc);
      });
    } catch {
      // Ignored
    }
  }

  stopAmbient() {
    this.ambientOscs.forEach((o) => {
      try {
        o.stop();
      } catch {
        // Ignored
      }
    });
    this.ambientOscs = [];
    this.isAmbientPlaying = false;
  }
}

const audio = new AudioService();

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kamila_theme') !== 'light';
    }
    return true;
  });

  // BOOK STATE:
  const [isBookOpen, setIsBookOpen] = useState<boolean>(false);
  const [isAnimatingCover, setIsAnimatingCover] = useState<boolean>(false);

  // CURRENT CHAPTER / PAGE SPREAD INSIDE THE BOOK (0: Candle & K-A-M-I-L-A, 1: Seriale & Sceny, 2: List od Amelie & Napisy)
  const [currentChapter, setCurrentChapter] = useState<number>(0);

  // CANDLE STATE:
  const [isCandleLit, setIsCandleLit] = useState<boolean>(true);
  const [revealedLettersCount, setRevealedLettersCount] = useState<number>(0);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [ambientPlaying, setAmbientPlaying] = useState<boolean>(false);
  const [copiedLetter, setCopiedLetter] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Theme Sync
  useEffect(() => {
    localStorage.setItem('kamila_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
  }, [isDarkMode]);

  // Ambient sound toggle
  const handleToggleAmbient = () => {
    const next = !ambientPlaying;
    setAmbientPlaying(next);
    audio.toggleAmbient(next);
  };

  // Confetti in strict palette only
  const firePaletteConfetti = () => {
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

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 180,
        y: canvas.height * 0.45 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 15,
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

  // 3D REAL BOOK OPENING TRIGGER
  const handleOpenBook = () => {
    if (isAnimatingCover) return;
    setIsAnimatingCover(true);
    if (soundEnabled) {
      audio.playPageTurn();
      setTimeout(() => audio.playMagicalChime(), 400);
    }
    setIsBookOpen(true);
    setTimeout(() => {
      setIsAnimatingCover(false);
    }, 1300);
  };

  // Close book back into closed hardcover view
  const handleCloseBook = () => {
    if (isAnimatingCover) return;
    setIsAnimatingCover(true);
    if (soundEnabled) {
      audio.playPageTurn();
    }
    setIsBookOpen(false);
    setTimeout(() => {
      setIsAnimatingCover(false);
      setIsCandleLit(true);
      setRevealedLettersCount(0);
      setCurrentChapter(0);
    }, 1200);
  };

  // Extinguish the realistic candle (Turn off the light)
  const handleExtinguishCandle = () => {
    if (!isCandleLit) return;
    setIsCandleLit(false);

    if (soundEnabled) {
      audio.playExtinguish();
      setTimeout(() => audio.playMagicalChime(), 350);
    }

    firePaletteConfetti();

    // Trigger sequential illumination of the letters of K-A-M-I-L-A
    setRevealedLettersCount(0);
    for (let i = 1; i <= 6; i++) {
      setTimeout(() => {
        setRevealedLettersCount(i);
        if (soundEnabled) {
          audio.playLetterDing(i - 1);
        }
      }, i * 450);
    }
  };

  const handleRelightCandle = () => {
    setIsCandleLit(true);
  };

  // K-A-M-I-L-A letter data
  const kamilaLetters = [
    {
      letter: 'K',
      word: 'Kojąca',
      toneName: 'Blush Pink',
      toneHex: '#F8C8D8',
      title: 'Kojąca obecność i spokój',
      description:
        'Gdy wokół panuje pośpiech i szum, Twój uścisk i zrównoważony ton natychmiast przywracają wewnętrzny ład. Tworzysz wokół przystań, do której zawsze chce się wracać.',
    },
    {
      letter: 'A',
      word: 'Anielska',
      toneName: 'Soft Rose',
      toneHex: '#F28DAE',
      title: 'Anielska cierpliwość',
      description:
        'Do naszych pytań, humorów i wątpliwości. Słuchasz sercem, bez cienia oceny, zawsze z otwartymi ramionami i bezgranicznym zrozumieniem.',
    },
    {
      letter: 'M',
      word: 'Mądra',
      toneName: 'Signature Pink',
      toneHex: '#FF5C8A',
      title: 'Mądrość i matczyne serce',
      description:
        'Wiesz bez słów, kiedy trzeba doradzić, a kiedy po prostu mocno przytulić. Twoja mądrość życiowa to nasz najpewniejszy kompas na każdą pogodę.',
    },
    {
      letter: 'I',
      word: 'Iskra',
      toneName: 'Deep Rose',
      toneHex: '#C2185B',
      title: 'Iskra domowej radości',
      description:
        'Twój uśmiech rozprasza nawet najbardziej ponury dzień. Twoja pasja, dbałość o dom i pogoda ducha wypełniają każdy kąt prawdziwym życiem.',
    },
    {
      letter: 'L',
      word: 'Lekarstwo',
      toneName: 'Graphite Grey',
      toneHex: '#6B6B73',
      title: 'Lekarstwo na zmartwienia',
      description:
        'Gorąca herbata z cytryną, domowy obiad i niezawodne „wszystko będzie dobrze”. Posiadasz sekretny przepis na zażegnanie każdego życiowego chłodu.',
    },
    {
      letter: 'A',
      word: 'Absolutna',
      toneName: 'Obsidian Velvet',
      toneHex: '#1E1E22',
      title: 'Absolutnie niezastąpiona',
      description:
        'Jesteś sercem, spoiwem i najpiękniejszą częścią naszej rodziny. Dziękujemy Ci za to, kim jesteś – dziś, jutro i każdego wspólnego dnia.',
    },
  ];

  // 4 Scenes from her home
  const scenes = [
    {
      id: '01',
      title: 'Rytuał herbaty z cytryną',
      quote: '„Herbata stygnie, siadajcie!”',
      description:
        'Zawsze parzona w ulubionej porcelanie, idealnie ciepła i stawiana na stole bez pytania, dokładnie w tej chwili, gdy ktoś najbardziej potrzebuje chwili wyciszenia.',
      tag: 'Scena 1 · Kuchnia o poranku',
    },
    {
      id: '02',
      title: 'Magia niedzielnego stołu',
      quote: '„Dla każdego znajdzie się miejsce”',
      description:
        'Zapach ciasta drożdżowego z kruszonką unoszący się na klatce schodowej już od progu. I ten stół, przy którym w tajemniczy sposób zawsze mieści się jeszcze jedno krzesło dla gościa.',
      tag: 'Scena 2 · Niedzielne popołudnie',
    },
    {
      id: '03',
      title: 'Telefon w trudnej chwili',
      quote: '„Zawsze wiesz, zanim powiem”',
      description:
        'Dwie minuty rozmowy z Tobą i każdy problem natychmiast traci na sile. Masz dar wyczuwania nastrojów na odległość i zawsze wiesz, które słowa przyniosą ulgę.',
      tag: 'Scena 3 · Niezawodny kontakt',
    },
    {
      id: '04',
      title: 'Odnajdywanie zaginionych rzeczy',
      quote: '„Leżało przecież na widoku!”',
      description:
        'Przedmioty, które rozpłynęły się w powietrzu, pod Twoim spojrzeniem materializują się w trzy sekundy. Rodzinna supermoc, której nikt inny nie potrafi racjonalnie wytłumaczyć.',
      tag: 'Scena 4 · Domowa magia',
    },
  ];

  // Birthday letter (138 words, strictly within 120-180 words)
  const letterParagraphs = [
    'Droga Kamilo,',
    'Gdyby ktoś spróbował napisać scenariusz do najpiękniejszej opowieści o naszym domu, Ty byłabyś jego najjaśniejszą postacią. To Ty każdego dnia przypominasz nam, że prawdziwe szczęście nie potrzebuje głośnych dekoracji – rodzi się przy wspólnym stole, w cieple podanego kubka herbaty i w Twoim serdecznym uśmiechu, który potrafi rozproszyć nawet największe troski.',
    'Dziękujemy Ci za Twoją anielską cierpliwość, za mądrość, która zawsze wskazuje właściwą drogę, i za to niezwykłe poczucie bezpieczeństwa, jakim nas otaczasz. Dziękujemy za każdy obiad przygotowany z miłością, za wszystkie wysłuchane historie i za to, że w Twoim sercu zawsze jest miejsce na wyrozumiałość i czułość.',
    'W dniu Twoich urodzin życzymy Ci niegasnącego zdrowia, głębokiego spokoju ducha, czasu na Twoje małe pasje i ludzi wokół, którzy będą dbać o Ciebie tak pięknie, jak Ty dbasz o nas. Niech każdy kolejny dzień mieni się dla Ciebie najjaśniejszymi odcieniami szczęścia.',
    'Sto lat, Kamilo!',
  ];

  const fullLetter = letterParagraphs.join('\n\n') + '\n\nZ bezgraniczną miłością,\nAmelie & Twoja Rodzina';

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(fullLetter);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2400);
  };

  const handleNextChapter = () => {
    if (soundEnabled) audio.playPageTurn();
    setCurrentChapter((prev) => Math.min(prev + 1, 2));
  };

  const handlePrevChapter = () => {
    if (soundEnabled) audio.playPageTurn();
    setCurrentChapter((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-500 relative selection:bg-[#FF5C8A] selection:text-black flex flex-col justify-between">
      {/* Canvas for confetti */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* FLOATING TOP BAR FOR QUIET CONTROLS */}
      <header className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none no-print">
        <div className="pointer-events-auto">
          {isBookOpen && (
            <button
              onClick={handleCloseBook}
              className="px-3.5 py-1.5 rounded-full border border-[var(--border-line)] bg-[var(--surface-raised)]/90 backdrop-blur-md text-xs font-semibold text-[var(--text-secondary)] hover:text-[#FF5C8A] hover:border-[#FF5C8A] transition-all flex items-center gap-1.5 shadow-sm"
              title="Zamknij księgę wspomnień"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Zamknij księgę</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleToggleAmbient}
            title={ambientPlaying ? 'Wycisz melodię' : 'Włącz łagodną melodię'}
            aria-label={ambientPlaying ? 'Wycisz melodię' : 'Włącz łagodną melodię'}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5 ${
              ambientPlaying
                ? 'border-[#FF5C8A] text-[#FF5C8A] bg-[#FF5C8A]/15'
                : 'border-[var(--border-line)] text-[var(--text-muted)] bg-[var(--surface-raised)]/80 hover:text-[var(--text-primary)]'
            }`}
          >
            {ambientPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{ambientPlaying ? 'Melodia gra' : 'Muzyka'}</span>
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? 'Tryb jasny' : 'Tryb ciemny'}
            aria-label={isDarkMode ? 'Tryb jasny' : 'Tryb ciemny'}
            className="p-2 rounded-full border border-[var(--border-line)] bg-[var(--surface-raised)]/80 backdrop-blur-md text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-[#F8C8D8]" /> : <Moon className="w-3.5 h-3.5 text-[#FF5C8A]" />}
          </button>
        </div>
      </header>

      {/* =========================================================================
          THE 3D BOOK EXPERIENCE
         ========================================================================= */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-10 book-scene">
        
        {/* BOOK CONTAINER */}
        <div
          className={`w-full max-w-5xl transition-all duration-1000 ${
            isBookOpen ? 'max-w-5xl' : 'max-w-lg'
          }`}
        >
          {/* THE BOOK SHELL */}
          <div className="relative rounded-2xl bg-[#151518] border-2 border-[#2A2A2E] shadow-[0_30px_70px_rgba(0,0,0,0.9)] overflow-hidden">
            
            {/* BOOK SPINE ON THE FAR LEFT (Visible in 3D) */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/80 via-[#2A2A2E]/60 to-transparent z-30 pointer-events-none border-r border-[#2A2A2E]/50" />

            {/* PINK BOOKMARK RIBBON (HANGING FROM THE BOTTOM) */}
            <div className="absolute left-14 -bottom-6 w-5 h-16 bg-[#FF5C8A] shadow-[0_4px_12px_rgba(255,92,138,0.5)] z-40 rounded-b-sm transform skew-x-3 pointer-events-none" />

            {/* ===================================================================
                THE 3D FRONT COVER (TURNS OPEN WITH REAL 3D HINGE)
               =================================================================== */}
            {!isBookOpen && (
              <div
                onClick={handleOpenBook}
                className="cursor-pointer group select-none min-h-[540px] sm:min-h-[600px] p-8 sm:p-12 flex flex-col justify-between relative z-20 book-cover-hinge"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleOpenBook();
                }}
                aria-label="Dotknij, aby otworzyć księgę dla Mamy Kamili przygotowaną przez Amelie"
              >
                {/* Decorative Filigree Borders in Pink & Silver */}
                <div className="absolute inset-4 border border-[#FF5C8A]/30 rounded-xl pointer-events-none" />
                <div className="absolute inset-6 border border-[#2A2A2E] rounded-lg pointer-events-none" />

                {/* Cover Header */}
                <div className="text-center space-y-3 pt-4 z-10">
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
                <div className="my-8 flex flex-col items-center justify-center z-10">
                  <div className="w-24 h-24 rounded-full bg-[#1E1E22] border-2 border-[#FF5C8A] shadow-[0_0_35px_rgba(255,92,138,0.35)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
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
                    <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF5C8A] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,92,138,0.5)] group-hover:bg-[#F28DAE] transition-colors">
                      <BookOpen className="w-4 h-4" />
                      <span>Dotknij, aby otworzyć księgę</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================
                THE OPENED BOOK SPREAD (INSIDE THE BOOK)
               =================================================================== */}
            {isBookOpen && (
              <div className="min-h-[580px] sm:min-h-[640px] flex flex-col justify-between p-6 sm:p-10 z-10 animate-fade-in">
                
                {/* Book Header / Breadcrumb */}
                <div className="flex items-center justify-between border-b border-[var(--border-line)] pb-4 text-xs font-semibold text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#FF5C8A]">Księga Życzeń</span>
                    <span>·</span>
                    <span>Dla Mamy Kamili od <strong className="text-[var(--text-primary)]">Amelie</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span>Rozdział {currentChapter + 1} z 3</span>
                  </div>
                </div>

                {/* SPREAD CONTENT BY CHAPTER */}
                <div className="my-6">
                  {/* ===============================================================
                      CHAPTER 0: CANDLE RITUAL & SEQUENTIAL LETTERS (K-A-M-I-L-A)
                     =============================================================== */}
                  {currentChapter === 0 && (
                    <div className="space-y-8 animate-fade-in">
                      {/* Step Header */}
                      <div className="text-center space-y-2">
                        <div className="text-xs uppercase tracking-widest font-bold text-[#FF5C8A]">
                          Rytuał Urodzinowy
                        </div>
                        <h2 className="font-serif-display text-3xl sm:text-5xl font-bold text-[var(--text-primary)]">
                          {isCandleLit ? 'Święty Płomień Życzenia' : 'Światło Zostało Zgaszone'}
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
                          {isCandleLit
                            ? 'Pomyśl w sercu najpiękniejsze życzenie. Następnie dotknij płomienia świecy na ekranie, aby go zgasić i odkryć tajemnicę imienia.'
                            : 'Płomień zgasł, a Twoje życzenie poleciało do gwiazd. Spójrz, jak rozbłyskują litery Twojego imienia:'}
                        </p>
                      </div>

                      {/* THE REALISTIC CANDLE */}
                      <div className="py-4 flex flex-col items-center justify-center select-none relative">
                        {/* Ambient table glow */}
                        {isCandleLit && (
                          <div className="absolute w-64 h-64 rounded-full bg-[#FF5C8A]/15 blur-3xl pointer-events-none animate-aura-pulse" />
                        )}

                        <div
                          onClick={handleExtinguishCandle}
                          className="cursor-pointer group flex flex-col items-center focus:outline-none"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') handleExtinguishCandle();
                          }}
                          aria-label={isCandleLit ? 'Dotknij świecy, aby zgasić płomień' : 'Świeca jest zgaszona'}
                        >
                          <svg
                            className="w-48 h-64 overflow-visible"
                            viewBox="0 0 200 250"
                            aria-hidden="true"
                          >
                            <defs>
                              <linearGradient id="waxGradReal" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#1E1E22" />
                                <stop offset="35%" stopColor="#35353C" />
                                <stop offset="70%" stopColor="#25252A" />
                                <stop offset="100%" stopColor="#121215" />
                              </linearGradient>
                              <radialGradient id="flameGradReal" cx="50%" cy="70%" r="50%">
                                <stop offset="0%" stopColor="#FFF" />
                                <stop offset="35%" stopColor="#F8C8D8" />
                                <stop offset="70%" stopColor="#FF5C8A" />
                                <stop offset="95%" stopColor="#C2185B" />
                                <stop offset="100%" stopColor="transparent" />
                              </radialGradient>
                            </defs>

                            {/* Pedestal */}
                            <ellipse cx="100" cy="235" rx="72" ry="11" fill="#151518" stroke="#2A2A2E" strokeWidth="1.5" />
                            <ellipse cx="100" cy="232" rx="62" ry="8" fill="#1E1E22" stroke="#6B6B73" strokeWidth="0.75" />

                            {/* Candle Wax Body with Drippings */}
                            <path
                              d="M 64 125 C 64 120, 136 120, 136 125 L 136 228 C 136 232, 64 232, 64 228 Z"
                              fill="url(#waxGradReal)"
                              stroke="#2A2A2E"
                              strokeWidth="1"
                            />
                            {/* Wax drip trails */}
                            <path d="M 68 125 Q 71 145 71 160 Q 69 168 66 165 Z" fill="#2A2A2E" opacity="0.8" />
                            <path d="M 130 125 Q 128 140 131 155 Q 134 162 135 158 Z" fill="#35353C" opacity="0.8" />

                            {/* Molten pool at top */}
                            <ellipse cx="100" cy="125" rx="36" ry="8" fill="#25252A" stroke="#3A3A42" strokeWidth="0.75" />

                            {/* Cotton Wick */}
                            <path d="M 100 125 Q 99 114 102 108" fill="none" stroke="#121215" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="102" cy="108" r="1.5" fill={isCandleLit ? "#FF5C8A" : "#6B6B73"} />

                            {/* FLAME OR SMOKE */}
                            {isCandleLit ? (
                              <g className="animate-realistic-flame" style={{ transformOrigin: "100px 108px" }}>
                                <path d="M 102 108 C 84 100, 78 70, 101 42 C 124 70, 118 100, 102 108 Z" fill="url(#flameGradReal)" />
                                <path d="M 102 108 C 94 104, 92 84, 101 64 C 110 84, 108 104, 102 108 Z" fill="#FFF" />
                              </g>
                            ) : (
                              <g className="animate-smoke-wisp" style={{ transformOrigin: "102px 108px" }}>
                                <path d="M 102 108 Q 98 90 104 75 T 98 45" fill="none" stroke="#B5B5BC" strokeWidth="2" opacity="0.6" />
                                <circle cx="102" cy="98" r="3" fill="#6B6B73" opacity="0.4" />
                                <circle cx="105" cy="80" r="4.5" fill="#D9D9DE" opacity="0.3" />
                              </g>
                            )}
                          </svg>

                          <div className="mt-2">
                            {isCandleLit ? (
                              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF5C8A]/15 border border-[#FF5C8A]/50 text-[#FF5C8A] text-xs font-semibold group-hover:bg-[#FF5C8A] group-hover:text-black transition-colors">
                                <Flame className="w-3.5 h-3.5 fill-current" />
                                <span>Dotknij świecy, aby zgasić płomień</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-line)] text-xs text-[var(--text-muted)]">
                                <Check className="w-3.5 h-3.5 text-[#FF5C8A]" />
                                <span>Świeca zgaszona · Marzenie wysłane</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {!isCandleLit && (
                          <button
                            onClick={handleRelightCandle}
                            className="mt-3 text-xs text-[var(--text-muted)] hover:text-[#FF5C8A] flex items-center gap-1 underline underline-offset-2"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Zapal świecę ponownie</span>
                          </button>
                        )}
                      </div>

                      {/* SEQUENTIAL ILLUMINATION OF K-A-M-I-L-A */}
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="font-serif-display text-2xl font-bold text-[var(--text-primary)]">
                            Barwy Szczęścia Kamili
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {kamilaLetters.map((item, idx) => {
                            const isRevealed = !isCandleLit && idx < revealedLettersCount;
                            return (
                              <div
                                key={idx}
                                className={`rounded-xl p-5 border transition-all duration-500 flex flex-col justify-between ${
                                  isRevealed
                                    ? 'bg-[var(--surface-raised)] border-[#FF5C8A] shadow-[0_0_20px_rgba(255,92,138,0.2)] -translate-y-0.5'
                                    : isCandleLit
                                    ? 'bg-[var(--surface-raised)]/70 border-[var(--border-line)]'
                                    : 'bg-[var(--surface-raised)]/40 border-[var(--border-line)] opacity-60'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span
                                      className={`font-serif-display text-5xl font-black leading-none transition-all duration-500 ${
                                        isRevealed ? 'text-[#FF5C8A] scale-105' : 'text-[var(--text-muted)]'
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
                      </div>
                    </div>
                  )}

                  {/* ===============================================================
                      CHAPTER 1: DWA SERIALE & NAJLEPSZE SCENY
                     =============================================================== */}
                  {currentChapter === 1 && (
                    <div className="space-y-10 animate-fade-in">
                      {/* Section A: Dwa seriale, jedna prawda */}
                      <div className="space-y-4">
                        <div className="text-center space-y-1">
                          <div className="text-xs uppercase tracking-widest font-bold text-[#FF5C8A]">
                            Rozdział I
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
                              Najpiękniejsze chwile nie potrzebują wielkich dekoracji – mieszkają w kubku gorącej herbaty i czułym uśmiechu.
                            </p>
                          </div>

                          <div className="bg-[var(--surface-raised)] border border-[var(--border-line)] rounded-xl p-5 space-y-2">
                            <span className="font-serif-display text-2xl font-bold text-[#FF5C8A]">03</span>
                            <h4 className="font-serif-display text-lg font-bold text-[var(--text-primary)]">
                              Nadzieja po każdej burzy
                            </h4>
                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                              Twój spokojny głos i mądrość przynoszą słońce. Zawsze potrafisz napełnić nas wiarą, że ze wszystkim sobie poradzimy.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Section B: Najlepsze sceny z Twojego domu */}
                      <div className="space-y-4 pt-6 border-t border-[var(--border-line)]">
                        <div className="text-center space-y-1">
                          <div className="text-xs uppercase tracking-widest font-bold text-[#FF5C8A]">
                            Rozdział II
                          </div>
                          <h3 className="font-serif-display text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                            Najlepsze sceny z Twojego domu
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {scenes.map((scene) => (
                            <div
                              key={scene.id}
                              className="bg-[var(--surface-raised)] border border-[var(--border-line)] rounded-xl p-5 space-y-2"
                            >
                              <div className="flex justify-between text-xs text-[var(--text-muted)] font-semibold">
                                <span>{scene.tag}</span>
                                <span className="text-[#FF5C8A]">#{scene.id}</span>
                              </div>
                              <h4 className="font-serif-display text-xl font-bold text-[var(--text-primary)]">
                                {scene.title}
                              </h4>
                              <div className="font-cursive text-xl text-[#FF5C8A]">
                                {scene.quote}
                              </div>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                {scene.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ===============================================================
                      CHAPTER 2: LIST URODZINOWY OD AMELIE & NAPISY KOŃCOWE
                     =============================================================== */}
                  {currentChapter === 2 && (
                    <div className="space-y-10 animate-fade-in">
                      {/* Section A: The Heartfelt Letter */}
                      <div className="bg-[var(--surface-raised)] border border-[var(--border-line)] rounded-2xl p-7 sm:p-9 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-line)]">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#FF5C8A]">
                            <Heart className="w-4 h-4 fill-[#FF5C8A]" />
                            <span>List od Amelie</span>
                          </div>

                          <div className="flex items-center gap-2 no-print">
                            <button
                              onClick={handleCopyLetter}
                              className="px-3 py-1 rounded-lg text-xs font-semibold border border-[var(--border-line)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#FF5C8A] transition-colors flex items-center gap-1"
                            >
                              {copiedLetter ? <Check className="w-3.5 h-3.5 text-[#FF5C8A]" /> : <Share2 className="w-3.5 h-3.5" />}
                              <span>{copiedLetter ? 'Skopiowano' : 'Kopiuj'}</span>
                            </button>
                            <button
                              onClick={() => window.print()}
                              className="px-3 py-1 rounded-lg text-xs font-semibold border border-[var(--border-line)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#FF5C8A] transition-colors flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Drukuj</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4 font-serif text-base sm:text-lg leading-relaxed text-[var(--text-primary)]">
                          <p className="font-semibold text-2xl text-[#FF5C8A]">
                            Droga Kamilo,
                          </p>
                          <p>
                            Gdyby ktoś spróbował napisać scenariusz do najpiękniejszej opowieści o naszym domu, Ty byłabyś jego najjaśniejszą postacią. To Ty każdego dnia przypominasz nam, że prawdziwe szczęście nie potrzebuje głośnych dekoracji – rodzi się przy wspólnym stole, w cieple podanego kubka herbaty i w Twoim serdecznym uśmiechu, który potrafi rozproszyć nawet największe troski.
                          </p>
                          <p>
                            Dziękujemy Ci za Twoją anielską cierpliwość, za mądrość, która zawsze wskazuje właściwą drogę, i za to niezwykłe poczucie bezpieczeństwa, jakim nas otaczasz. Dziękujemy za każdy obiad przygotowany z miłością, za wszystkie wysłuchane historie i za to, że w Twoim sercu zawsze jest miejsce na wyrozumiałość i czułość.
                          </p>
                          <p>
                            W dniu Twoich urodzin życzymy Ci niegasnącego zdrowia, głębokiego spokoju ducha, czasu na Twoje małe pasje i ludzi wokół, którzy będą dbać o Ciebie tak pięknie, jak Ty dbasz o nas. Niech każdy kolejny dzień mieni się dla Ciebie najjaśniejszymi odcieniami szczęścia.
                          </p>
                          <p className="font-serif-display font-bold text-2xl sm:text-3xl text-[#FF5C8A] pt-1">
                            Sto lat, Kamilo!
                          </p>
                        </div>

                        <div className="pt-4 border-t border-[var(--border-line)] flex justify-between items-center">
                          <span className="text-xs text-[var(--text-muted)]">18 października</span>
                          <div className="text-right">
                            <div className="font-cursive text-2xl text-[#FF5C8A] font-bold">
                              Z bezgraniczną miłością, Amelie
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">oraz Twoja Rodzina</div>
                          </div>
                        </div>
                      </div>

                      {/* Section B: End Credits */}
                      <div className="bg-[var(--surface-raised)] rounded-2xl border border-[var(--border-line)] p-6 sm:p-8 divide-y divide-[var(--border-line)]">
                        <div className="py-2.5 flex justify-between text-xs sm:text-sm">
                          <span className="text-[#FF5C8A] font-bold uppercase">W roli głównej:</span>
                          <span className="font-semibold text-[var(--text-primary)]">Kamila (Niezastąpiona Mama)</span>
                        </div>
                        <div className="py-2.5 flex justify-between text-xs sm:text-sm">
                          <span className="text-[#FF5C8A] font-bold uppercase">Reżyseria podarunku:</span>
                          <span className="font-bold text-[#FF5C8A]">Amelie</span>
                        </div>
                        <div className="py-2.5 flex justify-between text-xs sm:text-sm">
                          <span className="text-[#FF5C8A] font-bold uppercase">Scenariusz:</span>
                          <span>Bezwarunkowa Miłość</span>
                        </div>
                        <div className="py-2.5 flex justify-between text-xs sm:text-sm">
                          <span className="text-[#FF5C8A] font-bold uppercase">Produkcja:</span>
                          <span>Amelie & Twoja Rodzina</span>
                        </div>

                        <div className="pt-6 text-center">
                          <div className="font-serif-display font-cursive text-4xl sm:text-5xl font-bold text-[#FF5C8A]">
                            Ciąg dalszy nastąpi…
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SPREAD PAGINATION CONTROLS (TURNING PAGES INSIDE THE BOOK) */}
                <div className="border-t border-[var(--border-line)] pt-4 flex items-center justify-between no-print">
                  <button
                    onClick={handlePrevChapter}
                    disabled={currentChapter === 0}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      currentChapter === 0
                        ? 'text-[var(--text-muted)]/40 cursor-not-allowed'
                        : 'text-[var(--text-secondary)] hover:text-[#FF5C8A]'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Poprzednia strona</span>
                  </button>

                  <div className="flex gap-2">
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (soundEnabled) audio.playPageTurn();
                          setCurrentChapter(idx);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          currentChapter === idx
                            ? 'bg-[#FF5C8A] scale-125'
                            : 'bg-[var(--border-line)] hover:bg-[#FF5C8A]/50'
                        }`}
                        title={`Przejdź do strony ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNextChapter}
                    disabled={currentChapter === 2}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      currentChapter === 2
                        ? 'text-[var(--text-muted)]/40 cursor-not-allowed'
                        : 'text-[var(--text-secondary)] hover:text-[#FF5C8A]'
                    }`}
                  >
                    <span>Następna strona</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>

      {/* QUIET FOOTER */}
      <footer className="text-center py-4 text-xs text-[var(--text-muted)] no-print">
        Podarunek dla Mamy Kamili · Przygotowany z miłością przez <span className="text-[#FF5C8A] font-semibold">Amelie</span>
      </footer>
    </div>
  );
}
