interface SearchStorage<T> {
    get: () => T | null;
    set: (data: T) => void
    clear: () => void;
}

class MemoryStorage<T> implements SearchStorage<T> {
    private data: T | null = null;

    get() {
        return this.data
    }

    set(data: T) {
        this.data = data
    }

    clear() {
        this.data = null
    }
}
