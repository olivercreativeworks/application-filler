export namespace Credentials{
  export function getNycOpenDataAppToken(){
    return getCredentials().api.nyc_kj4p_ruqc.APP_TOKEN
  }
  export function getGeoclientAPIAppId(){
    return getCredentials().api.geoclient.appId
  }
  export function getGeoclientSecretKey(){
    return getCredentials().api.geoclient.SECRET_KEY
  }
  export function getCredentials(): Credentials{
    const credentialsDoc = DocumentApp.openById("10AX3FPtWyj5v7CsBPQ2tCKIsXNZHpgw-U1298IA40WU" || process.env.CREDENTIALS_DOC_ID)
    const jsoncredentials = credentialsDoc.getBody().getText()
    const CREDENTIALS = JSON.parse(jsoncredentials)
    let owner = SpreadsheetApp.getActiveSpreadsheet().getOwner()?.getEmail() as string // Line is here as weak protection against someone who tries to copy the spreadsheet. They will not be able to use the credentials (API keys, etc.)
    return CREDENTIALS[owner]
  }
}


interface Credentials{
  "api":{
    "geoclient":{
      "SECRET_KEY":string,
      "appId":string
    },
      "nyc_kj4p_ruqc":{
          "APP_TOKEN":string
      }
    },
    "folderId":{
      "osha30Folder": string,
      "assessment":string,
      "completionCertificate":string,
      "osha30Card":string,
      "photoId":string
    },
    "docId":{
      "cache":{
        "text":{
          "photoId": string,
          "completionCertificate": string,
          "osha30Card": string,
        },
        "jpeg":{
          "jpegPhotoId": string,
          "jpegCompletionCertificate": string,
          "jpegOsha30Card": string,
        }
      },
      "assessmentTemplate": string,
    },
    "sheetId":{
      "nychaDevelopments": string,
      "interestForm": string
    }
  }
  
