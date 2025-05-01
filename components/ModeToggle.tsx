"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Moon, Sun, Orbit } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [currentTheme, setCurrentTheme] = useState<string | undefined>("system")

    useEffect(() => {
        setCurrentTheme(theme)
    }, [theme])

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="cursor-pointer">
                    {currentTheme === "light" && <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />}
                    {currentTheme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />}
                    {currentTheme === "modern" && <Orbit className="h-[1.2rem] w-[1.2rem] transition-all" />}
                    {currentTheme === "system" && <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("modern")}>
                    Modern
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}