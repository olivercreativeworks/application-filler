export interface MyGoogleIterator<A>{
    hasNext():boolean
    next(): A
}

export namespace Utility{
    export function loop<A, B>(fn:(x:A, y?:B) => B, iterator:MyGoogleIterator<A>, maxIterations:number = Infinity):B | undefined{
        let result = undefined
        for(let i = 0; i<maxIterations && iterator.hasNext(); i++){
           result = fn(iterator.next(), result)
        }
        return result
    }
    
    export function collect<A, B, C>(iterator:MyGoogleIterator<A>, fn:(x:A, y:Map<B,C>) => Map<B,C>, maxIterations:number = Infinity):Map<B,C>{
        let map = new Map() as Map<B,C>
        for(let i = 0; i<maxIterations && iterator.hasNext(); i++){
            const iterable = iterator.next()
            map = new Map(fn(iterable, map))
        }
        return map
    }

    export function mapObjectValues<A extends string, B, C>(obj: Record<A, B>, fn:(arg:B) => C):Record<A, C>{
        return Object.fromEntries( Object.entries(obj).map(([k,v]) => [k, fn(v as B)]) ) as Record<A, C>
    }

    export function appendColumn<A, B>(currentGrid:Array<Array<A>>, additionalColumns:Array<Array<B>>):Array<Array<A | B>>{
        return currentGrid.length === additionalColumns.length ? currentGrid.map((row, i) => Array<A|B>().concat(row, additionalColumns[i])) : throwRowsNeedToBeSameSize()

        function throwRowsNeedToBeSameSize():never{
            throw new Error("Row lengths need to be the same")
        }
    }

    export function memoize<A, B>(fn:(...args:Array<A>) => B): (...args:Array<A>) => B{
        const memo: Map<string, B> = new Map()
        return (...args) => {
            const argsAsString = JSON.stringify(args)
            const storedResult = memo.get(argsAsString)
            if (storedResult === undefined){
                const computedResult = fn(...args)
                memo.set(argsAsString, computedResult)
                return computedResult 
            }
            return storedResult
        }
    }
    
    export function areEqual(x:unknown, y:unknown):boolean{
        if (x === null || y === null) 
            return bothValuesAreNull(x, y)      
        else if (x === undefined || y === undefined) 
            return bothValuesAreUndefined(x, y)    
        else if (Array.isArray(x) && Array.isArray(y)) 
            return arrayElementsToJson(x) === arrayElementsToJson(y)
        else if (isMap(x) &&  isMap(y))
            return mapToJson(x) === mapToJson(y)
        else if (isObject(x) && isObject(y)) 
            return objectToJson(x) === objectToJson(y)
        return JSON.stringify(x) === JSON.stringify(y)
   
        function bothValuesAreNull(x:unknown, y:unknown):boolean{
            return (x === null) && (y === null)
        }
        function bothValuesAreUndefined(x:unknown, y:unknown):boolean{
            return (x === undefined) && (y === undefined)
        }

        function mapToJson(x:Map<unknown, unknown>):string{
            return arrayElementsToJson(Array.from(x.entries()).sort())
        }
        
        function objectToJson(x:object):string{
            if(x === null || x === undefined){ return x}
            return JSON.stringify(Object.entries(x).sort().map(([key,val]) => [key, jsonify(val)]))
        }
    
        function arrayElementsToJson(x:Array<any>):string{
            return JSON.stringify(x.map(jsonify))
        }
        
        function jsonify(x:unknown):string{
            if(Array.isArray(x)){ return arrayElementsToJson(x) }
            else if (isObject(x)){ return objectToJson(x) }
            return JSON.stringify(x)
        }
    
        function isObject(x:unknown): x is object{
            return typeof x === "object"
        }

        function isMap(x:unknown): x is Map<unknown, unknown>{
            return x instanceof Map
        }
    }

    export function isNull(x:unknown): x is null{
        return x === null
    }
    export function isUndefined(x:unknown): x is undefined{
        return x === undefined
    }

}
