import {Tracker as Tracker} from "./Tracker"
describe("Testing Tracker", () => {
    describe("Return column headers as keys and column body as values", () =>{
        test("One Column", () => {
            expect(Tracker.headersAsKeys([["headerA"], ["value1"]])).toEqual({"headerA":["value1"]})
        })
        test("Multiple Columns", () => {
            expect(Tracker.headersAsKeys([["headerA", "headerB"], ["value1", "value2"]])).toEqual({"headerA":["value1"], "headerB":["value2"]})
        })
        test("Multiple Values In A Column", () =>{
            expect(Tracker.headersAsKeys([["headerA"], ["value1"], ["value1A"]])).toEqual({"headerA":["value1", "value1A"]})
        })
        test("Empty string", () => {
            expect(Tracker.headersAsKeys([["headerA"], [""], ["value1A"]])).toEqual({"headerA":["", "value1A"]})
            expect(Tracker.headersAsKeys([["headerA"], ["value1"], [""]])).toEqual({"headerA":["value1", ""]})
            expect(Tracker.headersAsKeys([["headerA"], [""], [""]])).toEqual({"headerA":["", ""]})
        })
        test("Numbers", () => {
            expect(Tracker.headersAsKeys([["headerA"], [2]])).toEqual({"headerA":[2]})
        })
        test("Strings and Numbers", () => {
            expect(Tracker.headersAsKeys([["headerA", "headerB"], [2, "happy"]])).toEqual({"headerA":[2], "headerB":["happy"]})
        })
    })

    describe("Return array of rows with values mapped to the headers", () => {
        test("One Column", () => {
            expect(Tracker.getStubValues([["headerA"], ["value1"]])).toEqual([{"headerA": "value1"}])
        })
        test("Multiple Columns", () => {
            expect(Tracker.getStubValues([["headerA", "headerB"], ["value1", "value2"]])).toEqual([{"headerA": "value1", "headerB":"value2"}])
        })
        test("Multiple Values In A Column", () =>{
            expect(Tracker.getStubValues([["headerA"], ["value1"], ["value1A"]])).toEqual([{"headerA":"value1"}, {"headerA":"value1A"}])
        })
        test("Empty string", () => {
            expect(Tracker.getStubValues([["headerA"], [""], ["value1A"]])).toEqual([{"headerA":""}, {"headerA":"value1A"}])
            expect(Tracker.getStubValues([["headerA"], ["value1"], [""]])).toEqual([{"headerA":"value1"}, {"headerA":""}])
            expect(Tracker.getStubValues([["headerA"], [""], [""]])).toEqual([{"headerA":""},{"headerA":""}])
        })
        test("Numbers", () => {
            expect(Tracker.getStubValues([["headerA"], [2]])).toEqual([{"headerA":2}])
        })
        test("Strings and Numbers", () => {
            expect(Tracker.getStubValues([["headerA", "headerB"], [2, "happy"]])).toEqual([{"headerA":2, "headerB":"happy"}])
        })
    })
})