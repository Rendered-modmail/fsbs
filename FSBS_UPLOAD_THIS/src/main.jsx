import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  Blocks,
  Bot,
  CalendarCheck,
  Clock3,
  Coins,
  Flame,
  Gamepad2,
  LockKeyhole,
  Mail,
  Medal,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'fsbs_waitlist_emails';
const ASSETS = '/assets/';

function readEmails() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendWaitlistEmail(email) {
  const response = await fetch('/api/send-waitlist-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    let errorMessage = 'Email sending is not connected yet.';

    try {
      const data = await response.json();
      errorMessage = data.error || errorMessage;
    } catch {
      // Keep the friendly fallback when the response is not JSON.
    }

    throw new Error(errorMessage);
  }
}

function WaitlistForm({ compact = false, onSignup }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setStatus('error');
      setMessage('Enter a valid email address.');
      return;
    }

    const emails = readEmails();

    if (emails.includes(normalizedEmail)) {
      setStatus('error');
      setMessage('That email is already on the waitlist.');
      return;
    }

    setIsSubmitting(true);

    const updatedEmails = [...emails, normalizedEmail];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmails));
    setEmail('');
    onSignup(updatedEmails.length);

    try {
      await sendWaitlistEmail(normalizedEmail);
      setStatus('success');
      setMessage("You're on the waitlist! Check your email.");
    } catch (error) {
      setStatus('warning');
      setMessage(error.message || 'Saved here. Email sending is not connected yet.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={`waitlist-form ${compact ? 'mx-auto max-w-2xl' : ''}`} onSubmit={handleSubmit}>
      <div className="relative flex-1">
        <label className="sr-only" htmlFor={compact ? 'final-email' : 'hero-email'}>
          Email address
        </label>
        <Mail className="pointer-events-none absolute left-5 top-[1.15rem] h-5 w-5 text-[#b9a898]" />
        <input
          id={compact ? 'final-email' : 'hero-email'}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="paper-input"
          placeholder="you@student.com"
          type="email"
        />
        {message ? <p className={`waitlist-message waitlist-message-${status}`} role="status">{message}</p> : null}
      </div>
      <button className="waitlist-button" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Join the Waitlist'}
        <ArrowRight className="h-5 w-5" />
      </button>
    </form>
  );
}

function SectionHeader({ eyebrow, title, children, centered = false }) {
  return (
    <div className={`mb-10 max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}>
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="marker-title text-4xl leading-tight text-ink sm:text-5xl">{title}</h2>
      {children ? <p className="mt-4 text-lg leading-8 text-ink/75">{children}</p> : null}
    </div>
  );
}

function AssetImage({ name, alt, className = '' }) {
  return <img className={className} src={`${ASSETS}${name}`} alt={alt} />;
}

function QuestBoard() {
  const stats = [
    ['25:00', 'Focus Time', 'bg-[#fff1b8]'],
    ['+120 XP', 'Earned', 'bg-[#dff7c8]'],
    ['34', 'Coins', 'bg-[#ffd5dc]'],
    ['3', 'Quests', 'bg-[#d8efff]'],
  ];

  return (
    <div className="quest-board doodle-card animate-float" data-reveal="right">
      <div className="tape tape-one" />
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.12em] text-purple-600">Current Quest</p>
          <h3 className="marker-title mt-1 text-4xl text-purple-700">Deep Work Run</h3>
        </div>
        <span className="live-pill">Live</span>
      </div>

      <div className="doodle-inner flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="icon-tile bg-[#f0d8ff]">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-black text-ink">Block distracting apps</p>
            <p className="text-sm text-ink/60">TikTok, YouTube, games</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-ink">8</p>
          <p className="text-xs font-bold text-ink/60">blocked</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([value, label, color], index) => (
          <div key={label} className={`stat-note ${color}`} style={{ '--reveal-delay': `${index * 70}ms` }}>
            <p className="text-2xl font-black text-ink">{value}</p>
            <p className="text-sm font-bold text-ink/75">{label}</p>
          </div>
        ))}
      </div>

      <div className="pet-level-card">
        <AssetImage name="pet-cat.png" alt="Cute FSBS pet cat" className="quest-cat bounce-pet" />
        <div>
          <p className="text-base font-bold text-ink/70">Pet Level</p>
          <p className="text-4xl font-black text-ink">12</p>
          <div className="progress-track mt-3 h-3 overflow-hidden rounded-full border border-[#cda991] bg-white">
            <div className="progress-fill h-full w-[62%] rounded-full bg-purple-500" />
          </div>
          <p className="mt-3 font-bold text-ink/75">New room upgrade unlocked!</p>
        </div>
      </div>
    </div>
  );
}

function HeroDecorations() {
  return (
    <>
      <AssetImage name="desk-bookshelf.png" alt="" className="bookshelf-graphic" />
      <AssetImage name="sticky-notes.png" alt="Sticky notes with focus encouragement" className="sticky-notes-img" />
      <AssetImage name="safe-star-yellow.svg" alt="" className="hero-doodle hero-star" />
      <AssetImage name="safe-flower-pink.svg" alt="" className="hero-doodle hero-flower-large" />
      <AssetImage name="safe-puff-doodle.svg" alt="" className="hero-doodle hero-puff" />
      <AssetImage name="safe-flower-pink.svg" alt="" className="hero-doodle hero-flower-small" />
    </>
  );
}

function ProblemSketch() {
  return (
    <div className="problem-card">
      <div className="problem-copy">
        <SectionHeader eyebrow="The Problem" title="Your phone is engineered to win. Your study time isn't.">
          Procrastination eats away at your goals while TikTok, YouTube, games, and endless notifications keep you hooked.
        </SectionHeader>
      </div>
      <AssetImage
        name="problem-scene.png"
        alt="Distraction monster, tired study cat, and a note saying Let's change that"
        className="problem-scene-img"
      />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body, color }) {
  return (
    <article className={`feature-card ${color}`}>
      <div className="feature-icon">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-2xl font-black text-ink">{title}</h3>
      <p className="mt-3 leading-7 text-ink/70">{body}</p>
    </article>
  );
}

function PetPreview() {
  const stats = [
    ['Hunger', '82%', 'bg-[#f8c4d2]'],
    ['Happiness', '91%', 'bg-[#c7efad]'],
    ['Energy', '68%', 'bg-[#bfe8ff]'],
    ['Level', '12', 'bg-[#d8bcff]'],
  ];

  return (
    <section id="pets" className="px-5 py-20 sm:px-8" data-reveal="up">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <SectionHeader eyebrow="Pets" title="Level up a little friend while you study.">
          Earn coins from real focus sessions, then upgrade your pet with food, toys, accessories, rooms, and skins.
        </SectionHeader>
        <div className="doodle-card p-5 sm:p-7" data-reveal="right">
          <div className="grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
            <div className="pet-preview-panel">
              <AssetImage name="pet-cat.png" alt="Happy FSBS pet cat" className="pet-preview-cat bounce-pet" />
              <h3 className="marker-title mt-5 text-center text-4xl text-ink">Nova</h3>
              <p className="text-center font-bold text-ink/60">FSBS study pet</p>
            </div>
            <div className="space-y-5">
              <div className="grid gap-3">
                {stats.map(([label, value, color], index) => (
                  <div key={label} className="pet-stat" style={{ '--reveal-delay': `${index * 80}ms` }}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-black text-ink">{label}</span>
                      <span className="font-black text-ink/75">{value}</span>
                    </div>
                    <div className="h-3 rounded-full border border-[#d8b99f] bg-white">
                      <div className={`progress-fill h-full rounded-full ${color}`} style={{ width: label === 'Level' ? '72%' : value }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Food', Coins],
                  ['Toys', Gamepad2],
                  ['Accessories', Sparkles],
                ].map(([label, Icon]) => (
                  <button key={label} className="shop-button">
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [signupCount, setSignupCount] = useState(0);

  useEffect(() => {
    setSignupCount(readEmails().length);
  }, []);

  useEffect(() => {
    const revealItems = document.querySelectorAll('[data-reveal]');

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  const features = useMemo(
    () => [
      ['App blocking', ShieldCheck, 'Block the apps that pull you away when you are supposed to be locked in.', 'bg-[#fff0b8]'],
      ['Focus timer', Clock3, 'Run clear study sessions with a timer that feels like a quest instead of a chore.', 'bg-[#d9f5ff]'],
      ['XP and levels', Trophy, 'Turn completed sessions into visible progress, XP, and level-ups.', 'bg-[#ead8ff]'],
      ['Coins and pet shop', ShoppingBag, 'Spend earned coins on food, toys, accessories, rooms, and skins.', 'bg-[#ffd7df]'],
      ['Streaks', Flame, 'Build daily momentum without making your routine feel harsh or boring.', 'bg-[#ffe2bf]'],
      ['Daily quests', CalendarCheck, 'Start faster with small goals that make the next study block obvious.', 'bg-[#dff7c8]'],
      ['Leaderboards coming soon', Medal, 'Friendly competition with classmates and friends is on the roadmap.', 'bg-[#efe7ff]'],
    ],
    [],
  );

  return (
    <main className="min-h-screen overflow-hidden bg-paper text-ink">
      <header className="relative z-20 px-5 py-6 sm:px-8" data-reveal="down">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <a href="#top" aria-label="FSBS home">
            <AssetImage name="logo-fsbs.svg" alt="FSBS" className="logo-img" />
          </a>
          <div className="hidden items-center gap-8 text-lg font-black lg:flex">
            <a className="nav-link" href="#how-it-works">How it works</a>
            <a className="nav-link" href="#pets">Pets</a>
            <a className="nav-link" href="#features">Leaderboard</a>
          </div>
          <a className="cloud-button" href="#waitlist">Join Waitlist!</a>
        </nav>
      </header>

      <section id="top" className="hero-scene relative px-5 pb-20 pt-5 sm:px-8 lg:pb-24">
        <HeroDecorations />
        <div className="relative z-10 mx-auto grid max-w-7xl items-start gap-10 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="hero-copy" data-reveal="left">
            <h1 className="marker-title max-w-3xl text-6xl leading-[0.98] text-ink sm:text-7xl lg:text-8xl">
              <span className="highlight-pink">Stop</span> scrolling.
              <br />
              <span className="highlight-green">Start</span> growing.
            </h1>
            <p className="mt-7 max-w-2xl text-2xl font-black leading-10 text-ink/85">
              Beat procrastination, level up your pet, and turn studying into an{' '}
              <span className="underline-wiggle">adventure!</span>
            </p>
            <div className="mt-9 max-w-3xl">
              <WaitlistForm onSignup={setSignupCount} />
              <div className="mt-5 flex flex-wrap items-center gap-5 text-base font-bold text-purple-700">
                <span className="inline-flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Android beta coming soon!
                </span>
              </div>
            </div>
          </div>
          <QuestBoard />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8" data-reveal="up">
        <div className="mx-auto max-w-7xl">
          <ProblemSketch />
        </div>
      </section>

      <section id="how-it-works" className="px-5 py-20 sm:px-8" data-reveal="up">
        <div className="mx-auto max-w-7xl">
          <SectionHeader centered eyebrow="How It Works" title="Four tiny steps. One better study habit." />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['1', Blocks, 'Pick apps to block', 'Choose TikTok, YouTube, games, or any app that breaks your focus.'],
              ['2', Clock3, 'Start a focus session', 'Set the timer and begin one clean study quest.'],
              ['3', Coins, 'Earn XP and coins', 'Finish the session to collect rewards and level up.'],
              ['4', Sparkles, 'Upgrade your pet', 'Buy food, toys, accessories, rooms, and skins.'],
            ].map(([number, Icon, title, body], index) => (
              <article key={title} className="step-card" data-reveal="up" style={{ '--reveal-delay': `${index * 90}ms` }}>
                <span className="step-number">{number}</span>
                <Icon className="mb-5 h-8 w-8 text-purple-700" />
                <h3 className="text-2xl font-black text-ink">{title}</h3>
                <p className="mt-3 leading-7 text-ink/70">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-5 py-20 sm:px-8" data-reveal="up">
        <div className="mx-auto max-w-7xl">
          <SectionHeader centered eyebrow="Features" title="Focus tools with a little reward magic." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, Icon, body, color], index) => (
              <div key={title} data-reveal="up" style={{ '--reveal-delay': `${(index % 3) * 90}ms` }}>
                <FeatureCard icon={Icon} title={title} body={body} color={color} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <PetPreview />

      <section id="waitlist" className="px-5 py-20 sm:px-8" data-reveal="up">
        <div className="final-cta">
          <p className="section-eyebrow">Android Beta</p>
          <h2 className="marker-title text-5xl leading-tight text-ink sm:text-6xl">Be one of the first beta testers.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-xl font-bold leading-9 text-ink/75">
            Join FSBS early and help make studying feel more rewarding before launch.
          </p>
          <div className="mt-8">
            <WaitlistForm compact onSignup={setSignupCount} />
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-[#e6c9a8] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 font-bold text-ink/70 sm:flex-row sm:items-center sm:justify-between">
          <p className="marker-title text-3xl text-ink">FSBS</p>
          <p>Built for students who want studying to feel rewarding.</p>
        </div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
