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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Announcements</h1>

        <p className="text-slate-500">
          Stay updated with the latest company announcements.
        </p>
      </div>

      {publishedAnnouncements.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-slate-500">
          No announcements available.
        </div>
      ) : (
        <div className="space-y-4">
          {publishedAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {announcement.title}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {announcement.announcement_type}
                  </p>
                </div>

                {announcement.is_pinned && (
                  <Badge variant="info">
                    📌 Pinned
                  </Badge>
                )}
              </div>

              <p className="mt-4 whitespace-pre-line text-slate-700">
                {announcement.message}
              </p>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>
                  Published:
                  {" "}
                  {announcement.publish_at
                    ? new Date(
                        announcement.publish_at
                      ).toLocaleDateString("en-GB")
                    : "-"}
                </span>

                <span>
                  {announcement.creator?.[0]?.full_name ?? "Admin"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}