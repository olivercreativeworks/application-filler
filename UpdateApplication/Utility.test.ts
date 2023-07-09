import { Utility } from "./Utility"
describe("Collect / Should collect iterator values into a map", () => {
    const collect = Utility.collect
    
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
    const loop = Utility.loop

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

describe("Append Columns", () => {
    const appendColumn = Utility.appendColumn

    describe("Should append a column to an existing grid.", () => {
        test("Add a column to a single cell row", () => {
            const currentGrid = [["a"]]
            const additionalColumn = [["b"]]
            expect(appendColumn(currentGrid, additionalColumn)).toEqual([["a", "b"]])
        })

        test("Add a column to a grid with multiple rows", () => {
            const currentGrid = [["a"], ["1"]]
            const additionalColumn = [["b"], ["2"]]
            expect(appendColumn(currentGrid, additionalColumn)).toEqual([["a","b"], ["1","2"]])
        })

        test("Add a column to a grid with multiple columns", () => {
            const currentGrid = [["a", "b"]]
            const additionalColumn = [["c"]]
            expect(appendColumn(currentGrid, additionalColumn)).toEqual([["a", "b", "c"]])
        })

        test("Add multiple columns to a single cell row", () => {
            const currentGrid = [["a"]]
            const additionalColumn = [["b", "c"]]
            expect(appendColumn(currentGrid, additionalColumn)).toEqual([["a", "b", "c"]])
        })
        test("Throw error if number of rows do not match", () => {
            const currentGrid = [["a"], ["1"]]
            const additionalColumn = [["b"]]
            expect(() => appendColumn(currentGrid, additionalColumn)).toThrowError()
            
            const secondGrid = [["a"]]
            const secondAdditionalColumn = [["b"], ["2"]]
            expect(() => appendColumn(secondGrid, secondAdditionalColumn)).toThrowError()
        })
    })
})

describe("Memoize", () => {
    const addOne = (num:number) => num+1
    test("Should return function result", () => {
        const memoizedFn = Utility.memoize(addOne)
        expect(memoizedFn(1)).toEqual(2)
    })
    describe("Should call input function one time per unique argument", () => {
        test("One unique argument input multiple times", () => {
            const jestAddOne = jest.fn(addOne)
            const memoizedFn = Utility.memoize(jestAddOne)
            const args = [1, 1]
            args.map(x => memoizedFn(x))
            expect(jestAddOne).toHaveBeenCalledTimes(1)
        })
        test("Two unique arguments", () => {
            const jestAddOne = jest.fn(addOne)
            const memoizedFn = Utility.memoize(jestAddOne)
            const args = [1, 2]
            args.map(x => memoizedFn(x))
            expect(jestAddOne).toHaveBeenCalledTimes(2)
        })
        test("Two unique arguments input multiple times", () => {
            const jestAddOne = jest.fn(addOne)
            const memoizedFn = Utility.memoize(jestAddOne)
            const args = [1, 2, 2, 2, 1, 1]
            args.map(x => memoizedFn(x))
            expect(jestAddOne).toHaveBeenCalledTimes(2)
        })
    })
    describe("Should accept more than one argument at a time", () => {
        test("Accepts two arguments at the same time", () => {
            const add = (num1:number, num2:number) => num1 + num2
            
            const jestAdd = jest.fn(add)
            const memoizedFn = Utility.memoize(jestAdd)
            expect(memoizedFn(1,1)).toEqual(2)
            expect(jestAdd).toHaveBeenCalledTimes(1)
        })
    })
})

describe("Is Null", () => {
    const isNull = Utility.isNull

    test("Should return true", () => { 
        expect(isNull(null)).toEqual(true)
    })
    test("Should return false", () => {
        expect(isNull([null])).toEqual(false)
        expect(isNull([])).toEqual(false)
        expect(isNull({})).toEqual(false)
        expect(isNull(undefined)).toEqual(false)
        expect(isNull("")).toEqual(false)
        expect(isNull(0)).toEqual(false)
        expect(isNull(false)).toEqual(false)
    })
})

describe("Is Undefined", () => {
    const isUndefined = Utility.isUndefined

    test("Should return true", () => {  
        expect(isUndefined(undefined)).toEqual(true)
    })
    test("Should return false", () => {  
        expect(isUndefined([undefined])).toEqual(false)
        expect(isUndefined([])).toEqual(false)
        expect(isUndefined({})).toEqual(false)
        expect(isUndefined(null)).toEqual(false)
        expect(isUndefined("")).toEqual(false)
        expect(isUndefined(0)).toEqual(false)
        expect(isUndefined(false)).toEqual(false)
    })
})

describe("Testing Equality" , () => {
    const areEqual = Utility.areEqual

    describe("Primatives", () => {
        describe("Should return true", () => {
            test("Boolean", () => {
                expect(areEqual(true, true)).toEqual(true)
                expect(areEqual(false, false)).toEqual(true)
            })
            test("Number", () => {
                expect(areEqual(1, 1)).toEqual(true)
                expect(areEqual(1+1, 2)).toEqual(true)
            })
            test("String", () => {
                expect(areEqual("a", "a")).toEqual(true)
            })
        })
        describe("Should return false" , () => {
            test("Boolean", () => {
                expect(areEqual(true, false)).toEqual(false)
                expect(areEqual(false, null)).toEqual(false)
                expect(areEqual(false, 0)).toEqual(false)
                expect(areEqual(false, undefined)).toEqual(false)
                expect(areEqual(false, [])).toEqual(false)
                expect(areEqual(false, {})).toEqual(false)
                expect(areEqual(false, "")).toEqual(false)
            })
            test("Number", () => {
                expect(areEqual(1, false)).toEqual(false)
                expect(areEqual(1+1, false)).toEqual(false)
            })
            test("String", () => {
                expect(areEqual("a", false)).toEqual(false)
            })
        })
    })
    describe("Null", () => {
        test("Should return true", () => {
            expect(areEqual(null, null)).toEqual(true)
        })

        test("Should return false", () => {
            expect(areEqual(null, [null])).toEqual(false)
            expect(areEqual(null, [])).toEqual(false)
            expect(areEqual(null, {})).toEqual(false)
            expect(areEqual(null, undefined)).toEqual(false)
            expect(areEqual(null, "")).toEqual(false)
            expect(areEqual(null, 0)).toEqual(false)
            expect(areEqual(null, false)).toEqual(false)
        })
    })
    describe("Undefined", () => {
        test("Should return true", () => {
            expect(areEqual(undefined, undefined)).toEqual(true)
        })
        test("Should return false", () => {
            expect(areEqual(undefined, [undefined])).toEqual(false)
            expect(areEqual(undefined, [])).toEqual(false)
            expect(areEqual(undefined, {})).toEqual(false)
            expect(areEqual(undefined, null)).toEqual(false)
            expect(areEqual(undefined, "")).toEqual(false)
            expect(areEqual(undefined, 0)).toEqual(false)
            expect(areEqual(undefined, false)).toEqual(false)
        })
    })
    describe("Array", () => {
        describe("Should return true", () => {
            test("Empty Array", () => {
                expect(areEqual(Array.of(), Array.of())).toEqual(true)
            })
            test("One Dimensional Array", () => {
                expect(areEqual(Array.of(true), Array.of(true))).toEqual(true)
            })
            test("Multi-Dimensional Array", () =>{
                expect(areEqual(Array.of(Array.of(true)), Array.of(Array.of(true)))).toEqual(true)
            })
            test("One element", () => {
                expect(areEqual(Array.of(1), Array.of(1))).toEqual(true)
            })
            test("Multiple elements", () => {
                expect(areEqual(Array.of(1, 2), Array.of(1, 2))).toEqual(true)
            })
            test("Object as element", () => {
                expect(areEqual(Array.of(Object.fromEntries([["a",1]])), Array.of(Object.fromEntries([["a",1]])))).toEqual(true)
            })
            test("Object as element / same keys, different insertion order", () => {
                expect(areEqual(Array.of(Object.fromEntries([["a",1], ["b", 2]])), Array.of(Object.fromEntries([["b",2], ["a", 1]])))).toEqual(true)
            })
            test("Multi-dimensional array / Object as element / same keys, different insertion order", () => {
                expect(areEqual([[{b:2, a:1}]], [[{a:1, b:2}]])).toEqual(true)
            })
            test("Multi-dimensional array / Nested object as element / same keys, different insertion order", () => {
                expect(areEqual([[{b:{c:3, d:4, f:5}, a:1}]], [[{a:1, b:{d:4, c:3, f:5}}]])).toEqual(true)
            })
            test("Contains null element", () => {
                expect(areEqual([null], [null])).toEqual(true)
            })
            test("Contains undefined element", () => {
                expect(areEqual([undefined], [undefined])).toEqual(true)
            })
            test("Contains a mix of types", () => {
                expect(areEqual([undefined, "", [null], {a:3}], [undefined, "", [null], {a:3}])).toEqual(true)

            })
        })
        describe("Should return false", () => {
            test("Arrays have different elements", () => {
                expect(areEqual(Array.of(1), Array.of(2))).toEqual(false)
            })
            test("Arrays have same elements, but in different order", () => {
                expect(areEqual(Array.of(1,2), Array.of(2,1))).toEqual(false)
            })
            test("Multi-dimensional arrays have same elements, but in different order", () => {
                expect(areEqual(Array.of(Array.of(1,2)), Array.of(Array.of(2,1)))).toEqual(false)
                expect(areEqual(Array.of(Array.of(1), Array.of(2)), Array.of(Array.of(2), Array.of(1)))).toEqual(false)
            })
            test("Empty array and single null value", () => {
                expect(areEqual([null], [])).toEqual(false)
            })
            test("Empty array and single undefined value", () => {
                // I'm choosing to treat these as different values.
                // When you use map on an array that has a single undefined element, the map function will run
                // If you map on an empty array, the map function will not run
                expect(areEqual([undefined], [])).toEqual(false)
            })
        })
    })
    describe("Objects", () => {
        describe("Should return true", () => {
            test("Empty object", () => {
                expect(areEqual(Object.fromEntries([[,,]]), Object.fromEntries([[,,]]))).toEqual(true)
            })
            test("One key", () => {
                expect(areEqual(Object.fromEntries([["a", 1]]), Object.fromEntries([["a", 1]]))).toEqual(true)
            })
            test("Multiple keys / same insertion order", () => {
                expect(areEqual(Object.fromEntries([["a", 1], ["b", 2]]), Object.fromEntries([["a", 1], ["b", 2]]))).toEqual(true)
            })
            test("Multiple keys / different insertion order", () => {
                expect(areEqual(Object.fromEntries([["a", 1], ["b", 2]]), Object.fromEntries([["b", 2], ["a", 1]]))).toEqual(true)
            })
            test("One key with an array as a value", () => {
                expect(areEqual(Object.fromEntries([["a", Array.of(1)]]), Object.fromEntries([["a", Array.of(1)]]))).toEqual(true)
            })
            test("Nested object with same keys and values", () => {
                expect(areEqual(Object.fromEntries([["a", Object.fromEntries([["a1", 1]])]]), Object.fromEntries([["a", Object.fromEntries([["a1", 1]])]]))).toEqual(true)
            })
            test("Same keys, same values / values are undefined", () => {
                expect(areEqual({a:undefined}, {a:undefined})).toEqual(true)
            })
            test("Same keys, same values / values are null", () => {
                expect(areEqual({a:null}, {a:null})).toEqual(true)
            })
            test("Same keys, but one value is null, the other is undefined", () => {
                // I'm choosing to treat these as the same value
                // If you try to access a property on an object with an undefined value, the output value will be null
                // This means accessing property "a" on {a:null} and {a:undefined} will produce the same value (null)
                expect(areEqual({a:null}, {a:undefined})).toEqual(true)
            })
        })
        describe("Should return false", () => {
            test("Different keys and values", () => {
                expect(areEqual(Object.fromEntries([["a",1]]), Object.fromEntries([["b",2]]))).toEqual(false)
            })
            test("Same keys different values", () => {
                expect(areEqual(Object.fromEntries([["a",1]]), Object.fromEntries([["a",2]]))).toEqual(false)
            })
            test("Different keys same values", () => {
                expect(areEqual(Object.fromEntries([["a",1]]), Object.fromEntries([["b",1]]))).toEqual(false)
            })
            test("Same keys different array values", () => {
                expect(areEqual(Object.fromEntries([["a", Array.of(1,2)]]), Object.fromEntries([["a", Array.of(2,1)]]))).toEqual(false)
            })
            test("Nested object with different keys and values", () => {
                expect(areEqual(Object.fromEntries([["a", Object.fromEntries([["a1", 1]])]]), Object.fromEntries([["a", Object.fromEntries([["b1", 2]])]]))).toEqual(false)
            })
            test("Nested object with same keys but different values", () => {
                expect(areEqual(Object.fromEntries([["a", Object.fromEntries([["a1", 1]])]]), Object.fromEntries([["a", Object.fromEntries([["a1", 2]])]]))).toEqual(false)
            })
            test("Nested object with different keys but same values", () => {
                expect(areEqual(Object.fromEntries([["a", Object.fromEntries([["a1", 1]])]]), Object.fromEntries([["a", Object.fromEntries([["b1", 1]])]]))).toEqual(false)
            })
            test("Object where all keys have a null value vs empty object", () => {
                expect(areEqual({a:null}, {})).toEqual(false)
            })
            test("Object where all keys have a undefined value vs empty object", () => {
                expect(areEqual({a:undefined}, {})).toEqual(false)
            })
            
        })
    })
})