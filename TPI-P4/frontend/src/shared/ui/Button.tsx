import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
    primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 active:bg-blue-800",
    secondary:
        "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400 active:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
    danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 active:bg-red-800",
    success:
        "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 active:bg-green-800",
};

const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
};

export function Button({
    variant = "primary",
    size = "md",
    type = "button",
    disabled = false,
    loading = false,
    className = "",
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading}
            className={`
                inline-flex items-center justify-center gap-2
                rounded-md font-medium transition-colors
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-50
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            {...props}
        >
            {loading ? "Procesando..." : children}
        </button>
    );
}