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

    // Internal state for the input display
    const [inputValue, setInputValue] = useState('');

    // Initialize/Sync from props
    useEffect(() => {
        // If the prop value is empty, clear input
        if (!value) {
            if (inputValue) setInputValue('');
            return;
        }

        // If the prop value matches what we expect based on current input, don't clobber it
        // This prevents cursor jumping and "fighting"
        const currentDigits = inputValue.replace(/\D/g, '');
        // const PropDigits = (value?.replace(/\D/g, '') || ''); // Removed unused var

        // If digits match (ignoring country code prefix differences for a moment), skip update
        // Current input: 555123 -> +1555123
        // Prop value: +1555123
        const callingCode = getCountryCallingCode(country);
        const bareProp = value.startsWith(`+${callingCode}`) ? value.slice(callingCode.length + 1) : value;

        if (bareProp.replace(/\D/g, '') === currentDigits) {
            return;
        }

        // Otherwise, it's a true external change (or initial load)
        const formatted = formatPhoneNumber(bareProp).formatted;
        setInputValue(formatted);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, country]);

    const formatPhoneNumber = (val: string) => {
        // Strip non-digits
        const digits = val.replace(/\D/g, '');

        // Standard 10-digit US format (3-3-4)
        const limit = 10;
        const limited = digits.substring(0, limit);

        let formatted = limited;
        if (limited.length > 0) {
            formatted = `(${limited.substring(0, 3)}`;
        }
        if (limited.length >= 3) {
            formatted = `(${limited.substring(0, 3)}) ${limited.substring(3, 6)}`;
        }
        if (limited.length >= 6) {
            formatted = `(${limited.substring(0, 3)}) ${limited.substring(3, 6)}-${limited.substring(6, 10)}`;
        }

        return { formatted, digits: limited };
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const inputType = (e.nativeEvent as InputEvent).inputType;
        let newRaw = val;

        // Smart delete handling for separators
        const prevDigits = inputValue.replace(/\D/g, '');
        const newDigits = val.replace(/\D/g, '');
        const isDelete = inputType?.includes('delete');

        if (isDelete && newDigits.length === prevDigits.length) {
            // User deleted a separator, remove the digit before it
            newRaw = newRaw.slice(0, -1);
        }

        const { formatted, digits } = formatPhoneNumber(newRaw);

        // Update local state immediately
        setInputValue(formatted);

        // Propagate to parent
        if (digits.length > 0) {
            const callingCode = getCountryCallingCode(country);
            onChange(`+${callingCode}${digits}`);
        } else {
            onChange('');
        }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCountry(e.target.value as Country);
        onChange('');
        setInputValue('');
    };

    const callingCode = getCountryCallingCode(country);

    // Create country options
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

                    <div className="flex items-center gap-2 pointer-events-none">
                        <span className="text-lg leading-none">
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
                    value={inputValue}
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
