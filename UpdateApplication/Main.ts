import { Address } from "./Address"
import { Assessment } from "./Assessment"
import { MyGlobals } from "./GLOBALS"
import { Maybe, Unwrap } from "./Maybe"
import { Utility } from "./Utility"

function main(){
    updateAssessments()
}

function updateAssessments(){
    const studentData = MyGlobals.getStudentData()
    
    const updatedData = studentData
        .updateCol("assessment", createAssessment(), textIsEmptyString)
        .updateCol("assessment", fillAssessment, hasUrl)
        .updateRow(["formattedAddress", "borough", "councilDistrict", "development", "isNychaResident"], createRichTextAddressFields, (_, row) => addressFieldsMissingData(row))
        .updateCol("formattedAddress", row => createRichText(row.address.text.toUpperCase()), textIsEmptyString)
    return updatedData
}

function fillAssessment(richTextStudent:MyGlobals.RichTextStudent):MyGlobals.RichText{
    if(hasUrl(richTextStudent.assessment)){
        const assessment = DocumentApp.openByUrl(richTextStudent.assessment.url)
        const student = Utility.mapObjectValues( richTextStudent, (richText) => richText.text)
        Assessment.fillIn(student, assessment)
    }
    return richTextStudent.assessment
}

function hasUrl(richText:MyGlobals.RichText): richText is {text:string, url:string}{
    return typeof richText.url === "string"
}

function textIsEmptyString(richText:MyGlobals.RichText):richText is {text:""}{
    return richText.text === ""
}

function createAssessment():(richTextStudent:MyGlobals.RichTextStudent) => MyGlobals.RichText{
    const retrieveAssessment = Assessment.retrieve()
    return (richTextStudent) => {
        const name = richTextStudent.fullName.text
        const url = retrieveAssessment(name).orElseGet(() => Assessment.create(name)).getUrl()
        return createRichText("LINK", url)
    }
}

function createRichText(text:string, url?:string):MyGlobals.RichText{
    return {text, url}
}

type RichTextAddressFields = {
    [k in keyof AddressFields] : MyGlobals.RichText
}

interface AddressFields{
    formattedAddress:string
    borough:string
    councilDistrict:string
    isNychaResident:string
    development:string
}

function createRichTextAddressFields(richTextAddressFields: RichTextAddressFields & {address:MyGlobals.RichText}):RichTextAddressFields{
    if (!addressFieldsMissingData(richTextAddressFields)){ return richTextAddressFields}

    const address = richTextAddressFields.address.text
    const geoclientData = Maybe.of(address === "" ? undefined : address).flatMap(Address.getProcessedGeoclientData)
    const developmentData = geoclientData.flatMap(data => Address.getProcessedNychaResidentialData(data.bin))
    const addressRichText = geoclientData.orElse({} as Partial<Unwrap<typeof geoclientData>>)
    const developmentRichText = developmentData.orElse({} as Partial<Unwrap<typeof developmentData>>)

    return {
        formattedAddress:createRichText((addressRichText.address || address).replace(new RegExp('\\s{2,}'), ' ')), 
        borough:createRichText(addressRichText.borough || ""),
        councilDistrict:createRichText(`${addressRichText.councilDistrict || ""}`), 
        development:createRichText(developmentRichText.development || "N/A"), 
        isNychaResident:createRichText(developmentRichText.development ? "Y" : "N")
    }
}

function addressFieldsMissingData(row:RichTextAddressFields & {address:MyGlobals.RichText}):boolean{
    return hasAddress(row) && isMissingAddressData(row)

    function hasAddress(row:{address:MyGlobals.RichText}):boolean{
        return isNotEmpty(row.address.text)
    }
    function isMissingAddressData(row:RichTextAddressFields):boolean{
        return isEmpty(row.borough.text) || isEmpty(row.councilDistrict.text) || isEmpty(row.development.text) || isEmpty(row.isNychaResident.text)
    }
}

function isEmpty<A>(value:A):boolean{
    return Maybe.of(value).map($value => $value === "").orElse(true)
}

function isNotEmpty<A>(value:A):boolean{
    return !isEmpty(value)
}