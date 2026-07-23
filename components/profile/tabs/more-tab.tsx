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
import { Award, Plus, Pencil, Trash2, Save, X, Trophy, BookOpen, Heart, Users } from "lucide-react";

interface MoreTabProps {
  data: ParsedResumeData;
  onSave: (data: ParsedResumeData) => Promise<void>;
}

type Certification = ParsedResumeData["certifications"][number];

const emptyCert: Certification = {
  name: "",
  issuer: "",
  date: null,
  url: null,
};

export function MoreTab({ data, onSave }: MoreTabProps) {
  return (
    <div className="space-y-6">
      <CertificationsSection data={data} onSave={onSave} />
      <ListSection
        title="Achievements"
        icon={Trophy}
        items={data.achievements}
        field="achievements"
        data={data}
        onSave={onSave}
        placeholder="e.g. Won first place at hackathon"
      />
      <ListSection
        title="Publications"
        icon={BookOpen}
        items={data.publications}
        field="publications"
        data={data}
        onSave={onSave}
        placeholder="e.g. Published paper in IEEE"
      />
      <ListSection
        title="Volunteer Experience"
        icon={Users}
        items={data.volunteerExperience}
        field="volunteerExperience"
        data={data}
        onSave={onSave}
        placeholder="e.g. Mentored students at local coding bootcamp"
      />
      <ListSection
        title="Interests"
        icon={Heart}
        items={data.interests}
        field="interests"
        data={data}
        onSave={onSave}
        placeholder="e.g. Open source, Machine learning"
      />
    </div>
  );
}

function CertificationsSection({
  data,
  onSave,
}: {
  data: ParsedResumeData;
  onSave: (data: ParsedResumeData) => Promise<void>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Certification>(emptyCert);
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditIndex(null);
    setForm(emptyCert);
    setDialogOpen(true);
  }

  function openEdit(index: number) {
    setEditIndex(index);
    setForm(data.certifications[index]);
    setDialogOpen(true);
  }

  async function handleDelete(index: number) {
    const updated = [...data.certifications];
    updated.splice(index, 1);
    await onSave({ ...data, certifications: updated });
  }

  async function handleSave() {
    setSaving(true);
    const updated = [...data.certifications];
    if (editIndex !== null) {
      updated[editIndex] = form;
    } else {
      updated.push(form);
    }
    await onSave({ ...data, certifications: updated });
    setSaving(false);
    setDialogOpen(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          Certifications
        </h3>
        <Button variant="default" size="sm" onClick={openAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {data.certifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">No certifications added.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          {data.certifications.map((cert, i) => (
            <div key={i} className="flex items-start justify-between gap-3 group">
              <div>
                <p className="text-sm font-medium text-foreground">{cert.name}</p>
                <p className="text-xs text-muted-foreground">{cert.issuer}{cert.date ? ` · ${cert.date}` : ""}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button variant="ghost" size="icon-xs" onClick={() => openEdit(i)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button variant="destructive" size="icon-xs" onClick={() => handleDelete(i)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "Edit Certification" : "Add Certification"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="AWS Solutions Architect" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Issuer *</label>
              <Input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder="Amazon Web Services" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date</label>
                <Input value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value || null })} placeholder="2023" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">URL</label>
                <Input value={form.url || ""} onChange={(e) => setForm({ ...form, url: e.target.value || null })} placeholder="https://..." className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="default" onClick={handleSave} disabled={saving || !form.name || !form.issuer}>
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ListSection({
  title,
  icon: Icon,
  items,
  field,
  data,
  onSave,
  placeholder,
}: {
  title: string;
  icon: typeof Award;
  items: string[];
  field: "achievements" | "publications" | "volunteerExperience" | "interests";
  data: ParsedResumeData;
  onSave: (data: ParsedResumeData) => Promise<void>;
  placeholder: string;
}) {
  const [editing, setEditing] = useState(false);
  const [list, setList] = useState(items);
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);

  function addItem() {
    if (!newItem.trim()) return;
    setList([...list, newItem.trim()]);
    setNewItem("");
  }

  function removeItem(index: number) {
    const updated = [...list];
    updated.splice(index, 1);
    setList(updated);
  }

  async function handleSave() {
    setSaving(true);
    await onSave({ ...data, [field]: list });
    setSaving(false);
    setEditing(false);
  }

  function handleCancel() {
    setList(items);
    setEditing(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h3>
        {!editing ? (
          <Button variant="default" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        {editing ? (
          <>
            {list.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-foreground">{item}</span>
                <Button variant="destructive" size="icon-xs" onClick={() => removeItem(i)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem();
                  }
                }}
                placeholder={placeholder}
                className="flex-1"
              />
              <Button variant="default" size="sm" onClick={addItem} disabled={!newItem.trim()}>
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">None added yet.</p>
        ) : field === "interests" ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Badge key={item} variant="secondary">{item}</Badge>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
