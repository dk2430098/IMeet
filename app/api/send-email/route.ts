import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, message, name } = await req.json();
    const formUrl = process.env.NEXT_PUBLIC_FORMSPREE_URL;

    console.log("Attempting to send email via Formspree...");
    console.log("Form URL configured:", !!formUrl);

    if (!formUrl) {
        console.error("Error: NEXT_PUBLIC_FORMSPREE_URL is missing");
        return NextResponse.json({ error: "Formspree URL not configured" }, { status: 500 });
    }

    try {
        const response = await fetch(formUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ email, message, name }),
        });

        console.log("Formspree Response Status:", response.status);

        if (response.ok) {
            return NextResponse.json({ success: true });
        } else {
            const errorText = await response.text();
            console.error("Formspree Error Response:", errorText);

            // Try to parse JSON if possible, otherwise return text
            let errorJson;
            try {
                errorJson = JSON.parse(errorText);
            } catch {
                errorJson = { message: errorText };
            }

            return NextResponse.json({ error: errorJson }, { status: response.status });
        }
    } catch (error) {
        console.error("Internal Server Error during fetch:", error);
        return NextResponse.json({ error: "Failed to send message internally" }, { status: 500 });
    }
}
