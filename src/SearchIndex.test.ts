import SearchIndex from "./SearchIndex"

describe("getCommonPrefix", () => {

})

describe("TrieSearchIndex", () => {
    describe("insert", () => {
        // it('inserts root node',() => {
        //     const index = new SearchIndex()
        //     index.insert("wor", {id: 2})
        //     index.insert("worm", {id: 1})
        //     console.log("Trie", JSON.stringify(index.trie, null, 2))
        // })

        it.skip("inserts new node", () => {})
        it.skip("inserts new node and handles collision", () => {})
        it.skip("inserts new node and handles collision", () => {})
    })

    describe("remove", () => {
        // it("removes node that has no siblings", () => {
        //     const index = new SearchIndex()
        //     index.insert("wor", {id: 2})
        //     index.insert("worm", {id: 2})
        //     index.insert("wors", {id: 2})
        // })
        
        it.only("removes node that has siblings", () => {
            const index = new SearchIndex({key: "id"})

            index.insert("abcd", {id: 1})
            index.insert("abcf", {id: 2})
            
            console.log("Before: Trie", index.toString())
            index.remove("abc")
            console.log("After: Trie", index.toString())

            // const newIndex = new SearchIndex()
            // newIndex.insert("worm_a", {id: 1})
            // newIndex.insert("worm_b", {id: 1})
            // console.log("Expected: Trie", JSON.stringify(newIndex.trie, null, 2))
        })
    })

    describe("build", () => {
        it.skip("builds new index", () => {})
    })
})
