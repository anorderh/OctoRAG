import { UUID } from "mongodb";
import { InvalidURLFormatError, ScrapeEntryFailedError } from "src/error-handling/errors.js";
import { RecursiveCharacterTextSplitter, RecursiveCharacterTextSplitterParams } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { ScrapeMetadata } from "../../../utils/interfaces/scrape-metadata";
import { TokScript, TokScriptResponse } from "src/shared/utils/classes/tokscript";
import { OnlineResourceType } from "src/data/utils/constants/online-resource-type";
import { ScrapeEntry } from "../../../utils/classes/scrape-entry";
import { env } from "src/shared/utils/constants/env";
import { TiktokPostScrapeEntry } from "src/scraping/entries/online-resource/tiktok/tiktok-post";
import { TiktokPostMetadata } from "./utils/interfaces/tiktok-post-metadata";

export async function scrapeTiktokPost(url: URL) : Promise<TiktokPostScrapeEntry[]> {
    let tokScript = new TokScript();
    let res: TokScriptResponse = await tokScript.getVideoInfo(url);
    let transcript = tokScript
        .getTranscript(res)
        .map(cue => cue.text)
        .join(" "); 

    if (transcript == null) {
        throw new ScrapeEntryFailedError({
            status: 502,
            body: "A transcript could not be grabbed from the provided Tiktok video."
        })
    }

    return [
        new TiktokPostScrapeEntry({
            id: new UUID().toString(),
            body: transcript,
            metadata: {
                type: OnlineResourceType.TiktokPost,
                link: url.href,
                desc: res.data.desc,
                author: res.data.author.uniqueId
            }
        })
    ]
}