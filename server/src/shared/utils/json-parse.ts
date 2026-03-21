export function parseJsonSafe(text: string) {
    try {
        // remove markdown fences if present
        const cleaned = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        return JSON.parse(cleaned);
    } catch (err) {
        console.error('Failed to parse JSON:', text);
        throw err;
    }
}
