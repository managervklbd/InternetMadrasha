import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const failUrl = new URL("/student/billing?status=fail", req.url).toString();
    return new NextResponse(
        `<html>
            <script>window.location.href = "${failUrl}";</script>
        </html>`,
        {
            headers: { "Content-Type": "text/html" },
        }
    );
}
