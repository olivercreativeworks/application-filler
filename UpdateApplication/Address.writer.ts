import { Address } from "./Address"
import { DynamicGrid } from "./DynamicGrid"
import { MyGlobals } from "./GLOBALS"
import { Maybe } from "./Maybe"
import { Utility } from "./Utility"

export type AddressFields = {
    address:string
    formattedAddress:string
    borough:string
    councilDistrict:string
    isNychaResident:string
    development:string
}

export namespace AddressWriter{     
    export function updateStudentAddressFields(studentData:DynamicGrid<MyGlobals.Student>):DynamicGrid<MyGlobals.Student>{
        return updateAddressFields(studentData, student => getAddressFieldData(student.address) )
    }

    export function updateAddressFields<A extends AddressFields>(addressData: DynamicGrid<A>, updateFn: (arg:A) => Partial<A>):DynamicGrid<A>{        
        const updatedData = addressData
            .updateRow(["formattedAddress", "borough", "councilDistrict", "development", "isNychaResident"], updateFn, addressFieldsNeedToBeUpdated())
        return updatedData

        function addressFieldsNeedToBeUpdated(): (_:any, row:A) => boolean{
            const memoizedFn = Utility.memoize(addressFieldsMissingData)
            return (_, row) => memoizedFn(_, row)
        }
    }
    
    export function getAddressFieldData(address: string):AddressFields{    
        const geoclientData = Address.getProcessedGeoclientData(address)
        const developmentData = geoclientData.flatMap(data => Address.getProcessedNychaResidentialData(data.bin))
    
        return {
            address,
            formattedAddress: geoclientData.map(data => data.address).orElseGet(() => address.replace(/\s{2,}/g, "").toUpperCase()),
            borough: geoclientData.map(data => data.borough).orElse(""),
            councilDistrict: geoclientData.map(data => `${data.councilDistrict}`).orElse(""),
            development: developmentData.map(data => data.development).orElse("N/A"),
            isNychaResident: developmentData.map(_ => "Y").orElse("N")
        }
    }
    
    function addressFieldsMissingData(row:AddressFields):boolean{
        return hasAddress(row) && isMissingAddressData(row)
    
        function hasAddress(row:{address:string}):boolean{
            return row.address !== ""
        }
        function isMissingAddressData(row:AddressFields):boolean{
            return isEmpty(row.borough) || isEmpty(row.councilDistrict) || isEmpty(row.development) || isEmpty(row.isNychaResident)
        }
        function isEmpty<A>(value:A):boolean{
            return Maybe.of(value).map($value => $value === "").orElse(true)
        }
    }
    
}

