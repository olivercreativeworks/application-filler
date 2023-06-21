import { Credentials } from "./Credentials"
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

interface RawNychaResidentialAddressData{
    zip_code: number
    address: string
    development:string
    city:string
    city_council_district:number
    state:string
    bin:number
    street: string
    borough:string
}

interface RawGeoclientData{
    buildingIdentificationNumber:number // an id number assigned to each building in nyc
    houseNumber:number // house number (i.e. 425 or 4-25)
    houseNumberIn:number // house number as integer (i.e. 425)
    firstStreetNameNormalized:string // full street name (i.e. Astoria Boulevard)
    streetName1In:string // abbreviated street (i.e. Astoria Blvd)
    firstBoroughName:string
    zipCode:number
    cityCouncilDistrict:number
}

export namespace Address{
    export function getProcessedNychaResidentialData(bin:number):Maybe<ProcessedNychaResidentialAddressData>{
        return getRawNychaResidentialData(bin).map(processNychaApiData)
    }
    export function getProcessedGeoclientData(address:string):Maybe<ProcessedGeoclientData>{
        return getRawGeoclientData(address).map(processGeoclientApiData)
    }
    
    function processNychaApiData(data: RawNychaResidentialAddressData): ProcessedNychaResidentialAddressData{
        const development = data.development
        return {development}
    }
    function getRawNychaResidentialData(bin:number):Maybe<RawNychaResidentialAddressData | undefined>{
        try{
            const APP_TOKEN = Credentials.getNycOpenDataAppToken()
            const url = `https://data.cityofnewyork.us/resource/3ub5-4ph8.json?bin=${bin}&$$app_token=${APP_TOKEN}`
    
            const options:GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
                method:"get"
            }
    
            const jsonResponse = UrlFetchApp.fetch(url, options)
            const parsedResponse = JSON.parse(jsonResponse.getContentText()) as [RawNychaResidentialAddressData | undefined]
            return Maybe.of(parsedResponse[0])
        }
        catch(err){
            Logger.log(bin)
            Logger.log(err)
            return Maybe.of(undefined)
        }
    }


    function processGeoclientApiData(data:RawGeoclientData):ProcessedGeoclientData {
        const bin = data.buildingIdentificationNumber
        const address = `${data.houseNumberIn} ${data.firstStreetNameNormalized}, ${data.firstBoroughName}, NY, ${data.zipCode}`
        const borough = data.firstBoroughName
        const councilDistrict = data.cityCouncilDistrict
        return {bin, address, borough, councilDistrict}
    }
    function getRawGeoclientData(address:string):Maybe<RawGeoclientData | undefined>{
        try{
            const appId = Credentials.getGeoclientAPIAppId()
            const url = `https://api.nyc.gov/geo/geoclient/v1/search.json?input=${address}&appId=${appId} HTTP/1.1`
    
            const SECRET_KEY = Credentials.getGeoclientSecretKey()
            const options:GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
                method:"get",
                headers:{
                    "Ocp-Apim-Subscription-Key": SECRET_KEY
                }
            }
    
            const response = UrlFetchApp.fetch(url, options)
            const parsedResponse = JSON.parse(response.getContentText())
            const results = parsedResponse?.results as [{response: RawGeoclientData} | undefined]
            return Maybe.of(results[0]?.response)
        }
        catch(err){
            Logger.log(address)
            Logger.log(err)
            return Maybe.of(undefined)
        }
    }
}