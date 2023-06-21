import { DynamicGrid } from "./DynamicGrid"

describe("Dynamic Grid", () =>{
    describe("Should store 2d array in values property", () => {
        test("Can access values prop", () => {
            expect(DynamicGrid.fromOneBasedHeaderIndex([["value1"], ["value2"]], {a:1}).values).toEqual([["value1"], ["value2"]])
        })

        test("Values subarrays should be read only", () => {
            const student = DynamicGrid.fromOneBasedHeaderIndex([["value1"], ["value2"]], {a:1})
            student.values[0] = ["INVALID CHANGE"]
            expect(student.values).toEqual([["value1"], ["value2"]])
        })
    })

    describe("Should return corresponding column values based on header", () => {
        test("Reading headers as props on student object", () => {
            const headers = {firstName:1, lastName:2, fullName:3}
            const data = [ ["value1", "value2", "value3"], 
                           ["valueA", "valueB", "valueC"]]
            const student = DynamicGrid.fromOneBasedHeaderIndex(data, headers)
            expect(student.lookupCol("firstName")).toEqual(["value1", "valueA"])
            expect(student.lookupCol("lastName")).toEqual(["value2", "valueB"])
            expect(student.lookupCol("fullName")).toEqual(["value3", "valueC"])
        })
    })

    describe("Should update desginated header value", ()=>{
        test("Updating 1 value", () => {
            const headers = {firstName:1}
            const data = [ [""] ]
            const student = DynamicGrid.fromOneBasedHeaderIndex(data, headers)
            
            const fn = () => "UPDATED FIRST NAME"
            expect(student.updateCol("firstName", fn).values).toEqual([["UPDATED FIRST NAME"]])
        })
        test("Updating multiple values", () => {
            type Name = {firstName:string, lastName:string, fullName:string}
            
            function createNameGrid<A extends Name>(grid:Array<Array<A[keyof A]>>, columnIndexes:{[k in keyof A]: number}):DynamicGrid<A>{
                return DynamicGrid.of(grid, columnIndexes)
            }

            const headers = {firstName:0, lastName:1, fullName:2}
            const data = [ ["", "lastName1", ""], ["a", "b", "c"], ["", "d", "e"] ]
            const name =createNameGrid(data, headers)
    
            const fn = () => "UPDATED FIRST NAME"
            expect(name.updateCol("firstName", fn).values).toEqual([["UPDATED FIRST NAME", "lastName1", ""], ["a", "b", "c"], ["UPDATED FIRST NAME", "d", "e"]])
            
            const fn2 = (name: Name) => name.firstName + " BOO " + name.lastName
            expect(name.updateCol("fullName", fn2).values).toEqual([["", "lastName1", " BOO lastName1"], ["a", "b", "c"], ["", "d", "e"]])
        })
    })

    describe("Should not throw error for valid input", () => {
        test("More columns than headers", () => {
            const values = [["", ""]]
            const headers = {a:1}
            const func = jest.fn(() => DynamicGrid.fromOneBasedHeaderIndex(values, headers))
            func()
            expect(func).toReturn()
        })
        test("Header indexes fall between first and last index (inclusive)", () => {
            const values = [["", "", ""]]
            const firstHeaders = {a:1}
            const secondHeaders = {a:2}
            const thirdHeaders = {a:3}
            const func = jest.fn(() => {
                DynamicGrid.fromOneBasedHeaderIndex(values, firstHeaders)
                DynamicGrid.fromOneBasedHeaderIndex(values, secondHeaders)
                DynamicGrid.fromOneBasedHeaderIndex(values, thirdHeaders)
                return true
            })
            func()
            expect(func).toReturn()
        })
    })

    describe("Should throw error for invalid input", () => {
        test("No headers", () => {
            const values = [[""]]
            const headers = {}
            expect(() => DynamicGrid.fromOneBasedHeaderIndex(values, headers)).toThrowError()
        })
        test("More headers than columns / one row", () => {
            const values = [[""]]
            const headers = {a:1, b:2}
            expect(() => DynamicGrid.fromOneBasedHeaderIndex(values, headers)).toThrowError()
        })
        test("More headers than columns / multiple rows", () => {
            const values = [[""], [""]]
            const headers = {a:1, b:2}
            expect(() => DynamicGrid.fromOneBasedHeaderIndex(values, headers)).toThrowError()
        })
        test("Same value for different headers", () => {
            const values = [["", ""], ["", ""]]
            const headers = {a:1, b:1}
            expect(() => DynamicGrid.fromOneBasedHeaderIndex(values, headers)).toThrowError()
        } )
        test("Header value is greater than the number of columns", () => {
            const values = [[""]]
            const oneBasedHeaderIndex = {a:2}
            expect(() => DynamicGrid.fromOneBasedHeaderIndex(values, oneBasedHeaderIndex)).toThrowError()
            
            const zeroBasedHeaderIndex = {a:1}
            expect(() => DynamicGrid.of(values, zeroBasedHeaderIndex)).toThrowError()
        } )
        test("Header value is smaller than the number of columns", () => {
            const values = [[""]]
            const oneBasedHeaderIndex = {a:0}
            expect(() => DynamicGrid.fromOneBasedHeaderIndex(values, oneBasedHeaderIndex)).toThrowError()
            
            const zeroBasedHeaderIndex = {a:-1}
            expect(() => DynamicGrid.of(values, zeroBasedHeaderIndex)).toThrowError()
        } )
        test("Rows have different number of columns", () => {
            const values = [[""], ["", ""]]
            const oneBasedHeaderIndex = {a: 1}
            expect(() => DynamicGrid.fromOneBasedHeaderIndex(values, oneBasedHeaderIndex)).toThrowError()
        })

        test("Repeating header index values", () => {
            const values = [[""]]
            const headers = {a:1, b:1}
            expect(() => DynamicGrid.fromOneBasedHeaderIndex(values, headers)).toThrowError()
        })
    })

    describe("Should update specified columns in the same row", () => {
        test("Return row without any changes", () => {
            const values = [[""]]
            const headers = {a:1}
            const id = (x:unknown) =>( {a:""})
            expect(DynamicGrid.fromOneBasedHeaderIndex(values, headers).updateRow(["a"], id).values).toEqual([[""]])
        })
        test("Update one row", () => {
            const values = [[""]]
            const headers = {a:1}
            const id = (x:unknown) => ({a:"a"})
            expect(DynamicGrid.fromOneBasedHeaderIndex(values, headers).updateRow(["a"], id).values).toEqual([["a"]])
        })
        test("Update multiple rows", () => {
            const values = [[""], [""]]
            const headers = {a:1}
            const id = (x:unknown) => ({a:"a"})
            expect(DynamicGrid.fromOneBasedHeaderIndex(values, headers).updateRow(["a"], id).values).toEqual([["a"], ["a"]])
        })
        test("Update multiple columns in the same row", () => {
            const values = [["", ""]]
            const headers = {a:1, b:2}
            const id = (x:unknown) => ({a:"a", b:"b"})
            expect(DynamicGrid.fromOneBasedHeaderIndex(values, headers).updateRow(["a", "b"], id).values).toEqual([["a", "b"]])
        })
        test("Update multiple columns in the different rows", () => {
            const values = [["", ""], ["", ""]]
            const headers = {a:1, b:2}
            const id = (x:unknown) => ({a:"a", b:"b"})
            expect(DynamicGrid.fromOneBasedHeaderIndex(values, headers).updateRow(["a", "b"], id).values).toEqual([["a", "b"], ["a", "b"]])
        })
        test("Update column values that match predicate", () => {
            const values = [[""]]
            const headers = {a:1}
            const id = (x:unknown) => ({a:"a"})
            const predicate = (x: unknown) => x === ""
            expect(DynamicGrid.fromOneBasedHeaderIndex(values, headers).updateRow(["a"], id, predicate).values).toEqual([["a"]])
        })
        test("Do not update columns / Column value does not match predicate", () => {
            const values = [["b"]]
            const headers = {a:1}
            const id = (x:unknown) => ({a:"a"})
            const predicate = (x: unknown) => x === ""
            expect(DynamicGrid.fromOneBasedHeaderIndex(values, headers).updateRow(["a"], id, predicate).values).toEqual([["b"]])
        })
        test("Update column values that match predicate / Multiple columns", () => {
            const values = [["c", ""]]
            const headers = {a:1, b:2}
            const id = (x:unknown) => ({a:"a", b:"b"})
            const predicate = (x: unknown) => x === ""
            expect(DynamicGrid.fromOneBasedHeaderIndex(values, headers).updateRow(["a", "b"], id, predicate).values).toEqual([["c", "b"]])
        })
        test("Function can use the row values to determine output", () => {
            type TestA = {a:string}

            function createTestAGrid<A extends TestA>(grid:Array<Array<A[keyof A]>>, oneBasedColumnIndex:{[k in keyof A]: number}):DynamicGrid<A>{
                return DynamicGrid.fromOneBasedHeaderIndex(grid, oneBasedColumnIndex)
            }
            const values = [["Hello"]]
            const headers = {a:1}
            const grid = createTestAGrid(values, headers)
            const id = (x:TestA) => ({a: x.a + " World"})
            const predicate = (x: unknown) => x === "Hello"
            expect(grid.updateRow(["a"], id, predicate).values).toEqual([["Hello World"]])
        })
        test("Function should only update specified headers", () => {
            const values = [["", "", ""]]
            const headers = {a:1, b:2, c:3}
            const transform = (x:unknown) => ({a:"Hello"})
            expect(DynamicGrid.fromOneBasedHeaderIndex(values, headers).updateRow(["a"], transform).values).toEqual([["Hello", "", ""]])
        })
        describe("Predicate can reference any column in the row", () => {
            type TestA = {a:string, b:string}

            function createTestAGrid<A extends TestA>(grid:Array<Array<A[keyof A]>>, oneBasedColumnIndex:{[k in keyof A]: number}):DynamicGrid<A>{
                return DynamicGrid.fromOneBasedHeaderIndex(grid, oneBasedColumnIndex)
            }
            const values = [["Hello", "World"]]
            const headers = {a:1, b:2}
            const grid = createTestAGrid(values, headers)
            const id = (x:TestA) => ({a: x.b, b: x.a})
            
            test("Should only transform value in column A / Predicate true for A, false for B", () => {
                const trueForA = (x: unknown, row:TestA) => x === "Hello" && row.b === "World"
                expect(grid.updateRow(["a", "b"], id, trueForA).values).toEqual([["World", "World"]])
            })

            test("Should transform column A and B / Predicate is true based on row values", () => {
                const truePredicate = (x:unknown, row:TestA) => row.a === "Hello" && row.b === "World"
                expect(grid.updateRow(["a", "b"], id, truePredicate).values).toEqual([["World", "Hello"]])
            })
            
            test("Should not transform any values / Predicate is false based on row values", () => {
                const falsePredicate = (x:unknown, row:TestA) => row.a === "World" && row.b === "Hello"
                expect(grid.updateRow(["a", "b"], id, falsePredicate).values).toEqual([["Hello", "World"]])
            })
        })
        
    })

    describe("Should create a Dynamic Grid from an object", () => {
        test("Create a single cell / One key, one value", ()=>{
            const obj = {a:"100"}
            expect(DynamicGrid.fromObject(obj).values).toEqual(DynamicGrid.fromOneBasedHeaderIndex([["100"]], {a:1}).values)
        })
        test("Create one row with multiple cells / Multiple keys, one value each", ()=>{
            const obj = {a:"100", b:"200"}
            expect(DynamicGrid.fromObject(obj).values).toEqual(DynamicGrid.fromOneBasedHeaderIndex([["100", "200"]], {a:1, b:2}).values)
        })
        test("Create multiple rows with one cell each / One key, multiple values", () => {
            const obj = {a:["100", "101"]}
            expect(DynamicGrid.fromObject(obj).values).toEqual(DynamicGrid.fromOneBasedHeaderIndex([["100"], ["101"]], {a:1}).values)
        })
        test("Create multiple rows with multiple cells each / Multiple key, multiple values", () => {
            const obj = {a:["100", "101"], b:["200", "201"]}
            expect(DynamicGrid.fromObject(obj).values).toEqual(DynamicGrid.fromOneBasedHeaderIndex([["100", "200"], ["101", "201"]], {a:1, b:2}).values)
        })
        test("Throws error on invalid input / Rows are different lengths", () => {
            const obj = {a:["100"], b:["200", "201"]}
            expect(() => DynamicGrid.fromObject(obj)).toThrowError()
            const obj2 = {a:["100", "101"], b:["200"]}
            expect(() => DynamicGrid.fromObject(obj2)).toThrowError()
        })
        test("Throws error on invalid input / Array and non array entries", () => {
            const obj = {a:"100", b:["200", "201"]}
            expect(() => DynamicGrid.fromObject(obj)).toThrowError()
            const obj2 = {a:["100", "101"], b:"200"}
            expect(() => DynamicGrid.fromObject(obj2)).toThrowError()
        })
    })
})