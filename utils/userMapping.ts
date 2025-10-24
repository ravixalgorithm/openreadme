import fs from 'fs/promises';
import path from 'path';

const MAPPING_FILE = path.join(process.cwd(), 'data', 'user-mapping.json');

export async function getHashedUsername(username: string): Promise<string | null> {
    try {
        const data = await fs.readFile(MAPPING_FILE, 'utf-8');
        const mapping = JSON.parse(data);
        return mapping[username.toLowerCase()] || null;
    } catch (error) {
        return null;
    }
}

export async function storeUserMapping(username: string, hashed: string): Promise<void> {
    try {
        let mapping: Record<string, string> = {};
        try {
            const data = await fs.readFile(MAPPING_FILE, 'utf-8');
            mapping = JSON.parse(data);
        } catch (e) {
            // File doesn't exist yet
        }

        mapping[username.toLowerCase()] = hashed;
        await fs.mkdir(path.dirname(MAPPING_FILE), { recursive: true });
        await fs.writeFile(MAPPING_FILE, JSON.stringify(mapping, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error storing user mapping:', error);
        // Don't fail the request if mapping fails
    }
}
