"use client";

import { useState } from "react";
import type { ParsedResumeData } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Mail, Phone, Link2, Globe, Pencil, Save, X } from "lucide-react";

interface PersonalTabProps {
  data: ParsedResumeData;
  onSave: (data: ParsedResumeData) => Promise<void>;
}

export function PersonalTab({ data, onSave }: PersonalTabProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(data.personalInfo);
  const [summary, setSummary] = useState(data.professionalSummary || "");

  async function handleSave() {
    setSaving(true);
    await onSave({
      ...data,
      personalInfo: form,
      professionalSummary: summary || null,
    });
    setSaving(false);
    setEditing(false);
  }

  function handleCancel() {
    setForm(data.personalInfo);
    setSummary(data.professionalSummary || "");
    setEditing(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
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

      {/* Name & Summary */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Location</label>
              <Input
                value={form.location || ""}
                onChange={(e) => setForm({ ...form, location: e.target.value || null })}
                placeholder="City, Country"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Professional Summary</label>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief summary of your professional background..."
                className="mt-1"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xl font-bold text-primary">
                  {data.personalInfo.fullName.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {data.personalInfo.fullName}
                </h3>
                {data.personalInfo.location && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {data.personalInfo.location}
                  </p>
                )}
              </div>
            </div>
            {data.professionalSummary && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.professionalSummary}
              </p>
            )}
          </>
        )}
      </div>

      {/* Contact Info */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Contact Information</h4>
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value || null })}
                placeholder="email@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              <Input
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value || null })}
                placeholder="+1 234 567 8900"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">LinkedIn</label>
              <Input
                value={form.linkedIn || ""}
                onChange={(e) => setForm({ ...form, linkedIn: e.target.value || null })}
                placeholder="https://linkedin.com/in/..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">GitHub</label>
              <Input
                value={form.github || ""}
                onChange={(e) => setForm({ ...form, github: e.target.value || null })}
                placeholder="https://github.com/..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Portfolio</label>
              <Input
                value={form.portfolio || ""}
                onChange={(e) => setForm({ ...form, portfolio: e.target.value || null })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Website</label>
              <Input
                value={form.website || ""}
                onChange={(e) => setForm({ ...form, website: e.target.value || null })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.personalInfo.email && (
              <ContactItem icon={Mail} label="Email" value={data.personalInfo.email} />
            )}
            {data.personalInfo.phone && (
              <ContactItem icon={Phone} label="Phone" value={data.personalInfo.phone} />
            )}
            {data.personalInfo.linkedIn && (
              <ContactItem icon={Link2} label="LinkedIn" value={data.personalInfo.linkedIn} href={data.personalInfo.linkedIn} />
            )}
            {data.personalInfo.github && (
              <ContactItem icon={Globe} label="GitHub" value={data.personalInfo.github} href={data.personalInfo.github} />
            )}
            {data.personalInfo.portfolio && (
              <ContactItem icon={Globe} label="Portfolio" value={data.personalInfo.portfolio} href={data.personalInfo.portfolio} />
            )}
            {data.personalInfo.website && (
              <ContactItem icon={Globe} label="Website" value={data.personalInfo.website} href={data.personalInfo.website} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  const display = value.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href.startsWith("http") ? href : `https://${href}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary truncate block hover:underline"
          >
            {display}
          </a>
        ) : (
          <p className="text-sm font-medium text-foreground truncate">{value}</p>
        )}
      </div>
    </div>
  );
}
