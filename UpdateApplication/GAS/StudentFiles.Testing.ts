import { DynamicGrid } from "../System/DynamicGrid"
import { MyGlobals } from "../System/GLOBALS"
import { MyCache } from "./Cacher"
import { MyTest } from "./MyTest"
import { StudentFiles } from "./StudentFiles"



function Test_StudentFiles(){
    const describe = MyTest.describe
    const test = MyTest.test
    const expect = MyTest.expect

    function clearContentAndNamedRanges(...docs:GoogleAppsScript.Document.Document[]):void{
        return docs.forEach($clearContentAndNamedRanges)

        function $clearContentAndNamedRanges(cache:GoogleAppsScript.Document.Document):void{
            cache.getBody().clear()
            cache.getNamedRanges().forEach(nr => nr.remove())
            expect(cache.getBody().getNumChildren()).toEqual(1)
            expect(cache.getNamedRanges().length).toEqual(0)
        }
    }   
    
    describe("Student Files", () => {
        const mockStudent = MyGlobals.getMockStudent()        
        const cache = MyGlobals.getMockCache()
        const mockFile = MyGlobals.getMockDoc()
        function setUpCacher(...textToPutInCache:Array<string>):MyCache{
            clearContentAndNamedRanges(cache, mockFile)

            textToPutInCache.forEach((paragraph, i) =>  mockFile.getBody().insertParagraph(i, paragraph))
            
            const cacher = MyCache.from(cache)
            cacher.set(mockFile.getUrl(), mockFile)
            return cacher
        }

        describe("updateSheetFileData", () => {
            
            
            describe("Should not update student field", () => {
                const firstName = "Hello"
                const lastName = "World"
                const photoId = "photoId"
                const cacher = setUpCacher(firstName + " " + lastName)
                test("Student is missing first name", () => {
                    const studentMissingFirstName = {...mockStudent.emptyProps, lastName}
                    expect(StudentFiles.updateSheetFileData(cacher, photoId)(DynamicGrid.fromObject(studentMissingFirstName)).lookupCol(photoId)).toEqual([studentMissingFirstName[photoId]])
                })
                test("Student is missing last name", () => {
                    const studentMissingLastName = {...mockStudent.emptyProps, firstName}
                    expect(StudentFiles.updateSheetFileData(cacher, photoId)(DynamicGrid.fromObject(studentMissingLastName)).lookupCol(photoId)).toEqual([studentMissingLastName[photoId]])
                })
                test("Student already has field filled in", () => {
                    const studentWithFilledField = mockStudent.filledProps
                    expect(StudentFiles.updateSheetFileData(cacher, photoId)(DynamicGrid.fromObject(studentWithFilledField)).lookupCol(photoId)).toEqual([studentWithFilledField[photoId]])
                })
            })
            describe("Should update student field", () => {
                const firstName = "Hello"
                const lastName = "World"
                const photoId = "photoId"
                const studentWithNameAndNoAssessment = {...mockStudent.emptyProps, firstName, lastName}
                test("Cached student name is written in correct order (firstName lastName)", () => {
                    const cacher = setUpCacher(firstName + " " + lastName)
                    expect(StudentFiles.updateSheetFileData(cacher, photoId)(DynamicGrid.fromObject(studentWithNameAndNoAssessment)).lookupCol(photoId)).toEqual([{text:"LINK", url:mockFile.getUrl()}])
                })
                test("Cached student name is written in reverse order (lastName firstName)", () => {
                    const cacher = setUpCacher(lastName + " " + firstName)
                    expect(StudentFiles.updateSheetFileData(cacher, photoId)(DynamicGrid.fromObject(studentWithNameAndNoAssessment)).lookupCol(photoId)).toEqual([{text:"LINK", url:mockFile.getUrl()}])
                })
                test("Cached student name is written in all uppercase", () => {
                    const cacher = setUpCacher(`${firstName} ${lastName}`.toUpperCase())
                    expect(StudentFiles.updateSheetFileData(cacher, photoId)(DynamicGrid.fromObject(studentWithNameAndNoAssessment)).lookupCol(photoId)).toEqual([{text:"LINK", url:mockFile.getUrl()}])
                })
                test("Cached student name is written in all lowercase", () => {
                    const cacher = setUpCacher(`${firstName} ${lastName}`.toLowerCase())
                    expect(StudentFiles.updateSheetFileData(cacher, photoId)(DynamicGrid.fromObject(studentWithNameAndNoAssessment)).lookupCol(photoId)).toEqual([{text:"LINK", url:mockFile.getUrl()}])
                })
                test("Cached student name is written in mixed case", () => {
                    const mixedCaseName = `${firstName} ${lastName}`.split("").map(char => Math.random() < .5 ? char.toLowerCase() : char.toUpperCase()).join("")
                    const cacher = setUpCacher(mixedCaseName)
                    expect(StudentFiles.updateSheetFileData(cacher, photoId)(DynamicGrid.fromObject(studentWithNameAndNoAssessment)).lookupCol(photoId)).toEqual([{text:"LINK", url:mockFile.getUrl()}])
                })
                test("Cached student name has other words between first and last name", () => {
                    const nameSeparatedByOtherWords = `${firstName} ${lastName}`.split(" ").join("randomWords randomWords, 123 !!")
                    const cacher = setUpCacher(nameSeparatedByOtherWords)
                    expect(StudentFiles.updateSheetFileData(cacher, photoId)(DynamicGrid.fromObject(studentWithNameAndNoAssessment)).lookupCol(photoId)).toEqual([{text:"LINK", url:mockFile.getUrl()}])
                })
                test("Cached student name is not the first word in the document", () => {
                    const cacher = setUpCacher("first", `${firstName} ${lastName}`, "last")
                    expect(StudentFiles.updateSheetFileData(cacher, photoId)(DynamicGrid.fromObject(studentWithNameAndNoAssessment)).lookupCol(photoId)).toEqual([{text:"LINK", url:mockFile.getUrl()}])
                })
            })
        })

        

        clearContentAndNamedRanges(cache, mockFile)
    })
}