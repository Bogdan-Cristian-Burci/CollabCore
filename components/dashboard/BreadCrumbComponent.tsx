"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import { cn } from "@/lib/utils";

export default function BreadCrumbComponent() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  
  // Skip "dashboard" as it's the base path
  const segments = pathSegments[0] === "dashboard" 
    ? pathSegments.slice(1) 
    : pathSegments;

  // Wrapper paths that don't have their own pages (they're just containers)
  const wrapperPaths = ["settings"];

  const formatSegment = (segment: string) => {
    // Handle IDs by checking if entirely numeric, UUIDs, etc.
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
      return "Details";
    }
    
    // Format segment text (capitalize, replace hyphens with spaces)
    return segment.charAt(0).toUpperCase() + 
           segment.slice(1).replace(/-/g, " ");
  };

  const buildPath = (index: number) => {
    if (pathSegments[0] === "dashboard") {
      return "/" + pathSegments.slice(0, index + 2).join("/");
    }
    return "/" + pathSegments.slice(0, index + 1).join("/");
  };

  const isWrapperPath = (segment: string) => {
    return wrapperPaths.includes(segment);
  };

  return (
    <Breadcrumb className="ml-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {segments.length > 0 && <BreadcrumbSeparator />}
        
        {segments.map((segment, index) => {
          const isWrapper = isWrapperPath(segment);
          const isLastSegment = index === segments.length - 1;
          
          return (
            <React.Fragment key={segment + index}>
              {isLastSegment || isWrapper ? (
                <BreadcrumbItem>
                  <BreadcrumbPage 
                    className={cn(
                      isWrapper && !isLastSegment && "text-muted-foreground italic"
                    )}
                  >
                    {formatSegment(segment)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={buildPath(index)}>
                      {formatSegment(segment)}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )}
              {index < segments.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}