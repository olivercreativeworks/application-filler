export class Tracker{
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

    static updateBlanks<A, B>(originalRows:Array<Array<A>>, newRows:Array<Array<B>>): Array<Array<A|B>>{
        if(originalRows.length != newRows.length) { return throwArraysMustHaveSameLength() }
        return originalRows.map((row, rowIndex) => updateBlanksInRow(row, newRows[rowIndex]))

        function updateBlanksInRow<A, B>(originalRow:Array<A>, newRow:Array<B>): Array<A|B>{
            if(originalRow.length != newRow.length) { return throwArraysMustHaveSameLength() }
            return originalRow.map((value, columnIndex) => replaceBlankValue(value, newRow[columnIndex]))
        }

        function replaceBlankValue<A,B>(value:A, newValue:B): A|B{
            return value === "" ? newValue : value
        }

        function throwArraysMustHaveSameLength():never{
            throw new Error("Mismatched array lengths.")
        }
    }
}
    