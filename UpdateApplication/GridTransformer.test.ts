import {GridTransformer} from "./GridTransformer"
describe("Testing Tracker", () => {
    describe("Return column headers as keys and column body as values", () =>{
        test("One Column", () => {
            expect(GridTransformer.headersAsKeys([["headerA"], ["value1"]])).toEqual({"headerA":["value1"]})
        })
        test("Multiple Columns", () => {
            expect(GridTransformer.headersAsKeys([["headerA", "headerB"], ["value1", "value2"]])).toEqual({"headerA":["value1"], "headerB":["value2"]})
        })
        test("Multiple Values In A Column", () =>{
            expect(GridTransformer.headersAsKeys([["headerA"], ["value1"], ["value1A"]])).toEqual({"headerA":["value1", "value1A"]})
        })
        test("Empty string", () => {
            expect(GridTransformer.headersAsKeys([["headerA"], [""], ["value1A"]])).toEqual({"headerA":["", "value1A"]})
            expect(GridTransformer.headersAsKeys([["headerA"], ["value1"], [""]])).toEqual({"headerA":["value1", ""]})
            expect(GridTransformer.headersAsKeys([["headerA"], [""], [""]])).toEqual({"headerA":["", ""]})
        })
        test("Numbers", () => {
            expect(GridTransformer.headersAsKeys([["headerA"], [2]])).toEqual({"headerA":[2]})
        })
        test("Strings and Numbers", () => {
            expect(GridTransformer.headersAsKeys([["headerA", "headerB"], [2, "happy"]])).toEqual({"headerA":[2], "headerB":["happy"]})
        })
    })

    describe("Return array of rows with values mapped to the headers", () => {
        test("One Column", () => {
            expect(GridTransformer.getStubValues([["headerA"], ["value1"]])).toEqual([{"headerA": "value1"}])
        })
        test("Multiple Columns", () => {
            expect(GridTransformer.getStubValues([["headerA", "headerB"], ["value1", "value2"]])).toEqual([{"headerA": "value1", "headerB":"value2"}])
        })
        test("Multiple Values In A Column", () =>{
            expect(GridTransformer.getStubValues([["headerA"], ["value1"], ["value1A"]])).toEqual([{"headerA":"value1"}, {"headerA":"value1A"}])
        })
        test("Empty string", () => {
            expect(GridTransformer.getStubValues([["headerA"], [""], ["value1A"]])).toEqual([{"headerA":""}, {"headerA":"value1A"}])
            expect(GridTransformer.getStubValues([["headerA"], ["value1"], [""]])).toEqual([{"headerA":"value1"}, {"headerA":""}])
            expect(GridTransformer.getStubValues([["headerA"], [""], [""]])).toEqual([{"headerA":""},{"headerA":""}])
        })
        test("Numbers", () => {
            expect(GridTransformer.getStubValues([["headerA"], [2]])).toEqual([{"headerA":2}])
        })
        test("Strings and Numbers", () => {
            expect(GridTransformer.getStubValues([["headerA", "headerB"], [2, "happy"]])).toEqual([{"headerA":2, "headerB":"happy"}])
        })
    })

    describe("Return updated 2d array", () =>{
        describe("Should update empty cells", () => {
            test("One cell / non-empty cell as update value", () => {
                expect(GridTransformer.updateGrid([[""]], [["hello"]])).toEqual([["hello"]])
            })
            test("One cell / empty cell as update value", () => {
                expect(GridTransformer.updateGrid([[""]], [[""]])).toEqual([[""]])
            })
        
            test("Multiple cells in one row", () => {
                expect(GridTransformer.updateGrid([["",""]], [["hello", "world"]])).toEqual([["hello", "world"]])
            })
            test("Multiple cells across multiple rows", ()=>{
                expect(GridTransformer.updateGrid([[""],[""]], [["hello"], ["world"]])).toEqual([["hello"], ["world"]])
            })
        })
    })
    describe("Should not update non-empty cells", ()=>{
        test("One cell", () => {
            expect(GridTransformer.updateGrid([["a"]], [["hello"]])).toEqual([["a"]])
        })
        test("Multiple cells in one row", () => {
            expect(GridTransformer.updateGrid([["a", "b"]], [["hello", "world"]])).toEqual([["a", "b"]])
        })
        test("Multiple cells across multiple rows", () => {
            expect(GridTransformer.updateGrid([["a"],["b"]], [["hello"], ["world"]])).toEqual([["a"],["b"]])
        })
        test("One empty cell and one non-empty cell in the same row", () => {
            expect(GridTransformer.updateGrid([["" , "b"]], [["hello", "world"]])).toEqual([["hello", "b"]])
            expect(GridTransformer.updateGrid([["a", ""]], [["hello", "world"]])).toEqual([["a", "world"]])
        })
        test("One empty cell and one non-empty cell in multiple rows", () => {
            expect(GridTransformer.updateGrid([["a",""],["", "b"]], [["hello", "hello"], ["world", "world"]])).toEqual([["a", "hello"],["world","b"]])
        })
    })
    describe("Should not modify inputs", () =>{
        test("Does not modify input array",() => {
            const originalArray = [[""]]
            const updateArray = [["hello"]]
            expect(GridTransformer.updateGrid(originalArray, updateArray)).toEqual([["hello"]])
            expect(originalArray).toEqual(originalArray)
            expect(updateArray).toEqual(updateArray)
        })
    })
        
    describe("Should throw error if input arrays have different lengths shapes", () =>{
        test("Update array is shorter than original", () => {
            expect(() => GridTransformer.updateGrid([[""], [""]], [["hello"]])).toThrowError()
        })
        test("Update array is longer than original", () =>{
            expect(() => GridTransformer.updateGrid([[""]], [["hello"], ["world"]])).toThrowError()
        })          
    })
    describe("Should throw error if subarray lengths are inconpatible", () =>{
        test("Update subarray is longer than original subarray at same index", () => {
            expect(() => GridTransformer.updateGrid([["", ""]], [["hello", "world", "!"]])).toThrowError()
        })
        test("Update subarray is shorter than original subarray at same index", () => {
            expect(() => GridTransformer.updateGrid([["", ""]], [["hello"]])).toThrowError()
        })
    })
    describe("Should update values that match predicate", () => {
        test("Replaces blanks", () => {
            expect(GridTransformer.updateGrid([[""]], [["a"]], val => val === "")).toEqual([["a"]])

        })
        test("Replaces numbers", () => {
            expect(GridTransformer.updateGrid([[3]], [["a"]], val => typeof val === "number")).toEqual([["a"]])
        })
        test("Replaces numbers and does not replace blanks", () => {
            expect(GridTransformer.updateGrid([[3, "", 4]], [["a", "b", "c"]], val => typeof val === "number")).toEqual([["a", "", "c"]])
        })
    })   
})