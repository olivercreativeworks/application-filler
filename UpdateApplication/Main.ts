import { Address } from "./Address"
import { AddressWriter } from "./Address.writer"
import { Assessment } from "./Assessment"
import { AssessmentWriter } from "./Assessment.writer"
import { DynamicGrid } from "./DynamicGrid"
import { MyGlobals } from "./GLOBALS"
import { Maybe, Unwrap } from "./Maybe"
import { Utility } from "./Utility"

function main(){
    updateAssessments()
}

function updateAssessments(){
    const studentData = MyGlobals.getStudentData()
    const updatedData = Maybe.of(studentData)
        .map(AddressWriter.updateStudentAddressFields)
        .map(AssessmentWriter.updateAssessments)
    return updatedData
}