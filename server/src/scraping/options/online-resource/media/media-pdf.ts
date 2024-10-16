import axios from "axios";
import * as cheerio from 'cheerio';
import fs from 'fs';
import { UUID } from "mongodb";
import { RecursiveCharacterTextSplitter, TextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { ScrapeEntryFailedError } from "src/error-handling/errors.js";
import { parseOffice, parseOfficeAsync } from "officeparser";
import { ScrapeMetadata } from "../../../utils/interfaces/scrape-metadata";
import { parseRegex } from "src/shared/utils/helpers/parse-regex";
import { env } from "src/shared/utils/constants/env";
import { downloadFile } from "src/shared/utils/helpers/download-file";
import { OnlineResourceType } from "src/data/utils/constants/online-resource-type";
import { ScrapeEntry } from "../../../utils/classes/scrape-entry";
import { MediaPDFMetadata, MediaPDFScrapeEntry } from "src/scraping/entries/online-resource/media/media-pdf";
import { MediaScrapeMetadata } from "./utils/interfaces/media-scrape-metadata";
import { MediaType } from "./utils/constants/media-type";

export async function scrapeMediaPDF(url: URL) {
    let filename = parseRegex(
        url.toString(),
        /\/([^\/?#]+\.pdf)(?:[?#]|$)/i
    );
    if (filename == null) {
        throw new ScrapeEntryFailedError({
            status: 502,
            body: "A PDF could not be retrieved from the following URL."
        })
    }

    // Download file and temporarily save to disk.
    fs.mkdirSync(env.pathes.temp, { recursive: true });
    let pdfPath = `${env.pathes.temp}/${new UUID().toString()}.pdf`
    await downloadFile(url.toString(), pdfPath);

    // Read text and delete file.
    let body = await parseOfficeAsync(pdfPath, {
        newlineDelimiter: " ",
        ignoreNotes: true
    });        
    fs.unlinkSync(pdfPath);

    return [
        new MediaPDFScrapeEntry({
            id: new UUID().toString(),
            body: body,
            metadata: {
                type: OnlineResourceType.MediaPDF,
                mediaType: MediaType.PDF,
            }
        })
    ]
}
