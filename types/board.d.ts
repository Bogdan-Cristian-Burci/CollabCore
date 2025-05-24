import { BoardTemplateColumnStructure, BoardTemplateSettings } from "@/types/board-templates";
import { LinksStructure } from "@/types/user";

// Board type template structure from board_type
export interface BoardTypeTemplate {
    columns_structure: (BoardTemplateColumnStructure & {
        status_name?: string;  // Additional field in the response
    })[];
    settings: BoardTemplateSettings & {
        allow_wip_limits?: boolean;  // Different field name from BoardTemplateSettings
    };
}

// Board type (board_type in the response)
export interface BoardType {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    template: BoardTypeTemplate;
}

// Permissions for this board
export interface BoardPermissions {
    update: boolean;
    delete: boolean;
    duplicate: boolean;
}

// Board links
export interface BoardLinks extends LinksStructure {
    project: string;
    columns: string;
    tasks: string;
    sprints: string;
}

// Complete Board response type
export interface BoardResponse {
    id: number;
    name: string;
    description: string;
    key: string;
    project_id: number;
    board_type_id: number;
    created_at: string;
    updated_at: string;
    board_type: BoardType;
    tasks_count: number;
    can: BoardPermissions;
    links: BoardLinks;
}

// Type for creating a board (POST)
export interface BoardCreate {
    name: string;
    description?: string;
    project_id: number;
    board_type_id: number;
}

// Type for updating a board (PATCH)
export type BoardUpdate = Partial<BoardCreate>;