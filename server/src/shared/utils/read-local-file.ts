import fs from 'fs';

export function readLocalFile(
    filePath: string,
    encoding: BufferEncoding = 'utf8',
): string {
    return fs.readFileSync(filePath, { encoding });
}
