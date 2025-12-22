'use client';

import React, { useState, useEffect } from 'react';
import {
    getCountries,
    getCountryCallingCode,
    Country
} from 'react-phone-number-input/input';
import en from 'react-phone-number-input/locale/en.json';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    required?: boolean;
    error?: string;
    className?: string;
    placeholder?: string;
}

export function PhoneInput({
    value,
    onChange,
    label = "Phone Number",
    error,
    className = "",
    placeholder = "Enter phone number"
}: PhoneInputProps) {
    // Default to US
    const [country, setCountry] = useState<Country>('US');
    const [displayValue, setDisplayValue] = useState('');

    // Sync external value to internal display state
    useEffect(() => {
        if (!value) {
            setDisplayValue('');
            return;
        }

        // Value comes in as +1xxxxxxxxxx (E.164-ish)
        // We want to strip the calling code +1 for the input field if it matches current country
        const code = getCountryCallingCode(country);
        const prefix = `+${code}`;

        if (value.startsWith(prefix)) {
            const national = value.slice(prefix.length);
            // Re-format just the national part
            const { formatted } = formatPhoneNumber(national);
            setDisplayValue(formatted);
        } else {
            // Fallback
            setDisplayValue(value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, country]);

    const formatPhoneNumber = (val: string) => {
        // Strip non-digits
        const digits = val.replace(/\D/g, '');

        // Strict 9-digit limit (or 10 for US standard? Sticking to 10 for US standard as safe default, 
        // unless strictly requested 9 again. Previous task said 3-2-4 which is 9 digits (3+2+4=9). 
        // But US numbers are 10 digits (3 area + 3 prefix + 4 line). 
        // 3-2-4 implies (xxx)-xx-xxxx. That's 9 digits. 
        // I will implement 10 digits to be safe (3-3-4) unless specifically 3-2-4 is the 'weird' requirement.
        // User said: "Refine mask to 3-2-4 format (xxx)-xx-xxxx".
        // (123)-45-6789 is 3+2+4 = 9 digits.
        // Okay, I will strictly follow 9 digits if that's what was requested.

        const limit = 9;
        const limited = digits.substring(0, limit);

        let formatted = limited;
        if (limited.length > 0) {
            formatted = `(${limited.substring(0, 3)}`;
        }
        if (limited.length >= 3) {
            formatted = `(${limited.substring(0, 3)})-${limited.substring(3, 5)}`;
        }
        if (limited.length >= 5) {
            formatted = `(${limited.substring(0, 3)})-${limited.substring(3, 5)}-${limited.substring(5, 9)}`;
        }

        return { formatted, digits: limited };
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const { formatted, digits } = formatPhoneNumber(val);

        setDisplayValue(formatted);

        // Emit full E.164 with calling code
        if (digits.length > 0) {
            const callingCode = getCountryCallingCode(country);
            onChange(`+${callingCode}${digits}`);
        } else {
            onChange('');
        }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCountry(e.target.value as Country);
        // Clear input on country change to avoid confusion
        onChange('');
        setDisplayValue('');
    };

    const callingCode = getCountryCallingCode(country);

    // Create country options from supported countries list
    // This avoids "Unknown country" errors from codes in locale json that aren't supported
    const countryOptions = getCountries().map((code) => ({
        code,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: (en as any)[code] || code
    })).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-muted-foreground ml-1">
                    {label}
                    {error && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className={`flex h-12 w-full rounded-md border bg-secondary px-3 py-2 text-sm ring-offset-background transition-all duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-primary ${error ? "border-red-500 focus-within:ring-red-500" : "border-input"}`}>

                {/* Country Select + Code Prefix */}
                <div className="flex items-center border-r border-border pr-3 mr-3 relative">
                    <select
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        value={country}
                        onChange={handleCountryChange}
                        aria-label="Select Country"
                    >
                        {countryOptions.map((opt) => (
                            <option key={opt.code} value={opt.code}>
                                {opt.name} +{getCountryCallingCode(opt.code)}
                            </option>
                        ))}
                    </select>

                    {/* Visual Mock of Select */}
                    <div className="flex items-center gap-2 pointer-events-none">
                        <span className="text-lg leading-none">
                            {/* Flag logic could go here, for now just code is fine or use a map */}
                            {country === 'US' ? '🇺🇸' : country}
                        </span>
                        <span className="text-muted-foreground text-sm font-medium">
                            +{callingCode}
                        </span>
                        <span className="text-[10px] opacity-50">▼</span>
                    </div>
                </div>

                <input
                    type="tel"
                    value={displayValue}
                    onChange={handlePhoneChange}
                    placeholder={placeholder}
                    className="bg-transparent border-none w-full h-full focus:outline-none placeholder:text-muted-foreground text-foreground flex-1 tracking-wide font-medium"
                />
            </div>
            {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
        </div>
    );
}

// Re-export as a compatible name if needed or just usage
export default PhoneInput;
