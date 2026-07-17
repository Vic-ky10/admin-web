"use client";

import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { EmployeeCredentials } from "../employee.types";

interface CredentialsModalProps {
  credentials: EmployeeCredentials | null;
  open: boolean;
  onClose: () => void;
}

export default function CredentialsModal({
  credentials,
  open,
  onClose,
}: CredentialsModalProps) {
  if (!credentials) return null;

  const handleCopy = () => {
    const text = [
      "InfiniGoal Employee Portal",
      "",
      "Login URL:",
      credentials.portalUrl,
      "",
      "Email:",
      credentials.email,
      "",
      "Temporary Password:",
      credentials.password,
      "",
      "Please change your password after your first login.",
    ].join("\n");

    navigator.clipboard.writeText(text);
    toast.success("Credentials copied to clipboard.");
  };

  return (
    <Modal
      open={open}
      title="Employee Created Successfully"
      onClose={onClose}
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-emerald-800">
          <p className="font-medium">
            Please copy these credentials and share them securely with the employee.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <th className="bg-slate-50 px-4 py-3 font-medium text-slate-700 w-1/3">
                  Employee Name
                </th>
                <td className="px-4 py-3 text-slate-900">
                  {credentials.fullName}
                </td>
              </tr>
              <tr>
                <th className="bg-slate-50 px-4 py-3 font-medium text-slate-700">
                  Login Email
                </th>
                <td className="px-4 py-3 text-slate-900">
                  {credentials.email}
                </td>
              </tr>
              <tr>
                <th className="bg-slate-50 px-4 py-3 font-medium text-slate-700">
                  Temporary Password
                </th>
                <td className="px-4 py-3 font-mono text-slate-900">
                  {credentials.password}
                </td>
              </tr>
              <tr>
                <th className="bg-slate-50 px-4 py-3 font-medium text-slate-700">
                  Employee Portal URL
                </th>
                <td className="px-4 py-3 text-blue-600 hover:underline">
                  <a href={credentials.portalUrl} target="_blank" rel="noreferrer">
                    {credentials.portalUrl}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleCopy}>
            Copy Credentials
          </Button>
        </div>
      </div>
    </Modal>
  );
}
