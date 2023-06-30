import { Utility } from "../Utility"

export namespace MyTest{

    export function describe(description: string, fn:() => void, loggingFn:(message:string) => void = console.log):void{
        loggingFn(description)
        fn()
    }
    
    export function test(testName:string, fn:() => void, loggingFn:(message:string) => void = console.log):void | string{
        const message = createMesageOnFailureOrError(testName, fn)
        if (message){
            loggingFn(message)
        }
        return message
    }

    export function expect<A, B>(theValueYouGot:A): ({toEqual:(arg:B) =>void, toBeNull:() => void, toBeUndefined:() => void}){
        return {
            toEqual:(theValueYouExpect) => testEquality(theValueYouGot, theValueYouExpect),
            toBeNull:() => testEquality(theValueYouGot, null),
            toBeUndefined: () => testEquality(theValueYouGot, undefined)
        } 
    }

    function createMesageOnFailureOrError(testName:string, testFunction:() => void):void | string{
        try{
            testFunction()
        }
        catch(err){
            if (err instanceof FailedTestError){
                return buildFailedTestMessage(testName, `${(err.stack as string)}`.replace(`${err.name}:`, "").trim())
            }
            else{
                return buildErrorMessage(testName, err)
            }
        }
    }
    export function buildFailedTestMessage(testName:string, errorMessage:string):string{
        return `FAILED\nTest:${testName}\n${errorMessage}`
    }

    export function buildErrorMessage(testName:string, errorMessage: unknown):string{
        return `ERROR\n${testName}\n${errorMessage}`
    }
    
    function throwFailedTest(gotResult:unknown, expectedResult:unknown):never{
        throw new FailedTestError(gotResult, expectedResult)
    }

    function testEquality<A,B>(gotResult:A, expectedResult:B): undefined{
        return Utility.areEqual(gotResult, expectedResult) ? undefined : throwFailedTest(gotResult, expectedResult)
    }
    
    // Used this as inspiration for creating my own error
    // https://humanwhocodes.com/blog/2009/03/10/the-art-of-throwing-javascript-errors-part-2/
    export class FailedTestError implements Error{
        name: string
        message: string
        stack?: string | undefined
        constructor(gotResult:unknown, expectedResult:unknown){
            //https://stackoverflow.com/questions/8458984/how-do-i-get-a-correct-backtrace-for-a-custom-error-class-in-nodejs
            Error.call(this)
            Error.captureStackTrace(this, this.constructor)
            this.message = `Got:${gotResult}\nExpected:${expectedResult}`
            this.name = "FailedTest"
        }
    }  
}
