import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Send, ShieldCheck, Lock, Sparkles, Zap } from 'lucide-react';
import { Carousel } from './components/Carousel.tsx';
import { PlatformCard } from './components/PlatformCard.tsx';
import { BatchesView } from './components/BatchesView.tsx';
import { UpcomingView } from './components/UpcomingView.tsx';
import { BottomNav, NavTab } from './components/BottomNav.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { InternalWebview } from './components/InternalWebview.tsx';
import { GBAI } from './components/GBAI.tsx';
import { GBChat } from './components/GBChat.tsx';
import { SecretAdminModal } from './components/SecretAdminModal.tsx';
import { INITIAL_PLATFORMS } from './data/platforms.ts';
import { INITIAL_SLIDES } from './data/carousel.ts';
import { PlatformItem, CarouselSlide } from './types.ts';
import {
  subscribeToPlatforms,
  subscribeToCarousel,
  seedInitialPlatformsIfEmpty,
  seedInitialCarouselIfEmpty,
  getStoredPlatforms,
  getStoredCarousel,
} from './services/firestoreService.ts';

// ==========================================
// 1. INLINED SPLASH SCREEN COMPONENT
// ==========================================
interface SplashScreenProps {
  onComplete: () => void;
}

function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<1 | 2>(1);

  useEffect(() => {
    const phaseTimer = setTimeout(() => {
      setPhase(2);
    }, 1700);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(phaseTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden">
      {phase === 1 && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#1c1f24] text-white animate-in fade-in duration-500">
          <div className="relative flex flex-col items-center justify-center px-4 animate-in fade-in zoom-in-95 duration-700">
            <div className="absolute -inset-8 rounded-full bg-amber-500/30 blur-3xl pointer-events-none animate-pulse" />
            <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-[32px] overflow-hidden p-1 bg-gradient-to-b from-amber-300/40 via-amber-400/20 to-transparent shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-amber-400/50 bg-black">
              <img
                src="/assets/sarvottam_splash.jpg"
                alt="Sarvottam Yadav Emblem"
                className="w-full h-full object-cover rounded-[28px]"
              />
            </div>
            <div className="mt-6 px-5 py-1.5 rounded-full bg-[#11141c]/90 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <span className="text-xs sm:text-sm font-black tracking-widest text-amber-400 uppercase">
                SARVOTTAM YADAV
              </span>
            </div>
          </div>
          <div className="absolute bottom-10 inset-x-12 max-w-xs mx-auto h-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 animate-[pulse_1s_infinite] w-full" />
          </div>
        </div>
      )}

      {phase === 2 && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#07090e] text-white animate-in fade-in duration-500">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
          <div className="relative flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <div
              className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full blur-3xl opacity-80 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(56,189,248,0.7) 0%, rgba(168,85,247,0.55) 35%, rgba(245,158,11,0.45) 70%, rgba(239,68,68,0.2) 100%)',
              }}
            />
            <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-[32px] overflow-hidden p-1 bg-gradient-to-b from-white/25 via-white/10 to-transparent shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-white/20 bg-black">
              <img
                src="/assets/gb_study_icon.png"
                alt="GB Study Icon"
                className="w-full h-full object-cover rounded-[28px]"
              />
            </div>
            <div className="mt-7 text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center justify-center">
              <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]">
                gbstudy.
              </span>
              <span className="text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]">
                in
              </span>
            </div>
            <div className="mt-4 px-6 py-2 rounded-full bg-[#121622]/80 backdrop-blur-md border border-slate-700/60 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <div className="text-xs sm:text-sm font-bold tracking-widest uppercase flex items-center gap-1.5">
                <span className="text-slate-200">SARVOTTAM</span>
                <span className="text-sky-400">YADAV</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-10 inset-x-12 max-w-xs mx-auto h-1 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 animate-pulse w-full" />
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. INLINED WELCOME MODAL COMPONENT
// ==========================================
interface WelcomeModalProps {
  initialName: string;
  onConfirm: (name: string) => void;
}

function WelcomeModal({ initialName, onConfirm }: WelcomeModalProps) {
  const [name, setName] = useState(initialName || 'SARVOTTAM');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
    } else {
      onConfirm('SARVOTTAM');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-[30px] bg-[#111624] border border-sky-500/25 p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-[#182338] border border-sky-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.2)] mb-5">
          <User className="w-8 h-8 text-sky-400" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Welcome Student
        </h2>
        <p className="mt-1 text-sm text-slate-400 font-normal">
          Enter your full name to start learning.
        </p>
        <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
              className="w-full px-5 py-3.5 rounded-[16px] bg-[#1a2133] border border-slate-700/70 text-white placeholder-slate-500 text-base focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all text-center font-medium"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-[16px] bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-bold text-base shadow-[0_4px_20px_rgba(56,189,248,0.35)] active:scale-[0.98] transition-all cursor-pointer"
          >
            Start Exploring
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 3. INLINED TELEGRAM MODAL COMPONENT
// ==========================================
interface TelegramModalProps {
  onJoin: () => void;
  onSkip: () => void;
}

function TelegramModal({ onJoin, onSkip }: TelegramModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-[30px] bg-[#111624] border border-sky-500/25 p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-[#162742] border border-sky-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.25)] mb-5">
          <Send className="w-8 h-8 text-sky-400 transform -rotate-12 translate-x-0.5" strokeWidth={2.2} />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Join Telegram
        </h2>
        <p className="mt-2 text-sm text-slate-400 font-normal leading-relaxed px-2">
          Join our official channel for latest updates, notes & new platform announcements.
        </p>
        <div className="w-full mt-7 space-y-3.5">
          <button
            onClick={onJoin}
            className="w-full py-3.5 px-6 rounded-[16px] bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-bold text-base shadow-[0_4px_20px_rgba(56,189,248,0.35)] active:scale-[0.98] transition-all cursor-pointer"
          >
            Join Channel
          </button>
          <button
            onClick={onSkip}
            className="w-full py-2 text-sm text-slate-400 hover:text-white font-medium transition-colors cursor-pointer"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. INLINED STUDENT ANALYTICS MODAL COMPONENT
// ==========================================
interface StudentAnalyticsModalProps {
  studentName: string;
  activeSeconds: number;
  onClose: () => void;
  onOpenAdmin: () => void;
}

function StudentAnalyticsModal({
  studentName,
  activeSeconds,
  onClose,
  onOpenAdmin,
}: StudentAnalyticsModalProps) {
  const hours = Math.floor(activeSeconds / 3600);
  const minutes = Math.floor((activeSeconds % 3600) / 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-[30px] bg-[#111624] border border-sky-500/25 p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-[#182338] border border-sky-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.25)] mb-5">
          <User className="w-8 h-8 text-sky-400" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Student Analytics
        </h2>
        <p className="mt-1 text-sm text-slate-400 font-normal">
          Your registered account information
        </p>
        <div className="w-full mt-6 rounded-[20px] bg-[#171f30] border border-slate-700/50 p-5 space-y-4 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 font-medium">Student Name</span>
            <span className="text-white font-bold tracking-wide">
              {studentName || 'SARVOTTAM'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 font-medium">Active Time</span>
            <span className="text-white font-bold tracking-wide">
              {hours}h {minutes}m
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 font-medium">Access</span>
            <span className="text-white font-bold tracking-wide">
              Full Access (Free)
            </span>
          </div>
        </div>
        <div className="w-full mt-6 space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
            className="w-full py-3 px-5 rounded-[16px] bg-[#162138] hover:bg-[#1e2e4e] border border-sky-500/30 text-sky-400 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Admin Control Panel</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-[16px] bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-bold text-base shadow-[0_4px_20px_rgba(56,189,248,0.35)] active:scale-[0.98] transition-all cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. INLINED PLATFORM LAUNCHING MODAL COMPONENT
// ==========================================
interface PlatformLaunchingModalProps {
  platform?: PlatformItem | null;
  onLaunched: () => void;
}

function PlatformLaunchingModal({
  platform,
  onLaunched,
}: PlatformLaunchingModalProps) {
  const [progress, setProgress] = useState(20);
  const [statusText, setStatusText] = useState('Connecting to high-speed server...');
  const onLaunchedRef = useRef(onLaunched);
  onLaunchedRef.current = onLaunched;

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(60);
      setStatusText('Verifying student access & courses...');
    }, 450);

    const t2 = setTimeout(() => {
      setProgress(95);
      setStatusText(`Opening ${platform?.name || 'Platform'}...`);
    }, 1100);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Launching now...');
    }, 1650);

    const t4 = setTimeout(() => {
      onLaunchedRef.current();
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [platform]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-72 sm:w-80 rounded-[32px] bg-[#0f1422] border-2 border-sky-500/40 p-6 flex flex-col items-center justify-center text-center shadow-[0_20px_60px_rgba(56,189,248,0.25)] animate-in zoom-in-95 duration-200">
        <div className="relative mb-4">
          <div className="absolute -inset-2 rounded-2xl bg-sky-500/30 blur-lg animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden p-1 bg-gradient-to-b from-sky-400/30 to-slate-900 border border-sky-400/50 bg-[#162035] shadow-md flex items-center justify-center">
            {platform?.icon ? (
              <img
                src={platform.icon}
                alt={platform.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Sparkles className="w-8 h-8 text-sky-400" />
            )}
          </div>
        </div>

        <div className="relative w-10 h-10 mb-3">
          <div className="w-10 h-10 rounded-full border-3 border-sky-500/20 border-t-sky-400 animate-spin" />
        </div>

        <h3 className="text-white font-black text-lg tracking-tight">
          Launching {platform?.name || 'Platform'}...
        </h3>

        <p className="mt-1 text-xs text-slate-400 font-medium h-4 transition-all">
          {statusText}
        </p>

        <div className="w-full mt-4 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={() => onLaunchedRef.current()}
          className="mt-3.5 px-4 py-1.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-sky-400" />
          <span>Open Immediately (Skip)</span>
        </button>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>GB Study • Sarvottam Yadav</span>
        </div>
      </div>
    </div>
  );
}

type AppStep =
  | 'splash'
  | 'welcome'
  | 'telegram'
  | 'home'
  | 'launching'
  | 'batches'
  | 'webview';

export default function App() {
  const [appStep, setAppStep] = useState<AppStep>('splash');
  const [studentName, setStudentName] = useState<string>('SARVOTTAM');
  const [activeSeconds, setActiveSeconds] = useState<number>(0);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [showSecretUnlock, setShowSecretUnlock] = useState<boolean>(false);

  // 20-clicks consecutive secret counter for GB Study icon
  const [clickCount, setClickCount] = useState<number>(0);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [clickNotice, setClickNotice] = useState<string | null>(null);

  // Current User / Owner State
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    id: string;
    email?: string;
    isOwner: boolean;
    isAdmin: boolean;
  }>(() => {
    const isOwnerAuth = localStorage.getItem('gb_admin_auth') === 'true';
    const ownerName = localStorage.getItem('gb_admin_owner_name') || 'Sarvottam Yadav';
    const ownerEmail = localStorage.getItem('gb_admin_owner_email') || '';
    return {
      name: isOwnerAuth ? ownerName : 'SARVOTTAM',
      id: isOwnerAuth ? 'owner-sarvottam' : 'student-' + Math.random().toString(36).substr(2, 6),
      email: ownerEmail,
      isOwner: isOwnerAuth,
      isAdmin: isOwnerAuth,
    };
  });

  const [selectedPlatform, setSelectedPlatform] = useState<PlatformItem>(INITIAL_PLATFORMS[0]);
  const [activeWebviewUrl, setActiveWebviewUrl] = useState<{ title: string; url: string }>({
    title: '',
    url: '',
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<NavTab>('platforms');
  const [telegramToast, setTelegramToast] = useState<string | null>(null);

  // Real-time persistent state (loaded from local store immediately, synced with Firestore)
  const [platforms, setPlatforms] = useState<PlatformItem[]>(() => getStoredPlatforms());
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(() => getStoredCarousel());

  // Real-time subscription to platforms and carousel
  useEffect(() => {
    // Ensure initial platforms exist in Firestore for real-time synchronization
    seedInitialPlatformsIfEmpty();

    const unsubPlatforms = subscribeToPlatforms((livePlatforms) => {
      setPlatforms(livePlatforms);
    });

    const unsubCarousel = subscribeToCarousel((liveSlides) => {
      setCarouselSlides(liveSlides);
    });

    return () => {
      unsubPlatforms();
      unsubCarousel();
    };
  }, []);

  // Active time counter for Student Analytics
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 20 Clicks Handler on GB Study Icon
  const handleLogoClick = () => {
    const now = Date.now();
    let newCount = clickCount + 1;

    // Reset if gap between clicks is more than 3 seconds
    if (now - lastClickTime > 3000) {
      newCount = 1;
    }

    setClickCount(newCount);
    setLastClickTime(now);

    if (newCount >= 10 && newCount < 20) {
      setClickNotice(`${20 - newCount} clicks to Owner Gateway...`);
    }

    if (newCount >= 20) {
      setClickCount(0);
      setClickNotice('👑 Secret Gateway Unlocked!');
      setTimeout(() => setClickNotice(null), 1500);
      setShowSecretUnlock(true);
    }
  };

  const handleOwnerAuthSuccess = (ownerData: { name: string; email: string }) => {
    setCurrentUser({
      name: ownerData.name,
      id: 'owner-sarvottam',
      email: ownerData.email,
      isOwner: true,
      isAdmin: true,
    });
    setStudentName(ownerData.name);
    setShowSecretUnlock(false);
    setShowAdmin(true);
  };

  const handleWelcomeConfirm = (name: string) => {
    setStudentName(name);
    setCurrentUser((prev) => ({
      ...prev,
      name,
    }));
    setAppStep('telegram');
  };

  const handleTelegramJoin = () => {
    setTelegramToast('Opening official GB Study Telegram Channel...');
    setTimeout(() => {
      setTelegramToast(null);
      setAppStep('home');
    }, 800);
  };

  const handleTelegramSkip = () => {
    setAppStep('home');
  };

  // Launching Modal ALWAYS appears on clicking any platform
  const handlePlatformClick = (platform: PlatformItem) => {
    setSelectedPlatform(platform);
    setAppStep('launching');
  };

  // Launching Modal also appears when clicking a carousel banner with a target URL
  const handleSlideClick = (slide: CarouselSlide) => {
    if (!slide.targetUrl?.trim()) return;

    const pseudoPlatform: PlatformItem = {
      id: slide.id,
      name: slide.title,
      subtitle: slide.subtitle || 'GB Study Featured Platform',
      icon: slide.image,
      targetUrl: slide.targetUrl.trim(),
      openMode: slide.openMode || 'internal',
      order: slide.order || 1,
    };
    setSelectedPlatform(pseudoPlatform);
    setAppStep('launching');
  };

  // Once launching animation and connection finish, open the platform immediately
  const handleLaunchComplete = useCallback(() => {
    if (!selectedPlatform) {
      setAppStep('home');
      return;
    }

    const targetUrl = selectedPlatform.targetUrl?.trim();
    const mode = selectedPlatform.openMode || 'internal';

    if (mode === 'external' && targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setAppStep('home');
      return;
    }

    if (mode === 'new_tab' && targetUrl) {
      window.open(targetUrl, '_blank');
      setAppStep('home');
      return;
    }

    if (mode === 'same_tab' && targetUrl) {
      window.location.href = targetUrl;
      return;
    }

    if (mode === 'internal' && targetUrl) {
      setActiveWebviewUrl({
        title: selectedPlatform.name,
        url: targetUrl,
      });
      setAppStep('webview');
      return;
    }

    // Default: in-app Batches study view
    setAppStep('batches');
  }, [selectedPlatform]);

  const handleBackToHome = () => {
    setAppStep('home');
  };

  const filteredPlatforms = platforms.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#05070b] text-slate-100 flex justify-center select-none overflow-x-hidden">
      {/* 100% PURE MOBILE APP CONTAINER (Edge-to-Edge Native Feel) */}
      <div className="w-full max-w-md min-h-screen bg-[#080b11] relative overflow-hidden flex flex-col shadow-2xl">
        {/* Click Notice / Toast */}
        {clickNotice && (
          <div className="absolute top-3 inset-x-4 z-50 p-2.5 rounded-2xl bg-amber-500/90 text-slate-950 font-black text-xs text-center shadow-lg border border-amber-300 animate-in fade-in duration-200">
            {clickNotice}
          </div>
        )}

        {/* Telegram Toast */}
        {telegramToast && (
          <div className="absolute top-4 inset-x-4 z-50 p-3 rounded-2xl bg-sky-500 text-slate-950 font-bold text-xs text-center shadow-lg animate-in slide-in-from-top duration-300">
            {telegramToast}
          </div>
        )}

        {/* STEP 1: AUTOMATIC 3.5s SPLASH SCREEN (Sarvottam Yadav Gold Emblem -> GB Study App Icon + Rainbow Glow, 100% Automatic with 0 clicks required) */}
        {appStep === 'splash' && (
          <SplashScreen onComplete={() => setAppStep('home')} />
        )}

        {/* STEP 3: WELCOME STUDENT MODAL */}
        {appStep === 'welcome' && (
          <WelcomeModal
            initialName={studentName}
            onConfirm={handleWelcomeConfirm}
          />
        )}

        {/* STEP 4: JOIN TELEGRAM MODAL */}
        {appStep === 'telegram' && (
          <TelegramModal
            onJoin={handleTelegramJoin}
            onSkip={handleTelegramSkip}
          />
        )}

        {/* STEP 6: PLATFORM LAUNCHING ANIMATION SPINNER (Shows for every platform until connection completes) */}
        {appStep === 'launching' && (
          <PlatformLaunchingModal
            platform={selectedPlatform}
            onLaunched={handleLaunchComplete}
          />
        )}

        {/* INTERNAL WEBVIEW */}
        {appStep === 'webview' && (
          <InternalWebview
            title={activeWebviewUrl.title}
            url={activeWebviewUrl.url}
            onBack={handleBackToHome}
          />
        )}

        {/* STEP 7: BATCHES VIEW */}
        {appStep === 'batches' ? (
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <BatchesView
              platformName={selectedPlatform.name}
              onBack={handleBackToHome}
            />
          </div>
        ) : (
          /* STEP 5: MAIN HUB WITH BOTTOM TABS */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top Header */}
            <div className="px-4 py-3 bg-[#080b11] flex items-center justify-between shrink-0 border-b border-slate-900/60 z-20">
              <div className="flex items-center gap-3">
                {/* Secret 20-Click GB Study Logo */}
                <div
                  onClick={handleLogoClick}
                  className="w-12 h-12 rounded-2xl p-1 bg-gradient-to-b from-white/20 to-transparent border border-white/20 shadow-md overflow-hidden bg-[#0a0e17] cursor-pointer active:scale-90 transition-transform"
                  title="GB Study Logo"
                >
                  <img
                    src="/assets/gb_study_icon.png"
                    alt="GB Study Logo"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>

                {/* Brand & Creator Title */}
                <div className="flex flex-col">
                  <div className="text-xl font-black tracking-tight text-white flex items-center gap-1 leading-tight">
                    <span>gbstudy.</span>
                    <span className="text-sky-400">live</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      SARVOTTAM YADAV
                    </span>
                    {currentUser.isOwner && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold text-[9px]">
                        OWNER
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Button */}
              <button
                onClick={() => setShowAnalytics(true)}
                className="w-10 h-10 rounded-2xl bg-[#141b2c] border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-sky-400 hover:border-sky-400/50 transition-all cursor-pointer shadow-md"
                title="Student Profile"
              >
                <div className="w-6 h-6 rounded-full border border-sky-400/40 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                </div>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* TAB 1: PLATFORMS */}
              {activeTab === 'platforms' && (
                <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-2 pb-24 flex flex-col space-y-4">
                  {/* Hero Carousel */}
                  <Carousel
                    slides={carouselSlides}
                    onSlideClick={handleSlideClick}
                  />

                  {/* Ultra Platform Hub Badge with Real-Time Count */}
                  <div className="flex flex-col items-center gap-1.5 pt-1">
                    <div className="px-4 py-1.5 rounded-full bg-sky-950/40 border border-sky-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                      <span className="text-[11px] font-extrabold tracking-widest text-sky-300 uppercase">
                        ULTRA PLATFORM HUB • {platforms.length} LIVE
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Firebase Real-Time Synced for All Students
                    </span>
                  </div>

                  {/* Section Title */}
                  <div className="text-center">
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      Choose Your{' '}
                      <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                        Platform
                      </span>
                    </h2>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search platforms, notes, features..."
                      className="w-full py-3.5 px-6 rounded-full bg-[#111726]/90 border border-slate-700/60 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all shadow-inner text-center font-medium"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Platforms Cards List */}
                  <div className="space-y-3 pt-1">
                    {filteredPlatforms.length > 0 ? (
                      filteredPlatforms.map((platform) => (
                        <PlatformCard
                          key={platform.id}
                          platform={platform}
                          onClick={handlePlatformClick}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-sm">
                        No platforms found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: GB AI */}
              {activeTab === 'ai' && <GBAI />}

              {/* TAB 3: GB CHAT (Telegram Discussion Group) */}
              {activeTab === 'chat' && <GBChat currentUser={currentUser} />}

              {/* TAB 4: UPCOMING */}
              {activeTab === 'upcoming' && (
                <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-24">
                  <UpcomingView />
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION BAR (Platforms, GB AI, GB Chat, Upcoming) */}
        {appStep === 'home' && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
          />
        )}

        {/* STUDENT ANALYTICS MODAL */}
        {showAnalytics && (
          <StudentAnalyticsModal
            studentName={studentName}
            activeSeconds={activeSeconds}
            onClose={() => setShowAnalytics(false)}
            onOpenAdmin={() => {
              setShowAnalytics(false);
              setShowAdmin(true);
            }}
          />
        )}

        {/* SECRET ADMIN AUTH MODAL (Triggered by 20 clicks on GB Study icon) */}
        <SecretAdminModal
          isOpen={showSecretUnlock}
          onClose={() => setShowSecretUnlock(false)}
          onSuccess={handleOwnerAuthSuccess}
        />

        {/* ADMIN CONTROL PANEL */}
        {showAdmin && (
          <AdminPanel
            platforms={platforms}
            carouselSlides={carouselSlides}
            onClose={() => setShowAdmin(false)}
          />
        )}
      </div>
    </div>
  );
}
