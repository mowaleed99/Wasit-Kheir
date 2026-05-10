export const resolveImageUrl = (url: string | null | undefined): string => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
        return url;
    }
    const baseUrl = "https://wasitkheir.runasp.net";
    // Ensure no double slash
    return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
};
