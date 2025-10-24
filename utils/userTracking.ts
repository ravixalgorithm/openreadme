// utils/userTracking.ts
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export async function trackUser(username: string): Promise<void> {
    try {
        let users: string[] = [];

        // Read existing users
        try {
            const data = await fs.readFile(USERS_FILE, 'utf-8');
            users = JSON.parse(data);
        } catch (error) {
            // File doesn't exist yet, will create it
        }

        // Add user if not exists
        if (!users.includes(username)) {
            users.push(username);
            await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
            await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        }
    } catch (error) {
        console.error('Error tracking user:', error);
        // Don't fail the request if tracking fails
    }
}

export async function getAllUsers(): Promise<string[]> {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}
