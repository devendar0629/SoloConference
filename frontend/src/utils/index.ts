export const formatDate = (value?: string | Date) => {
    if (!value) return "—";
    try {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }).format(new Date(value));
    } catch {
        return "—";
    }
};
