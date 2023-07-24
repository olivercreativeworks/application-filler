import { Utility } from "../System/Utility";

export namespace ConvenienceFunctions{
    export function getFiles(folder:GoogleAppsScript.Drive.Folder):Map<string, GoogleAppsScript.Drive.File>{
        return Utility.collect(folder.getFiles(), (file, map) => map.set(file.getUrl(), file))
    }
}