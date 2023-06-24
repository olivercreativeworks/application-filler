import { AddressWriter } from "./Address.writer"
import { AssessmentWriter } from "./Assessment.writer"
import { MyGlobals } from "./GLOBALS"
import { Maybe } from "./Maybe"


function main(){
    const studentData = MyGlobals.getStudentData()
    Maybe.of(studentData)
        .map(AddressWriter.updateStudentAddressFields)
        .map(student => AssessmentWriter.updateAssessments(student, AssessmentWriter.getAssessmentObj()))
}
