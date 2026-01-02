
import Link from 'next/link';
import {
    Building2,
    Zap,
    ArrowRight,
    ChevronRight,
    CheckCircle2,
    LineChart,
    ShieldCheck,
    AlertTriangle,
    Users,
    Activity,
    History,
    FileText,
    Target,
    ZapOff,
    ShieldAlert
} from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-blue-500/30 font-sans overflow-x-hidden">
            {/* Atmospheric Glow Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Propflow <span className="text-blue-500">AI</span></span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium hover:text-white transition-colors px-4 py-2 text-slate-400">
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            Request Early Access
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-6 pt-40 pb-24 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold tracking-widest uppercase mb-8 animate-fade-in">
                        <Zap className="w-3 h-3 fill-current" />
                        Software-Only Intelligence
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.05] drop-shadow-sm text-white">
                        Detect Utility Issues Early. <br className="hidden md:block" />
                        Bill Utilities <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Fairly.</span>
                    </h1>

                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 mb-12 leading-relaxed">
                        Software-only utility intelligence for multifamily properties with shared meters. Catch abnormal usage and allocate costs accurately — no hardware, no sensors, no enterprise systems.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <Link
                            href="/signup"
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold px-10 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 group"
                        >
                            Request Early Access
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Dashboard Preview / Minimal Mockup */}
                    <div className="relative max-w-5xl mx-auto border border-white/10 rounded-[2rem] overflow-hidden bg-[#0a0f1e] shadow-2xl p-4">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10" />
                        <div className="aspect-[16/10] bg-[#0f172a] rounded-[1.5rem] flex flex-col">
                            <div className="h-12 border-b border-white/5 flex items-center px-6 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                                </div>
                                <div className="ml-4 h-4 w-32 bg-white/5 rounded-full" />
                            </div>
                            <div className="flex-1 p-8 grid grid-cols-3 gap-6">
                                <div className="col-span-2 space-y-6">
                                    <div className="h-48 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-center">
                                        <Activity className="w-12 h-12 text-blue-500/20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="h-32 bg-white/5 border border-white/5 rounded-2xl" />
                                        <div className="h-32 bg-white/5 border border-white/5 rounded-2xl" />
                                    </div>
                                </div>
                                <div className="h-full bg-white/5 border border-white/5 rounded-2xl p-6 space-y-4 text-left">
                                    <div className="h-4 w-2/3 bg-white/10 rounded-full mb-4" />
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <div className="w-2 h-2 rounded-full bg-blue-500/40" />
                                            <div className="h-2 w-full bg-white/5 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Problem Section */}
                <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 text-left">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black mb-8 text-white leading-tight">Shared Utilities Create <br /> Hidden Risk</h2>
                            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                Most operators don’t lack effort — they lack visibility. In shared-metered buildings, the building owner often pays for inefficiencies that go undetected.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    "Utility waste goes unnoticed until bills spike",
                                    "Leaks and abnormal usage are discovered too late",
                                    "R.U.B.S billing is manual, opaque, and dispute-prone",
                                    "Existing solutions require hardware, consultants, or enterprise contracts"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                        </div>
                                        <p className="text-slate-300 font-medium">{item}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500/10 blur-[100px] rounded-full" />
                            <div className="relative p-8 rounded-3xl bg-[#0a0f1e] border border-white/10 shadow-2xl">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="h-4 w-24 bg-white/10 rounded-full" />
                                        <div className="h-6 w-16 bg-red-500/20 rounded-full border border-red-500/30" />
                                    </div>
                                    <div className="h-32 bg-gradient-to-b from-red-500/10 to-transparent rounded-2xl border-x border-t border-red-500/20" />
                                    <div className="space-y-3">
                                        <div className="h-4 w-full bg-white/5 rounded-full" />
                                        <div className="h-4 w-full bg-white/5 rounded-full opacity-60" />
                                        <div className="h-4 w-2/3 bg-white/5 rounded-full opacity-30" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Solution Section */}
                <section className="max-w-7xl mx-auto px-6 py-24 bg-white/5 rounded-[3rem] my-12 text-center">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight leading-tight">Utility Intelligence Built for <br /> Shared-Metered Properties</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            Propflow is a software-only utility intelligence layer designed specifically for R.U.B.S properties. No sensors. No installs. No platform replacement.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        {[
                            {
                                icon: <Activity className="w-8 h-8 text-blue-500" />,
                                title: "Detect Early",
                                desc: "Find abnormal water, gas, or electric usage before the bill arrives."
                            },
                            {
                                icon: <Users className="w-8 h-8 text-indigo-500" />,
                                title: "Allocate Fairly",
                                desc: "Allocate shared utility bills fairly and transparently using R.U.B.S."
                            },
                            {
                                icon: <History className="w-8 h-8 text-emerald-500" />,
                                title: "Defensible Records",
                                desc: "Create a defensible billing record for every tenant, reducing disputes."
                            },
                            {
                                icon: <ShieldCheck className="w-8 h-8 text-amber-500" />,
                                title: "Reduce Waste",
                                desc: "Minimize surprise costs and wasted spend with pro-active monitoring."
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-[#020617] border border-white/10 hover:border-blue-500/30 transition-all group">
                                <div className="mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                                <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Key Features */}
                <section id="features" className="max-w-7xl mx-auto px-6 py-24 text-left">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">Focused Utility Control</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Feature 1 */}
                        <div className="md:col-span-2 group relative p-10 rounded-[2.5rem] bg-[#0a0f1e] border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all h-full">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-14 h-14 bg-blue-600/20 rounded-2xl mb-6 flex items-center justify-center">
                                    <LineChart className="w-7 h-7 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Utility Anomaly Detection (Software-Only)</h3>
                                <p className="text-slate-400 text-lg mb-8 max-w-md">Monitors utility data against historical baselines to flag unexpected spikes that may indicate leaks, system failures, or abnormal consumption.</p>
                            </div>
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Activity className="w-48 h-48 text-blue-500" />
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative p-10 rounded-[2.5rem] bg-[#0a0f1e] border border-white/10 overflow-hidden hover:border-indigo-500/30 transition-all">
                            <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl mb-6 flex items-center justify-center">
                                <Users className="w-7 h-7 text-indigo-500" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Fair R.U.B.S Billing</h3>
                            <p className="text-slate-400 mb-6">Mathematically sound allocation based on transparent ratios:</p>
                            <ul className="space-y-3">
                                {[
                                    "Square footage weighting",
                                    "Occupancy-based usage"
                                ].map((li, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                        <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                                        {li}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative p-10 rounded-[2.5rem] bg-[#0a0f1e] border border-white/10 overflow-hidden hover:border-emerald-500/30 transition-all md:col-span-3">
                            <div className="flex flex-col md:flex-row gap-12 items-center">
                                <div className="flex-1">
                                    <div className="w-14 h-14 bg-emerald-600/20 rounded-2xl mb-6 flex items-center justify-center">
                                        <History className="w-7 h-7 text-emerald-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-white">Billing Snapshots & History</h3>
                                    <p className="text-slate-400 text-lg">Saves a snapshot of tenant data at the time of billing, protecting operators from retroactive disputes. Every bill is auditable and defensible.</p>
                                </div>
                                <div className="flex-1 w-full flex justify-end">
                                    <div className="w-full max-w-sm p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                        <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">
                                            <span>Snapshot ID: PR-102</span>
                                            <span>June 2025</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-emerald-500/20 rounded-full">
                                            <div className="h-full w-2/3 bg-emerald-500 rounded-full" />
                                        </div>
                                        <div className="space-y-2 opacity-50">
                                            <div className="h-2 w-full bg-white/10 rounded-full" />
                                            <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Software-Only Section */}
                <section className="max-w-7xl mx-auto px-6 py-24 my-12 text-left">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative order-2 lg:order-1">
                            <div className="absolute inset-0 bg-blue-500/5 blur-[80px] rounded-full" />
                            <div className="relative grid grid-cols-2 gap-4">
                                {[
                                    { icon: <ZapOff className="text-red-400" />, label: "No IoT Installs" },
                                    { icon: <ShieldAlert className="text-amber-400" />, label: "No Sensor Failures" },
                                    { icon: <Users className="text-blue-400" />, label: "No Consultants" },
                                    { icon: <FileText className="text-emerald-400" />, label: "Fast Adoption" }
                                ].map((item, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-[#0a0f1e] border border-white/5 flex flex-col items-center text-center gap-3">
                                        {item.icon}
                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <h2 className="text-4xl md:text-5xl font-black mb-8 text-white leading-tight">Why Software-Only <br /> Matters</h2>
                            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                                Many utility management solutions rely on IoT hardware installs, sensor networks, and consulting-heavy audits. These come with long contracts and high complexity.
                            </p>
                            <p className="text-slate-100 text-lg font-bold mb-8 italic">
                                Propflow is different. We focus on fast adoption, clear ROI, and practical prevention — not infrastructure.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Who It's For */}
                <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="p-12 rounded-[3.5rem] bg-blue-600/10 border border-blue-500/20">
                            <span className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-6 block">Built For</span>
                            <h3 className="text-3xl font-black text-white mb-8">Clarity without complexity</h3>
                            <ul className="space-y-5">
                                {[
                                    "Multifamily residential (20–200 units)",
                                    "Buildings with shared utility meters",
                                    "Owners and small property management firms",
                                    "Operators who value practical over enterprise"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-slate-200">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-12 rounded-[3.5rem] bg-white/2 border border-white/5 grayscale">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-6 block">Not Built For</span>
                            <h3 className="text-3xl font-black text-white/40 mb-8">Everyone Else</h3>
                            <ul className="space-y-5">
                                {[
                                    "Hotels or short-term rentals",
                                    "Single-family rental portfolios",
                                    "Hardware-dependent monitoring systems",
                                    "Large portfolios with custom systems"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 opacity-40">
                                        <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[8px] text-slate-700 font-bold flex-shrink-0">✕</div>
                                        <span className="text-slate-500 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* ROI Section */}
                <section className="max-w-4xl mx-auto px-6 py-32 text-center">
                    <h2 className="text-4xl md:text-6xl font-black mb-12 text-white">One Caught Issue Can Pay for the Product</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                        <div className="space-y-3">
                            <div className="text-3xl font-black text-white">$100s</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Wasted per Leak Monthly</div>
                        </div>
                        <div className="space-y-3">
                            <div className="text-3xl font-black text-white">0</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Opaque Calculation Errors</div>
                        </div>
                        <div className="space-y-3">
                            <div className="text-3xl font-black text-white">100%</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Recovered Utility Spend</div>
                        </div>
                    </div>
                    <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                        A single leaking fixture can waste hundreds per month. Utility disputes cost time, trust, and credibility. Propflow helps you stay ahead of problems, not react to them.
                    </p>
                </section>

                {/* Final CTA */}
                <section className="max-w-7xl mx-auto px-6 py-24 mb-12">
                    <div className="relative bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[3.5rem] p-12 md:p-24 overflow-hidden text-center">
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-7xl font-black text-white mb-8">Get Early Access</h2>
                            <p className="text-white/80 text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
                                We’re onboarding a small group of multifamily operators to help shape the product. Early users receive direct founder support, pilot pricing, and priority feature input.
                            </p>
                            <Link
                                href="/signup"
                                className="inline-flex bg-white text-blue-700 text-xl font-extrabold px-14 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/40"
                            >
                                Request Early Access
                            </Link>
                        </div>
                        {/* Abstract Glow */}
                        <div className="absolute top-[-50%] left-[-20%] w-[60%] h-[120%] bg-blue-400/20 rotate-12 blur-[120px]" />
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-24 bg-[#020617] text-center md:text-left">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">Propflow <span className="text-blue-500 italic font-medium">Pilot</span></span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">© 2026 Propflow. All rights reserved.</p>

                    <div className="flex gap-10 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Active Pilot Program
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
