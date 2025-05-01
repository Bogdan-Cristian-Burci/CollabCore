import React, {useId} from "react";
import {Checkbox} from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CheckBoxAsButtonProps {
    text: string;
    value: string;
    checked: boolean;
    checkedChange: (value:string) => void;
}

export default function CheckBoxAsButton({text,value, checked, checkedChange}: CheckBoxAsButtonProps) {

    const id = useId()

    return(
        <>
            <Checkbox
                checked={checked}
                onCheckedChange={() => checkedChange(value)}
                id={id}
                className="hidden"
            />
            <label htmlFor={id}
                   className={cn(
                     "inline-flex items-center justify-between w-full p-1 border-2 border-border rounded-sm cursor-pointer",
                     checked ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
                   )}>
                <div className="block">
                    <div className="w-full text-sm">{text}</div>
                </div>
            </label>
        </>
    )
}