/**
 * Export data to Excel using simple CSV format
 * This is a lightweight solution that doesn't require external libraries
 */

export function exportToExcel(data: any[], filename: string, headers?: string[]) {
    // If no data, return
    if (!data || data.length === 0) {
        alert("কোনো ডেটা নেই এক্সপোর্ট করার জন্য।");
        return;
    }

    // Get headers from first object if not provided
    const columnHeaders = headers || Object.keys(data[0]);

    // Create CSV content
    let csvContent = "\uFEFF"; // UTF-8 BOM for Excel to recognize Bengali characters

    // Add headers
    csvContent += columnHeaders.join(",") + "\n";

    // Add data rows
    data.forEach(row => {
        const values = columnHeaders.map(header => {
            const value = row[header];
            // Handle null/undefined
            if (value === null || value === undefined) return "";
            // Escape commas and quotes in values
            const stringValue = String(value);
            if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        });
        csvContent += values.join(",") + "\n";
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Format date for Excel export
 */
export function formatDateForExport(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY format
}

/**
 * Format time for Excel export
 */
export function formatTimeForExport(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:MM format
}
