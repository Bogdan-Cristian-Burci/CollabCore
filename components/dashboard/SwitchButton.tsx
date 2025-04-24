"use client";

import { useId, useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SwitchButtonProps {
    /** Value controlling the checked state */
    checked?: boolean;
    /** Default value for uncontrolled usage */
    defaultChecked?: boolean;
    /** Callback to emit the new value */
    onChange?: (value: boolean) => void;
    /** Custom Tailwind classes for styling */
    className?: string;
    /** Classes when the switch is active */
    activeClassName?: string;
    /** Classes when the switch is inactive */
    inactiveClassName?: string;
    /** Optional label for accessibility */
    label?: string;
    /** Optional ID for the switch */
    id?: string;
    /** Optional disabled state */
    disabled?: boolean;
}

export default function SwitchButton({
                                         checked,
                                         defaultChecked = false,
                                         onChange,
                                         className = "",
                                         activeClassName = "bg-blue-500",
                                         inactiveClassName = "bg-gray-300",
                                         label,
                                         id,
                                         disabled = false,
                                     }: SwitchButtonProps) {
    const generatedId = useId();
    const switchId = id || `switch-${generatedId}`;

    // Internal state for when component is used in uncontrolled mode
    const [internalChecked, setInternalChecked] = useState(defaultChecked);

    // Determine if we're in controlled or uncontrolled mode
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    // Update internal state if controlled value changes
    useEffect(() => {
        if (isControlled) {
            setInternalChecked(checked);
        }
    }, [checked, isControlled]);

    const handleChange = (value: boolean) => {
        if (!isControlled) {
            setInternalChecked(value);
        }

        if (onChange) {
            onChange(value);
        }
    };

    return (
        <Switch
            id={switchId}
            checked={isChecked}
            onCheckedChange={handleChange}
            disabled={disabled}
            aria-label={label}
            className={cn(
                "transition-colors duration-200 ease-in-out",
                isChecked ? activeClassName : inactiveClassName,
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        />
    );
}