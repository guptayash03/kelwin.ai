"use client";

import { useState } from "react";
import type { ParsedResumeData } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, X, Save } from "lucide-react";

interface SkillsTabProps {
  data: ParsedResumeData;
  onSave: (data: ParsedResumeData) => Promise<void>;
}

type SkillCategory = keyof ParsedResumeData["skills"];

const CATEGORIES: { key: SkillCategory; label: string; color: string; badgeColor: string }[] = [
  { key: "technical", label: "Technical", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400", badgeColor: "border-blue-200 dark:border-blue-800" },
  { key: "frameworks", label: "Frameworks", color: "bg-purple-500/10 text-purple-700 dark:text-purple-400", badgeColor: "border-purple-200 dark:border-purple-800" },
  { key: "languages", label: "Languages", color: "bg-green-500/10 text-green-700 dark:text-green-400", badgeColor: "border-green-200 dark:border-green-800" },
  { key: "tools", label: "Tools", color: "bg-orange-500/10 text-orange-700 dark:text-orange-400", badgeColor: "border-orange-200 dark:border-orange-800" },
  { key: "soft", label: "Soft Skills", color: "bg-pink-500/10 text-pink-700 dark:text-pink-400", badgeColor: "border-pink-200 dark:border-pink-800" },
];

export function SkillsTab({ data, onSave }: SkillsTabProps) {
  const [editing, setEditing] = useState(false);
  const [skills, setSkills] = useState(data.skills);
  const [newSkillInputs, setNewSkillInputs] = useState<Record<SkillCategory, string>>({
    technical: "",
    frameworks: "",
    languages: "",
    tools: "",
    soft: "",
  });
  const [saving, setSaving] = useState(false);

  function addSkill(category: SkillCategory) {
    const value = newSkillInputs[category].trim();
    if (!value) return;
    setSkills({
      ...skills,
      [category]: [...skills[category], value],
    });
    setNewSkillInputs({ ...newSkillInputs, [category]: "" });
  }

  function removeSkill(category: SkillCategory, index: number) {
    const updated = [...skills[category]];
    updated.splice(index, 1);
    setSkills({ ...skills, [category]: updated });
  }

  async function handleSave() {
    setSaving(true);
    await onSave({ ...data, skills });
    setSaving(false);
    setEditing(false);
  }

  function handleCancel() {
    setSkills(data.skills);
    setEditing(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Skills</h3>
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

      {CATEGORIES.map((cat) => {
        const items = editing ? skills[cat.key] : data.skills[cat.key];
        if (!editing && items.length === 0) return null;

        return (
          <div key={cat.key} className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">{cat.label}</h4>
            <div className="flex flex-wrap gap-2">
              {items.map((skill, i) => (
                <span
                  key={`${skill}-${i}`}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium ${cat.color} ${cat.badgeColor}`}
                >
                  {skill}
                  {editing && (
                    <button
                      onClick={() => removeSkill(cat.key, i)}
                      className="ml-0.5 hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
              {editing && (
                <div className="flex items-center gap-1.5">
                  <Input
                    value={newSkillInputs[cat.key]}
                    onChange={(e) =>
                      setNewSkillInputs({ ...newSkillInputs, [cat.key]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(cat.key);
                      }
                    }}
                    placeholder="Add skill..."
                    className="h-7 w-32 text-xs"
                  />
                  <Button
                    variant="default"
                    size="icon-xs"
                    onClick={() => addSkill(cat.key)}
                    disabled={!newSkillInputs[cat.key].trim()}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {!editing && CATEGORIES.every((cat) => data.skills[cat.key].length === 0) && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center space-y-3">
          <p className="text-sm text-muted-foreground">No skills added yet.</p>
          <Button variant="default" size="sm" onClick={() => setEditing(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Skills
          </Button>
        </div>
      )}
    </div>
  );
}
