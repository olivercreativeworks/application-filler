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
}
