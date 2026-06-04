type SortDir = "asc" | "desc";

export function sortData(data: any, key: any, dir: SortDir): any {
    return [...data].sort((a, b) => {
        const aVal = a[key] ?? "";
        const bVal = b[key] ?? "";
        const result = String(aVal).toLowerCase() < String(bVal).toLowerCase() ? -1 : 1;
        return dir === "asc" ? result : -result;
    });
}

