import { MyGlobals } from "../System/GLOBALS"
import { ConvenienceFunctions } from "./ConvenienceFunctions"
import { MyTest } from "./MyTest"

function Test_ConvenienceFunctions(){
    const describe = MyTest.describe
    const test = MyTest.test
    const expect = MyTest.expect
    
    describe("Convienence Functions", () => {
        describe("Get files", () => {
            test("Should collect files from a folder", () => {
                const mockFolder = MyGlobals.getMockFolder()
                const mockFile = DriveApp.getFileById(MyGlobals.getMockDoc().getId())
                mockFolder.addFile(mockFile)
                expect(ConvenienceFunctions.getFiles(mockFolder)).toEqual(new Map([[mockFile.getUrl(), mockFile]]))
            })
        })
    })
}