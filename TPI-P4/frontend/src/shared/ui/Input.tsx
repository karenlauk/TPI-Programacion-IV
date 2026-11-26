import { useId } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({
    label,
    error,
    id,
    className = "",
    ...props
}: InputProps) {
    const generatedId = useId();
    const inputId = id ?? props.name ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                    {label}
                </label>
            )}

            <input
                {...props}
                id={inputId}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className={`
                    w-full rounded-lg border px-3 py-2 text-sm
                    bg-white text-slate-900 outline-none
                    placeholder:text-slate-400
                    focus:ring-2 focus:ring-blue-500
                    disabled:cursor-not-allowed disabled:bg-slate-100
                    dark:bg-slate-900 dark:text-slate-100
                    dark:disabled:bg-slate-800
                    ${
                        error
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-300 dark:border-slate-600"
                    }
                    ${className}
                `}
            />

            {error && (
                <p
                    id={errorId}
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}