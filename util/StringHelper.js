export default function joinNotNull(delimiter, values) {
    return values.filter(x => !!x).join(delimiter);
}
export function buildName(parts) {
    return joinNotNull(", ", parts);
}
