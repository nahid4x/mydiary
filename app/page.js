import Link from 'next/link'
import {
  PenLine, Shield, Calendar, Search, BookOpen, ArrowRight,
  Sparkles, CloudCog, Check,
} from 'lucide-react'

export const metadata = {
  title: 'MyDiary — Your Private Personal Journal',
  description: 'A calm, private space to write, reflect, and remember.',
}

const features = [
  { icon: PenLine, title: 'Beautiful writing', desc: 'A distraction-free editor that gets out of the way so your thoughts can flow.' },
  { icon: Sparkles, title: 'Mood tracking', desc: 'Log how you feel in one tap and watch the emotional shape of your weeks emerge.' },
  { icon: Calendar, title: 'Calendar view', desc: 'Browse your memories day by day, month by month, the way you actually remember them.' },
  { icon: Shield, title: 'Private by default', desc: 'Every entry is encrypted end to end. Nobody reads your diary but you.' },
  { icon: CloudCog, title: 'Synced everywhere', desc: 'Start an entry on your phone, finish it on your laptop. It just follows you.' },
  { icon: Search, title: 'Find anything', desc: 'Search by word, mood, or tag and land on the exact entry you\u2019re thinking of.' },
]

const emotionStats = [
  { label: 'Content', pct: 38 },
  { label: 'Calm', pct: 24 },
  { label: 'Grateful', pct: 17 },
  { label: 'Tired', pct: 12 },
  { label: 'Anxious', pct: 9 },
]

const trustBar = [
  { icon: Shield, label: 'Private & secure' },
  { icon: CloudCog, label: 'Cloud synced' },
  { icon: BookOpen, label: 'Works everywhere' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFCFA] text-[#17181C] antialiased selection:bg-[#FF7A45]/20" style={{ overflowX: 'hidden', width: '100%' }}>
      {/* Ambient light — clipped to viewport, no negative positions leaking */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -10, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '38rem', height: '38rem', borderRadius: '50%', background: 'rgba(255,154,98,0.25)', filter: 'blur(140px)' }} />
        <div style={{ position: 'absolute', top: '5rem', right: 0, width: '30rem', height: '30rem', borderRadius: '50%', background: 'rgba(139,124,246,0.15)', filter: 'blur(130px)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '33%', width: '26rem', height: '26rem', borderRadius: '50%', background: 'rgba(255,107,107,0.10)', filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)', width: '34rem', height: '34rem', borderRadius: '50%', background: 'rgba(255,233,214,0.5)', filter: 'blur(180px)' }} />
        <div style={{ position: 'absolute', top: '6rem', right: '18%', width: '40rem', height: '40rem', borderRadius: '50%', background: 'rgba(139,124,246,0.06)', filter: 'blur(180px)' }} />
      </div>

      {/* Nav */}
      <div className="sticky top-5 z-40 px-4">
        <nav className="relative max-w-[1400px] mx-auto bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[18px] shadow-[0_10px_40px_-12px_rgba(23,24,28,0.12)] overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'linear-gradient(100deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
              animation: 'navSweep 6s ease-in-out infinite',
            }}
          />
          <div className="h-[52px] flex items-center justify-between px-3 sm:px-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#FF7A45,#FF9A62)' }}>
                <PenLine className="w-4 h-4 text-white" strokeWidth={2.25} />
              </div>
              <span className="font-serif font-semibold text-[17px] tracking-tight">MyDiary</span>
            </div>
            <div className="hidden md:flex items-center gap-9 text-[13.5px] font-medium text-[#6B6F78]">
              <a href="#features" className="hover:text-[#17181C] transition-colors">Features</a>
              <a href="#preview" className="hover:text-[#17181C] transition-colors">Preview</a>
              <a href="#faq" className="hover:text-[#17181C] transition-colors">FAQ</a>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-[13.5px] font-medium text-[#6B6F78] hover:text-[#17181C] transition-colors px-3 py-2">
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-white text-[13.5px] font-semibold px-3 py-2 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[2px] hover:scale-[1.03] flex items-center gap-1.5 shadow-[0_6px_20px_-4px_rgba(255,122,69,0.55)]"
                style={{ background: 'linear-gradient(135deg,#FF7A45,#FF9A62)' }}
              >
                <span className="hidden sm:inline">Get started </span><ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Hero */}
      <section
        id="preview"
        className="max-w-[1400px] mx-auto px-4 pt-[150px] pb-[170px] relative"
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 440px) 1fr', gap: '64px', alignItems: 'start', overflow: 'hidden' }}
      >
        <div className="animate-[fade-in_0.7s_ease-out_both]" style={{ minWidth: 0 }}>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md text-[#FF7A45] px-3.5 py-1.5 rounded-full text-[13px] font-medium mb-7 border border-[#ECE8DF] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Your thoughts deserve a beautiful home</span>
          </div>

          <h1 className="font-serif font-extrabold mb-4 tracking-tight leading-[0.9]" style={{ fontSize: 'clamp(3rem, 10vw, 5.25rem)', wordBreak: 'break-word' }}>
            <span className="block text-[#111216]">Write</span>
            <span className="block text-[#111216] -mt-2">without</span>
            <span
              className="block italic font-normal -mt-1 animate-[gradientShift_10s_ease-in-out_infinite]"
              style={{
                background: 'linear-gradient(100deg,#FF7A45,#F06EA9,#8B5CF6,#F06EA9,#FF7A45)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              distractions.
            </span>
          </h1>

          <p className="text-lg text-[#6B6F78] mb-9 leading-[1.65]" style={{ maxWidth: '360px' }}>
            A calm, private space to write, reflect, and remember. No ads. No noise. Just your words.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              href="/register"
              className="group relative flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-2xl text-[15px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:scale-[1.02] shadow-[0_14px_36px_-10px_rgba(255,122,69,0.55)] hover:shadow-[0_20px_48px_-10px_rgba(255,122,69,0.65)] overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#FF7A45,#FF9A62)' }}
            >
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
                style={{ background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)' }}
              />
              Start writing today
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="group relative flex items-center gap-2 text-[#17181C] font-medium px-7 py-3.5 rounded-2xl text-[15px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:scale-[1.02] overflow-hidden"
              style={{
                border: '1px solid rgba(255,122,69,0.3)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <span className="absolute inset-0 bg-white/60 backdrop-blur-md -z-10" />
              Explore features
              <ArrowRight className="w-4 h-4 opacity-40 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[13px] text-[#8A8E96] mb-8">
            {trustBar.map((t, i) => (
              <span key={t.label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-[#D8D4C9]">•</span>}
                <t.icon className="w-3.5 h-3.5 text-[#FF7A45]" /> {t.label}
              </span>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 pt-6 border-t border-[#ECE8DF]">
            <div className="flex -space-x-2">
              {['#FFD9BC', '#E5DBFB', '#C9E4DE', '#F6D6D6'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white shrink-0" style={{ background: c }} />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-[#FF7A45] text-[11px] leading-none mb-0.5">
                {'★★★★★'}
              </div>
              <p className="text-[12px] text-[#8A8E96] leading-none">50,000+ journals created</p>
            </div>
          </div>
        </div>

        {/* Journal card — hidden on mobile */}
        <div
          className="relative animate-[fade-in_0.8s_ease-out_0.15s_both] hidden md:block"
          style={{ paddingTop: '32px', paddingBottom: '32px', paddingLeft: '20px', paddingRight: '20px' }}
        >
          <div style={{ maxWidth: '620px', width: '100%' }}>
            <div
              className="relative z-[5] rounded-[24px] overflow-hidden animate-[floatRotate_9s_ease-in-out_infinite] transition-transform duration-500 hover:!scale-[1.008]"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(23,24,28,0.07)',
                boxShadow: '0 30px 60px -12px rgba(23,24,28,0.22), 0 4px 12px rgba(23,24,28,0.08)',
                minHeight: '420px',
              }}
            >
              <div className="flex items-center gap-2.5 px-7 pt-6 pb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#FF7A45,#FF9A62)' }}>
                  <PenLine className="w-3.5 h-3.5 text-white" strokeWidth={2.25} />
                </div>
                <div>
                  <p className="font-serif font-semibold text-[14px] leading-none">MyDiary</p>
                  <p className="text-[10.5px] text-[#B0B4BB] mt-0.5">Personal Journal</p>
                </div>
              </div>
              <div className="border-t border-[#F1EFE9]" />

              <div className="px-7 pt-6 pb-7">
                <p className="text-[12px] text-[#B0B4BB] mb-2">Tuesday, August 5</p>
                <h3 className="font-serif text-[24px] text-[#17181C] leading-snug mb-5">A quiet evening</h3>
                <div className="space-y-3.5">
                  <p className="text-[14.5px] text-[#6B6F78] leading-[1.85]">
                    Today felt slower than usual, in the best way. I made tea, sat by
                  </p>
                  <p className="text-[14.5px] text-[#6B6F78] leading-[1.85]">
                    the window, and let my thoughts settle before writing anything
                  </p>
                  <p className="text-[14.5px] text-[#6B6F78] leading-[1.85] inline-block">
                    down. There's something grounding about
                    <span
                      className="inline-block ml-0.5"
                      style={{ borderRight: '2px solid #FF7A59', animation: 'caretBlink 0.8s step-end infinite' }}
                    >
                      &nbsp;
                    </span>
                  </p>
                </div>
              </div>

              <div className="border-t border-[#F1EFE9]" />
              <div className="flex items-center gap-4 px-7 py-4 text-[12px] text-[#8A8E96]">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Private</span>
                <span className="flex items-center gap-1.5 text-[#4CD37E] font-medium"><Check className="w-3.5 h-3.5" /> Auto-saved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mood analytics */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="grid lg:grid-cols-[1.1fr,1fr] gap-10 items-center">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-3 text-[#FF7A45]">Understand yourself</p>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 tracking-tight leading-[1.15]">
              Every entry teaches you
              <span className="block italic font-normal text-[#FF7A45]">something new.</span>
            </h2>
            <p className="text-[#6B6F78] text-[17px] leading-relaxed max-w-md mb-10">
              MyDiary quietly tracks the emotional shape of your days, so patterns become visible without you having to look for them.
            </p>

            <div className="grid grid-cols-2 gap-y-6 max-w-sm">
              {[
                { v: '50K+', l: 'Entries written' },
                { v: '100%', l: 'End-to-end encrypted' },
                { v: '99.9%', l: 'Uptime' },
                { v: '24/7', l: 'Cross-device sync' },
              ].map((m) => (
                <div key={m.l}>
                  <p className="text-2xl font-serif font-semibold tracking-tight">{m.v}</p>
                  <p className="text-[13px] text-[#8A8E96] mt-0.5">{m.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#ECE8DF] bg-white/80 backdrop-blur-xl shadow-[0_30px_80px_-24px_rgba(23,24,28,0.18)] p-8">
            <div className="flex items-center justify-between mb-7">
              <p className="text-[15px] font-semibold">Community mood snapshot</p>
              <span className="text-[11px] text-[#8A8E96] bg-[#F8F7F4] px-2.5 py-1 rounded-full">This week</span>
            </div>

            <div className="space-y-5">
              {emotionStats.map((e) => (
                <div key={e.label}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="text-[#17181C] font-medium">{e.label}</span>
                    <span className="text-[#8A8E96] font-medium">{e.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F1EFE9] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${e.pct}%`, background: 'linear-gradient(90deg,#FF7A45,#FF9A62)' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 pt-6 border-t border-[#ECE8DF] flex items-center gap-2 text-xs text-[#8A8E96]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF7A45]" />
              Based on 12,400 entries this week, across all users
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-28">
        <div className="text-center mb-16">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-3 text-[#FF7A45]">Built for your everyday</p>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-4 tracking-tight">Everything a diary should be</h2>
          <p className="text-[#6B6F78] text-lg max-w-md mx-auto leading-relaxed">
            Simple enough to use every day. Powerful enough to last a lifetime.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative bg-white/70 backdrop-blur-md rounded-[24px] border border-[#ECE8DF] p-7 hover:shadow-[0_24px_60px_-20px_rgba(23,24,28,0.16)] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: '#FFF1E8' }}
              >
                <f.icon className="w-5 h-5 text-[#FF7A45]" strokeWidth={1.75} />
              </div>
              <h3 className="font-semibold mb-2 text-[15px]">{f.title}</h3>
              <p className="text-sm text-[#6B6F78] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1100px] mx-auto px-4 relative" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
        <div
          className="text-center relative overflow-hidden animate-[gradientShift_28s_ease-in-out_infinite]"
          style={{
            borderRadius: '32px',
            minHeight: '460px',
            padding: '80px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 15% 15%, #F2814F, transparent 55%), radial-gradient(circle at 50% 45%, #E6907F, transparent 62%), radial-gradient(circle at 85% 85%, #8478D9, transparent 55%), linear-gradient(135deg, #F2814F, #E6907F, #8478D9)',
            backgroundSize: '200% 200%',
            filter: 'drop-shadow(0 40px 80px rgba(23,24,28,0.14))',
          }}
        >
          <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[26rem] h-[26rem] rounded-full bg-white/10 blur-[100px]" />

          <h2
            className="font-serif font-bold relative tracking-tight leading-[1.05] text-white mx-auto text-[38px] md:text-[52px]"
            style={{ maxWidth: '700px', marginBottom: '18px' }}
          >
            Your story, beautifully kept.
          </h2>

          <p className="text-white/90 leading-relaxed mx-auto relative text-[17px] md:text-[19px]" style={{ maxWidth: '560px', marginBottom: '32px' }}>
            A private home for your thoughts, memories, and moments — encrypted by default.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 relative" style={{ marginBottom: '36px' }}>
            {['Private', 'Encrypted', 'Cloud Sync', 'Search'].map((label, i) => (
              <span
                key={label}
                className="text-white text-[14px] flex items-center animate-[fade-in_0.6s_ease-out_both]"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '999px',
                  height: '42px',
                  padding: '0 18px',
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                {label}
              </span>
            ))}
          </div>

          <Link
            href="/register"
            className="relative inline-flex items-center gap-2 bg-white text-[#FF7A45] font-semibold text-[16px] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:scale-[1.02]"
            style={{
              borderRadius: '18px',
              padding: '18px 34px',
              boxShadow: '0 18px 50px rgba(0,0,0,0.15)',
            }}
          >
            Create your diary
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-white/80 text-[13px] relative" style={{ marginTop: '24px' }}>
            ★★★★★ 4.9 · Trusted by 50,000+ writers
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ECE8DF] bg-white/50 backdrop-blur-sm py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#FF7A45,#FF9A62)' }}>
              <PenLine className="w-3 h-3 text-white" />
            </div>
            <span className="font-serif font-semibold text-sm">MyDiary</span>
          </div>
          <p className="text-sm text-[#8A8E96]">© {new Date().getFullYear()} MyDiary. Your thoughts, safely kept.</p>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatRotate {
          0%, 100% { transform: rotate(-3deg) translateY(0px); }
          50% { transform: rotate(-3deg) translateY(-10px); }
        }
        @keyframes caretBlink {
          0%, 100% { border-color: #FF7A45; }
          50% { border-color: transparent; }
        }
        @keyframes navSweep {
          0%, 15% { transform: translateX(-100%); }
          35%, 100% { transform: translateX(200%); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @media (max-width: 768px) {
          #preview {
            grid-template-columns: 1fr !important;
            padding-top: 80px !important;
            padding-bottom: 80px !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  )
}