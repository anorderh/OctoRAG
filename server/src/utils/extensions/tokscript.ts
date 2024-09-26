import axios from "axios";

export interface TokScriptResponse {
    data: any;
    subtitles: string | boolean;
}

export interface TranscriptCue {
    start: string;
    end: string;
    text: string;
}

export class TokScript {
    public apiUrl: string = 'https://tt.tokbackup.com/fetchTikTokData';

    public async getVideoInfo(url: URL) : Promise<TokScriptResponse> {
        let res = await axios.get(
            `${this.apiUrl}?` + [
                `video=${url.toString()}`,
                `get_transcript=${true}`
            ].join("&"),
            {
                headers: {
                    'Accept': '*/*',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Accept-Language': 'en-US,en;q=0.8',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Origin': '*',
                    'Connection': 'keep-alive',
                    'Content-Type': 'application/json',
                    'Host': 'tt.tokbackup.com',
                    'If-None-Match': 'W/"728f-aq8eb9//qXMzuE5SHIQRsV70rNQ"',
                    'Origin': 'https://script.tokaudit.io',
                    'Referer': 'https://script.tokaudit.io/',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'cross-site',
                    'Sec-GPC': '1',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
                    'cross-origin-resource-policy': 'cross-origin',
                    'sec-ch-ua': '"Brave";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                    'x-api-key': 'Toktools2024@!NowMust',
                  }
            }
        );

        return res.data;
    }

    public getTranscript(res: TokScriptResponse) : TranscriptCue[] | null {
        if (typeof res.subtitles == "boolean") {
            return null;
        }

        // Parse subtitle property into cue objects.
        const regex = /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})\n(.*?)(?=\n\d{2}:\d{2}:\d{2}\.\d{3}|\Z)/gs;
        let matches = res.subtitles.matchAll(regex);
        let cues: TranscriptCue[] = [];
        for (let match of matches) {
            cues.push({
                start: match[1],
                end: match[2],
                text: match[3].replace(/\n/g, ' ').trim()
            });
        }

        return cues;
    }
}