import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const cancelUrl = new URL("/student/billing?status=cancel", req.url).toString();
    return new NextResponse(
        `<html>
            <script>window.location.href = "${cancelUrl}";</script>
        </html>`,
        {
            headers: { "Content-Type": "text/html" },
        }
    );
}
