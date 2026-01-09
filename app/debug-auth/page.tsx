
'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DebugAuthPage() {
    const { data: session, status } = useSession();
    const [cookies, setCookies] = useState<string>('');
    const [envInfo, setEnvInfo] = useState<unknown>(null);

    useEffect(() => {
        setCookies(document.cookie);

        // Fetch server-side session info
        fetch('/api/auth/session')
            .then(res => res.json())
            .then(data => setEnvInfo(data))
            .catch(err => setEnvInfo({ error: (err as Error).message }));
    }, []);

    return (
        <div className="p-10 bg-black text-white min-h-screen font-mono">
            <h1 className="text-2xl font-bold mb-4">Auth Debugger</h1>

            <div className="grid grid-cols-2 gap-8">
                <div className="border p-4 rounded bg-gray-900">
                    <h2 className="text-xl text-blue-400 mb-2">Client Session (useSession)</h2>
                    <pre className="whitespace-pre-wrap">{JSON.stringify({ status, session }, null, 2)}</pre>
                </div>

                <div className="border p-4 rounded bg-gray-900">
                    <h2 className="text-xl text-green-400 mb-2">Browser Cookies</h2>
                    <div className="break-all text-sm">{cookies || "No cookies found"}</div>
                </div>

                <div className="border p-4 rounded bg-gray-900 col-span-2">
                    <h2 className="text-xl text-yellow-400 mb-2">Server Session Endpoint (/api/auth/session)</h2>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(envInfo, null, 2)}</pre>
                </div>
            </div>

            <div className="mt-8 border-t border-gray-700 pt-4">
                <h3 className="text-lg">Diagnosis Guide:</h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-300">
                    <li>If <strong>Client Session</strong> is `null` or `unauthenticated`, you are not logged in.</li>
                    <li>If <strong>Cookies</strong> does not contain `next-auth.session-token` (or `__Secure-`), the cookie is not being set.</li>
                    <li>If <strong>Server Session</strong> is empty object `{ }`, the server doesn&apos;t see your cookie.</li>
                </ul>
            </div>
        </div>
    );
}
