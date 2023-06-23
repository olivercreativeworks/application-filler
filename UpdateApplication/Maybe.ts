type Nothing = null | undefined
type Something<T> = Exclude<T, Nothing>
export type Unwrap<T extends Maybe<unknown>> = T["value"]

export class Maybe<Value>{
    value: Value

    constructor(x:Value){
        this.value = x
    }

    static of<A>(x:A):Maybe<A>{
        return new Maybe(x)
    }

    static getThisOrGetThat<A, B>(maybeFn: (arg:A)=>Maybe<B>, defaultFn:(arg:A) => B):(arg:A) => B{
        return arg => maybeFn(arg).orElseGet(() => defaultFn(arg))
    }

    private static ignoreOperationIfNullValue(target: Maybe<unknown>, propertyKey: string, descriptor: PropertyDescriptor){
        const originalMethod = descriptor.value as (this:Maybe<unknown>, ...args:Array<unknown>) => Maybe<unknown> 
        descriptor.value = function(this:Maybe<unknown>, ...args:Array<unknown>){
            return this.isNothing() ? this : originalMethod.apply(this, args)
        }
    }

    unsafeUnwrap(): Value{
        return this.value
    }

    isNothing():this is Maybe<Nothing>{
        return this.value === null || this.value === undefined
    }

    @Maybe.ignoreOperationIfNullValue
    map<A>(fn:(arg:Something<Value>) => A):Maybe<A>{
        return new Maybe(fn(this.value as Something<Value>))
    }

    @Maybe.ignoreOperationIfNullValue
    join<A>(this:Maybe<Maybe<A>>):Maybe<A>{
        return this.unsafeUnwrap()
    }

    flatMap<A>(fn:(arg:Something<Value>) => Maybe<A>):Maybe<A>{
        return this.map(fn).join()
    }

    orElse<A>(x:A):A | Something<Value>{
        return this.isNothing() ? x : this.value as Something<Value>
    }

    orElseGet<A>(x:() => A): A | Something<Value>{
        return this.isNothing()? x() : this.value as Something<Value>
    }
}