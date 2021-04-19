interface SearchIndex<T> {
    insert: (string: string, data: T) => void
    remove: (string: string) => void;
    search: (query: string) => {results: T[]}
    clear: () => void;
}

type Trie<T> = {[key: string]: Trie<T> }
type KeyAccessor<T> = (entry: T) => string | number | symbol;
interface TrieOptions<T> {
    key: string | symbol | KeyAccessor<T>
}
class TrieIndex<T extends Record<any, any>> implements SearchIndex<T> {
    private options: TrieOptions<T>;
    private trie: Trie<T> = {};
    private reverseIndex: Record<string, Record<ReturnType<typeof getKey>, T>> = {}

    constructor(options: TrieOptions<T>) {
        this.options = options
    }

    public insert(string: string, data: T): void {
        if(!this.reverseIndex[string]) this.reverseIndex[string] = {}
        this.reverseIndex[string][getKey(this.options.key, data)] = data
        this.trieInsert(string, data, this.trie)
    }

    public remove(string: string) {
        if(this.reverseIndex[string]){
            delete this.reverseIndex[string]
            this.trieRemove(string, this.trie, null)
        }
    }

    public search(query: string): {results: T[]} {
        const matches: T[] = []
        this.trieSearch(query, this.trie, matches)

        return {
            results: matches
        }
    }

    public clear(){
        this.reverseIndex = {}
        this.trie = {}
    }

    private trieSearch(query: string, trie: Trie<T>,matches: T[]): T[] {
        for(let i = 0; i < query.length; i++) {
            this.trieSearch()
        }
    }

    private trieInsert(string: string, data: T, tree: Trie<T>) {
        let length = string.length;
        let prefix: string;

        while(length--) {
            prefix = string.substr(0, length + 1)
            const match = tree[prefix]

            if(match){
                // Found prefix, moving into subtrie
                // if (!Object.keys(tree[prefix]).length) {
                //     // If one word is a pure subset of another word, the prefix 
                //     // should also point to the subset.
                //     tree[prefix][""] = {};
                // }
                const carryOverPrefix = string.substr(length+1)
                this.trieInsert(carryOverPrefix, data, match)
                return
            }
        }

        const siblings = Object.keys(tree);

        const siblingFound = siblings.some((sibling) => {
            const [commonPrefix, distance] = getCommonPrefixForNode(string, sibling, )

            if(commonPrefix === null || distance === null) return false

            // Clear current prefix and ensure we start fresh
            tree[commonPrefix] = {};
            this.trieInsert(sibling.substr(distance), data, tree[commonPrefix]);
            tree[commonPrefix][sibling.substr(distance)] = tree[sibling];
            this.trieInsert(string.substr(distance), data, tree[commonPrefix]);

            delete tree[sibling];
            return true;
        });

        if(!siblingFound){
            console.log("Insert", string, data)
            tree[string] = {}
        }
    }

    private trieRemove(string: string, tree: Trie<T>, parent: Trie<T>|null): void{
        let length = string.length;
        let prefix: string;

        while(length--) {
            prefix = string.substr(0, length + 1)
            const match = tree[prefix]

            if(match){
                const carryOverPrefix = string.substr(length+1)

                if(!carryOverPrefix && tree[prefix]) {
                    const siblings = Object.keys(tree[prefix])

                    if(!siblings.length) {
                        delete tree[prefix]
                        return
                    }

                    
                    const children = tree[prefix]

                    if(parent){
                        delete tree[prefix]
                        Object.keys(children).map(c => {
                            tree[prefix+c] = children[c]
                        })
                    }
                }

                return this.trieRemove(carryOverPrefix, match, tree)
            }
        }
    }

    public toString(){
        return JSON.stringify(this.trie, null, 2)
    }
}

function getKey<T extends Record<any, any>>( key: TrieOptions<T>["key"], data: T): string | number{
    let primaryKey: unknown | undefined;

    // @ts-ignore https://github.com/Microsoft/TypeScript/issues/24587
    if(typeof key === "string" || typeof key === "symbol") primaryKey = data[key] as string;
    if(typeof key === "function") primaryKey = key(data)

    if(typeof primaryKey === "undefined") {
        throw new Error(`Could not retrieve primaryKey from ${JSON.stringify(data)} - got ${primaryKey}`)
    }

    if(typeof primaryKey === "string" || typeof primaryKey === "number" || typeof primaryKey === "symbol"){
        return primaryKey as string | number
    }
    
    throw new TypeError(`PrimaryKey needs to be either a string, symbol or number, got ${JSON.stringify(primaryKey)}`)
}

function getCommonPrefixForNode(sibling: string, prefix: string): [string, number] | [null, null] {
    let s = 0;
    let commonPrefix = null;

    while (sibling[s] === prefix[s]) {
        s++;
        if(s >= 1){
            commonPrefix = sibling.substr(0, s)
        }
    }

    return commonPrefix ? [commonPrefix, s] : [null, null]
}


export default TrieIndex
