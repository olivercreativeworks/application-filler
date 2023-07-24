import { MyGlobals } from "../System/GLOBALS";
import { OpticalCharacterRecognition as OpticalCharacterRecognition } from "../API/Ocr";
import { Credentials } from "../System/Credentials";
import { StudentFolderName } from "../System/Main";
import { Maybe } from "../System/Maybe";
import { ConvenienceFunctions } from "./ConvenienceFunctions";
import { GoogleNamedRange } from "./GoogleNamedRange";
import { GoogleDocument, GoogleDocumentNamedRange, GoogleParagraph } from "./Types";

type CacheableData = GoogleDocument | Array<GoogleParagraph>

export class MyCache implements DocumentCache{
    private constructor(private readonly _cache:GoogleDocument){}
    private readonly _cacheNamedRanges = this._cache.getNamedRanges().reduce((nrMap, nr) => nrMap.set(nr.getName(), nr), new Map() as Map<string, GoogleDocumentNamedRange>)

    static from(cache:GoogleDocument):MyCache{
        return new MyCache(cache)
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
    [Symbol.iterator]():{next:() => IteratorResult<[string, GoogleDocumentNamedRange], any>}{
        return this.entries()
    }

    entries():IterableIterator<[string, GoogleDocumentNamedRange]>{
        return this._cacheNamedRanges.entries()
    }

    set<A extends CacheableData | (() => CacheableData)>(cacheKey:string, fileToBeCached:A):this{
        try {
            const file = typeof(fileToBeCached) == "function" ? fileToBeCached() : fileToBeCached as CacheableData
            const namedRange = this.addContentToCacheAndCreateNamedRange(file, cacheKey)
            this.updateCacheNamedRanges(cacheKey, namedRange)
            return this
        }catch(err){
            Logger.log(err)
            return this
        }
    }
    
    setIfKeyIsNew<A extends CacheableData | (() => CacheableData)>(cacheKey:string, fileToBeCached:A):void{
        if(this.doesNotHave(cacheKey)){
            this.set(cacheKey, fileToBeCached)
        }
    }

    get(cacheKey:string):Maybe<GoogleDocumentNamedRange>{
        return Maybe.of(this._cacheNamedRanges.get(cacheKey)) as Maybe<GoogleDocumentNamedRange>
    }

    has(cacheKey:string):boolean{
        return this._cacheNamedRanges.has(cacheKey)
    }

    doesNotHave(cacheKey:string):boolean{
        return !this.has(cacheKey)
    }

    delete(cacheKey:string):void{
        const namedRange = this.get(cacheKey)
        namedRange.map(this.removeNamedRangeAndContentFromCache)
        this._cacheNamedRanges.delete(cacheKey)
    }

    getRangeContaining(text:string|RegExp, rangesToSkip?:Map<string, unknown>):Maybe<GoogleDocumentNamedRange>{
        const keysToExclude = new Map(rangesToSkip)
        
        for(let [cacheKey, namedRange] of this){
            if(keysToExclude.has(cacheKey)){ continue }
            if(contains(namedRange, text)){ return Maybe.of(namedRange)}
        }
        return Maybe.of(undefined as GoogleDocumentNamedRange|undefined) as Maybe<GoogleDocumentNamedRange>
        
        function contains(nr:GoogleDocumentNamedRange, name:string | RegExp):boolean{
            const text = getNamedRangeText(nr).join(" ")
            return typeof(name) === "string" ? RegExp(name).test(text) : name.test(text)
          }
        function getNamedRangeText(namedRange:GoogleDocumentNamedRange): Array<string> {
            return namedRange.getRange().getRangeElements().map(element => element.getElement().asText().getText());
        }
    }

    forEach(fn:(namedRange:GoogleDocumentNamedRange, cacheKey:string) => void):void{
        this._cacheNamedRanges.forEach(fn)
    }

    get size():number{
        return this._cacheNamedRanges.size
    }

    private updateCacheNamedRanges(cacheKey:string, namedRange:GoogleDocumentNamedRange):void{
        this._cacheNamedRanges.set(cacheKey, namedRange)
    }

    private addContentToCacheAndCreateNamedRange<A extends CacheableData>(contentToCache:A, cacheKey:string):GoogleDocumentNamedRange{
        const content = Array.isArray(contentToCache) ? contentToCache : contentToCache.getBody().getParagraphs()
        content.forEach((paragraph, index) => this._cache.getBody().insertParagraph(index, paragraph.copy()))
        const namedRange = GoogleNamedRange.create(this._cache, cacheKey).addElementsBetween(this._cache.getBody().getChild(0), this._cache.getBody().getChild(content.length - 1))
        return namedRange
    }

    private removeNamedRangeAndContentFromCache(namedRange:GoogleDocumentNamedRange):void{
        GoogleNamedRange.removeNamedRangeAndContent(namedRange)
    }
}

// type Document = GoogleDocument
// type NamedRange = GoogleDocumentNamedRange
type Paragraph = GoogleAppsScript.Document.Paragraph

interface DocumentCache {
    setIfKeyIsNew:(cacheKey:string, fileToCache: CacheableData | (() => CacheableData)) => void
    delete:(cacheKey:string) => void
    forEach:(fn:(namedRange:GoogleDocumentNamedRange, cacheKey:string) => void) => void
}

export namespace Cacher{

    export function getReconciledCacheFor(folderName:Exclude<FolderName, "osha30Folder"|"assessment">):MyCache{
        const cache = getCache(folderName, MyCache.from)
        const files = convertFilesToCacheableFormat(getFiles(folderName))
        reconcileCache(cache, files)
        return cache

        function convertFilesToCacheableFormat(files: Map<string, GoogleAppsScript.Drive.File>):Map<string, () => CacheableData>{
            const cacheableData = Array.from(files.entries(), ([cacheKey, file]) => [cacheKey, () => getFileContentFromTempOcrCopy(file)]) as Array<[string, () => CacheableData]>
            const cachableFiles = new Map(cacheableData)
            return cachableFiles
        }
        function getFileContentFromTempOcrCopy(fileToCopy:GoogleAppsScript.Drive.File):Array<GoogleParagraph> | never{
            const fileContent = OpticalCharacterRecognition.useTempOcrCopy(fileToCopy, (id) => DocumentApp.openById(id).getBody().getParagraphs().map(paragraph => paragraph.copy()))
            return fileContent
        }    
    }

    export function reconcileCache<A extends CacheableData | (() => CacheableData)>(cache:DocumentCache, files:Map<string, A>):void{
        removeOutdatedFiles(cache, files)
        cacheNewFiles(cache, files)

        function cacheNewFiles<A extends CacheableData | (() => CacheableData)>(cache:DocumentCache, files:Map<string, A>):void{
            files.forEach((file, url) => cache.setIfKeyIsNew(url, file))
        }
        
        function removeOutdatedFiles<A extends CacheableData | (() => CacheableData)>(cache:DocumentCache, files:Map<string, A>):void{
            cache.forEach((_, cacheKey) => files.has(cacheKey) ? undefined : cache.delete(cacheKey))
        }

    }


    function getCache<A extends DocumentCache>(folderName:Exclude<FolderName, "osha30Folder"|"assessment">, createCache:(arg:GoogleDocument) => A):A{
        const cacheId = Credentials.getCredentials().docId.cache.text[folderName]
        return createCache(DocumentApp.openById(cacheId))
    }

    function getFiles(folderName:Exclude<FolderName, "osha30Folder"|"assessment">):Map<string, GoogleAppsScript.Drive.File>{
        const folder = MyGlobals.getFolder(folderName)
        return ConvenienceFunctions.getFiles(folder)
    }

    function attachFilesToAssessment(student:MyGlobals.Student, assessment:GoogleDocument){
        const photoId = Cacher.getReconciledCacheFor("photoId")
        const url = student.photoId.url
        if(typeof(url) !== "string"){return}
        assessment.getBody().insertPageBreak(assessment.getBody().getNumChildren())
        const images = photoId.get(url).map(getParagraphsWithImagesAsFirstChild).map(images => images.map(image => image.asParagraph()))
        const cache = MyCache.from(assessment)
        images.map(images => cache.set(url, images))
    }

    export function attachImagesToAssessment(student:MyGlobals.Student, cache:MyCache, folderName:StudentFolderName):void{
        const assessmentUrl = student.assessment.url
        const targetUrl = student[folderName].url
        if(typeof(assessmentUrl) !== "string"){return}
        if(typeof(targetUrl) !== "string"){return}
        const assessment = DocumentApp.openByUrl(assessmentUrl)
        const namedRange = cache.get(targetUrl)
        namedRange.map(nr => appendImagesFromNamedRangeToAssessment(nr, assessment))
    }
    
    function appendImagesFromNamedRangeToAssessment(namedRange: GoogleDocumentNamedRange, assessment:GoogleDocument):void{
        const assessmentCacher = MyCache.from(assessment)
        if (assessmentCacher.has(namedRange.getName())){return}
        const images = getParagraphsWithImagesAsFirstChild(namedRange)
        assessment.getBody().appendPageBreak()
        assessmentCacher.set(namedRange.getName(), images)
    }
    
    function getParagraphsWithImagesAsFirstChild(namedRange:GoogleDocumentNamedRange):Array<GoogleParagraph>{
        return namedRange.getRange().getRangeElements().map(element => element.getElement().asParagraph())
        .filter(paragraph => paragraph.getNumChildren() > 0)
        .filter(paragraph => paragraph.getChild(0).getType() === DocumentApp.ElementType.INLINE_IMAGE)
        .map(paragraph => paragraph.copy())
    }
    type FolderName = keyof ReturnType<typeof Credentials.getCredentials>["folderId"]
}