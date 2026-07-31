"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import LoadingButton from "@/components/feedback/LoadingButton";
import { SalesArea } from "../sales.types";
import { SalesAreaForm, salesAreaSchema } from "../sales.validation";
import { useEffect } from "react";

interface SalesAreaDialogProps {
  open: boolean;
  onClose: () => void;
  area: SalesArea | null;
  onSubmit: (values: SalesAreaForm) => void;
  loading: boolean;
}

const defaultValues: SalesAreaForm = {
  area_name: "",
  area_type: "Residential",
  address: "",
  city: "",
  state: "",
  pincode: "",
  contact_person: "",
  contact_phone: "",
  notes: "",
  status: "Active",
};

export default function SalesAreaDialog({
  open,
  onClose,
  area,
  onSubmit,
  loading,
}: SalesAreaDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SalesAreaForm>({
    resolver: zodResolver(salesAreaSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      if (area) {
        reset({
          area_name: area.area_name,
          area_type: area.area_type,
          address: area.address || "",
          city: area.city || "",
          state: area.state || "",
          pincode: area.pincode || "",
          contact_person: area.contact_person || "",
          contact_phone: area.contact_phone || "",
          notes: area.notes || "",
          status: area.status,
        });
      } else {
        reset(defaultValues);
      }
    }
  }, [open, area, reset]);

  return (
    <Modal
      open={open}
      title={area ? "Edit Sales Area" : "Create Sales Area"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Area Name"
            placeholder="Enter Sales Ares ..."
            error={errors.area_name?.message}
            {...register("area_name")}
          />

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Area Type</label>
            <select
              {...register("area_type")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm"
            >
              <option value="Apartment">Apartment</option>
              <option value="Company">Company</option>
              <option value="Office">Office</option>
              <option value="Shop">Shop</option>
              <option value="Residential">Residential</option>
              <option value="Other">Other</option>
            </select>
            {errors.area_type?.message && (
              <p className="text-sm text-red-600">{errors.area_type.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="City"
            placeholder=" Enter City ... "
            error={errors.city?.message}
            {...register("city")}
          />
          <Input
            label="State"
            placeholder=" State..."
            error={errors.state?.message}
            {...register("state")}
          />
          <Input
            label="Pincode"
            placeholder=" Pincode ..."
            error={errors.pincode?.message}
            {...register("pincode")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Contact Person (Optional)"
            placeholder=" Contact Person "
            error={errors.contact_person?.message}
            {...register("contact_person")}
          />
          <Input
            label="Contact Phone (Optional)"
            placeholder="Contact Person phone ..."
            error={errors.contact_phone?.message}
            {...register("contact_phone")}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Status</label>
          <select
            {...register("status")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          {errors.status?.message && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <Input
          label="Address (Optional)"
          placeholder="Detailed area address description"
          error={errors.address?.message}
          {...register("address")}
        />

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">
            Notes / Landmark
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            placeholder="Provide any description or specific area details..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-sm"
          />
          {errors.notes?.message && (
            <p className="text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" loading={loading}>
            {area ? "Save Changes" : "Create Area"}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
