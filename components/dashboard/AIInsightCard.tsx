'use client';

import { useState } from 'react';
import { useAI } from '@/lib/hooks/use-ai';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

export default function AIInsightCard() {
    const { generate, isLoading, result } = useAI();
    const [query, setQuery] = useState('');

    const handleAsk = async () => {
        if (!query) return;
        try {
            await generate(`As a property manager assistant, answer this briefly: ${query}`, { model: 'gemma' });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-1 shadow-xl transition-all hover:shadow-2xl border border-white/10 hover:border-indigo-500/30">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 brightness-150 mix-blend-soft-light" />
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl transition-all duration-500 group-hover:bg-indigo-500/30" />

            <div className="relative h-full rounded-xl bg-slate-950/80 p-5 backdrop-blur-xl transition-all">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-500/10 p-2 ring-1 ring-white/10 group-hover:bg-indigo-500/20">
                            <Sparkles className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-100">Gemma Insights</h3>
                            <p className="text-xs text-slate-400">Powered by Vertex AI</p>
                        </div>
                    </div>
                </div>

                {!result ? (
                    <div className="space-y-4">
                        <p className="text-sm leading-relaxed text-slate-400">
                            Ask me about your portfolio performance, occupancy trends, or maintenance strategies.
                        </p>
                        <div className="relative group/input">
                            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 transition-opacity blur group-hover/input:opacity-100" />
                            <input
                                type="text"
                                placeholder="E.g., How can I improve net operating income?"
                                className="relative w-full rounded-lg border border-white/10 bg-slate-900/50 py-3 pl-4 pr-12 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                            />
                            <button
                                onClick={handleAsk}
                                disabled={isLoading || !query}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-indigo-600 p-1.5 text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
                        <div className="rounded-xl border border-white/5 bg-slate-900/50 p-4 shadow-inner">
                            <p className="text-sm leading-relaxed text-slate-200/90 whitespace-pre-line font-light">
                                {result}
                            </p>
                        </div>
                        <button
                            onClick={() => { setQuery(''); generate('', { model: 'gemma' }).then(() => { }).catch(() => { }); /* Reset check */ }} // Reset logic handling
                            className="flex items-center gap-2 text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                        >
                            <ArrowRight className="h-3 w-3 rotate-180" />
                            Ask another question
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
