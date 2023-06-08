export class GridTransformer{
    static headersAsKeys<A>(x:[Array<string>, ...Array<Array<A>>]):Record<string, Array<A>>{
        const headers = x[0]
        const body = x.slice(1) as Array<Array<A>>
        return Object.fromEntries(headers.map((header, index) =>  [header, body.map(row => row[index])]))
    }
    static getStubValues<A>(x:[Array<string>, ...Array<Array<A>>]): Array<Record<string, A>>{
        const headers = x[0]
        const rows = x.slice(1) as Array<Array<A>>
        return rows.map(row => Object.fromEntries(row.map((element, index) => [headers[index], element])))
    }

    static updateGrid<A, B>(originalRows:Array<Array<A>>, newRows:Array<Array<B>>, predicate?:(arg:A) => boolean): Array<Array<A|B>>{
        if(lengthsAreDifferent(originalRows, newRows)) { return throwArraysMustHaveSameLength(originalRows, newRows) }
        return originalRows.map((row, rowIndex) => updateRow(row, newRows[rowIndex], predicate))

        function updateRow<A, B>(originalRow:Array<A>, newRow:Array<B>, predicate?:(arg:A) => boolean): Array<A|B>{
            if(lengthsAreDifferent(originalRow, newRow)) { return throwArraysMustHaveSameLength(originalRow, newRow) }
            return originalRow.map((value, columnIndex) => updateValue(value, newRow[columnIndex], predicate))
        }

        function updateValue<A, B>(originalValue:A, newValue:B, predicate:(arg:A) => boolean = (value:A) => value === ""):A|B{
            return predicate(originalValue) ? newValue : originalValue
        }

        function lengthsAreDifferent(arr1:Array<unknown>, arr2:Array<unknown>):boolean{
            return arr1.length != arr2.length
        }

        function throwArraysMustHaveSameLength(...mismatchedArrays:Array<unknown>):never{
            throw new Error(`Mismatched array lengths. Make sure each input array has the same length.\n${mismatchedArrays?.join("\n")}`.trim())
        }
    }
}
    