"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { EditStudentModal } from "@/components/shared/EditStudentModal";

export function ProfileEditTrigger({ student, isAdmin = false }: { student: any, isAdmin?: boolean }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className="gap-2 font-bengali"
            >
                <Edit className="w-4 h-4" />
                তথ্য পরিবর্তন
            </Button>
            <EditStudentModal
                open={open}
                onOpenChange={setOpen}
                student={student}
                isAdmin={isAdmin}
                onSuccess={() => window.location.reload()}
            />
        </>
    );
}
