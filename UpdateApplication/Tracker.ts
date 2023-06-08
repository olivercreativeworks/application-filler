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
}
    