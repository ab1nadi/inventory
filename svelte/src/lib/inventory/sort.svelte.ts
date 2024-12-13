export class Sort {
    sorted: Record<string, number> = { createdAt: -1 };

    // Toggle sort direction for a given key and return the new sort value
    toggleSort(key: string) {
        if (key in this.sorted) {
            this.sorted[key] = this.sorted[key] === 1 ? -1 : 1;
        } else {
            this.sorted = { [key]: 1 }; // Reset to only sort by the new key
        }

        return this.sorted[key];
    }

    // Get the current sorting order as a single object
    getOrderBy() {
        return this.sorted;
    }
}