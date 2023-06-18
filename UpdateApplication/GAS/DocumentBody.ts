export namespace DocumentBody{
    export function replaceFirstInstanceOfText(body:GoogleAppsScript.Document.Body, searchPattern:string, replacement:string):void{
        body.findText(searchPattern).getElement().asText().replaceText(searchPattern, replacement)
    }
    
    export function replaceText(body:GoogleAppsScript.Document.Body, searchPattern: string, replacement: string):void{
        body.replaceText(searchPattern, replacement)
    }
        
    export function bold(body:GoogleAppsScript.Document.Body, regex:string, textFromRegexToBold:string):void{
        let text = body.editAsText()
        let elementText = text.findText(regex).getElement().asText()
        elementText.setBold(false)
        
        let foundText = elementText.findText(textFromRegexToBold)
        let start = foundText?.getStartOffset()
        let end = foundText?.getEndOffsetInclusive()
        
        foundText?.getElement().asText().setBold(start, end, true)
    }
}