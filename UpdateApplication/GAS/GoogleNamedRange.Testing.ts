import { GoogleNamedRange } from "./GoogleNamedRange"
import { MyTest } from "./MyTest"

function Test_GoogleNamedRanges(){
    const describe = MyTest.describe
    const test = MyTest.test
    const expect = MyTest.expect
    
    const doc = DocumentApp.openById("1bkSxvgXWqzGTBuoPmaq1syGLcd2wCVWfbdAKCfkgLYA")
    clearDocBodyAndRemoveAllNamedRanges(doc)
    
    describe("Google Named Range", () => {
      describe("Create Named Range", () => {
        test("Should create one named range with the designated name", () =>{
          clearDocBodyAndRemoveAllNamedRanges(doc)
          const originalNumberOfNamedRanges = doc.getNamedRanges().length
          const element = doc.getBody().insertParagraph(0, "Hello")
          GoogleNamedRange.create(doc, "range1").addElements(element)
          
          expect(doc.getNamedRanges().length).toEqual(originalNumberOfNamedRanges + 1)
          expect(doc.getNamedRanges().map(namedRange => namedRange.getName()).includes("range1")).toEqual(true)
  
        })
  
        test("The named range should only contain the added element / doc has one element", () =>{
          clearDocBodyAndRemoveAllNamedRanges(doc)
          const element = doc.getBody().insertParagraph(0, "Hello")
  
          const namedRange = GoogleNamedRange.create(doc, "range1").addElements(element)
          
          const namedRangeElements = namedRange.getRange().getRangeElements().map(element => element.getElement().asText().getText())
          expect(namedRangeElements.includes(element.getText())).toEqual(true)
          expect(namedRangeElements.length).toEqual(1)
          
        })
  
        test("The named range should only contain the added element / doc has multiple elements", () => {
          clearDocBodyAndRemoveAllNamedRanges(doc)
          const element = doc.getBody().insertParagraph(0, "Hello")
          const element2 = doc.getBody().insertParagraph(1, "World")
          const element3 = doc.getBody().insertParagraph(2, "!")
          
          const namedRange = GoogleNamedRange.create(doc, "range1").addElements(element)
          
          const namedRangeElements = namedRange.getRange().getRangeElements().map(element => element.getElement().asText().getText())
          expect(namedRangeElements.includes(element.getText())).toEqual(true)
          expect(namedRangeElements.includes(element2.getText())).toEqual(false)
          expect(namedRangeElements.includes(element3.getText())).toEqual(false)
  
        })
        test("Should not include an element appended to the document after the named range has been created", () => {
          clearDocBodyAndRemoveAllNamedRanges(doc)
          const element = doc.getBody().insertParagraph(0, "Hello")
          
          const namedRange = GoogleNamedRange.create(doc, "range1").addElements(element)
          
          const element2 = doc.getBody().insertParagraph(1, "World")
          
          const namedRangeElements = namedRange.getRange().getRangeElements().map(element => element.getElement().asText().getText())
          expect(namedRangeElements.includes(element2.getText())).toEqual(false)
  
        })
        test("Should include multiple elements in named range / consecutive elements", () => {
          clearDocBodyAndRemoveAllNamedRanges(doc)
          const element = doc.getBody().insertParagraph(0, "Hello")
          const element2 = doc.getBody().insertParagraph(1, "World")
          
          const namedRange = GoogleNamedRange.create(doc, "range1").addElements(element, element2)
                
          const namedRangeElements = namedRange.getRange().getRangeElements().map(element => element.getElement().asText().getText())
          expect(namedRangeElements.length).toEqual(2)
          expect(namedRangeElements.includes(element.getText())).toEqual(true)
          expect(namedRangeElements.includes(element2.getText())).toEqual(true)
  
        })
        test("Should include multiple elements in named range / non-consecutive elements", () => {
          clearDocBodyAndRemoveAllNamedRanges(doc)
          const element = doc.getBody().insertParagraph(0, "Hello")
          const element2 = doc.getBody().insertParagraph(1, "World")
          const element3 = doc.getBody().insertParagraph(2, "!")
          
          const namedRange = GoogleNamedRange.create(doc, "range1").addElements(element, element3)
                
          const namedRangeElements = namedRange.getRange().getRangeElements().map(element => element.getElement().asText().getText())
          
          expect(namedRangeElements.length).toEqual(2)
          expect(namedRangeElements.includes(element.getText())).toEqual(true)
          expect(namedRangeElements.includes(element3.getText())).toEqual(true)
  
          expect(namedRangeElements.includes(element2.getText())).toEqual(false)
  
        })
        test("Should include all elements between the starting and ending elements", () => {
          clearDocBodyAndRemoveAllNamedRanges(doc)
          const element = doc.getBody().insertParagraph(0, "Hello")
          const element2 = doc.getBody().insertParagraph(1, "World")
          const element3 = doc.getBody().insertParagraph(2, "!")
          
          const namedRange = GoogleNamedRange.create(doc, "range1").addElementsBetween(element, element3)
                
          const namedRangeElements = namedRange.getRange().getRangeElements().map(element => element.getElement().asText().getText())
  
          expect(namedRangeElements.length).toEqual(3)
          expect(namedRangeElements.includes(element.getText())).toEqual(true)
          expect(namedRangeElements.includes(element2.getText())).toEqual(true)
          expect(namedRangeElements.includes(element3.getText())).toEqual(true)
  
        })
      })
      describe("Remove Named Range and contents", () => {        
        test("Should remove named range", () => {
          clearDocBodyAndRemoveAllNamedRanges(doc)
  
          const element = doc.getBody().insertParagraph(0, "Hello")
          const rangebuilder = doc.newRange()
          rangebuilder.addElement(element)
          const namedRange = doc.addNamedRange("range1", rangebuilder.build())
          
          expect(doc.getNamedRanges().length).toEqual(1)
  
          GoogleNamedRange.removeNamedRangeAndContent(namedRange)
          expect(doc.getNamedRanges().length).toEqual(0)
  
        })
        test("Should remove range elements / One element", () => {
          clearDocBodyAndRemoveAllNamedRanges(doc)
          
          const element = doc.getBody().insertParagraph(0, "Hello")
          
          const rangebuilder = doc.newRange()
          rangebuilder.addElement(element)
          const namedRange = doc.addNamedRange("range1", rangebuilder.build())
          
          expect(doc.getNamedRanges().length).toEqual(1)
          const numberNamedRangeElements = namedRange.getRange().getRangeElements().map(rangeElements => rangeElements.getElement()).length
          const totalNumberElementsInBodyBeforeRemoval = doc.getBody().getNumChildren()
          
          GoogleNamedRange.removeNamedRangeAndContent(namedRange)
          expect(doc.getBody().getNumChildren()).toEqual(totalNumberElementsInBodyBeforeRemoval - numberNamedRangeElements)
  
        })
        test("Should remove range elements / Multiple elements", () => {
          clearDocBodyAndRemoveAllNamedRanges(doc)
          
          const element = doc.getBody().appendParagraph("Hello")
          const element2 = doc.getBody().appendParagraph("Hello")
          
          const rangebuilder = doc.newRange()
          rangebuilder.addElement(element)
          rangebuilder.addElement(element2)
          const namedRange = doc.addNamedRange("range1", rangebuilder.build())
          
          expect(doc.getNamedRanges().length).toEqual(1)
          const numberNamedRangeElements = namedRange.getRange().getRangeElements().map(rangeElements => rangeElements.getElement()).length
          const totalNumberElementsInBodyBeforeRemoval = doc.getBody().getNumChildren()
          
          GoogleNamedRange.removeNamedRangeAndContent(namedRange)
          expect(doc.getBody().getNumChildren()).toEqual(totalNumberElementsInBodyBeforeRemoval - numberNamedRangeElements)
        })
  
        test("Only removes range elements / two elements added consecutively, only first element is part of range", () => {
          clearDocBodyAndRemoveAllNamedRanges(doc)
  
          const element = doc.getBody().insertParagraph(0, "First")
          const element2 = doc.getBody().insertParagraph(1, "Second")
          
          const rangebuilder = doc.newRange()
          rangebuilder.addElement(element)
          const namedRange = doc.addNamedRange("range1", rangebuilder.build())
          
  
          expect(doc.getNamedRanges().length).toEqual(1)
          const numberNamedRangeElements = namedRange.getRange().getRangeElements().map(rangeElements => rangeElements.getElement()).length
          const totalNumberElementsInBodyBeforeRemoval = doc.getBody().getNumChildren()
  
          GoogleNamedRange.removeNamedRangeAndContent(namedRange)
          expect(doc.getBody().getNumChildren()).toEqual(totalNumberElementsInBodyBeforeRemoval - numberNamedRangeElements)  
        })

        test("Only removes range elements / two elements added consecutively, only the second element is part of range ", () => {
          clearDocBodyAndRemoveAllNamedRanges(doc)
  
          const element = doc.getBody().insertParagraph(0, "First")
          const element2 = doc.getBody().insertParagraph(1, "Second")
  
          const rangebuilder = doc.newRange()
          rangebuilder.addElement(element2)
          const namedRange = doc.addNamedRange("range1", rangebuilder.build())
          
          expect(doc.getNamedRanges().length).toEqual(1)
          const numberNamedRangeElements = namedRange.getRange().getRangeElements().map(rangeElements => rangeElements.getElement()).length
          const totalNumberElementsInBodyBeforeRemoval = doc.getBody().getNumChildren()
  
          GoogleNamedRange.removeNamedRangeAndContent(namedRange)
          expect(doc.getBody().getNumChildren()).toEqual(totalNumberElementsInBodyBeforeRemoval - numberNamedRangeElements)
        })
        test("Only removes range elements / new element added after named range is built", () => {
          clearDocBodyAndRemoveAllNamedRanges(doc)
  
          const element = doc.getBody().insertParagraph(0, "First")
          const rangebuilder = doc.newRange()
          rangebuilder.addElement(element)
          const namedRange = doc.addNamedRange("range1", rangebuilder.build())
          
          const element2 = doc.getBody().insertParagraph(1, "Second")
  
          expect(doc.getNamedRanges().length).toEqual(1)
          const numberNamedRangeElements = namedRange.getRange().getRangeElements().map(rangeElements => rangeElements.getElement()).length
          const totalNumberElementsInBodyBeforeRemoval = doc.getBody().getNumChildren()
  
          GoogleNamedRange.removeNamedRangeAndContent(namedRange)
          expect(doc.getBody().getNumChildren()).toEqual(totalNumberElementsInBodyBeforeRemoval - numberNamedRangeElements)  
        })
      })
    })
    clearDocBodyAndRemoveAllNamedRanges(doc)
  }
  
  function clearDocBodyAndRemoveAllNamedRanges(doc:GoogleAppsScript.Document.Document){
    doc.getBody().clear()
    doc.getNamedRanges().forEach(namedRange => namedRange.remove())
  }
  