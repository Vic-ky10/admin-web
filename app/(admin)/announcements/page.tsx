import { getAnnouncements } from "@/features/announcement/announcement.service";

import AnnouncementTable from "@/features/announcement/components/AnnouncementTable";

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements(); // fetch all announcment

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Announcements</h1>

        <p className="text-slate-500">
          Create, publish, and manage InfinGoal Company  announcements.
        </p>
      </div>

      <AnnouncementTable announcements={announcements} />
    </div>
  );
} //display annoucment is annoucement tabble