type Document = GoogleAppsScript.Document.Document
type Element = GoogleAppsScript.Document.Element
type RangeBuilder = GoogleAppsScript.Document.RangeBuilder
type NamedRange = GoogleAppsScript.Document.NamedRange
type Range = GoogleAppsScript.Document.Range

export namespace GoogleNamedRange{

    export function create(document: Document, rangeName:string): {addElements:(...elements:Array<Element>) => NamedRange, addElementsBetween:(startElement:Element, endElementInclusive:Element) => NamedRange} {
        return {
            addElements: (...elements:Array<Element>) => createNamedRange(document, rangeName, addElementsToRangeBuilder, ...elements),
            addElementsBetween:(startElement: Element, endElementInclusive: Element) => createNamedRange(document, rangeName, addElementsBetweenToRangeBuilder, startElement, endElementInclusive)
        }
        
        function addElementsToRangeBuilder(rangeBuilder:RangeBuilder, ...elements:Array<Element>):RangeBuilder{
            return elements.reduce(addElement, rangeBuilder)
            
            function addElement(rangeBuilder:RangeBuilder, element:Element):RangeBuilder{
                return rangeBuilder.addElement(element)
            }
        }
    
        function addElementsBetweenToRangeBuilder(rangeBuilder:RangeBuilder, startElement:Element, endElementInclusive: Element):RangeBuilder{
            return rangeBuilder.addElementsBetween(startElement, endElementInclusive)
        }
    
        type RangeBuilderFn = (rangeBuilder:RangeBuilder, ...elements:Array<Element>) => RangeBuilder
        function createNamedRange(document:Document, rangeName:string, rangeBuilderFn:RangeBuilderFn, ...elements:Array<Element>): NamedRange{
            const rangeBuilder = document.newRange()
            const updatedRangeBuilder = rangeBuilderFn(rangeBuilder, ...elements) 
            return document.addNamedRange(rangeName, updatedRangeBuilder.build())
        }
    }


    export function removeNamedRangeAndContent(namedRange:NamedRange):void{
        removeRangeContent(namedRange.getRange())
        namedRange.remove()
   
        function removeRangeContent(range:Range):void{
            range.getRangeElements().map(rangeElement => rangeElement.getElement()).forEach(removeElement)
        }
        
        function removeElement(element:Element):void{
            // Note: An exception will be thrown if you try to remove the last paragraph of a document.
            // To get around this we add an empty paragraph element to the end of the doc before removing the element to avoid the exception
            // Then we get rid of the paragraph we added by merging it with the previous paragraph element 
            if (element.isAtDocumentEnd()) {
                const newpara = element.getParent().asBody().appendParagraph("")
                element.removeFromParent();
                newpara.merge()
            } else {
                element.removeFromParent()
            }
        }
    }
    
}