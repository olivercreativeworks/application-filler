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

    static updateBlanks<A, B>(originalRows:Array<Array<A>>, newRows:Array<Array<B>>, predicate:(arg:A) => boolean = (value:A) => value === ""): Array<Array<A|B>>{
        if(lengthsAreDifferent(originalRows, newRows)) { return throwArraysMustHaveSameLength() }
        return originalRows.map((row, rowIndex) => updateBlanksInRow(row, newRows[rowIndex], predicate))

        function updateBlanksInRow<A, B>(originalRow:Array<A>, newRow:Array<B>, predicate:(arg:A) => boolean): Array<A|B>{
            if(lengthsAreDifferent(originalRow, newRow)) { return throwArraysMustHaveSameLength() }
            return originalRow.map((value, columnIndex) => predicate(value) ? newRow[columnIndex] : value)
        }

        function lengthsAreDifferent(arr1:Array<unknown>, arr2:Array<unknown>):boolean{
            return arr1.length != arr2.length
        }

        function throwArraysMustHaveSameLength():never{
            throw new Error("Mismatched array lengths.")
        }
    }
}
    