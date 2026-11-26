import { create } from "zustand";

interface NotificationState {
    message: string;
    isVisible: boolean;
    showNotification: (message: string) => void;
    hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    message: "",
    isVisible: false,

    showNotification: (message) => {
        set({
            message,
            isVisible: true,
        });
    },

    hideNotification: () => {
        set({
            isVisible: false,
            message: "",
        });
    },
}));