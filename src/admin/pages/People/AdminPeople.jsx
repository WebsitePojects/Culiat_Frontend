import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Users,
  User,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Plus,
  Eye,
  EyeOff,
  Search,
  ChevronDown,
  ChevronUp,
  Building2,
  Gavel,
  Scale,
  Shield,
  GripVertical,
  ArrowUpDown,
  Filter,
  BarChart3,
  UserPlus,
  RefreshCw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ─── Branch config ─── */
const BRANCHES = [
  { key: "Executive", label: "Executive Branch", icon: Building2, color: "violet", description: "Implements policies and manages daily operations" },
  { key: "Legislative", label: "Legislative Branch", icon: Gavel, color: "blue", description: "Sangguniang Barangay – enacts ordinances and resolutions" },
  { key: "Administrative", label: "Administrative Staff", icon: Shield, color: "emerald", description: "Provides essential support services and record management" },
  { key: "Lupong Tagapamayapa", label: "Judiciary Branch", icon: Scale, color: "rose", description: "Mediates and settles disputes at community level" },
  { key: "SK Council", label: "Sangguniang Kabataan", icon: Users, color: "amber", description: "Youth council representing the Katipunan ng Kabataan" },
  { key: "Barangay Public Safety Officers (BPSO)", label: "Barangay Public Safety Officers (BPSO)", icon: Shield, color: "violet", description: "Community peace and public safety support team" },
  { key: "Other", label: "Other", icon: User, color: "gray", description: "Other barangay personnel" },
];

const POSITION_OPTIONS = [
  { value: "barangay_captain", label: "Barangay Captain" },
  { value: "barangay_kagawad", label: "Barangay Kagawad" },
  { value: "sk_chairman", label: "SK Chairman" },
  { value: "barangay_secretary", label: "Barangay Secretary" },
  { value: "barangay_treasurer", label: "Barangay Treasurer" },
  { value: "administrative_officer", label: "Administrative Officer" },
  { value: "admin_officer_internal", label: "Admin Officer (Internal)" },
  { value: "admin_officer_external", label: "Admin Officer (External)" },
  { value: "executive_officer", label: "Executive Officer (EX-O)" },
  { value: "deputy_officer", label: "Deputy Officer" },
  { value: "other", label: "Other" },
];

const COMMITTEE_ROLE_OPTIONS = [
  { value: "", label: "No Role" },
  { value: "chairperson", label: "Chairperson" },
  { value: "co_chairperson", label: "Co-Chairperson" },
  { value: "coordinator", label: "Coordinator" },
  { value: "member", label: "Member" },
];

const getPositionLabel = (value) => {
  const opt = POSITION_OPTIONS.find((o) => o.value === value);
  return opt ? opt.label : value;
};

const branchColors = {
  violet: { badge: "bg-violet-100 text-violet-700 border-violet-200", card: "border-l-violet-500", header: "bg-violet-50 border-violet-200", icon: "text-violet-600 bg-violet-100", stat: "bg-violet-500" },
  blue: { badge: "bg-blue-100 text-blue-700 border-blue-200", card: "border-l-blue-500", header: "bg-blue-50 border-blue-200", icon: "text-blue-600 bg-blue-100", stat: "bg-blue-500" },
  emerald: { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", card: "border-l-emerald-500", header: "bg-emerald-50 border-emerald-200", icon: "text-emerald-600 bg-emerald-100", stat: "bg-emerald-500" },
  rose: { badge: "bg-rose-100 text-rose-700 border-rose-200", card: "border-l-rose-500", header: "bg-rose-50 border-rose-200", icon: "text-rose-600 bg-rose-100", stat: "bg-rose-500" },
  amber: { badge: "bg-amber-100 text-amber-700 border-amber-200", card: "border-l-amber-500", header: "bg-amber-50 border-amber-200", icon: "text-amber-600 bg-amber-100", stat: "bg-amber-500" },
  gray: { badge: "bg-gray-100 text-gray-700 border-gray-200", card: "border-l-gray-400", header: "bg-gray-50 border-gray-200", icon: "text-gray-600 bg-gray-100", stat: "bg-gray-500" },
};

const normalizeBranch = (branch) => {
  if (!branch) return "";
  const raw = String(branch).trim();
  if (raw === "Sangguniang Kabataan" || raw.toLowerCase() === "sk") return "SK Council";
  if (raw === "Judiciary") return "Lupong Tagapamayapa";
  if (raw === "BPSO" || raw === "Barangay Public Safety Officers") return "Barangay Public Safety Officers (BPSO)";
  return raw;
};

const toBranchArray = (value, fallbackBranch = "Legislative") => {
  let raw = [];

  if (Array.isArray(value)) {
    raw = value;
  } else if (value && typeof value === "object") {
    raw = Object.values(value);
  } else if (typeof value === "string") {
    const text = value.trim();
    if (!text) {
      raw = [];
    } else if (text.startsWith("[") && text.endsWith("]")) {
      try {
        const parsed = JSON.parse(text);
        raw = Array.isArray(parsed) ? parsed : [];
      } catch {
        raw = [text];
      }
    } else if (text.includes(",")) {
      raw = text.split(",").map((item) => item.trim());
    } else {
      raw = [text];
    }
  }

  const normalized = [...new Set(raw.map(normalizeBranch).filter(Boolean))];
  if (normalized.length === 0 && fallbackBranch) return [normalizeBranch(fallbackBranch)];
  return normalized;
};

const getOfficialBranches = (official) => {
  const branchesFromArray = toBranchArray(official.branches, "");
  if (branchesFromArray.length > 0) return branchesFromArray;
  return toBranchArray(official.branch, "Legislative");
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
const AdminPeople = () => {
  const [officials, setOfficials] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedBranches, setCollapsedBranches] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [quickBranchModal, setQuickBranchModal] = useState(null); // {officialId, currentBranch}
  const [filterActive, setFilterActive] = useState("all"); // "all", "active", "inactive"
  const fileInputRef = useRef(null);

  const emptyForm = {
    firstName: "",
    lastName: "",
    middleName: "",
    position: "barangay_kagawad",
    committee: "",
    branch: "Legislative",
    branches: ["Legislative"],
    committeeRef: "",
    committeeRole: "",
    committeeAssignments: [],
    bio: "",
    contactNumber: "",
    email: "",
    officeHours: "",
    education: "",
    isActive: true,
    displayOrder: 0,
  };

  const [formData, setFormData] = useState(emptyForm);

  /* ─── Fetch ─── */
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [offRes, comRes] = await Promise.all([
        axios.get(`${API_URL}/api/officials`),
        axios.get(`${API_URL}/api/committees`),
      ]);
      if (offRes.data.success) setOfficials(offRes.data.data);
      if (comRes.data.success) setCommittees(comRes.data.data);
    } catch (err) {
      toast.error("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Derived data ─── */
  const filteredOfficials = officials.filter((o) => {
    const nameMatch = `${o.firstName} ${o.middleName || ""} ${o.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const activeMatch =
      filterActive === "all" ||
      (filterActive === "active" && o.isActive) ||
      (filterActive === "inactive" && !o.isActive);
    return nameMatch && activeMatch;
  });

  const branchGroups = BRANCHES.map((b) => ({
    ...b,
    members: filteredOfficials
      .filter((o) => {
        const officialBranches = getOfficialBranches(o);
        return officialBranches.includes(normalizeBranch(b.key));
      })
      .sort((a, x) => (a.displayOrder || 0) - (x.displayOrder || 0)),
  }));

  const totalActive = officials.filter((o) => o.isActive).length;
  const totalInactive = officials.filter((o) => !o.isActive).length;

  /* ─── Modal helpers ─── */
  const resetForm = () => {
    setFormData({ ...emptyForm, displayOrder: officials.length });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingOfficial(null);
  };

  const openModal = (official = null, defaultBranch = null) => {
    if (official) {
      const resolvedBranches = getOfficialBranches(official);

      const resolvedAssignments = Array.isArray(official.committeeAssignments) && official.committeeAssignments.length > 0
        ? official.committeeAssignments.map((item) => ({
            committeeRef: item?.committeeRef?._id || item?.committeeRef || "",
            committeeRole: item?.committeeRole || "",
          }))
        : (official.committeeRef
            ? [{
                committeeRef: official.committeeRef?._id || official.committeeRef || "",
                committeeRole: official.committeeRole || "",
              }]
            : []);

      setEditingOfficial(official);
      setFormData({
        firstName: official.firstName || "",
        lastName: official.lastName || "",
        middleName: official.middleName || "",
        position: official.position || "barangay_kagawad",
        committee: official.committee || "",
        branch: resolvedBranches[0] || "Legislative",
        branches: resolvedBranches,
        committeeRef: resolvedAssignments[0]?.committeeRef || "",
        committeeRole: resolvedAssignments[0]?.committeeRole || "",
        committeeAssignments: resolvedAssignments,
        bio: official.bio || "",
        contactNumber: official.contactNumber || "",
        email: official.email || "",
        officeHours: official.officeHours || "",
        education: official.education || "",
        isActive: official.isActive ?? true,
        displayOrder: official.displayOrder || 0,
      });
      setPreviewUrl(official.photo || null);
    } else {
      resetForm();
      if (defaultBranch) {
        setFormData((prev) => ({
          ...prev,
          branch: defaultBranch,
          branches: [defaultBranch],
          displayOrder: officials.length,
        }));
      }
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  /* ─── CRUD ─── */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type))
        return toast.error("JPG/PNG only");
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } };
      const fd = new FormData();

      const normalizedBranches = toBranchArray(formData.branches, formData.branch || "Legislative");
      const primaryBranch = normalizeBranch(formData.branch) || normalizedBranches[0] || "Legislative";
      const orderedBranches = [primaryBranch, ...normalizedBranches.filter((branch) => branch !== primaryBranch)];

      const payload = {
        ...formData,
        branch: primaryBranch,
        branches: orderedBranches,
      };

      Object.entries(payload).forEach(([k, v]) => {
        if (k === "branches" || k === "committeeAssignments") return;
        fd.append(k, typeof v === "boolean" ? v.toString() : String(v ?? ""));
      });

      fd.append("branches", JSON.stringify(orderedBranches));
      fd.append("committeeAssignments", JSON.stringify(formData.committeeAssignments || []));

      if (selectedFile) fd.append("officialPhoto", selectedFile);

      if (editingOfficial) {
        await axios.put(`${API_URL}/api/officials/${editingOfficial._id}`, fd, config);
        toast.success("Official updated");
      } else {
        await axios.post(`${API_URL}/api/officials`, fd, config);
        toast.success("Official created");
      }
      fetchAll();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this official?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/officials/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Official deleted");
      fetchAll();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/officials/${id}/toggle-active`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Status updated");
      fetchAll();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleQuickBranchChange = async (officialId, newBranch) => {
    try {
      const token = localStorage.getItem("token");
      const official = officials.find((o) => o._id === officialId);
      if (!official) return;

      const existingBranches = [...getOfficialBranches(official)];
      const target = normalizeBranch(newBranch);

      if (!existingBranches.includes(target)) {
        existingBranches.push(target);
      } else {
        const reordered = [target, ...existingBranches.filter((branch) => branch !== target)];
        existingBranches.splice(0, existingBranches.length, ...reordered);
      }

      const primaryBranch = existingBranches[0] || normalizeBranch(official.branch) || "Legislative";

      const normalizedAssignments = Array.isArray(official.committeeAssignments) && official.committeeAssignments.length > 0
        ? official.committeeAssignments.map((item) => ({
            committeeRef: item?.committeeRef?._id || item?.committeeRef || "",
            committeeRole: item?.committeeRole || "",
          }))
        : (official.committeeRef
            ? [{
                committeeRef: official.committeeRef?._id || official.committeeRef || "",
                committeeRole: official.committeeRole || "",
              }]
            : []);

      const fd = new FormData();
      Object.entries({
        firstName: official.firstName,
        lastName: official.lastName,
        middleName: official.middleName || "",
        position: official.position,
        committee: official.committee || "",
        branch: primaryBranch,
        branches: JSON.stringify(existingBranches),
        committeeRef: official.committeeRef?._id || official.committeeRef || "",
        committeeRole: official.committeeRole || "",
        committeeAssignments: JSON.stringify(normalizedAssignments),
        bio: official.bio || "",
        contactNumber: official.contactNumber || "",
        email: official.email || "",
        officeHours: official.officeHours || "",
        education: official.education || "",
        isActive: String(official.isActive ?? true),
        displayOrder: String(official.displayOrder || 0),
      }).forEach(([k, v]) => fd.append(k, v));

      await axios.put(`${API_URL}/api/officials/${officialId}`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      const actionLabel = existingBranches[0] === target ? "Set as primary / swapped" : "Added";
      toast.success(`${actionLabel}: ${target}`);
      setQuickBranchModal(null);
      fetchAll();
    } catch (err) {
      toast.error("Failed to change branch");
    }
  };

  /* ─── Toggle branch collapse ─── */
  const toggleBranch = (key) =>
    setCollapsedBranches((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* ═══════ HEADER ═══════ */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="p-2 sm:p-2.5 bg-blue-500/20 rounded-lg sm:rounded-xl">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">People Management</h1>
            </div>
            <p className="text-[11px] sm:text-sm text-blue-200/80">
              Organize personnel by branch, manage positions, and control the organizational structure
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25 text-xs sm:text-sm font-medium"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Personnel
          </button>
        </div>
      </div>

      {/* ═══════ STATS ═══════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold tracking-wider">Total</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{officials.length}</p>
        </div>
        {BRANCHES.filter(b => b.key !== "Other").map((b) => {
          const count = officials.filter((o) => {
            const officialBranches = getOfficialBranches(o);
            return officialBranches.includes(normalizeBranch(b.key));
          }).length;
          const colors = branchColors[b.color];
          return (
            <div key={b.key} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold tracking-wider truncate">{b.key === "Lupong Tagapamayapa" ? "Judiciary" : b.key}</p>
              <div className="flex items-end justify-between mt-1">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                <div className={`w-2 h-6 rounded-full ${colors.stat}`} />
              </div>
            </div>
          );
        })}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-semibold tracking-wider">Active</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">{totalActive}</p>
        </div>
      </div>

      {/* ═══════ TOOLBAR ═══════ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            {["all", "active", "inactive"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterActive(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${filterActive === f ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAll}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ═══════ BRANCH SECTIONS ═══════ */}
      <div className="space-y-4">
        {branchGroups.map((branch) => {
          const colors = branchColors[branch.color];
          const Icon = branch.icon;
          const isCollapsed = collapsedBranches[branch.key];
          if (branch.members.length === 0 && searchTerm) return null;

          return (
            <div key={branch.key} className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              {/* Branch header */}
              <div className={`${colors.header} border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between`}>
                <button
                  onClick={() => toggleBranch(branch.key)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${colors.icon} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{branch.label}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${colors.badge}`}>
                        {branch.members.length}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">{branch.description}</p>
                  </div>
                  {isCollapsed ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
                </button>
                <button
                  onClick={() => openModal(null, branch.key)}
                  className="ml-2 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-500 hover:text-blue-600 transition-colors"
                  title={`Add to ${branch.label}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Members list */}
              {!isCollapsed && (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {branch.members.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No personnel in this branch</p>
                      <button
                        onClick={() => openModal(null, branch.key)}
                        className="mt-3 text-xs text-blue-600 font-semibold hover:underline"
                      >
                        + Add First Member
                      </button>
                    </div>
                  ) : (
                    branch.members.map((person) => (
                      <div
                        key={person._id}
                        className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border-l-4 ${colors.card} ${!person.isActive ? "opacity-50" : ""}`}
                      >
                        {/* Photo */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                          {person.photo ? (
                            <img src={person.photo} alt={person.lastName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {person.firstName} {person.middleName ? `${person.middleName[0]}.` : ""} {person.lastName}
                            </h4>
                            {!person.isActive && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-600">INACTIVE</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {getPositionLabel(person.position)}
                            {person.committee && <span className="text-gray-400"> · {person.committee}</span>}
                          </p>
                          {Array.isArray(person.branches) && person.branches.length > 1 && (
                            <p className="text-[10px] text-gray-400 truncate hidden sm:block">
                              Branches: {person.branches.join(", ")}
                            </p>
                          )}
                          {(person.contactNumber || person.email) && (
                            <p className="text-[10px] text-gray-400 truncate hidden sm:block">
                              {person.contactNumber}{person.contactNumber && person.email ? " · " : ""}{person.email}
                            </p>
                          )}
                        </div>

                        {/* Display order badge */}
                        <div className="hidden md:flex items-center gap-1 text-[10px] text-gray-400">
                          <ArrowUpDown className="w-3 h-3" />
                          #{person.displayOrder || 0}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                        onClick={() => setQuickBranchModal({ officialId: person._id, currentBranch: person.branch, currentBranches: person.branches, name: `${person.firstName} ${person.lastName}` })}
                            className="p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Add branch membership"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(person._id)}
                            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                            title={person.isActive ? "Deactivate" : "Activate"}
                          >
                            {person.isActive ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                          </button>
                          <button
                            onClick={() => openModal(person)}
                            className="p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(person._id)}
                            className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══════ QUICK BRANCH CHANGE MODAL ═══════ */}
      {quickBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setQuickBranchModal(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Add Branch Membership</h3>
            <p className="text-xs text-gray-500 mb-4">
              Add <strong>{quickBranchModal.name}</strong> to another branch
            </p>
            <div className="space-y-2">
              {BRANCHES.map((b) => {
                const Icon = b.icon;
                const colors = branchColors[b.color];
                const currentBranches = Array.isArray(quickBranchModal.currentBranches)
                  ? quickBranchModal.currentBranches
                  : [quickBranchModal.currentBranch].filter(Boolean);
                const normalizedCurrent = toBranchArray(currentBranches, "");
                const targetBranch = normalizeBranch(b.key);
                const isAdded = normalizedCurrent.includes(targetBranch);
                const isPrimary = normalizeBranch(quickBranchModal.currentBranch) === targetBranch;
                return (
                  <button
                    key={b.key}
                    onClick={() => handleQuickBranchChange(quickBranchModal.officialId, b.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      isPrimary
                        ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 cursor-default"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${colors.icon} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{b.label}</p>
                      <p className="text-[10px] text-gray-500">
                        {isPrimary ? "Primary branch" : isAdded ? "Added branch (click to make primary)" : "Not yet added"}
                      </p>
                    </div>
                    {isPrimary && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600">Primary</span>
                    )}
                    {!isPrimary && isAdded && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-600">Added</span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setQuickBranchModal(null)}
              className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ═══════ ADD/EDIT MODAL ═══════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-gray-700">
                <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {editingOfficial ? "Edit Personnel" : "Add New Personnel"}
                </h2>
                <button onClick={closeModal} className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(90vh-8rem)]">
                {/* Photo */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-gray-400" />
                        <span className="text-[10px] sm:text-xs text-gray-500 mt-1">Upload</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/jpg,image/png" className="hidden" />
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5">Click to upload (JPG, PNG, max 5MB)</p>
                </div>

                {/* Name */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                    <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">M.I.</label>
                    <input type="text" value={formData.middleName} onChange={(e) => setFormData({ ...formData, middleName: e.target.value })} className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                  </div>
                </div>

                {/* Position */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position *</label>
                    <select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                      {POSITION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Branch</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => {
                        const newPrimary = e.target.value;
                        const merged = Array.isArray(formData.branches) ? [...formData.branches] : [];
                        if (!merged.includes(newPrimary)) merged.unshift(newPrimary);
                        const ordered = [newPrimary, ...merged.filter((b) => b !== newPrimary)];
                        setFormData({ ...formData, branch: newPrimary, branches: ordered });
                      }}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {BRANCHES.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Multi Branch Membership */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch Memberships (Multi-select)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {BRANCHES.map((b) => {
                      const checked = (formData.branches || []).includes(b.key);
                      return (
                        <label key={b.key} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              let updated = Array.isArray(formData.branches) ? [...formData.branches] : [];
                              if (e.target.checked) {
                                if (!updated.includes(b.key)) updated.push(b.key);
                              } else {
                                updated = updated.filter((item) => item !== b.key);
                              }

                              if (updated.length === 0) {
                                updated = [formData.branch || "Legislative"];
                              }

                              if (!updated.includes(formData.branch)) {
                                updated.unshift(formData.branch);
                              }

                              setFormData({ ...formData, branches: updated });
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{b.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Committee Assignments */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Committee Assignments (Multi)</label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({
                        ...prev,
                        committeeAssignments: [...(prev.committeeAssignments || []), { committeeRef: "", committeeRole: "member" }],
                      }))}
                      className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                      + Add Committee
                    </button>
                  </div>

                  {(formData.committeeAssignments || []).length === 0 ? (
                    <p className="text-xs text-gray-400">No committee assignments yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {(formData.committeeAssignments || []).map((assignment, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40">
                          <div className="sm:col-span-7">
                            <select
                              value={assignment.committeeRef}
                              onChange={(e) => {
                                const updated = [...(formData.committeeAssignments || [])];
                                updated[idx] = { ...updated[idx], committeeRef: e.target.value };
                                setFormData({ ...formData, committeeAssignments: updated });
                              }}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="">Select Committee</option>
                              {committees.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div className="sm:col-span-4">
                            <select
                              value={assignment.committeeRole || ""}
                              onChange={(e) => {
                                const updated = [...(formData.committeeAssignments || [])];
                                updated[idx] = { ...updated[idx], committeeRole: e.target.value };
                                setFormData({ ...formData, committeeAssignments: updated });
                              }}
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              {COMMITTEE_ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                          <div className="sm:col-span-1 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.committeeAssignments || []).filter((_, i) => i !== idx);
                                setFormData({ ...formData, committeeAssignments: updated });
                              }}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                              title="Remove assignment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Number</label>
                    <input type="text" value={formData.contactNumber} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="09xx xxxx xxx" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="email@example.com" />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brief Biography</label>
                  <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[70px]" placeholder="Brief description..." />
                </div>

                {/* Extra */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Office Hours</label>
                    <input type="text" value={formData.officeHours} onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })} className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Mon-Fri 8am-5pm" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Education</label>
                    <input type="text" value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value })} className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g. BS in Law" />
                  </div>
                </div>

                {/* Order & Active */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Order</label>
                    <input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })} className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="0" />
                    <p className="text-[10px] text-gray-500 mt-0.5">Lower = appears first</p>
                  </div>
                  <div className="flex items-center pt-5 sm:pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Active (visible)</span>
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t dark:border-gray-700">
                  <button type="button" onClick={closeModal} className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 shadow-lg shadow-blue-600/25 text-xs sm:text-sm">
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {editingOfficial ? "Update" : "Create"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ INFO ═══════ */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
          <strong>Tip:</strong> Use the <ArrowUpDown className="w-3 h-3 inline" /> button to quickly reassign personnel between branches. Changes are reflected on the public Organizational Chart and Personnel pages.
        </p>
      </div>
    </div>
  );
};

export default AdminPeople;
