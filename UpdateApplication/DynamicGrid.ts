import { GridTransformer } from "./GridTransformer"

export type Grid<Row extends Record<string, unknown>> = Array<Array<ValueOf<Row>>>
export type Headers<Row extends Record<string, unknown>> = {
    [k in keyof Row] : number
}


type HeadersByIndex<T extends Record<string, number>> = {
    [k in keyof T as T[k]]: k
}

type CellType<Row extends Record<string, unknown>> = Row[keyof Row]
type ColumnHeaders<Row> = keyof Row
type ValueOf<Type extends Record<string | number, unknown>> = Type[keyof Type]
type UnwrapArray<T> = T extends Array<infer A> ? A: T


export class DynamicGrid<Row extends Record<string,unknown>>{
    private $values: Grid<Row>
    private zeroBasedHeaderIndex: Headers<Row>
    private headersByIndex: HeadersByIndex<typeof this.zeroBasedHeaderIndex>
        
    private constructor(values:Grid<Row>, zeroBasedHeaderIndex:Headers<Row>, lookupHeadersByIndex:HeadersByIndex<typeof zeroBasedHeaderIndex>){
        this.$values = values
        this.zeroBasedHeaderIndex = zeroBasedHeaderIndex
        this.headersByIndex = lookupHeadersByIndex
    }

    static fromOneBasedHeaderIndex<A extends Record<string,unknown>>(values:Grid<A>, oneBasedHeaderIndex:Headers<A>):DynamicGrid<A>{
        const zeroBasedHeaderIndex = Object.fromEntries(Object.entries(oneBasedHeaderIndex).map(([header, index]) => [header, index - 1])) as Headers<A>
        return DynamicGrid.of(values, zeroBasedHeaderIndex)
    }

    static of<A extends Record<string,unknown>>(values:Grid<A>, zeroBasedHeaderIndex:Headers<A>):DynamicGrid<A>{
        const inputValidity = DynamicGrid.inputsAreValid(values, zeroBasedHeaderIndex)
        if (inputValidity.valid){
            const headersByIndex = DynamicGrid.createHeadersByIndex(zeroBasedHeaderIndex)
            return new DynamicGrid(values, zeroBasedHeaderIndex, headersByIndex)
        }
        else { DynamicGrid.throwInvalidInputsError(inputValidity.errorMessage) }
    }

    get values():Grid<Row>{
        return [...this.$values]
    }
    
    static fromObject<A extends Record<string, unknown>>(x:A):DynamicGrid<A>{
        const objectValues = Object.values(x)
        const headers = Object.fromEntries(Object.keys(x).map((a,i) => [a, i])) as Record<keyof typeof x, number>

        if(Array.isArray(objectValues[0])){
            const allValuesArrays = objectValues.reduce((allValuesAreArrays:boolean, currentValue:unknown) => {
                return allValuesAreArrays && Array.isArray(currentValue)
            }, true)
            if (!allValuesArrays) { DynamicGrid.throwInvalidInputsError("All values must either be arrays or non arrays")}
            const grid = (objectValues as Array<Array<keyof A>>).reduce((prev:Array<Array<keyof A>>, curr:Array<keyof A>, index:number, values:Array<unknown>) => {
                if (index === 0) { return curr.map(val => [val]) }
                return curr.length === prev.length ? prev.map((row, rowIndex) => row.concat(curr[rowIndex]) ) : DynamicGrid.throwInvalidInputsError("All of your rows need to be the same size")
            }, [[]]) as Array<Array<A[keyof A]>>
            
            return DynamicGrid.of(grid, headers)
        }
        const grid = objectValues.reduce((prev:Array<Array<keyof A>>, curr:unknown, index:number, values:Array<unknown>) => {
            if (index === 0) {
                return Array.isArray(curr) ? curr.map(val => [val]) : prev.map(arr => arr.concat(curr as keyof A)) 
            }
            if(Array.isArray(prev[0]) && Array.isArray(curr)){ DynamicGrid.throwInvalidInputsError("All entries must be ")}
            if(Array.isArray(curr)){
                return curr.length === prev.length ? prev.map((row, rowIndex) => row.concat(curr[rowIndex]) ) : DynamicGrid.throwInvalidInputsError("All of your rows need to be the same size")
            }
            return prev.map(arr => arr.concat(curr as keyof A))
        }, [[]]) as Array<Array<A[keyof A]>>

        return DynamicGrid.of(grid, headers)
    }

    updateRow<Header extends ColumnHeaders<Row>>(headers:Array<Header>, fn:(row:Row) => Partial<Row>, predicate:(arg:CellType<Row>, row:Row)=> boolean = (value) => value === ""):DynamicGrid<Row>{
        const headersSet = new Set(headers)
        const updatedArray = this.values.map(rowArray => {
            const row = DynamicGrid.fromArrayToRow(rowArray, this.headersByIndex)
            const updatedRowValues = fn(row)
            const updatedRowArray = rowArray.map((value, index) => {
                const columnHeader = this.lookupHeader(index) as Header
                const newValue = updatedRowValues[columnHeader]
                return (predicate(value, row) && headersSet.has(columnHeader) ) ? newValue : value
            })
            return updatedRowArray
        })
        return new DynamicGrid(updatedArray as Grid<Row>, this.zeroBasedHeaderIndex, this.headersByIndex)
    }

    private lookupHeader(index:number): ColumnHeaders<Row>{
        return (this.headersByIndex as Record<number, keyof Row>)[index]
    }

    lookupCol<Header extends ColumnHeaders<Row>>(header:Header):Array<Row[Header]>{
        return this.values.map((rowArray) => rowArray[this.zeroBasedHeaderIndex[header]] as Row[Header])
    }

    updateCol<Header extends ColumnHeaders<Row>>(header:Header, fn:(row:Row) => Row[Header], predicate:(arg: CellType<Row>)=>boolean = (value) => value === ""):DynamicGrid<Row>{
        const updatedValues = this.values.map(rowArray => rowArray.map((value, index) => {
            return index === this.zeroBasedHeaderIndex[header] && predicate(value) ? 
                fn(DynamicGrid.fromArrayToRow(rowArray, this.headersByIndex)) :
                value
        }))
        return new DynamicGrid(updatedValues, this.zeroBasedHeaderIndex, this.headersByIndex)
    }
    
    private static fromArrayToRow<A extends Record<string,unknown>>(rowArray:Array<ValueOf<A>>, headersByIndex: Record<number, string>):A{
        return Object.fromEntries(rowArray.map(($value, index) => [headersByIndex[index], $value])) as A
    }

    private static createHeadersByIndex<A extends Record<string, number>>(x:A):HeadersByIndex<A>{
        return Object.fromEntries(Object.entries(x).map(([header, index]) => [index, header])) as HeadersByIndex<A>
    }

    private static inputsAreValid<A extends Record<string, unknown>>(values:Grid<A>, headers:Headers<A>):{valid:boolean, errorMessage?:string}{
        if(rowsAreNotTheSameSize(values)){ return createResponse(false, "All of your rows need to be the same size")}
        
        const headerIndexValues = Object.values(headers)
        const headerIndexesSet = new Set(headerIndexValues)
        const firstRow = values[0]
        
        if(headerIndexesDoNotFallWithinColumnIndexBounds(firstRow, headerIndexesSet)){return createResponse(false, "Header indexes cannot be less than 0 or greater than the total number of columns.")}
        if(numberOfHeadersDoNotFallWithinNumberOfColumns(firstRow, headerIndexesSet)){return createResponse(false, "There cannot be more headers than there are columns.")}
        if(headerIndexesAreNotUnique(headerIndexValues, headerIndexesSet)){return createResponse(false, "Header indexes must be unique.")}
        return createResponse(true) 
                
        function rowsAreNotTheSameSize(x:Grid<A>):boolean{
            return !rowsAreSameSize(x)

            function rowsAreSameSize(x:Grid<A>):boolean{
                const rowLengths = x.map(row => row.length)
                return new Set(rowLengths).size === 1
            }
        }
        function headerIndexesAreNotUnique(headerIndexValues:Array<number>, headerIndexesSet:Set<number>):boolean{
            return !headerIndexesAreUnique(headerIndexValues, headerIndexesSet)

            function headerIndexesAreUnique(headerIndexValues:Array<number>, headerIndexesSet:Set<number>):boolean{
                return headerIndexValues.length === headerIndexesSet.size
            }
        }
        function numberOfHeadersDoNotFallWithinNumberOfColumns(row:Array<unknown>, headerIndexesSet:Set<number>):boolean{
            return !numberOfHeadersFallWithinNumberOfColumns(row, headerIndexesSet)

            function numberOfHeadersFallWithinNumberOfColumns(row:Array<unknown>, headerIndexesSet:Set<number>):boolean{
                return headerIndexesSet.size <= row.length && headerIndexesSet.size >= 1
            }
        }

        function headerIndexesDoNotFallWithinColumnIndexBounds(row:Array<unknown>, headerIndexesSet:Set<number>):boolean{
            return !headerIndexesFallWithinColumnIndexBounds(row, headerIndexesSet)

            
            function headerIndexesFallWithinColumnIndexBounds(row:Array<unknown>, headerIndexesSet:Set<number>):boolean{
                return (Math.max(...headerIndexesSet) <= row.length - 1) && (Math.min(...headerIndexesSet) >= 0 )
            }
        }

        function createResponse(valid:boolean, errorMessage?:string): {valid:boolean, errorMessage?:string}{
            return {valid, errorMessage}
        }
    }

    private static throwInvalidInputsError(message:string = ""):never{
        throw new Error(`Invalid input. ${message}`.trim())
    }


}



