"use client";
import React, { useState } from "react";
import { useEffect } from "react";
import useBoardTemplates from "@/lib/hooks/useBoardTemplates";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import { Plus, Loader2 } from "lucide-react";
import BoardTemplateSimpleCard from "@/components/dashboard/board-templates/BoardTemplateSimpleCard";
import BoardTemplateDetailedCard from "@/components/dashboard/board-templates/BoardTemplateDetailedCard";
import BoardTemplateDetailedListCard from "@/components/dashboard/board-templates/BoardTemplateDetailedListCard";
import { BoardTemplateResponse, BoardTemplateCreate } from "@/types/board-templates";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ExpandableWrapper } from "@/components/dashboard/ExpandableWrapper";

const createTemplateSchema = z.object({
  name: z.string().min(3, {
    message: "Template name must be at least 3 characters.",
  }),
  description: z.string().min(5, {
    message: "Description must be at least 5 characters.",
  }),
});

type FormData = z.infer<typeof createTemplateSchema>;

export default function BoardTemplatesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { 
    useAllBoardTemplates,
    useSystemBoardTemplates,
    useCreateBoardTemplate
  } = useBoardTemplates();
  
  const { 
    data: allTemplates, 
    isLoading: isLoadingAll,
    refetch: refetchAll
  } = useAllBoardTemplates();

  const { 
    data: systemTemplates, 
    isLoading: isLoadingSystem,
    refetch: refetchSystem
  } = useSystemBoardTemplates();
  
  const { mutate: createTemplate, isPending: isCreating } = useCreateBoardTemplate();

  const form = useForm<FormData>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    refetchAll();
    refetchSystem();
  }, [refetchAll, refetchSystem]);

  // Ensure allTemplates is always an array before filtering
  const userTemplates = Array.isArray(allTemplates) 
    ? allTemplates.filter(template => 
        !systemTemplates?.some((sysTemplate: { id: any; }) => sysTemplate.id === template.id)
      ) 
    : [];

  const handleCreateTemplate = (data: FormData) => {
    // Creating a minimal template with default columns
    const newTemplate: BoardTemplateCreate = {
      name: data.name,
      description: data.description,
      column_structure: [
        { name: "To Do", color: "#E3E5E8" },
        { name: "In Progress", color: "#4EAAFF" },
        { name: "Done", color: "#2CBB5D" }
      ],
      settings: {
        default_view: "board",
        allow_subtasks: true,
        allow_wip_limit: false,
        track_cycle_time: true,
        show_assignee_avatars: true,
        enable_task_estimation: false
      }
    };

    createTemplate(newTemplate, {
      onSuccess: () => {
        toast.success("Board template created successfully");
        form.reset();
        setIsDialogOpen(false);
        refetchAll();
      },
      onError: () => {
        toast.error("Failed to create board template");
      }
    });
  };

  const isLoading = isLoadingAll || isLoadingSystem;

  // Filter value mapping for system/custom templates
  const filterValueMapping = [
    { value: "true", displayText: "System" },
    { value: "false", displayText: "Custom" }
  ];

  // Toggle texts customization
  const toggleTexts = {
    showLess: "Show less",
    showMore: "Show more",
    showDetails: "Test board"
  };

  // Prepare templates data for ExpandableWrapper
  const templates = Array.isArray(allTemplates) ? allTemplates : [];

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Board Templates</h1>
          <p className="text-muted-foreground">
            Create and manage your board templates here.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Board Template</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateTemplate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Agile Project Board" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the purpose of this board template..." 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Template
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Loading message="Loading board templates..." className="h-60" />
      ) : (
        <div className="flex-1 h-full">
          <ExpandableWrapper<BoardTemplateResponse>
            list={templates}
            searchBy="name"
            filterBy="is_system"
            filterValueMapping={filterValueMapping}
            toggleTexts={toggleTexts}
            SimpleComponent={BoardTemplateSimpleCard}
            DetailedComponent={BoardTemplateDetailedCard}
            ListDetailedComponent={BoardTemplateDetailedListCard}
          />
        </div>
      )}
    </div>
  );
}