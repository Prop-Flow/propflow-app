'use client';
import React, { useState } from 'react';
import { FileText, Send, X } from 'lucide-react';

interface DocumentSigningModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DocumentSigningModal({ isOpen, onClose }: DocumentSigningModalProps) {
    const [documentType, setDocumentType] = useState('lease_agreement');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setSuccess(null);

        try {
            const res = await fetch('/api/documents/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentType,
                    tenantEmail: email,
                    tenantName: name
                })
            });
            const data = await res.json();

            if (res.ok) {
                setSuccess(`Document sent! Envelope ID: ${data.result.envelopeId}`);
                setTimeout(() => {
                    setSuccess(null);
                    onClose();
                }, 2000);
            } else {
                alert('Failed to send: ' + data.error);
            }

        } catch (err) {
            console.error(err);
            alert('Error sending document');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                        Send for Signature
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center justify-center">
                        <Send className="w-5 h-5 mr-2" />
                        {success}
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                            <select
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                            >
                                <option value="lease_agreement">Lease Agreement</option>
                                <option value="lead_disclosure">Lead Paint Disclosure</option>
                                <option value="pet_addendum">Pet Addendum</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Name</label>
                            <input
                                type="text"
                                required
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tenant Email</label>
                            <input
                                type="email"
                                required
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                            >
                                {sending ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>

                        <p className="text-xs text-center text-gray-500">
                            Powered by {process.env.NODE_ENV === 'development' ? 'Mock Signer' : 'Secure eSign'}
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
