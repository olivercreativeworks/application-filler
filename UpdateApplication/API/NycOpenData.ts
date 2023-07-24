import { Credentials } from "../System/Credentials"

export namespace NycOpenData{
    export interface RawNychaResidentialData{
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
    export function getRawNychaResidentialData(bin:number):RawNychaResidentialData | undefined{
        try{
            const APP_TOKEN = Credentials.getNycOpenDataAppToken()
            const url = `https://data.cityofnewyork.us/resource/3ub5-4ph8.json?bin=${bin}&$$app_token=${APP_TOKEN}`
    
            const options:GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
                method:"get"
            }
    
            const jsonResponse = UrlFetchApp.fetch(url, options)
            const parsedResponse = JSON.parse(jsonResponse.getContentText()) as [RawNychaResidentialData | undefined]
            return parsedResponse[0]
        }
        catch(err){
            Logger.log(bin)
            Logger.log(err)
            return undefined
        }
    }

}