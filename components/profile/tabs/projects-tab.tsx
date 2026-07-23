"use client";

import { useState } from "react";
import type { ParsedResumeData } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Globe, ExternalLink, Plus, Pencil, Trash2, Save } from "lucide-react";

type Project = ParsedResumeData["projects"][number];

interface ProjectsTabProps {
  data: ParsedResumeData;
  onSave: (data: ParsedResumeData) => Promise<void>;
}

const emptyProject: Project = {
  title: "",
  description: "",
  technologies: [],
  github: null,
  liveUrl: null,
};

export function ProjectsTab({ data, onSave }: ProjectsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Project>(emptyProject);
  const [techText, setTechText] = useState("");
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditIndex(null);
    setForm(emptyProject);
    setTechText("");
    setDialogOpen(true);
  }

  function openEdit(index: number) {
    const proj = data.projects[index];
    setEditIndex(index);
    setForm(proj);
    setTechText(proj.technologies.join(", "));
    setDialogOpen(true);
  }

  async function handleDelete(index: number) {
    const updated = [...data.projects];
    updated.splice(index, 1);
    await onSave({ ...data, projects: updated });
  }

  async function handleSave() {
    setSaving(true);
    const entry: Project = {
      ...form,
      technologies: techText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const updated = [...data.projects];
    if (editIndex !== null) {
      updated[editIndex] = entry;
    } else {
      updated.push(entry);
    }

    await onSave({ ...data, projects: updated });
    setSaving(false);
    setDialogOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Projects</h3>
        <Button variant="default" size="sm" onClick={openAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {data.projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center space-y-3">
          <p className="text-sm text-muted-foreground">No projects added yet.</p>
          <Button variant="default" size="sm" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5" />
            Add Project
          </Button>
        </div>
      ) : (
        data.projects.map((proj, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-3 group relative">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon-xs" onClick={() => openEdit(i)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="destructive" size="icon-xs" onClick={() => handleDelete(i)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-semibold text-foreground">{proj.title}</h4>
              <div className="flex items-center gap-2 shrink-0">
                {proj.github && (
                  <a
                    href={proj.github.startsWith("http") ? proj.github : `https://${proj.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-muted hover:bg-accent transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                )}
                {proj.liveUrl && (
                  <a
                    href={proj.liveUrl.startsWith("http") ? proj.liveUrl : `https://${proj.liveUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-muted hover:bg-accent transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{proj.description}</p>
            {proj.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {proj.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">{tech}</Badge>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "Edit Project" : "Add Project"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Title *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Description *</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Technologies (comma-separated)</label>
              <Input value={techText} onChange={(e) => setTechText(e.target.value)} placeholder="React, TypeScript, Firebase" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">GitHub URL</label>
                <Input value={form.github || ""} onChange={(e) => setForm({ ...form, github: e.target.value || null })} placeholder="https://github.com/..." className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Live URL</label>
                <Input value={form.liveUrl || ""} onChange={(e) => setForm({ ...form, liveUrl: e.target.value || null })} placeholder="https://..." className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="default" onClick={handleSave} disabled={saving || !form.title || !form.description}>
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
