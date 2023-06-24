import { AssessmentWriter } from "./Assessment.writer"
import { DynamicGrid } from "./DynamicGrid"
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
    
    describe("Update assessments", () => {
        const storedAssessments = new Map([[mockStudent.filledProps.fullName, "1"]])
        const assessmentObj = {
            fetch: (fileName:string) => Maybe.of(storedAssessments.get(fileName)),
            create:  (fileName:string) => fileName,
            fill: (student:MyGlobals.Student & {assessment:{url:string}}) => undefined,
            getUrl: function(fileName:string){ return Maybe.getThisOrGetThat(this.fetch,this.create)(fileName) as string}
        }
        test("Should not update the grid and should not fetch / grid already has assessment value", () => {
            const jestFetch = jest.fn(assessmentObj.fetch)
            const jestCreate = jest.fn(assessmentObj.create)
            const jestFill = jest.fn(assessmentObj.fill)
            const jestAssessmentObj = {...assessmentObj, fetch:jestFetch, create:jestCreate, fill:jestFill}
            
            const studentData = DynamicGrid.fromObject(mockStudent.filledProps)
            expect(AssessmentWriter.updateAssessments(studentData, jestAssessmentObj).lookupCol("assessment")).toEqual([mockStudent.filledProps.assessment])
            expect(jestFetch).toHaveBeenCalledTimes(0)
            expect(jestCreate).toHaveBeenCalledTimes(0)
            expect(jestFill).toHaveBeenCalledTimes(1)        
        })
        test("Should update the grid and fetch existing assessment / grid is missing assessment value / assessment is stored", () => {
            const jestFetch = jest.fn(assessmentObj.fetch)
            const jestCreate = jest.fn(assessmentObj.create)
            const jestFill = jest.fn(assessmentObj.fill)
            const jestAssessmentObj = {...assessmentObj, fetch:jestFetch, create:jestCreate, fill:jestFill}
            
            const fullName = mockStudent.filledProps.fullName
            const studentData = DynamicGrid.fromObject({...mockStudent.emptyProps, fullName})
            expect(AssessmentWriter.updateAssessments(studentData, jestAssessmentObj).lookupCol("assessment")).toEqual([{text: "LINK", url:assessmentObj.fetch(fullName).unsafeUnwrap()}])
            expect(jestFetch).toHaveBeenCalledTimes(1)
            expect(jestCreate).toHaveBeenCalledTimes(0)
            expect(jestFill).toHaveBeenCalledTimes(1)
        })
        test("Should update the grid and create new assessment / grid is missing assessment value / assessment is not stored", () => {
            const jestFetch = jest.fn(assessmentObj.fetch)
            const jestCreate = jest.fn(assessmentObj.create)
            const jestFill = jest.fn(assessmentObj.fill)
            const jestAssessmentObj = {...assessmentObj, fetch:jestFetch, create:jestCreate, fill:jestFill}
            
            const fullName = "MY FULL NAME"
            const studentData = DynamicGrid.fromObject({...mockStudent.emptyProps, fullName})
            expect(AssessmentWriter.updateAssessments(studentData, jestAssessmentObj).lookupCol("assessment")).toEqual([{text: "LINK", url:assessmentObj.create(fullName)}])
            expect(jestFetch).toHaveBeenCalledTimes(1)
            expect(jestCreate).toHaveBeenCalledTimes(1)
            expect(jestFill).toHaveBeenCalledTimes(1)
        })
        test("Should not update grid nor call fetch/create / fill called if assessment url is present / grid is missing full name", () => {
            const jestFetch = jest.fn(assessmentObj.fetch)
            const jestCreate = jest.fn(assessmentObj.create)
            const jestFill = jest.fn(assessmentObj.fill)
            const jestAssessmentObj = {...assessmentObj, fetch:jestFetch, create:jestCreate, fill:jestFill}
            
            const studentDataEmpty = DynamicGrid.fromObject(mockStudent.emptyProps)
            expect(AssessmentWriter.updateAssessments(studentDataEmpty, jestAssessmentObj).lookupCol("assessment")).toEqual([mockStudent.emptyProps.assessment])
            
            const studentDataFilled = DynamicGrid.fromObject({...mockStudent.filledProps, fullName:""})
            expect(AssessmentWriter.updateAssessments(studentDataFilled, jestAssessmentObj).lookupCol("assessment")).toEqual([mockStudent.filledProps.assessment])

            expect(jestFetch).toHaveBeenCalledTimes(0)
            expect(jestCreate).toHaveBeenCalledTimes(0)
            expect(jestFill).toHaveBeenCalledTimes(1)
        })

    })
})