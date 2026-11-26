import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function Card({
    children,
    className = "",
    ...props
}: CardProps) {
    return (
        <div
            className={`
                rounded-xl border border-slate-200
                bg-white shadow-sm
                dark:border-slate-700 dark:bg-slate-800
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
}