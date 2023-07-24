import { AssessmentWriter } from "./Assessment.writer"
import { DynamicGrid } from "./DynamicGrid"
import { MyGlobals } from "./GLOBALS"

describe("Assessment Writer", () => {
    const mockStudent = MyGlobals.getMockStudent()
    
    describe("Update assessments", () => {
        const mockUrl = "1"
        const assessmentObj = {
            fill: (student:MyGlobals.Student & {assessment:{url:string}}, assessment:string) => undefined,
            getUrl: (fileName:string) => mockUrl,
            getAssessment: (url:string) => url
        }
        
        test("Should not update the assessment column / grid already has assessment value", () => {
            const studentData = DynamicGrid.fromObject(mockStudent.filledProps)
            expect(AssessmentWriter.updateAssessments(studentData, assessmentObj).lookupCol("assessment")).toEqual([mockStudent.filledProps.assessment])
        })
        test("Should not update the assessment column / grid is missing full name", () => {
            const missingFullName = DynamicGrid.fromObject({...mockStudent.filledProps, fullName:""})
            expect(AssessmentWriter.updateAssessments(missingFullName, assessmentObj).lookupCol("assessment")).toEqual([mockStudent.filledProps.assessment])
        })
        test("Should update the assessment column / grid has full name", () => {
            const onlyFullName = DynamicGrid.fromObject({...mockStudent.emptyProps, fullName:"Full name"})
            expect(AssessmentWriter.updateAssessments(onlyFullName, assessmentObj).lookupCol("assessment")).toEqual([{text: "LINK", url: mockUrl}])
        })
        describe("Fill method", () => {
            const jestFill = jest.fn(assessmentObj.fill)
            const jestFillAssessmentObj = {...assessmentObj, fill:jestFill}

            test("Fill is not called / grid is missing assessment url value", () => {
                jestFill.mockClear()
                const missingAssessmentUrl = DynamicGrid.fromObject({...mockStudent.filledProps, fullName:"", assessment:{text:"assessment"}})
                
                AssessmentWriter.updateAssessments(missingAssessmentUrl, jestFillAssessmentObj)
                expect(jestFill).toHaveBeenCalledTimes(0)
            })
            
            test("Fill is called / grid has assessment url value", () => {
                jestFill.mockClear()
                const onlyHasAssessmentUrl = DynamicGrid.fromObject({...mockStudent.emptyProps, assessment:{text:"", url:mockUrl} as MyGlobals.RichText})
    
                AssessmentWriter.updateAssessments(onlyHasAssessmentUrl, jestFillAssessmentObj)
                expect(jestFill).toHaveBeenCalledTimes(1)
            })
        })
    })
})