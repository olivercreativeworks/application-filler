import { Utility } from "./Utility"
const loop = Utility.loop
const collect = Utility.collect
describe("Collect / Should collect iterator values into a map", () => {
    const myIterator = (numberOfIterations:number) => ({
        currentIteration: 0,
        maxIterations: numberOfIterations,
        hasNext(){
            return this.currentIteration < this.maxIterations
        },
        next(){
            this.currentIteration++
            return this.currentIteration > this.maxIterations ? this.throwAnError() : this.currentIteration
        },
        throwAnError(){
            throw new Error("No new next values")
        }
    })

    function addToMap(x:number, map:Map<number, number>):Map<number, number>{
        return new Map(map).set(x, x)
    }
    
    describe("Should iterate over all values", () => {
        test("Empty iterator", () => {
            expect(collect(myIterator(0), addToMap)).toEqual(new Map())
        })
        test("One iterator value", () => {
            expect(collect(myIterator(1), addToMap)).toEqual(new Map([[1,1]]))
        })
        test("Two iterator values", () => {
            expect(collect(myIterator(2), addToMap)).toEqual(new Map([[1,1], [2,2]]))
        })
        test("Iterates over all values", () => {
            const $addToMap = jest.fn((x:number, y:Map<number, number>) => addToMap(x, y))
            collect(myIterator(10), $addToMap)
            expect($addToMap).toHaveBeenCalledTimes(10)
        })
    })
    describe("Should cap the number of iterations", () => {
        test("Runs 0 times / 10 possible iterations vs 0 max iterations", () => {
            const $addToMap = jest.fn((x:number, y:Map<number, number>) => addToMap(x, y))
            const maxIterations = 0
            const possibleIterations = 10
            expect(collect(myIterator(possibleIterations), $addToMap, maxIterations)).toEqual(new Map())
            expect($addToMap).toHaveBeenCalledTimes(maxIterations)
        })
        test("Runs 1 time / 10 possible iterations vs 1 max iterations", () => {
            const $addToMap = jest.fn((x:number, y:Map<number, number>) => addToMap(x, y))
            const maxIterations = 1
            const possibleIterations = 10
            expect(collect(myIterator(possibleIterations), $addToMap, maxIterations)).toEqual(new Map([[1,1]]))
            expect($addToMap).toHaveBeenCalledTimes(maxIterations)
        })
        test("Runs 2 times / 10 possible iterations vs 2 max iterations", () => {
            const $addToMap = jest.fn((x:number, y:Map<number, number>) => addToMap(x, y))
            const maxIterations = 2
            const possibleIterations = 10
            expect(collect(myIterator(possibleIterations), $addToMap, maxIterations)).toEqual(new Map([[1,1], [2,2]]))
            expect($addToMap).toHaveBeenCalledTimes(maxIterations)
        }) 
    })

    describe("Should return early if iteration is complete before max number of iterations", () => {
        test("Should run twice / 2 possible iterations vs 100 max iterations", () => {
            const $addToMap = jest.fn((x:number, y:Map<number, number>) => addToMap(x, y))
            const maxIterations = 100
            const possibleIterations = 2
            expect(collect(myIterator(possibleIterations), $addToMap, maxIterations)).toEqual(new Map([[1,1], [2,2]]))
            expect($addToMap).toHaveBeenCalledTimes(2)
        }) 
    })
})

describe("Loop", () => {

    const myIterator = (numberOfIterations:number) => ({
        currentIteration: 0,
        maxIterations: numberOfIterations,
        hasNext(){
            return this.currentIteration < this.maxIterations
        },
        next(){
            this.currentIteration++
            return this.currentIteration > this.maxIterations ? this.throwAnError() : this.currentIteration
        },
        throwAnError(){
            throw new Error("No new next values")
        }
    })

    function identity<A>(x:A):A{
        return x
    }

    describe("Should iterate over all values", () => {
        test("Iterates over all values", () => {
            const getValue = jest.fn(<A>(x:A) => identity(x))
            expect(loop(getValue, myIterator(10))).toBe(10)
            expect(getValue).toHaveBeenCalledTimes(10)
        })
    })
    describe("Should cap the number of iterations", () => {
        test("Runs 0 times / 0 max iterations", () => {
            const getValue = jest.fn(<A>(x:A) => identity(x))
            const maxIterations = 0
            expect(loop(getValue, myIterator(10), maxIterations)).toBeUndefined()
            expect(getValue).toHaveBeenCalledTimes(maxIterations)
        })
        test("Runs 1 time / 1 max iterations", () => {
            const getValue = jest.fn(<A>(x:A) => identity(x))
            const maxIterations = 1
            expect(loop(getValue, myIterator(10), maxIterations)).toEqual(1)
            expect(getValue).toHaveBeenCalledTimes(maxIterations)
        })
        test("Runs 2 times / 2 max iterations", () => {
            const getValue = jest.fn(<A>(x:A) => identity(x))
            const maxIterations = 2
            expect(loop(getValue, myIterator(10), maxIterations)).toEqual(2)
            expect(getValue).toHaveBeenCalledTimes(maxIterations)
        }) 
    })

    describe("Should return early if iteration is complete before max number of iterations", () => {
        test("Should run once / 3 next ; 100 max iterations", () => {
            const getValue = jest.fn(<A>(x:A) => identity(x))
            const maxIterations = 100
            expect(loop(getValue, myIterator(10), maxIterations)).toEqual(10)
            expect(getValue).toHaveBeenCalledTimes(10)
        }) 
    })

    describe("Function should be able to transform iterator input into an output", () => {
        test("Should return function output", () => {
            const returnOneHundred = jest.fn(<A>(x:A) => 100)
            const maxIterations = 1
            expect(loop(returnOneHundred, myIterator(10), maxIterations)).toEqual(100)
            expect(returnOneHundred).toHaveBeenCalledTimes(1)
        })
    })

    describe("Function should be able to use prior outputs to calculate new output", () => {
        test("Should return sum of all iterator outputs", () => {
            const sum = jest.fn((iteratorValue:number, currentSum?:number) => currentSum ? iteratorValue + currentSum : iteratorValue)
            const maxIterations = 5
            expect(loop(sum, myIterator(10), maxIterations)).toEqual(1 + 2 + 3 + 4 + 5)
            expect(sum).toHaveBeenCalledTimes(5)
        })
    })
})