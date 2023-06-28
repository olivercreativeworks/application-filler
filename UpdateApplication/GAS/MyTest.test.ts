import { FailedTestError, MyTest } from "./MyTest"

describe("MyTest", () => {
    describe("Test", () => {
        const testName = "test"
        describe("Should return undefined if input function does not throw", () => {
            test("Undefined", () => {
                expect(MyTest.test(testName, () => undefined )).toBeUndefined()
            })
            test("Boolean", () => {
                expect(MyTest.test(testName, () => true )).toBeUndefined()
            })
            test("Number", () => {
                expect(MyTest.test(testName, () => 3 )).toBeUndefined()
            })
        })
        describe("Should return an error message if input function throws", () => {
            test("FailedTestError", () => {
                expect(MyTest.test(testName, () => { throw new FailedTestError(4, 3) })).toEqual(MyTest.buildFailedTestMessage(testName, new FailedTestError(4, 3).message))
            })
            test("Error", () => {
                const genericError = new Error("This is a generic error")
                expect(MyTest.test(testName, () => { throw genericError})).toEqual(MyTest.buildErrorMessage(testName, genericError))
            })
        })
    })

    describe("Expect", () => {
        describe("ToEqual", () => {
            test("Should return undefined if the expect statement is true", () => {
                expect(MyTest.expect(true).toEqual(true)).toBeUndefined()
            })
            test("Should throw FailedTestError if the expect statement is false", () => {
                expect(() => MyTest.expect(false).toEqual(true)).toThrowError(FailedTestError)
            })
        })
        describe("ToBeNull", () => {
            test("Should return undefined if the expect statement is true", () => {
                expect(MyTest.expect(null).toBeNull()).toBeUndefined()
            })
            test("Should throw FailedTestError if the expect statement is false", () => {
                expect(() => MyTest.expect(false).toBeNull()).toThrowError(FailedTestError) 
            })
        })
        describe("ToBeUndefined", () => {
            test("Should return undefined if the expect statement is true", () => {
                expect(MyTest.expect(undefined).toBeUndefined()).toBeUndefined()
            })
            test("Should throw FailedTestError if the expect statement is false", () => {
                expect(() => MyTest.expect(false).toBeUndefined()).toThrowError(FailedTestError)
            })
        })
    })

    describe("Test and Expect", () => {
        const testName = "test"
        test("Should return undefined if expect returns undefined", () => {
            expect(MyTest.test(testName, () => MyTest.expect(3).toEqual(3))).toBeUndefined()
        })
        test("Should return failedTestMessage if expect statement is false (and throws a FailedTestError as a result)", () => {
            expect(MyTest.test(testName, () => MyTest.expect(3).toEqual(4))).toEqual(MyTest.buildFailedTestMessage(testName, new FailedTestError(3, 4).message))
        })
        test("Should return errorMessage if expect statement throws an error", () => {
            const genericError = new Error("This is a generic error")
            expect(MyTest.test(testName, () => MyTest.expect(function(){throw genericError}()).toEqual(3))).toEqual(MyTest.buildErrorMessage(testName, genericError))
        })
    })
})