import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    const role = session.user.role;

    if (role === "ADMIN") {
        redirect("/admin/overview");
    } else if (role === "TEACHER") {
        redirect("/teacher/overview");
    } else {
        redirect("/student/profile");
    }

    return null;
}
