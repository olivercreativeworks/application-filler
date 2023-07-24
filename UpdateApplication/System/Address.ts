import { Geoclient } from "../API/Geoclient"
import { NycOpenData } from "../API/NycOpenData"
import { Maybe } from "./Maybe"

interface ProcessedGeoclientData{
    bin: number
    address:string
    borough:string
    councilDistrict:number
}

interface ProcessedNychaResidentialAddressData{
    development:string
}

export namespace Address{
    export function getProcessedNychaResidentialData(bin:number):Maybe<ProcessedNychaResidentialAddressData>{
        return Maybe.of(bin).map(NycOpenData.getRawNychaResidentialData).map(processNychaApiData)
    }
    export function getProcessedGeoclientData(address:string):Maybe<ProcessedGeoclientData>{
        return Maybe.of(address).map(Geoclient.getRawGeoclientData).map(processGeoclientApiData)
    }
    
    function processNychaApiData(data: NycOpenData.RawNychaResidentialData): ProcessedNychaResidentialAddressData{
        const development = data.development
        return {development}
    }
    
    function processGeoclientApiData(data:Geoclient.RawData):ProcessedGeoclientData {
        const bin = data.buildingIdentificationNumber
        const address = `${data.houseNumberIn} ${data.firstStreetNameNormalized}, ${data.firstBoroughName}, NY, ${data.zipCode}`
        const borough = data.firstBoroughName
        const councilDistrict = data.cityCouncilDistrict
        return {bin, address, borough, councilDistrict}
    }
    
}