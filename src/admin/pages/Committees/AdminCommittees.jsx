import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  Users,
  UserCheck,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  Calendar,
  Image,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const RichTextEditor = ({ label, value, onChange, placeholder }) => {
  const editorRef = useRef(null);

  const applyCommand = (command, commandValue = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl overflow-hidden bg-white dark:bg-gray-700">
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/60">
          <button
            type="button"
            onClick={() => applyCommand("bold")}
            className="px-2 py-1 text-xs font-semibold rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => applyCommand("italic")}
            className="px-2 py-1 text-xs italic rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => applyCommand("underline")}
            className="px-2 py-1 text-xs underline rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="Underline"
          >
            U
          </button>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            type="button"
            onClick={() => applyCommand("justifyLeft")}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="Align Left"
          >
            Left
          </button>
          <button
            type="button"
            onClick={() => applyCommand("justifyCenter")}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="Align Center"
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => applyCommand("justifyRight")}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="Align Right"
          >
            Right
          </button>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            type="button"
            onClick={() => applyCommand("insertUnorderedList")}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="Bulleted List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => applyCommand("insertOrderedList")}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="Numbered List"
          >
            1. List
          </button>

          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

          <input
            type="color"
            onChange={(e) => applyCommand("foreColor", e.target.value)}
            className="w-7 h-7 rounded border border-gray-300 dark:border-gray-600 bg-transparent cursor-pointer"
            title="Text Color"
          />
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[120px] p-3 text-sm text-gray-900 dark:text-white focus:outline-none"
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: value || "" }}
          data-placeholder={placeholder}
          style={{
            whiteSpace: "pre-wrap",
          }}
        />
      </div>
      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
        Supports bold, italic, underline, alignment, bullets, numbered lists, and text color.
      </p>
    </div>
  );
};

const AdminCommittees = () => {
  const [committees, setCommittees] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [accomplishmentsByCommittee, setAccomplishmentsByCommittee] = useState(
    {}
  );
  const [accomplishmentsLoading, setAccomplishmentsLoading] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    nameEnglish: "",
    description: "",
    description2: "",
    responsibilities: [""],
    chairperson: "",
    coChairperson: "",
    members: [],
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchCommittees();
    fetchOfficials();
  }, []);

  const fetchCommittees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/committees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setCommittees(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch committees");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficials = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/officials`);
      if (response.data.success) {
        setOfficials(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch officials", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nameEnglish: "",
      description: "",
      description2: "",
      responsibilities: [""],
      chairperson: "",
      coChairperson: "",
      members: [],
      displayOrder: committees.length,
      isActive: true,
    });
    setEditingCommittee(null);
  };

  const openModal = (committee = null) => {
    if (committee) {
      setEditingCommittee(committee);
      setFormData({
        name: committee.name || "",
        nameEnglish: committee.nameEnglish || "",
        description: committee.description || "",
        description2: committee.description2 || "",
        responsibilities:
          committee.responsibilities?.length > 0
            ? [...committee.responsibilities]
            : [""],
        chairperson: committee.chairperson?._id || committee.chairperson || "",
        coChairperson:
          committee.coChairperson?._id || committee.coChairperson || "",
        members: committee.members
          ? committee.members.map((m) => m._id || m)
          : [],
        displayOrder: committee.displayOrder || 0,
        isActive: committee.isActive ?? true,
      });
    } else {
      resetForm();
      setFormData((prev) => ({ ...prev, displayOrder: committees.length }));
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      // Clean up responsibilities - remove empty strings
      const cleanData = {
        ...formData,
        responsibilities: formData.responsibilities.filter(
          (r) => r.trim() !== ""
        ),
        chairperson: formData.chairperson || undefined,
        coChairperson: formData.coChairperson || undefined,
        members: formData.members.length > 0 ? formData.members : [],
      };

      // Remove undefined fields
      if (!cleanData.chairperson) delete cleanData.chairperson;
      if (!cleanData.coChairperson) delete cleanData.coChairperson;

      if (editingCommittee) {
        await axios.put(
          `${API_URL}/api/committees/${editingCommittee._id}`,
          cleanData,
          config
        );
        toast.success("Committee updated successfully");
      } else {
        await axios.post(`${API_URL}/api/committees`, cleanData, config);
        toast.success("Committee created successfully");
      }

      fetchCommittees();
      closeModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save committee"
      );
      console.error("Error saving committee:", error.response?.data || error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this committee?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/committees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Committee deleted successfully");
      fetchCommittees();
    } catch (error) {
      toast.error("Failed to delete committee");
      console.error(error);
    }
  };

  const handleToggleActive = async (committee) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/committees/${committee._id}`,
        { isActive: !committee.isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(
        `Committee ${!committee.isActive ? "activated" : "deactivated"}`
      );
      fetchCommittees();
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const fetchCommitteeAccomplishments = async (committeeId) => {
    if (!committeeId) return;
    if (accomplishmentsByCommittee[committeeId]) return;

    try {
      setAccomplishmentsLoading((prev) => ({ ...prev, [committeeId]: true }));
      const response = await axios.get(
        `${API_URL}/api/committees/${committeeId}/accomplishments`
      );
      if (response.data.success) {
        setAccomplishmentsByCommittee((prev) => ({
          ...prev,
          [committeeId]: response.data.data || [],
        }));
      }
    } catch (error) {
      console.error("Failed to fetch committee accomplishments", error);
      setAccomplishmentsByCommittee((prev) => ({
        ...prev,
        [committeeId]: [],
      }));
    } finally {
      setAccomplishmentsLoading((prev) => ({ ...prev, [committeeId]: false }));
    }
  };

  const handleToggleExpandedCard = (committeeId) => {
    if (expandedCard === committeeId) {
      setExpandedCard(null);
      return;
    }

    setExpandedCard(committeeId);
    fetchCommitteeAccomplishments(committeeId);
  };

  // Responsibility helpers
  const addResponsibility = () => {
    setFormData((prev) => ({
      ...prev,
      responsibilities: [...prev.responsibilities, ""],
    }));
  };

  const removeResponsibility = (index) => {
    setFormData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }));
  };

  const updateResponsibility = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.responsibilities];
      updated[index] = value;
      return { ...prev, responsibilities: updated };
    });
  };

  // Member multi-select helpers
  const toggleMember = (officialId) => {
    setFormData((prev) => {
      const exists = prev.members.includes(officialId);
      return {
        ...prev,
        members: exists
          ? prev.members.filter((id) => id !== officialId)
          : [...prev.members, officialId],
      };
    });
  };

  const getOfficialName = (officialIdOrObj) => {
    if (!officialIdOrObj) return "Not assigned";
    if (typeof officialIdOrObj === "object" && officialIdOrObj.firstName) {
      return `${officialIdOrObj.firstName} ${officialIdOrObj.lastName}`;
    }
    const official = officials.find((o) => o._id === officialIdOrObj);
    return official
      ? `${official.firstName} ${official.lastName}`
      : "Not assigned";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-900 via-green-900 to-slate-900 p-4 sm:p-6 md:p-8">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="p-2 sm:p-2.5 bg-green-500/20 rounded-lg sm:rounded-xl">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                Committees
              </h1>
            </div>
            <p className="text-[11px] sm:text-sm text-green-200/80">
              Manage barangay committees, members, and responsibilities
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/25 text-xs sm:text-sm font-medium"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Committee
          </button>
        </div>
      </div>

      {/* Committees List */}
      {committees.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 dark:bg-gray-700 rounded-full mb-3 sm:mb-4">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
            No Committees Yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            Start by adding your first committee
          </p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/25 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add First Committee
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {committees.map((committee) => (
            <div
              key={committee._id}
              className={`bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-all ${
                !committee.isActive ? "opacity-60" : ""
              }`}
            >
              {/* Card Header */}
              <div className="p-3 sm:p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg truncate">
                        {committee.name}
                      </h3>
                      <span
                        className={`shrink-0 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-medium ${
                          committee.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {committee.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {committee.nameEnglish && (
                      <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {committee.nameEnglish}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        <ListOrdered className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Order: {committee.displayOrder}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Chair:{" "}
                        {getOfficialName(committee.chairperson)}
                      </span>
                      {committee.members?.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {committee.members.length} member
                          {committee.members.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleExpandedCard(committee._id)}
                      className="p-1.5 sm:p-2 rounded-lg border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      title="Toggle details"
                    >
                      {expandedCard === committee._id ? (
                        <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleActive(committee)}
                      className="p-1.5 sm:p-2 rounded-lg border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      title={
                        committee.isActive ? "Deactivate" : "Activate"
                      }
                    >
                      {committee.isActive ? (
                        <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => openModal(committee)}
                      className="p-1.5 sm:p-2 rounded-lg border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(committee._id)}
                      className="p-1.5 sm:p-2 rounded-lg border dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCard === committee._id && (
                <div className="border-t dark:border-gray-700 px-3 sm:px-4 md:px-5 py-3 sm:py-4 bg-gray-50/50 dark:bg-gray-800/50 space-y-3">
                  {/* Description */}
                  {committee.description && (
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Description 1
                      </h4>
                      <div
                        className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: committee.description }}
                      />
                    </div>
                  )}

                  {committee.description2 && (
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Description 2
                      </h4>
                      <div
                        className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: committee.description2 }}
                      />
                    </div>
                  )}

                  {/* Responsibilities */}
                  {committee.responsibilities?.length > 0 && (
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Responsibilities
                      </h4>
                      <ul className="list-disc list-inside space-y-0.5">
                        {committee.responsibilities.map((resp, i) => (
                          <li
                            key={i}
                            className="text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                          >
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Leadership */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Chairperson
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        {getOfficialName(committee.chairperson)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Co-Chairperson
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        {getOfficialName(committee.coChairperson)}
                      </p>
                    </div>
                  </div>

                  {/* Members */}
                  {committee.members?.length > 0 && (
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Members
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {committee.members.map((member) => (
                          <span
                            key={member._id || member}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-[10px] sm:text-xs font-medium"
                          >
                            {getOfficialName(member)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accomplishments (linked announcements) */}
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Accomplishments
                    </h4>

                    {accomplishmentsLoading[committee._id] ? (
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Loading accomplishments...
                      </div>
                    ) : (accomplishmentsByCommittee[committee._id] || []).length ===
                      0 ? (
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        No linked announcements yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {(accomplishmentsByCommittee[committee._id] || []).map(
                          (item) => {
                            const coverImage = item.images?.[0] || item.image;
                            return (
                              <div
                                key={item._id}
                                className="rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
                              >
                                {coverImage ? (
                                  <div className="h-28 sm:h-32 bg-gray-100 dark:bg-gray-700">
                                    <img
                                      src={coverImage}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-28 sm:h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <Image className="w-6 h-6 sm:w-7 sm:h-7 text-gray-400" />
                                  </div>
                                )}

                                <div className="p-2.5 sm:p-3">
                                  <h5 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                                    {item.title}
                                  </h5>
                                  <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                    {item.content}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(
                                        item.eventDate || item.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                    <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                      {item.category || "General"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-gray-700">
                <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {editingCommittee
                    ? "Edit Committee"
                    : "Add New Committee"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form
                onSubmit={handleSubmit}
                className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(90vh-8rem)]"
              >
                {/* Committee Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Committee Name (Filipino) *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g. Komite sa Kapayapaan"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Committee Name (English)
                    </label>
                    <input
                      type="text"
                      value={formData.nameEnglish}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nameEnglish: e.target.value,
                        })
                      }
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g. Committee on Peace and Order"
                    />
                  </div>
                </div>

                {/* Description 1 */}
                <RichTextEditor
                  label="Description 1"
                  value={formData.description}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      description: value,
                    })
                  }
                  placeholder="Brief description of the committee's purpose..."
                />

                {/* Description 2 (Optional) */}
                <RichTextEditor
                  label="Description 2 (Optional)"
                  value={formData.description2}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      description2: value,
                    })
                  }
                  placeholder="Additional committee details..."
                />

                {/* Responsibilities */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                      Responsibilities
                    </label>
                    <button
                      type="button"
                      onClick={addResponsibility}
                      className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                    >
                      <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.responsibilities.map((resp, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={resp}
                          onChange={(e) =>
                            updateResponsibility(index, e.target.value)
                          }
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder={`Responsibility ${index + 1}`}
                        />
                        {formData.responsibilities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeResponsibility(index)}
                            className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leadership Assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Chairperson
                    </label>
                    <select
                      value={formData.chairperson}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          chairperson: e.target.value,
                        })
                      }
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">None</option>
                      {officials
                        .filter((o) => o.isActive)
                        .map((official) => (
                          <option key={official._id} value={official._id}>
                            {official.firstName} {official.lastName} —{" "}
                            {official.position
                              ?.replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Co-Chairperson
                    </label>
                    <select
                      value={formData.coChairperson}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          coChairperson: e.target.value,
                        })
                      }
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">None</option>
                      {officials
                        .filter((o) => o.isActive)
                        .map((official) => (
                          <option key={official._id} value={official._id}>
                            {official.firstName} {official.lastName} —{" "}
                            {official.position
                              ?.replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Members Multi-Select */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Committee Members
                  </label>
                  {/* Selected members pills */}
                  {formData.members.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {formData.members.map((memberId) => {
                        const official = officials.find(
                          (o) => o._id === memberId
                        );
                        return (
                          <span
                            key={memberId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-[10px] sm:text-xs font-medium"
                          >
                            {official
                              ? `${official.firstName} ${official.lastName}`
                              : memberId}
                            <button
                              type="button"
                              onClick={() => toggleMember(memberId)}
                              className="ml-0.5 hover:text-red-600"
                            >
                              <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {/* Scrollable checkbox list */}
                  <div className="border dark:border-gray-600 rounded-lg sm:rounded-xl max-h-36 overflow-y-auto">
                    {officials
                      .filter((o) => o.isActive)
                      .map((official) => (
                        <label
                          key={official._id}
                          className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b last:border-b-0 dark:border-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={formData.members.includes(official._id)}
                            onChange={() => toggleMember(official._id)}
                            className="w-3.5 h-3.5 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                          />
                          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            {official.firstName} {official.lastName}
                            <span className="text-gray-400 dark:text-gray-500 ml-1">
                              —{" "}
                              {official.position
                                ?.replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          </span>
                        </label>
                      ))}
                    {officials.filter((o) => o.isActive).length === 0 && (
                      <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                        No active officials found
                      </p>
                    )}
                  </div>
                </div>

                {/* Display Order & Active Status */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          displayOrder: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                    />
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                      Lower = appears first
                    </p>
                  </div>
                  <div className="flex items-center pt-5 sm:pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-green-600 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500"
                      />
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        Active (visible)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t dark:border-gray-700">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 sm:gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:bg-green-700 disabled:bg-green-400 shadow-lg shadow-green-600/25 text-xs sm:text-sm"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {editingCommittee ? "Update" : "Create"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 sm:mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-green-800 dark:text-green-300">
          <strong>Note:</strong> Active committees are displayed on the public
          Committees page. Assign chairpersons and members from the list of
          barangay officials.
        </p>
      </div>
    </div>
  );
};

export default AdminCommittees;
