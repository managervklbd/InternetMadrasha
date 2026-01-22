import { getAcademicStructure } from "@/lib/actions/academic-actions";
import { getAdminViewMode } from "@/lib/actions/settings-actions";

async function main() {
    try {
        console.log("Fetching admin view mode...");
        const mode = await getAdminViewMode();
        console.log("Mode:", mode);

        console.log("Fetching academic structure...");
        const data = await getAcademicStructure(mode);
        console.log("Success. Count:", data.length);
    } catch (error) {
        console.error("Error fetching structure:", error);
    }
}

main();
