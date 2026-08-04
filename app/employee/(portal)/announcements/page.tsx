import { Megaphone, Pin, CalendarDays, User } from "lucide-react";
import { getAnnouncements } from "@/features/announcement/announcement.service";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/layout/PageHeader";
import { ANNOUNCEMENT_STATUS } from "@/features/announcement/announcement.types";

export default async function EmployeeAnnouncementsPage() {
  const announcements = await getAnnouncements();

  const publishedAnnouncements = announcements.filter(
    (announcement) =>
      announcement.status === ANNOUNCEMENT_STATUS.PUBLISHED
  );

  return (
    <div className="space-y-6 max-w-[1920px] mx-auto animate-fade-in">
      <PageHeader
        title="Announcements"
        description="Stay updated with the latest company news and important updates."
        breadcrumbs={[{ label: "Portal", href: "/employee/dashboard" }, { label: "Announcements" }]}
      />

      {publishedAnnouncements.length === 0 ? (
        <EmptyState
          title="No announcements available"
          description="You're all caught up. Check back later for new company updates."
          icon={<Megaphone className="h-6 w-6 text-emerald-600" />}
        />
      ) : (
        <div className="space-y-5">
          {publishedAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition duration-200 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">
                      {announcement.title}
                    </h2>

                    {announcement.is_pinned && (
                      <Badge variant="info" size="sm">
                        <span className="flex items-center gap-1">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </span>
                      </Badge>
                    )}
                  </div>

                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-100/60">
                    {announcement.announcement_type}
                  </span>
                </div>
              </div>

              <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {announcement.message}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                  <span>
                    {announcement.publish_at
                      ? new Date(announcement.publish_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-3.5 w-3.5 text-slate-600" />
                  </div>

                  <span className="font-semibold text-slate-700">
                    {announcement.creator?.[0]?.full_name ?? "Admin"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}