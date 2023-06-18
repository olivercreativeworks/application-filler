import { DocumentBody } from "./GAS/DocumentBody"
import { MyGlobals } from "./GLOBALS"
import { Maybe } from "./Maybe"
import { Utility } from "./Utility"

interface AssessmentFields{
    firstName:string
    lastName:string
    address:string
    borough:string
    councilDistrict:string
    phone:string
    email:string
    isNychaResident:string
    hasOsha10Card:string
    inConstruction:string
    development:string
    employer:string
    job:string
}

export namespace Assessment{
    
    export function retrieve():(studentName:string) => Maybe<GoogleAppsScript.Drive.File | undefined>{
        function getAssessments(maxNumberOfAssessmentsToGet: number = Infinity):Map<string, GoogleAppsScript.Drive.File>{
            const assessments = MyGlobals.getAssessmentFolder().getFiles()
            return Utility.collect(assessments, addToMap, maxNumberOfAssessmentsToGet)
            
            function addToMap(assessment:GoogleAppsScript.Drive.File, map:Map<string, GoogleAppsScript.Drive.File>):Map<string, GoogleAppsScript.Drive.File>{
                return new Map(map).set(assessment.getName().toUpperCase(), assessment)
            }
        }
        
        const assessments = getAssessments()
        return (studentName) => Maybe.of(assessments.get(studentName.toUpperCase()))

    }

    export function create(studentName:string):GoogleAppsScript.Drive.File {
        const assessmentTemplate = MyGlobals.getAssessmentTemplate()
        const assessmentFolder = MyGlobals.getAssessmentFolder()
        const fileName = studentName.toUpperCase()
        const newAssessment = assessmentTemplate.makeCopy(fileName, assessmentFolder)
        return newAssessment
    }

    export function fillIn(student: AssessmentFields, assessment:GoogleAppsScript.Document.Document):void{
        function getTodaysDate(){
            let date = new Date()
            let today = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
            return today
        }
        
        const body = assessment.getBody()

        body.replaceText('Date[^\\t\\n]*', "Date: " + getTodaysDate())

        body.replaceText('First[^\\t\\n]*', "First Name: "+ student.firstName)
        body.replaceText('Last[^\\t\\n]*', "Last Name: "+ student.lastName)
        body.replaceText('Address[^\\t\\n]*', "Address: "+ student.address)
        body.replaceText('Borough[^\\t\\n]*', "Borough: "+ student.borough)
        body.replaceText('Council[^\\t\\n]*', "Council District #: "+ student.councilDistrict)

        DocumentBody.replaceFirstInstanceOfText(body, 'Phone[^\\t\\n]*','Phone Number: ' + student.phone)
        
        body.replaceText('Email[^\\t\\n]*', "Email: "+ student.email)
              
        const yesNoMap = new Map([['Y', "Y\\s"], ["N","N\\s"]])
        
        Maybe.of(yesNoMap.get(student.isNychaResident)).map(textToBold => DocumentBody.bold(body, 'NYCHA development[^\\t\\n]*', textToBold,))
        Maybe.of(yesNoMap.get(student.hasOsha10Card)).map(textToBold => DocumentBody.bold(body, 'OSHA 10 card[^\\t\\n]*', textToBold,))
        Maybe.of(yesNoMap.get(student.inConstruction)).map(textToBold => DocumentBody.bold(body, 'construction-related[^\\t\\n]*', textToBold,))
        
        body.replaceText('Which one[^\\t\\n]*', "Which one? "+ student.development)
        
        DocumentBody.replaceFirstInstanceOfText(body, 'Employer[^\\t\\n]*', 'Employer: ' + student.employer)
        DocumentBody.replaceFirstInstanceOfText(body, 'Job[^\\t\\n]*','Job/position: ' + student.job)
    
    }
} 