"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import type { ParsedResumeData } from "@/types/resume";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileCompleteness } from "@/components/profile/profile-completeness";
import { PersonalTab } from "@/components/profile/tabs/personal-tab";
import { ExperienceTab } from "@/components/profile/tabs/experience-tab";
import { EducationTab } from "@/components/profile/tabs/education-tab";
import { SkillsTab } from "@/components/profile/tabs/skills-tab";
import { ProjectsTab } from "@/components/profile/tabs/projects-tab";
import { MoreTab } from "@/components/profile/tabs/more-tab";
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  FolderOpen,
  Award,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<ParsedResumeData | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.data();
        if (data?.resumeId) {
          setResumeId(data.resumeId);
          const resumeDoc = await getDoc(doc(db, "resumes", data.resumeId));
          const resume = resumeDoc.data();
          if (resume?.parsedData) {
            setResumeData(resume.parsedData as ParsedResumeData);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const saveProfile = useCallback(
    async (updatedData: ParsedResumeData) => {
      if (!resumeId) return;
      setResumeData(updatedData);
      await updateDoc(doc(db, "resumes", resumeId), {
        parsedData: updatedData,
        updatedAt: serverTimestamp(),
      });
    },
    [resumeId]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">
          No profile data found. Complete onboarding to populate your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Your extracted resume information. Click edit to make changes.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <Tabs defaultValue={0}>
            <TabsList variant="line" className="w-full justify-start border-b border-border pb-0 mb-6">
              <TabsTrigger value={0} className="gap-1.5">
                <User className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value={1} className="gap-1.5">
                <Briefcase className="h-4 w-4" />
                Experience
              </TabsTrigger>
              <TabsTrigger value={2} className="gap-1.5">
                <GraduationCap className="h-4 w-4" />
                Education
              </TabsTrigger>
              <TabsTrigger value={3} className="gap-1.5">
                <Code className="h-4 w-4" />
                Skills
              </TabsTrigger>
              <TabsTrigger value={4} className="gap-1.5">
                <FolderOpen className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value={5} className="gap-1.5">
                <Award className="h-4 w-4" />
                More
              </TabsTrigger>
            </TabsList>

            <TabsContent value={0}>
              <PersonalTab data={resumeData} onSave={saveProfile} />
            </TabsContent>
            <TabsContent value={1}>
              <ExperienceTab data={resumeData} onSave={saveProfile} />
            </TabsContent>
            <TabsContent value={2}>
              <EducationTab data={resumeData} onSave={saveProfile} />
            </TabsContent>
            <TabsContent value={3}>
              <SkillsTab data={resumeData} onSave={saveProfile} />
            </TabsContent>
            <TabsContent value={4}>
              <ProjectsTab data={resumeData} onSave={saveProfile} />
            </TabsContent>
            <TabsContent value={5}>
              <MoreTab data={resumeData} onSave={saveProfile} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:w-80 shrink-0">
          <ProfileCompleteness data={resumeData} />
        </div>
      </div>
    </div>
  );
}
