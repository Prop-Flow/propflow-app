'use client';
import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { AlertTriangle, CheckCircle, Clock, Plus, MessageSquare, Send, X, Loader2 } from 'lucide-react';

interface MaintenanceRequest {
    id: string;
    title: string;
    location: string;
    description: string;
    status: string;
    priority: string;
    ticketNumber: string;
    createdAt: string;
}

export default function TenantMaintenancePage() {
    const [showNewRequest, setShowNewRequest] = useState(false);
    const [showContactManager, setShowContactManager] = useState(false);
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [newRequestData, setNewRequestData] = useState({ title: '', location: '', description: '', urgency: 'normal' });
    const [contactData, setContactData] = useState({ subject: '', message: '', topic: 'general' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const storedUser = localStorage.getItem('propflow_user');
            if (!storedUser) {
                // No user found, stop loading so UI doesn't hang
                setIsLoading(false);
                return;
            }

            const res = await fetch('/api/maintenance', {
                headers: {
                    'Authorization': storedUser
                }
            });
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const storedUser = localStorage.getItem('propflow_user');
            if (!storedUser) {
                alert('You must be logged in');
                return;
            }

            const res = await fetch('/api/maintenance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': storedUser
                },
                body: JSON.stringify({
                    title: newRequestData.title,
                    location: newRequestData.location,
                    description: newRequestData.description,
                    priority: newRequestData.urgency
                })
            });

            if (res.ok) {
                await fetchRequests();
                setShowNewRequest(false);
                setNewRequestData({ title: '', location: '', description: '', urgency: 'normal' });
            } else {
                alert('Failed to submit request');
            }
        } catch (error) {
            console.error(error);
            alert('Error submitting request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const storedUser = localStorage.getItem('propflow_user');
            if (!storedUser) {
                alert('You must be logged in');
                return;
            }

            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': storedUser
                },
                body: JSON.stringify({
                    topic: contactData.topic,
                    message: `${contactData.subject} - ${contactData.message}`,
                    urgency: 'normal'
                })
            });

            if (res.ok) {
                alert('Message sent to Property Manager!');
                setShowContactManager(false);
                setContactData({ subject: '', message: '', topic: 'general' });
            } else {
                alert('Failed to send message');
            }
        } catch (error) {
            console.error(error);
            alert('Error sending message');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'resolved': return 'green';
            case 'in_progress': return 'yellow';
            default: return 'blue';
        }
    };

    const getFormattedDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <DashboardShell role="tenant">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Maintenance & Support</h1>
                        <p className="text-muted-foreground">Submit repairs or contact your property manager.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowContactManager(true)}
                            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/90 transition-colors flex items-center"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contact Manager
                        </button>
                        <button
                            onClick={() => setShowNewRequest(true)}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Request
                        </button>
                    </div>
                </div>

                {/* Active Requests */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="text-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mt-2">Loading requests...</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-10 border border-dashed rounded-xl">
                            <CheckCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">No active maintenance requests.</p>
                        </div>
                    ) : (
                        requests.map((req) => {
                            const statusColor = getStatusColor(req.status);
                            return (
                                <div key={req.id} className={`rounded-xl p-6 border shadow-sm ${req.status === 'resolved' ? 'bg-muted/30 border-border opacity-75' : 'bg-card border-border'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${statusColor === 'yellow' ? 'bg-yellow-500/10 text-yellow-500' :
                                                statusColor === 'green' ? 'bg-green-500/10 text-green-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {req.status === 'resolved' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">{req.title}</h3>
                                                <p className="text-xs text-muted-foreground">{req.location || 'General'} • Submitted {getFormattedDate(req.createdAt)}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor === 'yellow' ? 'bg-yellow-500/10 text-yellow-600' :
                                            statusColor === 'green' ? 'bg-green-500/10 text-green-600' :
                                                'bg-blue-500/10 text-blue-600'
                                            }`}>
                                            {req.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/80 mb-4">
                                        {req.description}
                                    </p>
                                    <div className="flex items-center space-x-4 text-xs text-muted-foreground border-t border-border pt-4">
                                        <span>{req.ticketNumber || 'No Ticket #'}</span>
                                        <span>•</span>
                                        <span className="capitalize">Priority: {req.priority}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Emergency Info */}
                <div className="bg-red-500/5 rounded-xl p-6 border border-red-500/10 flex items-start space-x-4">
                    <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-red-600">Emergency Maintenance</h3>
                        <p className="text-sm text-red-600/80 mb-2">
                            For urgent issues (flooding, fire, gas leak), please call the 24/7 active emergency line immediately.
                        </p>
                        <a href="tel:911" className="text-sm font-bold text-red-600 underline hover:text-red-700">
                            Call (555) 012-3456
                        </a>
                    </div>
                </div>

            </div>

            {/* New Request Modal */}
            {showNewRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-background rounded-2xl p-6 max-w-lg w-full mx-4 border border-border shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground">New Maintenance Request</h2>
                            <button onClick={() => setShowNewRequest(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Issue Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-primary"
                                    placeholder="e.g., Broken Dishwasher"
                                    value={newRequestData.title}
                                    onChange={e => setNewRequestData({ ...newRequestData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground"
                                        placeholder="e.g., Kitchen"
                                        value={newRequestData.location}
                                        onChange={e => setNewRequestData({ ...newRequestData, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Urgency</label>
                                    <select
                                        className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground"
                                        value={newRequestData.urgency}
                                        onChange={e => setNewRequestData({ ...newRequestData, urgency: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="emergency">Emergency</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                                <textarea
                                    required
                                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground min-h-[100px]"
                                    placeholder="Please describe the issue in detail..."
                                    value={newRequestData.description}
                                    onChange={e => setNewRequestData({ ...newRequestData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowNewRequest(false)} className="px-4 py-2 text-foreground hover:bg-muted rounded-lg font-medium">Cancel</button>
                                <button disabled={isSubmitting} type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90">
                                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Contact Manager Modal */}
            {showContactManager && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-background rounded-2xl p-6 max-w-lg w-full mx-4 border border-border shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-foreground">Contact Property Manager</h2>
                            <button onClick={() => setShowContactManager(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSendMessage} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Topic</label>
                                <select
                                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground"
                                    value={contactData.topic}
                                    onChange={e => setContactData({ ...contactData, topic: e.target.value })}
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="billing">Billing Question</option>
                                    <option value="lease">Lease / Renewal</option>
                                    <option value="complaint">Noise / Complaint</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground"
                                    placeholder="Brief subject..."
                                    value={contactData.subject}
                                    onChange={e => setContactData({ ...contactData, subject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                                <textarea
                                    required
                                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground min-h-[120px]"
                                    placeholder="How can we help you?"
                                    value={contactData.message}
                                    onChange={e => setContactData({ ...contactData, message: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowContactManager(false)} className="px-4 py-2 text-foreground hover:bg-muted rounded-lg font-medium">Cancel</button>
                                <button disabled={isSubmitting} type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 flex items-center">
                                    <Send className="w-4 h-4 mr-2" />
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardShell>
    );
}
