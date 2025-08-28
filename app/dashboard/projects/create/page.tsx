"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { Upload, ArrowLeft, Check } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useBoardTypes } from "@/lib/hooks/useBoardTypes"
import { createProject } from "@/lib/api/projects"
import { useUsers } from "@/lib/hooks/useUsers"
import { useOrganizationStore } from "@/app/store/organisationStore"
import { UserResource } from "@/types/user"
import { BoardType } from "@/types/board-type"
import { UserMultiSelect } from "@/components/ui/user-multi-select"
import { DatePicker } from "@/components/ui/date-picker"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import {BulletListItem} from "@/components/dashboard/projects/ProjectStepHeader";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Project title must be at least 2 characters long",
    }),
    description: z.string().optional(),
    board_type_id: z.number({
        required_error: "Please select a board type",
    }),
    selected_users: z.array(z.number()).optional().default([]),
    start_date: z.date({
        required_error: "Please select a start date",
    }),
    end_date: z.date({
        required_error: "Please select an end date",
    }),
    files: z.array(z.instanceof(File)).optional().default([])
})

export default function CreateProjectPage() {
    const [isSaving, setIsSaving] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { data: boardTypesResponse, isLoading: boardTypesLoading } = useBoardTypes()
    const { users, isLoading: usersLoading } = useUsers()
    const currentOrganization = useOrganizationStore(state => state.getCurrentOrganization())
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            selected_users: [],
            start_date: undefined,
            end_date: undefined,
            files: []
        },
    })

    const selectedUserIds = form.watch("selected_users") || []
    const selectedBoardTypeId = form.watch("board_type_id")
    const selectedBoardType = boardTypesResponse?.data?.find((bt: BoardType) => bt.id === selectedBoardTypeId)

    // Handle drag and drop
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files)
            setSelectedFiles(prev => [...prev, ...files])
        }
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            setSelectedFiles(prev => [...prev, ...files])
        }
    }

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    // Handle form submission
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSaving(true)
            setError(null)

            // Step 1: Create the project
            const projectData = {
                name: values.name,
                description: values.description || "",
                board_type_id: values.board_type_id,
                start_date: values.start_date.toISOString(),
                end_date: values.end_date.toISOString()
            }

            const response = await createProject(projectData)
            const projectId = response.id

            let hasErrors = false
            const errors: string[] = []

            // Step 2: Add users to project (if any selected)
            if (values.selected_users && values.selected_users.length > 0) {
                try {
                    const userResponse = await fetch(`/api/projects/${projectId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userIds: values.selected_users }),
                    })
                    
                    if (!userResponse.ok) {
                        hasErrors = true
                        errors.push('Failed to add some users to the project')
                    }
                } catch (error) {
                    hasErrors = true
                    errors.push('Error adding users to project')
                }
            }

            // Step 3: Handle file uploads (placeholder for future implementation)
            if (selectedFiles.length > 0) {
                // TODO: Implement file upload API call when route is created
                console.log('Files to upload:', selectedFiles)
            }

            // Show errors if any, but still redirect to project
            if (hasErrors) {
                setError(`Project created successfully, but: ${errors.join(', ')}`)
                setTimeout(() => {
                    router.push(`/dashboard/projects/${projectId}`)
                }, 3000)
            } else {
                // Success - redirect to project
                router.push(`/dashboard/projects/${projectId}`)
            }
            
        } catch (error) {
            console.error("Failed to create project:", error)
            setError("Failed to create project. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>
                <h1 className="text-2xl font-bold">Create new project</h1>
                <p className="text-muted-foreground mt-2">
                    Set up your new project with all the necessary details.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* 1. Project Title */}
                    <div className="space-y-4">
                        <BulletListItem title="Project title" step="1"/>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input 
                                            placeholder="Enter project title" 
                                            className="text-base py-2"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage className="text-destructive" />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* 2. Select Board */}
                    <div className="space-y-4">
                        <BulletListItem title="What do you want us to do for you?" step="2"/>
                        <FormField
                            control={form.control}
                            name="board_type_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        {boardTypesLoading ? (
                                            <div className="text-muted-foreground text-center py-8">Loading board types...</div>
                                        ) : (
                                            <Carousel
                                                opts={{
                                                    align: "start",
                                                    slidesToScroll: 1,
                                                    breakpoints: {
                                                        '(min-width: 768px)': { slidesToScroll: 2 },
                                                        '(min-width: 1024px)': { slidesToScroll: 4 },
                                                    }
                                                }}
                                                className="w-full"
                                            >
                                                <CarouselContent className="-ml-2 md:-ml-4">
                                                    {boardTypesResponse?.data?.map((boardType: BoardType) => (
                                                        <CarouselItem key={boardType.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                                                            <div
                                                                className={cn(
                                                                    "border rounded-lg p-4 cursor-pointer transition-all hover:bg-muted/50 hover:border-primary/50 h-full",
                                                                    field.value === boardType.id && "border-primary bg-primary/10 ring-2 ring-primary/20"
                                                                )}
                                                                onClick={() => field.onChange(boardType.id)}
                                                            >
                                                                <div className="text-center">
                                                                    <div className="font-medium mb-2">{boardType.name}</div>
                                                                    <div className="text-sm text-muted-foreground">{boardType.description}</div>
                                                                </div>
                                                            </div>
                                                        </CarouselItem>
                                                    ))}
                                                </CarouselContent>
                                                {/* Only show navigation if there are more than 4 items */}
                                                {(boardTypesResponse?.data?.length || 0) > 4 && (
                                                    <>
                                                        <CarouselPrevious className="left-0" />
                                                        <CarouselNext className="right-0" />
                                                    </>
                                                )}
                                            </Carousel>
                                        )}
                                    </FormControl>
                                    <FormMessage className="text-destructive" />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* 3. Project Description */}
                    <div className="space-y-4">
                        <BulletListItem title="Here is space for your notes and comments" step="3"/>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Enter project description, notes, and comments..." 
                                            className="min-h-[120px]"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage className="text-destructive" />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* 4. Select Users */}
                    <div className="space-y-4">
                        <BulletListItem title="Select team members for this project" step="4"/>
                        <FormField
                            control={form.control}
                            name="selected_users"
                            render={({ field }) => {
                                // Get selected user objects from IDs
                                const selectedUserObjects = users?.filter(user => 
                                    (field.value || []).includes(user.id)
                                ) || []

                                return (
                                    <FormItem>
                                        <FormControl>
                                            <UserMultiSelect
                                                users={users || []}
                                                selectedUsers={selectedUserObjects}
                                                onSelectionChange={(selectedUsers) => {
                                                    const userIds = selectedUsers.map(user => user.id)
                                                    field.onChange(userIds)
                                                }}
                                                placeholder="Select team members..."
                                                disabled={usersLoading}
                                                maxCount={5}
                                                className="w-full"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-destructive" />
                                    </FormItem>
                                )
                            }}
                        />
                    </div>

                    {/* 5. Project Dates */}
                    <div className="space-y-4">
                        <BulletListItem title="Project timeline" step="5"/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-medium">Start Date</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select start date"
                                                className="w-full"
                                                disabled={(date) => date < new Date()}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-destructive" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-medium">End Date (Deadline)</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select deadline"
                                                className="w-full"
                                                disabled={(date) => {
                                                    const startDate = form.getValues("start_date")
                                                    return date < new Date() || (startDate && date <= startDate)
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-destructive" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* 6. Upload Files */}
                    <div className="space-y-4">
                        <BulletListItem title="Upload your tutorials, videos, notes or audio recordings" step="6"/>
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                            <div className="space-y-3">
                                <p className="text-lg">
                                    <span className="font-medium">Drag and Drop</span> or{" "}
                                    <label className="text-primary hover:underline cursor-pointer font-medium">
                                        Browse
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileSelect}
                                            accept=".jpg,.jpeg,.png,.gif,.mp4,.pdf,.txt,.doc,.docx"
                                        />
                                    </label>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    File types supported: JPG, PNG, GIF, MP4, PDF, TXT, DOC, DOCX • Max size: 100 MB
                                </p>
                            </div>
                        </div>
                        
                        {/* Display selected files */}
                        {selectedFiles.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "px-2 py-1 rounded text-xs font-medium",
                                                    file.type.includes('pdf') ? "bg-red-100 text-red-800" : 
                                                    file.type.includes('image') ? "bg-green-100 text-green-800" :
                                                    "bg-blue-100 text-blue-800"
                                                )}>
                                                    {file.type.includes('pdf') ? 'PDF' : 
                                                     file.type.includes('image') ? 'IMG' : 'DOC'}
                                                </div>
                                                <span className="text-sm font-medium">{file.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({(file.size / 1024).toFixed(1)} KB)
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Section */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex items-center gap-2"
                        >
                            Cancel
                        </Button>
                        
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 sm:ml-auto"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Project...
                                </>
                            ) : (
                                <>
                                    Create Project
                                    <Check className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}