import {Maybe} from "./Maybe"

describe("Maybe class", () => {

    describe("Should return the stored value", () => {
        test("Should return the stored value / string value", () => {
            expect(new Maybe(3).unsafeUnwrap()).toEqual(3) 
        })
        test("Should return the stored value / undefined", () => {
            expect(new Maybe(undefined).unsafeUnwrap()).toBeUndefined()
        })
        test("Should return the stored value / null", () => {
            expect(new Maybe(null).unsafeUnwrap()).toBeNull()
        })
    })

    describe("Should tell us if the value is null or undefined", () => {
        test("Should return true if value is undefined or null / isNothing", () => {
            expect(new Maybe(undefined).isNothing()).toBe(true)
            expect(new Maybe(null).isNothing()).toBe(true)
        })
        test("Should return false if value is not undefined or null / isNothing", () => {
            expect(new Maybe(3).isNothing()).toBe(false)
        })
    })

    describe("Should accept a function to transform the stored value inside", () => {
        function addOne(num:number):number{
            return num + 1
        }
        test("Should return the value transformed by the input function / map", () =>{
            expect(new Maybe(3).map(addOne).unsafeUnwrap()).toEqual(4)
        })
        test("Should be able to chain maps", () => {
            expect(new Maybe(3).map(addOne).map(addOne).unsafeUnwrap()).toEqual(5)
        })
        test("Should not apply function if stored value is undefined / map", () => {
            expect(new Maybe(null).map(x => new Maybe(x))).toEqual(new Maybe(null))
            expect(new Maybe(undefined).map(x => new Maybe(x))).toEqual(new Maybe(undefined))
        })
    })
    describe("Should flatten", () => {
        test("Should flatten / join", () => {
            expect(new Maybe(new Maybe(3)).join()).toEqual(new Maybe(3))
        })
        test("Should not apply function if stored value is undefined / join", () => {
            expect(new Maybe(null).map(x => new Maybe(x)).join()).toEqual(new Maybe(null))
            expect(new Maybe(undefined).map(x => new Maybe(x)).join()).toEqual(new Maybe(undefined))
        })
    })

    describe("Should apply transformation and flatten", () => {
        test("Should transform value and flatten / flatmap", () => {
            expect(new Maybe(3).flatMap((x:number) => new Maybe(x + 1))).toEqual(new Maybe(4))
        })
        test("Should not apply function if stored value is undefined / flatmap", () => {
            expect(new Maybe(null).flatMap(x => new Maybe(x))).toEqual(new Maybe(null))
            expect(new Maybe(undefined).flatMap(x => new Maybe(x))).toEqual(new Maybe(undefined))
        })
    })

    describe("Should return alternative value if value is null or undefined", () => {
        test("Should return alternate value / stored value is null", () => {
            expect(new Maybe(null).orElse(2)).toEqual(2)
            expect(new Maybe(undefined).orElse(2)).toEqual(2)
            expect(new Maybe(null).orElse(undefined)).toBeUndefined()
            expect(new Maybe(undefined).orElse(null)).toBeNull()
        })
        test("Should return stored value / stored value is not null", () => {
            expect(new Maybe(3).orElse(2)).toEqual(3)
            expect(new Maybe("a").orElse(2)).toEqual("a")
            expect(new Maybe("a").orElse(undefined)).toEqual("a")
            expect(new Maybe("a").orElse(null)).toEqual("a")
        })
    })
    
    describe("Should return result of function if value is null or undefined", () => {
        test("Should return alternate value / stored value is null", () => {
            expect(new Maybe(null).orElseGet(() => 2)).toEqual(2)
            expect(new Maybe(undefined).orElseGet(() => 2)).toEqual(2)
            expect(new Maybe(null).orElseGet(() => undefined)).toBeUndefined()
            expect(new Maybe(undefined).orElseGet(() => null)).toBeNull()
        })
        test("Should return stored value / stored value is not null", () => {
            expect(new Maybe(3).orElseGet(() => 2)).toEqual(3)
            expect(new Maybe("a").orElseGet(() => 2)).toEqual("a")
            expect(new Maybe("a").orElseGet(() => undefined)).toEqual("a")
            expect(new Maybe("a").orElseGet(() => null)).toEqual("a")
        })
    })
})