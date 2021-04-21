let citationsCache;
function comparePersons(a, b, reverse) {
    let result = (reverse ? a.lastName : a.firstName)
        .localeCompare((reverse ? b.lastName : b.firstName));
    if (result !== 0) {
        return result;
    }
    result = (reverse ? a.firstName : a.lastName)
        .localeCompare((reverse ? b.firstName : b.lastName));
    return result;
}
function comparer(a, b) {
    // compare authors
    for (let index = 0; index < a.contributors.length, index < b.contributors.length; index++) {
        let result;
        if ((result = comparePersons(a.contributors[index], b.contributors[index], index === 0)) !== 0) {
            return result;
        }
    }
    // compare title
    return a.title.localeCompare(b.title);
}
export function getCitations() {
    if (citationsCache) {
        return citationsCache;
    }
    const data = localStorage.getItem('data');
    citationsCache = ((data ? JSON.parse(data) : [])) || [];
    citationsCache.sort(comparer);
    return citationsCache;
}
export function saveCitations(value) {
    localStorage.removeItem('data');
    localStorage.setItem('data', JSON.stringify(value));
    citationsCache = value;
}
