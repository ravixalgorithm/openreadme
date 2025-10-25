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
            console.log('Creating new user mapping file');
        }

        mapping[username.toLowerCase()] = hashed;
        await fs.mkdir(path.dirname(MAPPING_FILE), { recursive: true });
        await fs.writeFile(MAPPING_FILE, JSON.stringify(mapping, null, 2), 'utf-8');
        
        // Verify the mapping was saved correctly
        const verification = await getHashedUsername(username);
        if (verification !== hashed) {
            throw new Error(`Failed to verify user mapping for ${username}`);
        }
        
        console.log(`✅ Successfully stored mapping for user: ${username} -> ${hashed}`);
    } catch (error) {
        console.error('❌ Critical error storing user mapping:', error);
        throw error; // Re-throw to ensure the caller knows about the failure
    }
}
