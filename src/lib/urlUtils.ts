/**
 * Utility functions for handling URLs and backend integration
 */

/**
 * Normalizes a URL to ensure it uses the correct backend base URL.
 * If the URL is hardcoded to localhost:8000, it replaces it with the dynamic API URL.
 * If the URL is relative, it prepends the API base URL.
 *
 * @param url The URL string to normalize
 * @returns The normalized URL string
 */
export const normalizeUrl = (url: string | null | undefined): string => {
    if (!url) return '';

    // If it's already a blob or external link, leave it
    if (url.startsWith('blob:') || (url.startsWith('http') && !url.includes('localhost:8000'))) {
        return url;
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Clean up potential trailing slash on base and leading slash on input
    const base = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

    // Case 1: Hardcoded localhost URL from backend or legacy data
    if (url.includes('localhost:8000')) {
        // Replace the legacy base with the dynamic one
        return url.replace(/http:\/\/localhost:8000/g, base);
    }

    // Case 2: Relative path starting with /api
    if (url.startsWith('/')) {
        return `${base}${url}`;
    }

    // Case 3: Just the path without leading slash
    if (url.startsWith('api/')) {
        return `${base}/${url}`;
    }

    return url;
};

/**
 * Gets a download URL for a file ID
 * @param fileId The UUID of the file
 */
export const getDownloadUrl = (fileId: string): string => {
    return normalizeUrl(`/api/files/download/${fileId}`);
};
