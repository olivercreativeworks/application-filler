import { MyGlobals } from "../System/GLOBALS";
import { Cacher, MyCache } from "./Cacher";
import { MyTest } from "./MyTest";
import { GoogleDocument, GoogleDocumentNamedRange } from "./Types";

function Test_Cacher(){
    const describe = MyTest.describe
    const test = MyTest.test
    const expect = MyTest.expect

    function clearContentAndNamedRanges(...docs:GoogleDocument[]):void{
        return docs.forEach($clearContentAndNamedRanges)

        function $clearContentAndNamedRanges(cache:GoogleDocument):void{
            cache.getBody().clear()
            cache.getNamedRanges().forEach(nr => nr.remove())
            expect(cache.getBody().getNumChildren()).toEqual(1)
            expect(cache.getNamedRanges().length).toEqual(0)
        }
    }    

    describe("MyCache", () => {
        const cache = MyGlobals.getMockCache()
        const mockFile = MyGlobals.getMockDoc()
        describe("Should copy content from mock file to cache file", () => {
            test("One paragraph element", () => {
                clearContentAndNamedRanges(cache, mockFile)
                mockFile.getBody().insertParagraph(0, "Hello World")
                const originalNumChildrenInCache = cache.getBody().getNumChildren()
                MyCache.from(cache).set(mockFile.getUrl(), mockFile)
                
                expect(cache.getBody().getNumChildren()).toEqual(mockFile.getBody().getNumChildren() + originalNumChildrenInCache)
                expect(cache.getBody().getText().trim()).toEqual(mockFile.getBody().getText().trim())
            })
            test("Multiple paragraph elements", () => {
                clearContentAndNamedRanges(cache, mockFile)
                mockFile.getBody().insertParagraph(0, "World")
                mockFile.getBody().insertParagraph(0, "Hello")
                const originalNumChildrenInCache = cache.getBody().getNumChildren()
                MyCache.from(cache).set(mockFile.getUrl(), mockFile)
                
                expect(cache.getBody().getNumChildren()).toEqual(mockFile.getBody().getNumChildren() + originalNumChildrenInCache)
                expect(cache.getBody().getText().trim()).toEqual(mockFile.getBody().getText().trim())
            })
        })

        describe("Set", () => {
            clearContentAndNamedRanges(cache, mockFile)
            mockFile.getBody().insertParagraph(0, "Hello World")
            const originalNumNamedRangesInCache = cache.getNamedRanges().length
            MyCache.from(cache).set(mockFile.getUrl(), mockFile)
            
            const cachedNamedRanges: Map<string, GoogleDocumentNamedRange> = cache.getNamedRanges().reduce((nrMap, nr) => nrMap.set(nr.getName(), nr), new Map())
            
            test("Should create a new named range in cache", () => {
                expect(cachedNamedRanges.size).toEqual(originalNumNamedRangesInCache + 1)
            })
            test("Cached named range contains same content as the file", () => { 
                const namedRange = cachedNamedRanges.get(mockFile.getUrl())
                const namedRangeText = namedRange?.getRange().getRangeElements().map(element => element.getElement().asText().getText()).join(" ")
                const mockFileText = mockFile.getNamedRanges().filter(nr => nr.getName() === mockFile.getUrl()).map(getNamedRangeText).join(" ")
                expect(namedRangeText?.includes(mockFileText)).toEqual(true)
            })
            test("Should be able to set the result of a callback function", () => {
                clearContentAndNamedRanges(cache, mockFile)
                mockFile.getBody().insertParagraph(0, "Hello World")
                const originalNumNamedRangesInCache = cache.getNamedRanges().length
                MyCache.from(cache).set(mockFile.getUrl(), () => mockFile)
                const cachedNamedRanges: Map<string, GoogleDocumentNamedRange> = cache.getNamedRanges().reduce((nrMap, nr) => nrMap.set(nr.getName(), nr), new Map())
                
                expect(cachedNamedRanges.size).toEqual(originalNumNamedRangesInCache + 1)
                const namedRange = cachedNamedRanges.get(mockFile.getUrl())
                const namedRangeText = namedRange?.getRange().getRangeElements().map(element => element.getElement().asText().getText()).join(" ")
                const mockFileText = mockFile.getNamedRanges().filter(nr => nr.getName() === mockFile.getUrl()).map(getNamedRangeText).join(" ")
                expect(namedRangeText?.includes(mockFileText)).toEqual(true)
            })
        })

        describe("Lookups", () => {
            clearContentAndNamedRanges(cache, mockFile)
            mockFile.getBody().insertParagraph(0, "Hello World")
            const reuseableName = "name"
            const uncachedName = "uncachedName"
            const cacher = MyCache.from(cache)
            cacher.set(reuseableName, mockFile)

            describe("Has", () => {
                test("Should return true when looking up previously set cache key", () => {
                    expect(cacher.has(reuseableName)).toEqual(true)
                })        
                test("Should return false when looking up new cache key", () => {               
                    expect(cacher.has(uncachedName)).toEqual(false)
                })
            })

            describe("Get", () => {
                test("Should return the stored value", () => {
                    expect(cacher.get(reuseableName).map(getNamedRangeText).unsafeUnwrap()).toEqual(getNamedRangeText(cache.getNamedRanges().filter(nr => nr.getName() === reuseableName)[0]))
                })
                test("Should return undefined when looking up new cache key", () => {
                    expect(cacher.get(uncachedName).unsafeUnwrap()).toBeUndefined()
                })
            })
                    
        })

        describe("Set if key is new", () => {
            clearContentAndNamedRanges(cache, mockFile)
            const reuseableName = "name"
            const cacher = MyCache.from(cache)
            
            const firstParagraphText = "Hello World"
            mockFile.getBody().insertParagraph(0, firstParagraphText)
            cacher.set(reuseableName, mockFile)

            const secondParagraphText = "This paragraph should not be cached because we are reusing the range name (see below)."
            mockFile.getBody().insertParagraph(0, secondParagraphText)
            cacher.setIfKeyIsNew(reuseableName, mockFile)

            test("Should not overwrite existing cache keys", () => {
                expect(cacher.get(reuseableName).map(nr => getNamedRangeText(nr).join(" ")).map(text => text.includes(firstParagraphText) && !(text.includes(secondParagraphText))).unsafeUnwrap()).toEqual(true)
            })
            test("Should not create a new namedRange in the cache with the same name as an existing namedRange in the cache / Using existing Cacher", () => {
                const existingNamedRanges = cache.getNamedRanges()
                const existingNames = existingNamedRanges.map(nr => nr.getName())
                const existingText = existingNamedRanges.map(getNamedRangeText)

                mockFile.getBody().insertParagraph(0, "Another paragraph")
                cacher.setIfKeyIsNew(reuseableName, mockFile)

                const currentNamedRanges = cache.getNamedRanges()
                expect(currentNamedRanges.map(nr => nr.getName())).toEqual(existingNames)
                expect(currentNamedRanges.map(getNamedRangeText)).toEqual(existingText)
            })
            test("Should not create a new namedRange in the cache with the same name as an existing namedRange in the cache / Using new Cacher", () => {
                const existingNamedRanges = cache.getNamedRanges()
                const existingNames = existingNamedRanges.map(nr => nr.getName())
                const existingText = existingNamedRanges.map(getNamedRangeText)

                mockFile.getBody().insertParagraph(0, "Yet another paragraph")
                MyCache.from(cache).setIfKeyIsNew(reuseableName, mockFile)

                const currentNamedRanges = cache.getNamedRanges()
                expect(currentNamedRanges.map(nr => nr.getName())).toEqual(existingNames)
                expect(currentNamedRanges.map(getNamedRangeText)).toEqual(existingText)
            })

            test("Should only set ranges with new names (i.e. names that are not a current namedRange in cache)", () => {
                clearContentAndNamedRanges(cache, mockFile)
                const reuseableName = "name"
                
                mockFile.getBody().insertParagraph(0, "Hello World")
                MyCache.from(cache).set(reuseableName, mockFile)
                const firstCache = cache.getNamedRanges().map(namedRange => [namedRange.getName(), getNamedRangeText(namedRange)])
                
                mockFile.getBody().insertParagraph(0, "This paragraph should not be cached because we are reusing the range name (see below).")            
                MyCache.from(cache).setIfKeyIsNew(reuseableName, mockFile)
                const secondCache = cache.getNamedRanges().map(namedRange => [namedRange.getName(), getNamedRangeText(namedRange)])
                
                expect(secondCache).toEqual(firstCache)
            })
        })

        describe("Delete", () => {
            test("Should remove named range from cache", () => {
                clearContentAndNamedRanges(cache, mockFile)
                mockFile.getBody().insertParagraph(0, "Hello World")
                const cacher = MyCache.from(cache)
                
                cacher.set(mockFile.getUrl(), mockFile)
                expect(cacher.has(mockFile.getUrl())).toEqual(true)
                
                cacher.delete(mockFile.getUrl())
                expect(cacher.has(mockFile.getUrl())).toEqual(false)
            })
            test("Should remove named range from the cache document", () => {
                clearContentAndNamedRanges(cache, mockFile)
                mockFile.getBody().insertParagraph(0, "Hello World")
                const cacher = MyCache.from(cache)
                
                cacher.set(mockFile.getUrl(), mockFile)
                const namedRanges = cache.getNamedRanges()
                expect(namedRanges.length).toEqual(1)

                cacher.delete(mockFile.getUrl())
                const namedRangesAfterDeletion = cache.getNamedRanges()
                expect(namedRangesAfterDeletion.length).toEqual(0)
            })
        })
        clearContentAndNamedRanges(cache, mockFile)
    })

    describe("Reconcile Cache", () => {
        const cache = MyGlobals.getMockCache()
        const mockFile = MyGlobals.getMockDoc()

        
        describe("Should add file content to cache", () => {
            test("One file", () => {
                clearContentAndNamedRanges(cache, mockFile)
                const cacher = MyCache.from(cache)
                const cacheKey = "cacheKey"
                expect(cacher.has(cacheKey)).toEqual(false)
                
                const files = new Map([[cacheKey, mockFile]])
                mockFile.getBody().insertParagraph(0, "Hello World")
                
                Cacher.reconcileCache(cacher, files)
                
                expect(cacher.has(cacheKey)).toEqual(true)
            })
            test("Multiple files", () => {
                clearContentAndNamedRanges(cache, mockFile)
                const cacher = MyCache.from(cache)

                const cacheKeyOne = "cacheKeyOne"
                const cacheKeyTwo = "cacheKeyTwo"

                expect(cacher.has(cacheKeyOne)).toEqual(false)
                expect(cacher.has(cacheKeyTwo)).toEqual(false)
                
                const files = new Map([
                    [cacheKeyOne, mockFile], 
                    [cacheKeyTwo, mockFile]
                ])

                mockFile.getBody().insertParagraph(0, "Hello World")
                
                Cacher.reconcileCache(cacher, files)
                
                expect(cacher.has(cacheKeyOne)).toEqual(true)
                expect(cacher.has(cacheKeyTwo)).toEqual(true)
            })
        })
            test("Should not overwrite existing keys", () => {
                    clearContentAndNamedRanges(cache, mockFile)
                    const cacher = MyCache.from(cache)

                    const cacheKeyOne = "cacheKeyOne"
                    
                    expect(cacher.has(cacheKeyOne)).toEqual(false)
                    
                    const files = new Map([[cacheKeyOne, mockFile]])
                    
                    const firstParagraphText = "Hello World"
                    mockFile.getBody().insertParagraph(0, firstParagraphText)
                    Cacher.reconcileCache(cacher, files)
                    
                    const secondParagraphText = "A Different Paragraph"
                    mockFile.getBody().insertParagraph(0, secondParagraphText)
                    Cacher.reconcileCache(cacher, files)
    
                    expect(cacher.has(cacheKeyOne)).toEqual(true)
                    expect(cacher.get(cacheKeyOne).map(nr => getNamedRangeText(nr).join(" ")).map(text => text.includes(firstParagraphText) && !(text.includes(secondParagraphText))).unsafeUnwrap()).toEqual(true)
                })
        test("Should remove old files", () => {
            clearContentAndNamedRanges(cache, mockFile)
            const cacher = MyCache.from(cache)
            const cacheKeyOne = "cacheKeyOne"
            cacher.set(cacheKeyOne, mockFile)

            const files = new Map()

            Cacher.reconcileCache(cacher, files)

            expect(cacher.has(cacheKeyOne)).toEqual(false)
        })
        describe("Should add new file and remove old file", () => {
           test("Files map has a Document as value", () => {
               clearContentAndNamedRanges(cache, mockFile)
                const cacher = MyCache.from(cache)
                const cacheKeyOne = "cacheKeyOne"
                cacher.set(cacheKeyOne, mockFile)
    
                const cacheKeyTwo = "cacheKeyTwo"
                const files = new Map([[cacheKeyTwo, mockFile]])
                
                Cacher.reconcileCache(cacher, files)
    
                expect(cacher.has(cacheKeyOne)).toEqual(false)
                expect(cacher.has(cacheKeyTwo)).toEqual(true)
           }) 
           test("Files map has a Function as value", () => {
               clearContentAndNamedRanges(cache, mockFile)
                const cacher = MyCache.from(cache)
                const cacheKeyOne = "cacheKeyOne"
                cacher.set(cacheKeyOne, mockFile)
    
                const cacheKeyTwo = "cacheKeyTwo"
                
                const files = new Map([[cacheKeyTwo, () => mockFile]])
                
                Cacher.reconcileCache(cacher, files)
    
                expect(cacher.has(cacheKeyOne)).toEqual(false)
                expect(cacher.has(cacheKeyTwo)).toEqual(true)
           }) 
        })

        describe("Attach images to assessment", () => {
            function getMockFileWithImage(){
                const mockFile = MyGlobals.getMockDoc()
                clearContentAndNamedRanges(mockFile)
                const mockImage = MyGlobals.getMockImage()
                mockFile.getBody().appendImage(mockImage)
                return mockFile
            }

            function getCacherWithCachedData(fileToCache:GoogleDocument){
                const mockCache = MyGlobals.getMockCache()
                clearContentAndNamedRanges(mockCache)
                const cacher = MyCache.from(mockCache)
                cacher.set(fileToCache.getUrl(), fileToCache)
                return cacher
            }
            
            const mockAssessment = MyGlobals.getMockAssessment()
            const mockFileWithImage = getMockFileWithImage()
            const cacher = getCacherWithCachedData(mockFileWithImage)
            
            const mockStudent = MyGlobals.getMockStudent()
            
            
            describe("Should attach image to assesssment", () =>{
                test("Has assessment and data in cache", () => {
                    const studentWithAssessment = {...mockStudent.emptyProps, photoId:{text:"LINK", url:mockFileWithImage.getUrl()}, assessment:{text:"LINK", url:mockAssessment.getUrl()}}
                    clearContentAndNamedRanges(mockAssessment)
                    const startNumOfImages = mockAssessment.getBody().getImages().length
                    Cacher.attachImagesToAssessment(studentWithAssessment, cacher, "photoId")
                    expect(mockAssessment.getBody().getImages().length).toEqual(startNumOfImages + 1)
                })
                test("Has created a named range for the data", () => {
                    clearContentAndNamedRanges(mockAssessment)
                    const studentWithAssessment = {...mockStudent.emptyProps, photoId:{text:"LINK", url:mockFileWithImage.getUrl()}, assessment:{text:"LINK", url:mockAssessment.getUrl()}}
                    Cacher.attachImagesToAssessment(studentWithAssessment, cacher, "photoId")
                    const assessmentAsCache = MyCache.from(mockAssessment)
                    expect(assessmentAsCache.size).toEqual(1)
                    expect(assessmentAsCache.has(mockFileWithImage.getUrl())).toEqual(true)
                })
            })
            describe("Should not attach image to assessment", () => {
                test("Does not have assessment", () => {
                    clearContentAndNamedRanges(mockAssessment)
                    const studentWithoutAssessment = {...mockStudent.emptyProps, photoId:{text:"LINK", url:mockFileWithImage.getUrl()}}
                    Cacher.attachImagesToAssessment(studentWithoutAssessment, cacher, "photoId")
                    expect(MyCache.from(mockAssessment).size).toEqual(0)
                })
                test("Does not have photoId", () => {
                    clearContentAndNamedRanges(mockAssessment)
                    const studentWithoutPhotoId = {...mockStudent.emptyProps, assessment:{text:"LINK", url:mockAssessment.getUrl()}}
                    Cacher.attachImagesToAssessment(studentWithoutPhotoId, cacher, "photoId")
                    expect(MyCache.from(mockAssessment).size).toEqual(0)
                })
                test("PhotoId url is not in cache", () => {
                    clearContentAndNamedRanges(mockAssessment)
                    const studentWithoutPhotoId = {...mockStudent.emptyProps, photoId:{text:"LINK", url:"This Url is not in the cache!"} ,assessment:{text:"LINK", url:mockAssessment.getUrl()}}
                    Cacher.attachImagesToAssessment(studentWithoutPhotoId, cacher, "photoId")
                    expect(MyCache.from(mockAssessment).size).toEqual(0)
                })
                test("PhotoId is already in the assessment", () => {
                    clearContentAndNamedRanges(mockAssessment)
                    const studentWithAssessment = {...mockStudent.emptyProps, photoId:{text:"LINK", url:mockFileWithImage.getUrl()} ,assessment:{text:"LINK", url:mockAssessment.getUrl()}}
                    // First time
                    const startNumOfImages = mockAssessment.getBody().getImages().length
                    Cacher.attachImagesToAssessment(studentWithAssessment, cacher, "photoId")
                    expect(mockAssessment.getBody().getImages().length).toEqual(startNumOfImages + 1)
                    expect(MyCache.from(mockAssessment).size).toEqual(1)
                    
                    // Second time (should not cache)
                    Cacher.attachImagesToAssessment(studentWithAssessment, cacher, "photoId")
                    expect(mockAssessment.getBody().getImages().length).toEqual(startNumOfImages + 1)
                    expect(MyCache.from(mockAssessment).size).toEqual(1)
                })
            })
        })
        clearContentAndNamedRanges(cache, mockFile)
    })


}

function getNamedRangeText(namedRange:GoogleDocumentNamedRange){
    return namedRange.getRange().getRangeElements().map(element => element.getElement().asText().getText())
}