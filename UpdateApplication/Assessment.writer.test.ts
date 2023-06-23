import { AssessmentWriter } from "./Assessment.writer"
import { MyGlobals } from "./GLOBALS"

describe("Fill Assessment", () => {
    const mockStudent = MyGlobals.getMockStudent()
    const existingAssessment = mockStudent.filledProps
    const missingAssessment = mockStudent.emptyProps
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