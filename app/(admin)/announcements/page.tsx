import { getAnnouncements } from "@/features/announcement/announcement.service";
import AnnouncementTable from "@/features/announcement/components/AnnouncementTable";
import PageHeader from "@/components/layout/PageHeader";

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="Announcements"
        description="Create, publish, and manage organization-wide announcements."
        breadcrumbs={[{ label: "Admin", href: "/dashboard" }, { label: "Announcements" }]}
      />

      <AnnouncementTable announcements={announcements} />
    </div>
  );
}