import axios, {AxiosResponse} from "axios";
import * as fs from 'fs';

export async function downloadFile(url: string, writablePath: string) {
    // Download zip.
    let writer = fs.createWriteStream(writablePath);
    await axios.get(url, {
        responseType: 'stream'
    }).then((res: AxiosResponse) => {
        return new Promise((resolve, reject) => {
            res.data.pipe(writer);
            let error: any = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    resolve(true);
                }
            });
        })
    })
}