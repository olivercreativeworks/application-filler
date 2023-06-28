import { MyTest } from "./MyTest"

describe("MyTest", () => {
    const buildTestFailedMessage = MyTest.buildTestFailedMessage
    const buildErrorMessage = MyTest.buildErrorMessage
    const testName = "test"
    describe("Test", () => {
        test("Should return undefined if input function returns true", () => {
            expect(MyTest.test(testName, () => MyTest.expect(true).toEqual(true))).toBeUndefined()
        }) 
        test("Should return undefined if input function returns true", () => {
            expect(MyTest.test(testName, () => MyTest.expect(false).toEqual(false))).toBeUndefined()
        })
        test("Should return failure message if input function returns false", () => {
            expect(MyTest.test(testName, () => MyTest.expect(4).toEqual(3))).toEqual(buildTestFailedMessage(testName, {testFailed:true, gotResult:4, expectedResult:3}))
        })
        test("Should return error message if input function throws an error", () => {
            const errorMessage = "This is a random error!"
            function throwRandomError(errorMessage:string){
                throw new Error(errorMessage)
            }
            expect(MyTest.test(testName, () => MyTest.expect(throwRandomError(errorMessage)).toEqual(true))).toEqual(buildErrorMessage(testName, new Error(errorMessage)));
        })

    })

    describe("Expect", () => {
        describe("ToEqual", () => {
            test("Should return undefined if the expect statement is true", () => {
                expect(MyTest.expect(true).toEqual(true)).toBeUndefined()
            })
            test("Should return failedTestObject if the expect statement is false", () => {
                expect(() => MyTest.expect(false).toEqual(true)).toThrow() 
            })
        })
        describe("ToBeNull", () => {
            test("Should return undefined if the expect statement is true", () => {
                expect(MyTest.expect(null).toBeNull()).toBeUndefined()
            })
            test("Should return failedTestObject if the expect statement is false", () => {
                expect(() => MyTest.expect(false).toBeNull()).toThrow() 
            })
        })
        describe("ToBeUndefined", () => {
            test("Should return undefined if the expect statement is true", () => {
                expect(MyTest.expect(undefined).toBeUndefined()).toBeUndefined()
            })
            test("Should return failedTestObject if the expect statement is false", () => {
                expect(() => MyTest.expect(false).toBeUndefined()).toThrow()
            })
        })
    })
})