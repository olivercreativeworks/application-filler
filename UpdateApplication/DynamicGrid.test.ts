import { DynamicGrid } from "./DynamicGrid"

describe("Dynamic Grid", () =>{
    describe("Should store 2d array in values property", () => {
        test("Can access values prop", () => {
            expect(new DynamicGrid([["value1"], ["value2"]], {}).values).toEqual([["value1"], ["value2"]])
        })

        test("Values subarrays should be read only", () => {
            const student = new DynamicGrid([["value1"], ["value2"]], {})
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
                return DynamicGrid.fromZeroBasedHeaderIndex(grid, columnIndexes)
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

})