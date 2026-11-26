import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

export function Toast() {
    const message = useNotificationStore((state) => state.message);
    const isVisible = useNotificationStore((state) => state.isVisible);
    const hideNotification = useNotificationStore(
        (state) => state.hideNotification
    );

    useEffect(() => {
        if (!isVisible) {
            return;
        }

        const timeout = setTimeout(() => {
            hideNotification();
        }, 3000);

        return () => clearTimeout(timeout);
    }, [isVisible, message, hideNotification]);

    if (!isVisible) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="fixed right-5 top-5 z-100 max-w-sm rounded-lg bg-slate-800 px-5 py-3 text-sm font-medium text-white shadow-lg dark:bg-slate-700"
        >
            {message}
        </div>
    );
}