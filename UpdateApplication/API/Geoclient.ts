import { Credentials } from "../System/Credentials"

export namespace Geoclient{
    export interface RawData{
        buildingIdentificationNumber:number // an id number assigned to each building in nyc
        houseNumber:number // house number (i.e. 425 or 4-25)
        houseNumberIn:number // house number as integer (i.e. 425)
        firstStreetNameNormalized:string // full street name (i.e. Astoria Boulevard)
        streetName1In:string // abbreviated street (i.e. Astoria Blvd)
        firstBoroughName:string
        zipCode:number
        cityCouncilDistrict:number
    }

    export function getRawGeoclientData(address:string):RawData | undefined{
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
            const results = parsedResponse?.results as [{response: RawData} | undefined]
            return results[0]?.response
        }
        catch(err){
            Logger.log(address)
            Logger.log(err)
            return undefined
        }
    }
}