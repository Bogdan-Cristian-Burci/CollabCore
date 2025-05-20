
export interface MetaLink{
    url:string | null;
    label:string;
    active:boolean;
}

export interface PaginationResource{
    first:string,
    last:string,
    prev:string | null,
    next:string | null,
}
export interface ApiMeta{
    current_page:number;
    from:number;
    last_page:number;
    links:MetaLink[];
    path:string;
    per_page:number;
    to:number;
    total:number;
}

export interface PaginatedResponse<T> {
    data: T[];
    links: PaginationResource;
    meta: ApiMeta;
}

export interface PaginationParams {
    page?: number;
    per_page?: number;
}


