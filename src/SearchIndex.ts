interface SearchIndex<T> {
    // search: (query: string) => T[]
    insert: (data: T) => void
    remove: (data: T) => void;
    build: (data: T[]) => void
}


type TrieNode<T> = T
type Trie<T> = Record<string, TrieNode<T>>

class TrieIndex<T> implements SearchIndex<T> {
    insert(data: T) {

    }
    remove(data: T) {

    }
    build(data: T[]) {

    }
}
