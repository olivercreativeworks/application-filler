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
})