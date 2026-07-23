"use client";

import { useState } from "react";
import type { ParsedResumeData } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { GraduationCap, Calendar, Plus, Pencil, Trash2, Save } from "lucide-react";

type Education = ParsedResumeData["education"][number];

interface EducationTabProps {
  data: ParsedResumeData;
  onSave: (data: ParsedResumeData) => Promise<void>;
}

const emptyEducation: Education = {
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: null,
  gpa: null,
  grade: null,
};

export function EducationTab({ data, onSave }: EducationTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Education>(emptyEducation);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditIndex(null);
    setForm(emptyEducation);
    setDialogOpen(true);
  }

  function openEdit(index: number) {
    setEditIndex(index);
    setForm(data.education[index]);
    setDialogOpen(true);
  }

  async function handleDelete(index: number) {
    const updated = [...data.education];
    updated.splice(index, 1);
    await onSave({ ...data, education: updated });
  }

  async function handleSave() {
    setSaving(true);
    const updated = [...data.education];
    if (editIndex !== null) {
      updated[editIndex] = form;
    } else {
      updated.push(form);
    }
    await onSave({ ...data, education: updated });
    setSaving(false);
    setDialogOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Education</h3>
        <Button variant="default" size="sm" onClick={openAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {data.education.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        data.education.map((edu, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-2 group relative">
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
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground">
                  {edu.degree} in {edu.field}
                </h4>
                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {edu.startDate} — {edu.endDate || "Present"}
                  </p>
                  {edu.gpa && (
                    <Badge variant="secondary" className="text-xs">GPA: {edu.gpa}</Badge>
                  )}
                  {edu.grade && !edu.gpa && (
                    <Badge variant="secondary" className="text-xs">{edu.grade}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "Edit Education" : "Add Education"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Institution *</label>
              <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Degree *</label>
                <Input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="B.Tech" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Field *</label>
                <Input value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} placeholder="Computer Science" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                <Input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} placeholder="2019" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">End Date</label>
                <Input value={form.endDate || ""} onChange={(e) => setForm({ ...form, endDate: e.target.value || null })} placeholder="2023" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">GPA</label>
                <Input value={form.gpa || ""} onChange={(e) => setForm({ ...form, gpa: e.target.value || null })} placeholder="3.8" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Grade</label>
                <Input value={form.grade || ""} onChange={(e) => setForm({ ...form, grade: e.target.value || null })} placeholder="First Class" className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="default" onClick={handleSave} disabled={saving || !form.institution || !form.degree || !form.field}>
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center space-y-3">
      <p className="text-sm text-muted-foreground">No education added yet.</p>
      <Button variant="default" size="sm" onClick={onAdd}>
        <Plus className="h-3.5 w-3.5" />
        Add Education
      </Button>
    </div>
  );
}
