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
        if (DynamicGrid.inputsAreValid(values, zeroBasedHeaderIndex)){
            const headersByIndex = DynamicGrid.createHeadersByIndex(zeroBasedHeaderIndex)
            return new DynamicGrid(values, zeroBasedHeaderIndex, headersByIndex)
        }
        else { DynamicGrid.throwInvalidInputsError() }
    }

    get values():Grid<Row>{
        return [...this.$values]
    }

    updateRow<Header extends ColumnHeaders<Row>>(headers:Array<Header>, fn:(row:Row) => Partial<Row>, predicate:(arg:CellType<Row>)=> boolean = (value) => value === ""):DynamicGrid<Row>{
        const headersSet = new Set(headers)
        const updatedArray = this.values.map(rowArray => {
            const updatedRowValues = fn(DynamicGrid.fromArrayToRow(rowArray, this.headersByIndex))
            const updatedRowArray = rowArray.map((value, index) => {
                const columnHeader = this.lookupHeader(index) as Header
                const newValue = updatedRowValues[columnHeader]
                return (predicate(value) && headersSet.has(columnHeader) ) ? newValue : value
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

    private static inputsAreValid<A extends Record<string, unknown>>(values:Grid<A>, headers:Headers<A>):boolean{
        return rowsAreSameSize(values) && thereIsAHeaderForEachColumn(values[0], headers)
        
        function rowsAreSameSize(x:Grid<A>):boolean{
            const rowLengths = x.map(row => row.length)
            return new Set(rowLengths).size === 1
        }
        
        function thereIsAHeaderForEachColumn(row:Array<unknown>, headers:Headers<A>):boolean{
            const headerIndexValues = Object.values(headers)
            const headerIndexesSet = new Set(headerIndexValues)
            
            const headerIndexesFallWithinColumnIndexBounds = (Math.max(...headerIndexesSet) <= row.length - 1) && (Math.min(...headerIndexesSet) >= 0 )
            const numberOfHeadersFallWithinNumberOfColumns = headerIndexesSet.size <= row.length && headerIndexesSet.size >= 1
            const headerIndexesAreUnique = headerIndexValues.length === headerIndexesSet.size
            
            return headerIndexesFallWithinColumnIndexBounds && numberOfHeadersFallWithinNumberOfColumns && headerIndexesAreUnique
        }
    }

    private static throwInvalidInputsError(message:string = ""):never{
        throw new Error(`Invalid input. ${message}`.trim())
    }


}



