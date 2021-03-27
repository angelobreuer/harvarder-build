let citationsCache;
export function getCitations() {
    if (citationsCache) {
        return citationsCache;
    }
    const data = localStorage.getItem('data');
    return citationsCache = (data ? JSON.parse(data) : []);
}
export function saveCitations(value) {
    localStorage.removeItem('data');
    localStorage.setItem('data', JSON.stringify(value));
    citationsCache = value;
}
