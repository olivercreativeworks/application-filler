import { Utility } from "../Utility"

// Use this class to run tests on Google Apps Script. 
// This class mimics the basic functionality of jest
// And it can be good for testing for any of your code code that makes use of Google Apps Script classes/methods
// (Since I can't figure out how to get Jest into Google Apps Script)

export class MyTest{

    static describe(description: string, fn:() => void, loggingFn:(message:string) => void = console.log):void{
        loggingFn(description)
        fn()
        loggingFn("________________________")
    }
    
    static test(testName:string, fn:() => void, loggingFn:(message:string) => void = console.log):void | string{
        const message = MyTest.createMesageOnFailureOrError(testName, fn)
        if (message){
            loggingFn(message)
        }
        return message
    }

    static expect<A, B>(theValueYouGot:A): ({toEqual:(arg:B) =>void, toBeNull:() => void, toBeUndefined:() => void}){
        return {
            toEqual:(theValueYouExpect) => MyTest.testEquality(theValueYouGot, theValueYouExpect),
            toBeNull:() => MyTest.testEquality(theValueYouGot, null),
            toBeUndefined: () => MyTest.testEquality(theValueYouGot, undefined)
        } 
    }

    private static createMesageOnFailureOrError(testName:string, testFunction:() => void):void | string{
        try{
            testFunction()
        }
        catch(err:any){
            return err.testFailed ? MyTest.buildTestFailedMessage(testName, err) : MyTest.buildErrorMessage(testName, err)
        }
        
    }
    static buildTestFailedMessage(testName:string, testResults: {testFailed:true, gotResult:unknown, expectedResult:unknown}):string{
        return `FAILED\nTest:${testName}\nGot:${testResults.gotResult}\nExpected:${testResults.expectedResult}`
    }

    static buildErrorMessage(testName:string, err: Error):string{
        return `ERROR\n${testName}\n${err}`
    }
    
    private static throwTestFailed(gotResult:unknown, expectedResult:unknown):never{
        throw {testFailed: true, gotResult, expectedResult}
    }

    private static testEquality<A,B>(gotResult:A, expectedResult:B): undefined{
        return Utility.areEqual(gotResult, expectedResult) ? undefined : MyTest.throwTestFailed(gotResult, expectedResult)
    }
}
  
  


// export namespace TestingGas{
//     export function test(x:any){
//         return {
//             toEqual:(y:any) => areEqual(x,y),
//             toBeNull:() => x === null,
//             toBeUndefined: () => x === undefined
//         }
//     }
//     function areEqual(x:unknown, y:unknown):boolean{  
//         if (x === null || y === null) { return bothValuesAreNull(x, y)}      
//         if (x === undefined || y === undefined) { return bothValuesAreUndefined( x, y)}      
//         if (Array.isArray(x) && Array.isArray(y)) {
//           return arrayElementsToJson(x) === arrayElementsToJson(y)
//         }
//         if (isObject(x) && isObject(y)){
//           return objectToJson(x) === objectToJson(y)
//         }
//         return JSON.stringify(x) === JSON.stringify(y)
//     }

//     function bothValuesAreNull(x:unknown, y:unknown):boolean{
//         return (x === null) && (y === null)
//     }
//     function bothValuesAreUndefined(x:unknown, y:unknown):boolean{
//         return (x === undefined) && (y === undefined)
//     }
    
//     function objectToJson(x:object):string{
//         if(x === null || x === undefined){ return x}
//         return JSON.stringify(Object.entries(x).sort().map(([key,val]) => [key, jsonify(val)]))
//     }

//     function arrayElementsToJson(x:Array<any>):string{
//       return JSON.stringify(x.map(jsonify))
//     }
    
//     function jsonify(x:unknown):string{
//       if(Array.isArray(x)){ return arrayElementsToJson(x) }
//       else if (isObject(x)){ return objectToJson(x) }
//       return JSON.stringify(x)
//     }

//     function isObject(x:unknown): x is object{
//         return typeof x === "object"
//     }
// }