'use client';

import { useState } from 'react';
import { useAI } from '@/lib/hooks/use-ai';
import { Loader2, Sparkles, Send } from 'lucide-react';

interface AIComposerProps {
    onSend?: (message: string) => void;
}

export default function AIComposer({ onSend }: AIComposerProps) {
    const { generate, isLoading, result } = useAI();
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState<'professional' | 'friendly' | 'firm'>('professional');
    const [generatedMessage, setGeneratedMessage] = useState('');

    const handleGenerate = async () => {
        if (!topic) return;

        const prompt = `Draft a ${tone} email to a tenant about: ${topic}. Keep it concise and clear.`;

        try {
            const text = await generate(prompt, { model: 'gemma' });
            setGeneratedMessage(text);
        } catch (err) {
            console.error('Failed to generate draft:', err);
        }
    };

    return (
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">AI Message Composer</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-muted-foreground block mb-2">What is this message about?</label>
                    <textarea
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50"
                        rows={2}
                        placeholder="e.g. Late rent payment reminder, maintenance scheduled for Tuesday..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    {(['professional', 'friendly', 'firm'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTone(t)}
                            className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${tone === t
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                    <button
                        onClick={handleGenerate}
                        disabled={!topic || isLoading}
                        className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-primary/20 text-primary border border-primary/20 rounded text-xs font-medium hover:bg-primary/30 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {isLoading ? 'Drafting...' : 'Generate Draft'}
                    </button>
                </div>

                {(result || generatedMessage) && (
                    <div className="space-y-3 pt-4 border-t border-white/5">
                        <textarea
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-4 text-sm text-foreground focus:outline-none focus:border-primary/50 min-h-[150px]"
                            value={generatedMessage}
                            onChange={(e) => setGeneratedMessage(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={() => onSend?.(generatedMessage)}
                                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all text-sm"
                            >
                                <Send className="w-4 h-4" />
                                Send Message
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
