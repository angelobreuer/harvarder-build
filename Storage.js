let citationsCache;
export function getCitations() {
    if (citationsCache) {
        return citationsCache;
    }
    const data = localStorage.getItem('data');
    citationsCache = ((data ? JSON.parse(data) : [])) || [];
    citationsCache.sort((a, b) => a.title.localeCompare(b.title));
    return citationsCache;
}
export function saveCitations(value) {
    localStorage.removeItem('data');
    localStorage.setItem('data', JSON.stringify(value));
    citationsCache = value;
}
