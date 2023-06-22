import { Address } from "./Address"
import { DynamicGrid } from "./DynamicGrid"
import { Maybe } from "./Maybe"

export type AddressFields = {
    address:string
    formattedAddress:string
    borough:string
    councilDistrict:string
    isNychaResident:string
    development:string
}

export namespace AddressWriter{
    export function updateAddressFields(addressData:DynamicGrid<AddressFields>, updateFn: (arg: AddressFields) => AddressFields = (arg) => getAddressFieldData(arg.address)):DynamicGrid<AddressFields>{        
        const updatedData = addressData
            .updateRow(["formattedAddress", "borough", "councilDistrict", "development", "isNychaResident"], updateFn, (_, row) => addressFieldsMissingData(row))
        return updatedData
    }
    
    function getAddressFieldData(address: string):AddressFields{    
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
            return isNotEmpty(row.address)
        }
        function isMissingAddressData(row:AddressFields):boolean{
            return isEmpty(row.borough) || isEmpty(row.councilDistrict) || isEmpty(row.development) || isEmpty(row.isNychaResident)
        }
        function isEmpty<A>(value:A):boolean{
            return Maybe.of(value).map($value => $value === "").orElse(true)
        }
        
        function isNotEmpty<A>(value:A):boolean{
            return !isEmpty(value)
        }
    }
    
}

