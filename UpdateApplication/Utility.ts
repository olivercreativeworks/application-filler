export interface MyIterator<A>{
    hasNext():boolean
    next(): A
}

export namespace Utility{
    export function loop<A, B>(fn:(x:A, y?:B) => B, iterator:MyIterator<A>, maxIterations:number = Infinity):B | undefined{
        let result = undefined
        for(let i = 0; i<maxIterations && iterator.hasNext(); i++){
           result = fn(iterator.next(), result)
        }
        return result
    }
    
    export function collect<A, B, C>(iterator:MyIterator<A>, fn:(x:A, y:Map<B,C>) => Map<B,C>, maxIterations:number = Infinity):Map<B,C>{
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

    export function memoize<A, B>(fn:(arg:A) => B): (arg:A) => B{
        const memo: Map<A, B> = new Map()
        return (arg) => {
            const storedResult = memo.get(arg)
            if (storedResult === undefined){
                const computedResult = fn(arg)
                memo.set(arg, computedResult)
                return computedResult 
            }
            return storedResult
        }
    }
}
