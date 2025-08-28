"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { AnimatedButton } from "@/components/dashboard/AnimatedButton"
import { cn } from "@/lib/utils"

interface AddNewProjectProps {
    onProjectCreated?: () => void;
    className?: string;
    buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    buttonSize?: "default" | "sm" | "lg" | "icon";
    buttonText?: string;
}

export default function AddNewProject({
    onProjectCreated,
    className,
    buttonVariant = "outline",
    buttonSize = "default",
    buttonText = "Add new"
}: AddNewProjectProps) {
    const router = useRouter()
    
    const handleCreateProject = () => {
        router.push('/dashboard/projects/create')
    }

    return (
        <AnimatedButton
            icon={PlusIcon}
            text={buttonText}
            variant={buttonVariant}
            size={buttonSize}
            className={cn("rounded-full", className)}
            onClick={handleCreateProject}
        />
    )
}