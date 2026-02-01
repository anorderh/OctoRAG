import fs from 'fs';
import { UUID } from 'mongodb';
import { parseOfficeAsync } from 'officeparser';
import { OnlineResourceType } from 'src/database/shared/constants/online-resource-type';
import { ScrapeEntryFailedError } from 'src/shared/classes/errors.js';
import { env } from 'src/shared/constants/env';
import { downloadFile } from 'src/shared/utils/download-file';
import { parseRegex } from 'src/shared/utils/parse-regex';
import { MediaPDFScrapeEntry } from './shared/classes/media-pdf';
import { MediaType } from './shared/constants/media-type';

export async function scrapeMediaPDF(url: URL) {
    let filename = parseRegex(url.toString(), /\/([^\/?#]+\.pdf)(?:[?#]|$)/i);
    if (filename == null) {
        throw new ScrapeEntryFailedError({
            status: 502,
            body: 'A PDF could not be retrieved from the following URL.',
        });
    }

    // Download file and temporarily save to disk.
    fs.mkdirSync(env.pathes.temp, { recursive: true });
    let pdfPath = `${env.pathes.temp}/${new UUID().toString()}.pdf`;
    await downloadFile(url.toString(), pdfPath);

    // Read text and delete file.
    let body = await parseOfficeAsync(pdfPath, {
        newlineDelimiter: ' ',
        ignoreNotes: true,
    });
    fs.unlinkSync(pdfPath);

    return [
        new MediaPDFScrapeEntry({
            id: new UUID().toString(),
            body: body,
            metadata: {
                type: OnlineResourceType.MediaPDF,
                mediaType: MediaType.PDF,
            },
        }),
    ];
}
