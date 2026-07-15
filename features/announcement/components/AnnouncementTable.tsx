"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AnnouncementForm from "./AnnouncementForm";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

import {
  AnnouncementWithCreator,
  ANNOUNCEMENT_STATUS,
} from "../announcement.types";

import {
  deleteAnnouncementAction,
  publishAnnouncementAction,
} from "../announcement.action";

import { toast } from "sonner";

interface AnnouncementTableProps {
  announcements: AnnouncementWithCreator[];
}

function getStatusVariant(status: string): "success" | "warning" | "danger" {
  switch (status) {
    case ANNOUNCEMENT_STATUS.PUBLISHED:
      return "success";

    case ANNOUNCEMENT_STATUS.ARCHIVED:
      return "danger";

    default:
      return "warning";
  }
}

export default function AnnouncementTable({
  announcements,
}: AnnouncementTableProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementWithCreator | null>(null);

  const filteredAnnouncements = useMemo(() => {
    const keyword = search.toLowerCase();

    return announcements.filter((announcement) => {
      return (
        announcement.title.toLowerCase().includes(keyword) ||
        announcement.announcement_type.toLowerCase().includes(keyword)
      );
    });
  }, [announcements, search]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <Button
          onClick={() => {
            setSelectedAnnouncement(null);
            setOpen(true);
          }}
        >
          New Announcement
        </Button>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Title</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Target</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Pinned</TableHeader>
            <TableHeader>Published</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredAnnouncements.length === 0 ? (
            <TableRow>
              <TableCell>No announcements found.</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <TableRow key={announcement.id}>
                <TableCell>
                  <div>
                    <p className="font-semibold">{announcement.title}</p>

                    <p className="text-xs text-slate-500">
                      {announcement.creator?.[0]?.full_name ?? "-"}
                    </p>
                  </div>
                </TableCell>

                <TableCell>{announcement.announcement_type}</TableCell>

                <TableCell>{announcement.target_audience}</TableCell>

                <TableCell>
                  <Badge variant={getStatusVariant(announcement.status)}>
                    {announcement.status}
                  </Badge>
                </TableCell>

                <TableCell>{announcement.is_pinned ? "📌 Yes" : "-"}</TableCell>

                <TableCell>
                  {announcement.publish_at
                    ? new Date(announcement.publish_at).toLocaleDateString(
                        "en-GB",
                      )
                    : "-"}
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedAnnouncement(announcement);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </Button>

                    {announcement.status === ANNOUNCEMENT_STATUS.DRAFT && (
                      <Button
                        onClick={async () => {
                          const result = await publishAnnouncementAction(
                            announcement.id,
                          );

                          if (!result.success) {
                            toast.error(result.error);
                            return;
                          }

                          toast.success(result.message);
                           router.refresh();
                        }}
                      >
                        Publish
                      </Button>
                    )}

                    <Button
                      variant="danger"
                      onClick={async () => {
                        if (!confirm("Delete this announcement?")) {
                          return;
                        }

                        const result = await deleteAnnouncementAction(
                          announcement.id,
                        );

                        if (!result.success) {
                          toast.error(result.error);
                          return;
                        }

                        toast.success(result.message);
                       
                        router.refresh();
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <AnnouncementForm
        open={open}
        announcement={selectedAnnouncement}
        onClose={() => {
          setOpen(false);
          setSelectedAnnouncement(null);
        }}
      />
    </div>
  );
}
