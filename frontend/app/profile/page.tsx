"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, ArrowLeft, User, Calendar, Phone, CheckCircle } from "lucide-react";

export default function PatientProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "MALE",
    phone: "",
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get(`/api/patients/${user.id}`);
        const data = res.data.data;
        if (data) {
          setFormData({
            fullName: data.fullName || "",
            dob: data.dob || "",
            gender: data.gender || "MALE",
            phone: data.phone || "",
          });
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          toast.error("Không thể tải thông tin hồ sơ.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.dob || !formData.phone.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/api/patients`, {
        fullName: formData.fullName,
        dob: formData.dob,
        gender: formData.gender,
        phone: formData.phone,
      });
      toast.success("Cập nhật hồ sơ thành công!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật hồ sơ.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-low flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
        </button>

        <div className="bg-white p-8 rounded-3xl shadow-xs border border-outline-variant/30 clinical-shadow">
          <h1 className="text-3xl font-black text-on-surface mb-2">Hồ sơ cá nhân</h1>
          <p className="text-on-surface-variant text-sm mb-8">
            Cập nhật thông tin của bạn để thuận tiện cho việc đặt lịch khám tự động.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Họ và tên đầy đủ <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Nguyễn Văn A"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Ngày sinh <span className="text-primary">*</span>
                </label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split("T")[0]}
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Giới tính <span className="text-primary">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" /> Số điện thoại <span className="text-primary">*</span>
              </label>
              <input
                type="tel"
                placeholder="Nhập số điện thoại..."
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full py-3 px-4 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" /> Lưu hồ sơ
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
