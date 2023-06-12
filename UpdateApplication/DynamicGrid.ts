import { GridTransformer } from "./GridTransformer"

export type Grid<Row extends Record<string, unknown>> = Array<Array<ValueOf<Row>>>
export type ColumnIndexes<Row> = {
    [k in keyof Row] : number
}
type CellType<Row extends Record<string, unknown>> = Row[keyof Row]
type ColumnHeaders<Row> = keyof Row
type ValueOf<Type extends Record<string, unknown>> = Type[keyof Type]

export class DynamicGrid<Row extends Record<string,unknown>>{
    private $values: Grid<Row>
    private zeroBasedHeaderIndex: ColumnIndexes<Row>
    private headersByIndex: Record<number , keyof typeof this.zeroBasedHeaderIndex>
    
    static fromOneBasedHeaderIndex<A extends Record<string,unknown>>(values:Grid<A>, oneBasedHeaderIndex:ColumnIndexes<A>):DynamicGrid<A>{
        const zeroBasedHeaderIndex = Object.fromEntries(Object.entries(oneBasedHeaderIndex).map(([header, index]) => [header, index - 1])) as ColumnIndexes<A>
        return new DynamicGrid(values, zeroBasedHeaderIndex)
    }

    static fromZeroBasedHeaderIndex<A extends Record<string,unknown>>(values:Grid<A>, zeroBasedHeaderIndex:ColumnIndexes<A>):DynamicGrid<A>{
        return new DynamicGrid(values, zeroBasedHeaderIndex)
    }

    constructor(values:Grid<Row>, zeroBasedHeaderIndex:ColumnIndexes<Row>, lookupHeadersByIndex?:Record<number, keyof typeof zeroBasedHeaderIndex>){
        this.$values = values
        this.zeroBasedHeaderIndex = zeroBasedHeaderIndex
        this.headersByIndex = lookupHeadersByIndex || Object.fromEntries(Object.entries(this.zeroBasedHeaderIndex).map(([header, index]) => [index, header]))
    }

    get values():Grid<Row>{
        return [...this.$values]
    }

    lookupCol<Header extends ColumnHeaders<Row>>(header:Header):Array<Row[Header]>{
        return this.values.map((rowArray) => rowArray[this.zeroBasedHeaderIndex[header]] as Row[Header])
    }

    updateCol<Header extends ColumnHeaders<Row>>(header:Header, fn:(row:Row) => CellType<Row>, predicate:(arg: CellType<Row>)=>boolean = (value) => value === ""):DynamicGrid<Row>{
        const updatedValues = this.values.map(rowArray => rowArray.map((value, index) => {
            return index === this.zeroBasedHeaderIndex[header] && predicate(value) ? 
                fn(this.fromArrayToRow(rowArray)) :
                value
        }))
        const updatedGrid = GridTransformer.updateGrid(this.values, updatedValues, predicate)
        return new DynamicGrid(updatedGrid, this.zeroBasedHeaderIndex, this.headersByIndex)
    }

    private fromArrayToRow(rowArray:Array<ValueOf<Row>>):Row{
        return Object.fromEntries(rowArray.map(($value, index) => [this.headersByIndex[index], $value])) as Row
    }
}



