import React from 'react';
import {
  ArrowRight,
  Bot,
  Braces,
  Code2,
  GitBranch,
  Layers3,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';

interface HomePageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const FEATURE_CARDS = [
  {
    title: 'Generate production-ready code',
    description: 'Move from rough intent to polished code blocks with fast, context-aware AI generation.',
    icon: <Sparkles size={18} />,
    accent: '#8b5cf6',
    className: 'lg:col-span-4 lg:row-span-2',
  },
  {
    title: 'Review every edge case',
    description: 'Catch bugs, style drift, and hidden risks before they slow your workflow down.',
    icon: <ShieldCheck size={18} />,
    accent: '#34d399',
    className: 'lg:col-span-2',
  },
  {
    title: 'Explain complex logic',
    description: 'Turn unfamiliar code into readable, teachable explanations for yourself or your team.',
    icon: <Workflow size={18} />,
    accent: '#60a5fa',
    className: 'lg:col-span-2',
  },
  {
    title: 'Translate across languages',
    description: 'Switch between Python, Java, Go, Rust, JavaScript, TypeScript, and C++ with confidence.',
    icon: <GitBranch size={18} />,
    accent: '#f472b6',
    className: 'lg:col-span-3',
  },
  {
    title: 'Stay in flow',
    description: 'One premium workspace for writing, reviewing, documenting, and refining code.',
    icon: <Layers3 size={18} />,
    accent: '#fbbf24',
    className: 'lg:col-span-3',
  },
];

function AmbientBackground() {
  return (
    <>
      <div className="ambient-grid pointer-events-none absolute inset-0" />
      <div className="ambient-noise pointer-events-none absolute inset-0" />
      <div className="ambient-blob ambient-blob-a" />
      <div className="ambient-blob ambient-blob-b" />
      <div className="ambient-blob ambient-blob-c" />
    </>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  accent,
  className,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  className?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 ${className || ''}`}
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        borderColor: 'rgba(255,255,255,0.08)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at top right, ${accent}22 0%, transparent 55%)` }}
      />
      <div
        className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl border"
        style={{ color: accent, borderColor: `${accent}55`, background: `${accent}14` }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-slate-100">{title}</h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

export default function HomePage({ onGetStarted, onSignIn }: HomePageProps) {
  return (
    <div className="relative h-full overflow-auto bg-[#050506] text-[#EDEDEF]">
      <AmbientBackground />

      <div className="relative mx-auto flex min-h-full w-full max-w-[1500px] flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="mb-10 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #5E6AD2 0%, #8b5cf6 100%)', boxShadow: '0 12px 30px rgba(94,106,210,0.35)' }}
            >
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">AI Code Assistant</div>
              <div className="text-sm text-slate-500">Premium developer tooling with cinematic depth</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSignIn}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.06]"
            >
              Sign in
            </button>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white"
              style={{
                background: 'linear-gradient(135deg, #5E6AD2 0%, #8b5cf6 100%)',
                boxShadow: '0 0 0 1px rgba(94,106,210,0.4), 0 12px 30px rgba(94,106,210,0.24)',
              }}
            >
              Get started
              <ArrowRight size={15} />
            </button>
          </div>
        </header>

        <main className="grid flex-1 gap-8 lg:grid-cols-[1.2fr_0.9fr]">
          <section className="flex flex-col justify-center py-6 lg:py-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#5E6AD2]/30 bg-[#5E6AD2]/10 px-3 py-1 text-xs font-mono uppercase tracking-[0.24em] text-[#aeb7ff]">
              <Code2 size={14} />
              Linear / Modern Experience
            </div>

            <h1 className="max-w-4xl bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-5xl font-semibold tracking-[-0.03em] text-transparent sm:text-6xl xl:text-7xl">
              The intelligent code workspace that feels like premium software.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
              Generate, review, explain, document, and refactor code inside a single atmospheric workspace built for developers who care about speed, clarity, and craft.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-medium text-white"
                style={{
                  background: 'linear-gradient(135deg, #5E6AD2 0%, #8b5cf6 100%)',
                  boxShadow: '0 0 0 1px rgba(94,106,210,0.45), 0 18px 50px rgba(94,106,210,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                Start building
                <ArrowRight size={16} />
              </button>

              <button
                onClick={onSignIn}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3.5 text-sm text-slate-200 transition hover:bg-white/[0.06]"
              >
                I already have an account
              </button>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                ['7', 'Supported languages'],
                ['AI', 'Review, docs, tests, translate'],
                ['1', 'Unified developer workflow'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border px-5 py-4"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                    borderColor: 'rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="text-2xl font-semibold text-white">{value}</div>
                  <div className="mt-1 text-sm text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="relative">
            <div
              className="relative overflow-hidden rounded-[28px] border p-5"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
                borderColor: 'rgba(255,255,255,0.08)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 40px 100px rgba(0,0,0,0.4), 0 0 120px rgba(94,106,210,0.08)',
              }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(94,106,210,0.22),transparent_40%)]" />
              <div className="relative flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0b1020]/90 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-rose-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-300/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-xs font-mono uppercase tracking-[0.24em] text-slate-500">Workspace</span>
                </div>
                <div className="rounded-full border border-[#5E6AD2]/25 bg-[#5E6AD2]/10 px-3 py-1 text-xs text-[#b8bfff]">
                  Real-time AI assistance
                </div>
              </div>

              <div className="relative mt-5 grid auto-rows-[180px] gap-4 lg:grid-cols-6">
                {FEATURE_CARDS.map((card) => (
                  <FeatureCard key={card.title} {...card} />
                ))}
              </div>

              <div className="mt-5 rounded-3xl border border-white/[0.06] bg-[#0c111d]/90 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-[0.24em] text-slate-500">Developer cockpit</div>
                    <div className="mt-2 text-lg font-semibold text-white">Code flows from prompt to polished output.</div>
                  </div>
                  <div className="rounded-2xl border border-[#5E6AD2]/35 bg-[#5E6AD2]/10 px-4 py-2 text-sm text-[#c5cbff]">
                    Precision tooling
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ['Prompt → Code', 'Natural language generation tuned for developer workflows.'],
                    ['Review → Refine', 'Instant feedback loops for correctness, style, and clarity.'],
                    ['Explain → Teach', 'Turn difficult code into readable insight for your team.'],
                  ].map(([title, body]) => (
                    <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                      <div className="text-sm font-semibold text-white">{title}</div>
                      <div className="mt-2 text-sm leading-relaxed text-slate-500">{body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
