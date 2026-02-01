import fs from 'fs/promises';

export async function readLocalFile(
    filePath: string,
    encoding: BufferEncoding = 'utf8',
): Promise<string> {
    return fs.readFile(filePath, { encoding });
}
