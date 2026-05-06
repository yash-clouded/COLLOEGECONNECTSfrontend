import { useState, useEffect } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  getMyStudentProfile,
  getStudentReferralSummary,
  type StudentProfileResponse,
  type ReferralSummaryResponse,
  updateMyStudentProfile,
} from "@/lib/restApi";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { useNavigate } from "@tanstack/react-router";
import { User, Monitor, IndianRupee, Gift, Loader, CheckCircle, MapPin, GraduationCap, Trophy, Mail, Phone, Edit3, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { use3DTilt } from "@/hooks/use3DTilt";

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [student, setStudent] = useState<StudentProfileResponse | null>(null);
  const [referralSummary, setReferralSummary] = useState<ReferralSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    state: "",
    academic_status: "",
    jee_mains_percentile: "",
    jee_mains_rank: "",
    jee_advanced_rank: "",
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        fetchProfile(user);
      } else {
        navigate({ to: "/auth/signin" });
      }
    });
  }, [navigate]);

  const fetchProfile = async (user: FirebaseUser) => {
    try {
      const storedRole = localStorage.getItem("user_role");
      if (storedRole && storedRole !== "student") {
        navigate({ to: "/advisor/dashboard" });
        return;
      }

      const token = await user.getIdToken();
      const [prof, ref] = await Promise.all([
        getMyStudentProfile(token),
        getStudentReferralSummary(token),
      ]);
      setStudent(prof);
      setReferralSummary(ref);
      setEditForm({
        name: prof.name || "",
        phone: prof.phone || "",
        state: prof.state || "",
        academic_status: prof.academic_status || "",
        jee_mains_percentile: prof.jee_mains_percentile || "",
        jee_mains_rank: prof.jee_mains_rank || "",
        jee_advanced_rank: prof.jee_advanced_rank || "",
      });
    } catch (err: any) {
      console.error(err);
      if (err.status === 403 || (err.message && err.message.includes("403"))) {
        alert("Access Denied: You are registered as an Advisor.");
        navigate({ to: "/advisor/dashboard" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!authUser || !student) return;
    setSaving(true);
    try {
      const token = await authUser.getIdToken();
      const updated = await updateMyStudentProfile(token, editForm);
      setStudent(updated);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader className="animate-spin text-slate-900" size={32} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background pt-32 pb-24 px-4 sm:px-6">
      {/* Atmosphere Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="orb-1 absolute top-[-5%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-slate-200 blur-[140px]" />
        <div className="orb-2 absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-navy/5 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="glass-dashboard rounded-[3rem] p-8 sm:p-12">
          
          {/* Header Profile Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 mb-12 border-b border-slate-100 pb-12">
             <div className="shrink-0 relative">
               <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-4 border-white shadow-xl">
                 <span className="text-4xl font-display font-bold text-slate-800">
                    {student?.name?.split(" ").map(n => n[0]).slice(0, 2).join("")}
                 </span>
               </div>
               <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center shadow-lg border-4 border-white">
                 <CheckCircle size={18} strokeWidth={3} />
               </div>
             </div>

             <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <span className="stat-badge bg-slate-900 text-white">STUDENT VERIFIED</span>
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Member Since {new Date(student?.created_at || '').getFullYear()}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-2 tracking-tight">{student?.name}</h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm font-medium text-slate-500">
                   <div className="flex items-center gap-1.5"><Mail size={14} /> {student?.email}</div>
                   <div className="flex items-center gap-1.5"><MapPin size={14} /> {student?.state || 'Location not set'}</div>
                </div>
             </div>
             
             {!isEditing && (
               <button onClick={() => setIsEditing(true)} className="dashboard-tab-btn bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200">
                 <Edit3 size={16} /> Edit Profile
               </button>
             )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {[
              { label: "Booked Sessions", v: student?.total_sessions || 0, icon: Monitor, color: "text-navy", bg: "bg-navy-light" },
              { label: "Total Investment", v: `₹${student?.total_spent || 0}`, icon: IndianRupee, color: "text-slate-900", bg: "bg-slate-50" },
              { label: "Referral Balance", v: `₹${referralSummary?.referral_rewards_inr || 0}`, icon: Gift, color: "text-navy", bg: "bg-navy-light" },
            ].map(s => (
              <div key={s.label} className="p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-navy/20 transition-all group">
                 <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} mb-4 group-hover:scale-110 transition-transform`}>
                   <s.icon size={24} strokeWidth={2.5} />
                 </div>
                 <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-slate-400 mb-1">{s.label}</p>
                 <p className="text-2xl font-display font-bold text-slate-900">{s.v}</p>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-navy rounded-full" />
              <h3 className="text-2xl font-display font-bold text-slate-900">Academic Snapshot</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                { label: "Full Name", key: "name", type: "text", icon: User },
                { label: "Mobile Number", key: "phone", type: "tel", icon: Phone },
                { label: "Current State", key: "state", type: "text", icon: MapPin },
                { label: "Academic Level", key: "academic_status", type: "text", icon: GraduationCap },
                { label: "JEE Mains %ile", key: "jee_mains_percentile", type: "text", icon: Trophy },
                { label: "JEE Mains Rank", key: "jee_mains_rank", type: "text", icon: Trophy },
                { label: "JEE Advanced Rank", key: "jee_advanced_rank", type: "text", icon: Trophy },
              ].map((f) => (
                <div key={f.key} className="flex flex-col gap-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
                    <f.icon size={12} strokeWidth={2.5} />
                    {f.label}
                  </label>
                  {isEditing ? (
                    <input
                      type={f.type}
                      value={editForm[f.key as keyof typeof editForm]}
                      onChange={(e) => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:border-navy/30 outline-none transition-all placeholder:text-slate-300"
                    />
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700">
                       {editForm[f.key as keyof typeof editForm] || "Not provided"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence>
               {isEditing && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex gap-4 pt-8">
                   <button onClick={handleSave} disabled={saving} className="flex-1 bg-slate-900 text-white font-display font-bold h-14 rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                     {saving ? <Loader size={20} className="animate-spin" /> : <><CheckCircle size={20} /> Deploy Changes</>}
                   </button>
                   <button onClick={() => setIsEditing(false)} disabled={saving} className="px-8 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 font-display font-bold h-14 rounded-2xl transition-all">
                     Discard
                   </button>
                 </motion.div>
               )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
