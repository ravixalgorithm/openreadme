import { NextRequest, NextResponse } from "next/server";

// Simple file-based cache simulation (in production, use Redis/Database)
const imageCache = new Map<string, { buffer: Buffer; timestamp: number; headers: Record<string, string> }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function generateCacheKey(params: URLSearchParams): string {
    const keys = ['theme', 'g', 'n', 'x', 'l', 'i', 'p'];
    const sortedParams = keys
        .filter(key => params.get(key))
        .map(key => `${key}=${params.get(key)}`)
        .join('&');
    return Buffer.from(sortedParams).toString('base64');
}

async function generateImageInBackground(originalUrl: string): Promise<void> {
    try {
        console.log('🔄 Generating image in background:', originalUrl);

        // Call your original API to generate the image
        const response = await fetch(originalUrl, {
            headers: { 'User-Agent': 'OpenReadme-Cache/1.0' }
        });

        if (response.ok) {
            const buffer = Buffer.from(await response.arrayBuffer());
            const headers: Record<string, string> = {};

            // Copy important headers
            ['content-type', 'content-length', 'cache-control'].forEach(header => {
                const value = response.headers.get(header);
                if (value) headers[header] = value;
            });

            const cacheKey = generateCacheKey(new URL(originalUrl).searchParams);
            imageCache.set(cacheKey, {
                buffer,
                timestamp: Date.now(),
                headers
            });

            console.log('✅ Image cached successfully');
        }
    } catch (error) {
        console.error('❌ Background generation failed:', error);
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const cacheKey = generateCacheKey(searchParams);

        // Check cache first
        const cached = imageCache.get(cacheKey);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < CACHE_DURATION) {
            console.log('📦 Serving from cache');

            return new NextResponse(new Uint8Array(cached.buffer), {
                headers: {
                    ...cached.headers,
                    'X-Cache': 'HIT',
                    'X-Cache-Age': Math.floor((now - cached.timestamp) / 1000).toString(),
                }
            });
        }

        // Cache miss or expired - return placeholder and generate in background
        console.log('🎯 Cache miss - serving placeholder and generating in background');

        // Generate the original API URL
        const originalUrl = `${req.nextUrl.origin}/api/openreadme?${searchParams.toString()}`;

        // Start background generation (don't await)
        generateImageInBackground(originalUrl);

        // Return a fast placeholder image
        const placeholderSvg = `
            <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="800" height="400" fill="url(#bg)"/>
                <text x="400" y="180" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="bold">
                    ${searchParams.get('n') || searchParams.get('g') || 'Developer'}
                </text>
                <text x="400" y="220" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="18">
                    @${searchParams.get('g') || 'username'}
                </text>
                <text x="400" y="250" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="14">
                    ⚡ Generating your profile... Please refresh in a moment
                </text>
                <text x="400" y="320" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Arial, sans-serif" font-size="12">
                    Powered by OpenReadme
                </text>
            </svg>
        `;

        return new NextResponse(placeholderSvg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Cache': 'MISS',
                'X-Status': 'GENERATING',
            }
        });

    } catch (error) {
        console.error('💥 Proxy error:', error);

        // Return error placeholder
        const errorSvg = `
            <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
                <rect width="800" height="400" fill="#dc2626"/>
                <text x="400" y="200" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24">
                    ❌ Error generating image
                </text>
            </svg>
        `;

        return new NextResponse(errorSvg, {
            status: 500,
            headers: { 'Content-Type': 'image/svg+xml' }
        });
    }
}
