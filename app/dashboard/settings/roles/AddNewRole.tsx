"use client"

import * as React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { Check, PlusIcon, X, ArrowLeft, ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AnimatedButton } from "@/components/dashboard/AnimatedButton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { usePermissions } from "@/lib/hooks/usePermissions";
import PermissionAccordion from "@/components/dashboard/PermissionAccordion"
import { Permission } from "@/types/permission"
import { Slider } from "@/components/ui/slider"
import { createRole } from "@/lib/api/roles"
import { usePermissionSelectionStore } from "@/app/store/permissionSelectionStore"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Role name must be at least 2 characters long",
    }).regex(/^[a-z0-9_]+$/, {
        message: "Role name can only contain lowercase letters, numbers and underscores",
    }),
    description: z.string().optional(),
    level: z.number().min(1).max(100)
})

interface AddNewRoleProps {
    onRoleCreated?: () => void;
    className?: string;
    buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    buttonSize?: "default" | "sm" | "lg" | "icon";
    buttonText?: string;
}

// Step types for the wizard
type WizardStep = 'roleDetails' | 'permissions' | 'summary';

export default function AddNewRole({
                                       onRoleCreated,
                                       className,
                                       buttonVariant = "outline",
                                       buttonSize = "default",
                                       buttonText = "Add new role"
                                   }: AddNewRoleProps) {
    const [open, setOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const { data: availablePermissions = [], isLoading: permissionsLoading } = usePermissions()
    
    // Use the zustand store for permission selection and accordion state
    const { 
        selectedPermissions,
        setSelectedPermissions,
        addPermission,
        removePermission,
        clearStore
    } = usePermissionSelectionStore()
    
    // Wizard state
    const [currentStep, setCurrentStep] = useState<WizardStep>('roleDetails')
    
    // Ref for content container to ensure scrolling works properly
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Reset scroll position when step changes
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [currentStep]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            level: 50
        },
    })

    // Group permissions by category for PermissionAccordion
    const groupedPermissions = useMemo(() => {
        if (!availablePermissions || availablePermissions.length === 0) return {};

        // Track permissions that are selected
        const selectedPermissionIds = new Set(selectedPermissions.map(p => p.id));

        return availablePermissions.reduce((acc, permission) => {
            const category = permission.category || "Uncategorized";
            if (!acc[category]) {
                acc[category] = [];
            }

            // Set permission state based on selection
            acc[category].push({
                ...permission,
                is_active: selectedPermissionIds.has(permission.id)
            });

            return acc;
        }, {} as Record<string, Permission[]>);
    }, [availablePermissions, selectedPermissions]);

    // Handle permission toggle using the zustand store
    const handlePermissionChange = (permissionId: number, isActive: boolean | 'revert') => {
        if (isActive === 'revert') return;

        const flatPermissions = availablePermissions;
        const permissionToToggle = flatPermissions.find(p => p.id === permissionId);
        
        if (!permissionToToggle) return;
        
        if (isActive) {
            // Add to selected permissions
            addPermission({ ...permissionToToggle, is_active: true });
        } else {
            // Remove from selected permissions
            removePermission(permissionId);
        }
    };

    // Reset form and state when drawer closes
    useEffect(() => {
        if (!open) {
            form.reset();
            clearStore(); // Clear zustand store instead of local state
            setCurrentStep('roleDetails');
        }
    }, [open, form, clearStore]);

    // Move to the next step
    const nextStep = () => {
        if (currentStep === 'roleDetails') {
            setCurrentStep('permissions');
        } else if (currentStep === 'permissions') {
            setCurrentStep('summary');
        }
    };

    // Move to the previous step
    const prevStep = () => {
        if (currentStep === 'permissions') {
            setCurrentStep('roleDetails');
        } else if (currentStep === 'summary') {
            setCurrentStep('permissions');
        }
    };

    // Handle form submission 
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (currentStep !== 'summary') {
            nextStep();
            return;
        }

        try {
            setIsSaving(true);

            // Extract selected permission names for the API
            const permissionNames = selectedPermissions.map(p => p.name);

            // Construct the payload for the API
            const roleData = {
                name: values.name,
                description: values.description || "",
                permissions: permissionNames,
                level: values.level
            };

            // Call the API to create the role
            await createRole(roleData);

            // Close drawer and reset form
            setOpen(false);
            form.reset();
            clearStore(); // Clear zustand store instead of local state
            setCurrentStep('roleDetails');

            // Notify parent component
            if (onRoleCreated) onRoleCreated();
        } catch (error) {
            console.error("Failed to create role:", error);
        } finally {
            setIsSaving(false);
        }
    }

    // Step 1: Role Details
    const RoleDetailsStep = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role Name</FormLabel>
                            <FormControl>
                                <Input placeholder="super_admin" {...field} />
                            </FormControl>
                            <FormDescription>
                                The technical name for the role (lowercase, no spaces).
                            </FormDescription>
                            <FormMessage className="text-destructive" />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Has full access to all system features" {...field} />
                        </FormControl>
                        <FormDescription>
                            Optional description of the role's purpose.
                        </FormDescription>
                        <FormMessage className="text-destructive" />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Permission Level (1-100)</FormLabel>
                        <div className="pt-2">
                            <FormControl>
                                <div className="space-y-2">
                                    <Slider
                                        min={1}
                                        max={100}
                                        step={1}
                                        defaultValue={[field.value]}
                                        onValueChange={(value) => field.onChange(value[0])}
                                    />
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Lower access</span>
                                        <span className="font-medium">{field.value}</span>
                                        <span className="text-sm text-muted-foreground">Higher access</span>
                                    </div>
                                </div>
                            </FormControl>
                        </div>
                        <FormDescription>
                            Set the permission level for this role (1-100).
                        </FormDescription>
                        <FormMessage className="text-destructive" />
                    </FormItem>
                )}
            />
        </div>
    );

    // Step 2: Select Permissions
    const PermissionsStep = () => (
        <div className="space-y-3">
            <div className="sticky top-0 z-10 bg-background pt-2 pb-3 border-b mb-4">
                <h4 className="text-sm font-medium">Permissions</h4>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        Select the permissions for this role.
                    </p>
                    <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {selectedPermissions.length} selected
                    </span>
                </div>
            </div>

            {permissionsLoading ? (
                <div className="py-8 text-center">
                    <p className="text-muted-foreground">Loading permissions...</p>
                </div>
            ) : Object.keys(groupedPermissions).length === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-muted-foreground">No permissions available.</p>
                </div>
            ) : (
                <div className="pb-6">
                    <PermissionAccordion
                        groupedPermissions={groupedPermissions}
                        handlePermissionChange={handlePermissionChange}
                        isSaving={isSaving}
                        gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
                    />
                </div>
            )}
        </div>
    );

    // Step 3: Summary
    const SummaryStep = () => {
        const values = form.getValues();
        
        // Group selected permissions by category for display
        const groupedSelectedPermissions = selectedPermissions.reduce((acc, permission) => {
            const category = permission.category || "Uncategorized";
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(permission);
            return acc;
        }, {} as Record<string, Permission[]>);

        return (
            <div className="space-y-6">
                <div className="border rounded-md p-4 bg-muted/20">
                    <h4 className="font-medium text-lg mb-4">Role Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h5 className="text-sm font-medium text-muted-foreground">Name</h5>
                            <p className="text-base font-medium">{values.name}</p>
                        </div>
                        <div>
                            <h5 className="text-sm font-medium text-muted-foreground">Level</h5>
                            <p className="text-base font-medium">{values.level}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h5 className="text-sm font-medium text-muted-foreground">Description</h5>
                        <p className="text-base">{values.description || "No description provided"}</p>
                    </div>
                </div>

                <div className="border rounded-md p-4 bg-muted/20">
                    <h4 className="font-medium text-lg mb-4">Selected Permissions ({selectedPermissions.length})</h4>
                    
                    {Object.entries(groupedSelectedPermissions).length > 0 ? (
                        Object.entries(groupedSelectedPermissions).map(([category, permissions]) => (
                            <div key={category} className="mb-4">
                                <h5 className="text-sm font-medium mb-2">{category}</h5>
                                <ul className="space-y-1 pl-4">
                                    {permissions.map(permission => (
                                        <li key={permission.id} className="text-sm">
                                            {permission.display_name} - <span className="text-muted-foreground">{permission.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No permissions selected.</p>
                    )}
                </div>
            </div>
        );
    };

    // Get the current step component
    const getCurrentStepContent = () => {
        switch (currentStep) {
            case 'roleDetails':
                return <RoleDetailsStep />;
            case 'permissions':
                return <PermissionsStep />;
            case 'summary':
                return <SummaryStep />;
            default:
                return <RoleDetailsStep />;
        }
    };

    // Get the step title
    const getStepTitle = () => {
        switch (currentStep) {
            case 'roleDetails':
                return "Step 1: Define Role Details";
            case 'permissions':
                return "Step 2: Select Permissions";
            case 'summary':
                return "Step 3: Review and Submit";
            default:
                return "Create New Role";
        }
    };

    // Get the step description
    const getStepDescription = () => {
        switch (currentStep) {
            case 'roleDetails':
                return "Add the basic information about the role.";
            case 'permissions':
                return "Select the permissions to assign to this role.";
            case 'summary':
                return "Review your selections and submit to create the role.";
            default:
                return "Add a new role to the system.";
        }
    };

    // Conditional button text
    const getSubmitButtonText = () => {
        if (isSaving) return "Creating...";
        
        switch (currentStep) {
            case 'roleDetails':
                return "Continue to Permissions";
            case 'permissions':
                return "Continue to Review";
            case 'summary':
                return "Submit";
            default:
                return "Next";
        }
    };

    // Validation for the current step
    const validateCurrentStep = () => {
        if (currentStep === 'roleDetails') {
            return form.trigger(['name', 'description', 'level']);
        }
        return Promise.resolve(true);
    };

    // Handler for the Next button
    const handleNext = async () => {
        const isValid = await validateCurrentStep();
        if (isValid) nextStep();
    };

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <AnimatedButton
                    icon={PlusIcon}
                    text={buttonText}
                    variant={buttonVariant}
                    size={buttonSize}
                    className={cn("rounded-full", className)}
                />
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh]">
                <div className="mx-auto w-full max-w-4xl">
                    <DrawerHeader className="sticky top-0 z-20 bg-background pb-0">
                        <DrawerTitle>{getStepTitle()}</DrawerTitle>
                        <DrawerDescription>
                            {getStepDescription()}
                        </DrawerDescription>
                        
                        {/* Wizard Progress Indicator */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="w-full space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium">Step {currentStep === 'roleDetails' ? 1 : currentStep === 'permissions' ? 2 : 3} of 3</span>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary transition-all" 
                                        style={{ 
                                            width: currentStep === 'roleDetails' ? '33.33%' : 
                                                   currentStep === 'permissions' ? '66.66%' : '100%' 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </DrawerHeader>
                    
                    <Form {...form}>
                        <form>
                            <div 
                                ref={contentRef}
                                className="px-4 py-4 overflow-y-auto max-h-[calc(90vh-220px)]"
                            >
                                {getCurrentStepContent()}
                            </div>

                            <DrawerFooter className="px-4 border-t sticky bottom-0 z-20 bg-background">
                                <div className="flex flex-col sm:flex-row justify-between gap-2">
                                    <div className="flex gap-2">
                                        {currentStep !== 'roleDetails' && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={prevStep}
                                                className="flex items-center"
                                                disabled={isSaving}
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back
                                            </Button>
                                        )}
                                        
                                        <DrawerClose asChild>
                                            <Button variant="outline" className="flex items-center">
                                                <X className="mr-2 h-4 w-4" />
                                                Cancel
                                            </Button>
                                        </DrawerClose>
                                    </div>
                                    
                                    <Button
                                        type="button"
                                        onClick={currentStep === 'summary' ? form.handleSubmit(onSubmit) : handleNext}
                                        className="flex items-center"
                                        disabled={isSaving || (currentStep === 'permissions' && selectedPermissions.length === 0)}
                                    >
                                        {isSaving ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                {getSubmitButtonText()}
                                                {currentStep !== 'summary' && <ArrowRight className="ml-2 h-4 w-4" />}
                                                {currentStep === 'summary' && <Check className="ml-2 h-4 w-4" />}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </DrawerFooter>
                        </form>
                    </Form>
                </div>
            </DrawerContent>
        </Drawer>
    )
}