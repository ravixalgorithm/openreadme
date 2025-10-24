import { NextResponse } from 'next/server';
import { getHashedUsername } from '@/utils/userMapping';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json(
            { error: 'Username is required' },
            { status: 400 }
        );
    }

    try {
        const hashed = await getHashedUsername(username);

        if (!hashed) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            username,
            hashedUsername: hashed,
            imageUrl: `https://raw.githubusercontent.com/ravixalgorithm/openreadme-images/main/profiles/${hashed}.png`
        });
    } catch (error) {
        console.error('Lookup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
