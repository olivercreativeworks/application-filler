import { AssessmentWriter } from "./Assessment.writer"
import { MyGlobals } from "./GLOBALS"
import { Maybe } from "./Maybe"

describe("Assessment Writer", () => {
    const mockStudent = MyGlobals.getMockStudent()
    const existingAssessment = mockStudent.filledProps
    const missingAssessment = mockStudent.emptyProps
    
    describe("Fill Assessment", () => {
        const fillFn = (x:MyGlobals.Student) => undefined
        test("Should return the input student's assessment / Student has assessment", () => {
            expect(AssessmentWriter.fillAssessment(existingAssessment, fillFn)).toEqual(existingAssessment.assessment)
        })
        test("Should return the input student's assessment / Student does not have assessment", () => {
            expect(AssessmentWriter.fillAssessment(missingAssessment, fillFn)).toEqual(missingAssessment.assessment)
        })
        test("Should call the fillFn if student has an assessment", () => {
            const jestFillFn = jest.fn(fillFn)
            AssessmentWriter.fillAssessment(existingAssessment, jestFillFn)
            expect(jestFillFn).toHaveBeenCalledTimes(1)
        })
        test("Should not call the fillFn if student is missing assessment", () => {
            const jestFillFn = jest.fn(fillFn)
            AssessmentWriter.fillAssessment(missingAssessment, jestFillFn)
            expect(jestFillFn).toHaveBeenCalledTimes(0)
        })
    })
    
    describe("Fetch or Create", () => {
        const assessments = new Map([["a", "1"]])
        const fetchFn = (fileName:string) => Maybe.of(assessments.get(fileName))
        const createFn = (fileName:string) => fileName
        test("Should fetch existing assessment", () => {
            const name = "a"
            expect(AssessmentWriter.fetchOrCreateAssessment(fetchFn, createFn)(name)).toEqual("1")
        })
        test("Should create new assessment / assessment does not exist", () => {
            const name = "b"
            expect(AssessmentWriter.fetchOrCreateAssessment(fetchFn, createFn)(name)).toEqual("b")
        })
        test("Should not create new assessment / assessment already exists", () => {
            const name = "a"
            const jestCreateFn = jest.fn(createFn)
            expect(AssessmentWriter.fetchOrCreateAssessment(fetchFn, jestCreateFn)(name)).toEqual("1")
            expect(jestCreateFn).toHaveBeenCalledTimes(0)
        })
        test("Should try to fetch before creating a new assessment / assessment does not exist", () => {
            const name = "b"
            const jestFetchFn = jest.fn(fetchFn)
            expect(AssessmentWriter.fetchOrCreateAssessment(jestFetchFn, createFn)(name)).toEqual("b")
            expect(jestFetchFn).toHaveBeenCalledTimes(1)
        })
    })
})