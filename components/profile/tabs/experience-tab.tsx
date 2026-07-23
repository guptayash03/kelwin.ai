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
import { Building2, Calendar, MapPin, Plus, Pencil, Trash2, Save } from "lucide-react";

type Experience = ParsedResumeData["experience"][number];

interface ExperienceTabProps {
  data: ParsedResumeData;
  onSave: (data: ParsedResumeData) => Promise<void>;
}

const emptyExperience: Experience = {
  company: "",
  title: "",
  employmentType: null,
  location: null,
  startDate: "",
  endDate: null,
  duration: null,
  responsibilities: [],
  technologies: [],
};

export function ExperienceTab({ data, onSave }: ExperienceTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Experience>(emptyExperience);
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [techText, setTechText] = useState("");
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditIndex(null);
    setForm(emptyExperience);
    setResponsibilitiesText("");
    setTechText("");
    setDialogOpen(true);
  }

  function openEdit(index: number) {
    const exp = data.experience[index];
    setEditIndex(index);
    setForm(exp);
    setResponsibilitiesText(exp.responsibilities.join("\n"));
    setTechText(exp.technologies.join(", "));
    setDialogOpen(true);
  }

  async function handleDelete(index: number) {
    const updated = [...data.experience];
    updated.splice(index, 1);
    await onSave({ ...data, experience: updated });
  }

  async function handleSave() {
    setSaving(true);
    const entry: Experience = {
      ...form,
      responsibilities: responsibilitiesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      technologies: techText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const updated = [...data.experience];
    if (editIndex !== null) {
      updated[editIndex] = entry;
    } else {
      updated.push(entry);
    }

    await onSave({ ...data, experience: updated });
    setSaving(false);
    setDialogOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Work Experience</h3>
        <Button variant="default" size="sm" onClick={openAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {data.experience.length === 0 ? (
        <EmptyState message="No experience added yet." onAdd={openAdd} />
      ) : (
        data.experience.map((exp, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-3 group relative">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon-xs" onClick={() => openEdit(i)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="destructive" size="icon-xs" onClick={() => handleDelete(i)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">{exp.title}</h4>
                <p className="text-sm text-muted-foreground">{exp.company}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {exp.startDate} — {exp.endDate || "Present"}
              </p>
              {exp.location && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {exp.location}
                </p>
              )}
              {exp.employmentType && (
                <Badge variant="secondary" className="text-xs">{exp.employmentType}</Badge>
              )}
            </div>

            {exp.responsibilities.length > 0 && (
              <ul className="space-y-1.5 pl-1">
                {exp.responsibilities.map((r, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-2 h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            )}

            {exp.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {exp.technologies.map((tech) => (
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
            <DialogTitle>{editIndex !== null ? "Edit Experience" : "Add Experience"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-medium text-muted-foreground">Job Title *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-medium text-muted-foreground">Company *</label>
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                <Input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} placeholder="Jan 2023" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">End Date</label>
                <Input value={form.endDate || ""} onChange={(e) => setForm({ ...form, endDate: e.target.value || null })} placeholder="Present" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Location</label>
                <Input value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value || null })} placeholder="City, Country" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Employment Type</label>
                <Input value={form.employmentType || ""} onChange={(e) => setForm({ ...form, employmentType: e.target.value || null })} placeholder="Full-time" className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Responsibilities (one per line)</label>
              <Textarea value={responsibilitiesText} onChange={(e) => setResponsibilitiesText(e.target.value)} placeholder="Built scalable APIs&#10;Led a team of 5 engineers" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Technologies (comma-separated)</label>
              <Input value={techText} onChange={(e) => setTechText(e.target.value)} placeholder="React, Node.js, PostgreSQL" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="default" onClick={handleSave} disabled={saving || !form.title || !form.company}>
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ message, onAdd }: { message: string; onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center space-y-3">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="default" size="sm" onClick={onAdd}>
        <Plus className="h-3.5 w-3.5" />
        Add Experience
      </Button>
    </div>
  );
}
