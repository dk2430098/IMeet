import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
        // Perform a HEAD request to the actual recording URL from the server
        const response = await fetch(url, { method: "HEAD" });

        if (response.ok) {
            return NextResponse.json({ valid: true });
        } else {
            // If it's 404/403, we know it's invalid/expired
            return NextResponse.json({ valid: false }, { status: response.status === 404 ? 404 : 400 });
        }
    } catch (error) {
        // Network error or other issue
        console.error("Error checking recording URL:", error);
        return NextResponse.json({ valid: false, error: "Failed to verify" }, { status: 500 });
    }
}
