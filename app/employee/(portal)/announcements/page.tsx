import { Megaphone, Pin, CalendarDays, User } from "lucide-react";

import { getAnnouncements } from "@/features/announcement/announcement.service";
import Badge from "@/components/ui/Badge";
import { ANNOUNCEMENT_STATUS } from "@/features/announcement/announcement.types";

export default async function EmployeeAnnouncementsPage() {
  const announcements = await getAnnouncements();

  const publishedAnnouncements = announcements.filter(
    (announcement) =>
      announcement.status === ANNOUNCEMENT_STATUS.PUBLISHED,
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Announcements
          </h1>

          <p className="mt-1 text-slate-500">
            Stay updated with the latest company news and important updates.
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Megaphone className="h-7 w-7" />
        </div>
      </div>

      {publishedAnnouncements.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
          <Megaphone className="mx-auto mb-4 h-12 w-12 text-slate-300" />

          <h3 className="text-lg font-semibold text-slate-700">
            No announcements available
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            You&apos;re all caught up. Check back later for new updates.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {publishedAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">
                      {announcement.title}
                    </h2>

                    {announcement.is_pinned && (
                      <Badge variant="info">
                        <span className="flex items-center gap-1">
                          <Pin className="h-3.5 w-3.5" />
                          Pinned
                        </span>
                      </Badge>
                    )}
                  </div>

                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {announcement.announcement_type}
                  </span>
                </div>
              </div>

              <div className="mt-6 whitespace-pre-line text-[15px] leading-7 text-slate-700">
                {announcement.message}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />

                  <span>
                    {announcement.publish_at
                      ? new Date(
                          announcement.publish_at,
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>

                  <span className="font-medium text-slate-700">
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