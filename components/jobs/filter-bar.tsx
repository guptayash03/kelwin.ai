"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";
import type { JobFilters } from "@/types/central-job";
import {
  EXPERIENCE_LEVELS,
  WORK_ARRANGEMENTS,
  EMPLOYMENT_TYPES,
  JOB_SOURCES,
} from "@/types/central-job";
import { useState } from "react";

interface FilterBarProps {
  filters: JobFilters;
  onFilterChange: (filters: Partial<JobFilters>) => void;
  onReset: () => void;
}

export function FilterBar({ filters, onFilterChange, onReset }: FilterBarProps) {
  const [keyword, setKeyword] = useState(filters.keyword || "");

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== null && v !== ""
  );

  function handleKeywordSubmit(e: React.FormEvent) {
    e.preventDefault();
    onFilterChange({ keyword: keyword || null });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.experienceLevel || ""}
          onValueChange={(val) =>
            onFilterChange({ experienceLevel: val || null })
          }
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder="Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            {EXPERIENCE_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.workArrangement || ""}
          onValueChange={(val) =>
            onFilterChange({ workArrangement: val || null })
          }
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder="Work Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {WORK_ARRANGEMENTS.map((arr) => (
              <SelectItem key={arr.value} value={arr.value}>
                {arr.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.employmentType || ""}
          onValueChange={(val) =>
            onFilterChange({ employmentType: val || null })
          }
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder="Employment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            {EMPLOYMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.source || ""}
          onValueChange={(val) => onFilterChange({ source: val || null })}
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Sources</SelectItem>
            {JOB_SOURCES.map((src) => (
              <SelectItem key={src.value} value={src.value}>
                {src.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-7 px-2">
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <form onSubmit={handleKeywordSubmit} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by title or company..."
            className="h-8 pl-8 text-sm"
          />
        </div>
        <Button type="submit" size="sm" variant="secondary" className="h-8">
          Search
        </Button>
      </form>
    </div>
  );
}
