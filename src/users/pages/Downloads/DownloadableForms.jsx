import React, { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Download, FileText, ShieldCheck } from "lucide-react";

const tabConfig = [
  {
    key: "ordinance",
    label: "Barangay Ordinance",
    title: "Barangay Ordinances",
    description:
      "Browse ordinance documents issued by Barangay Culiat. Downloadable files will be uploaded here soon.",
    files: [
      {
        id: "ord-001",
        title: "Barangay Ordinance No. 001 (Sample)",
        summary: "Sample placeholder for ordinance PDF file.",
        date: "March 2026",
      },
      {
        id: "ord-002",
        title: "Barangay Ordinance No. 002 (Sample)",
        summary: "Sample placeholder for ordinance PDF file.",
        date: "March 2026",
      },
    ],
  },
  {
    key: "executive-orders",
    label: "Executive Orders",
    title: "Executive Orders",
    description:
      "Access executive orders relevant to programs, directives, and community implementation.",
    files: [
      {
        id: "eo-001",
        title: "Executive Order No. 001 (Sample)",
        summary: "Sample placeholder for executive order PDF file.",
        date: "March 2026",
      },
      {
        id: "eo-002",
        title: "Executive Order No. 002 (Sample)",
        summary: "Sample placeholder for executive order PDF file.",
        date: "March 2026",
      },
    ],
  },
  {
    key: "resolutions",
    label: "Barangay Resolutions",
    title: "Barangay Resolutions",
    description:
      "Review barangay resolutions adopted for governance, community policy direction, and official actions.",
    files: [
      {
        id: "res-001",
        title: "Barangay Resolution No. 001 (Sample)",
        summary: "Sample placeholder for barangay resolution PDF file.",
        date: "March 2026",
      },
      {
        id: "res-002",
        title: "Barangay Resolution No. 002 (Sample)",
        summary: "Sample placeholder for barangay resolution PDF file.",
        date: "March 2026",
      },
    ],
  },
];

const DownloadableForms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab") || "ordinance";
  const activeTab = rawTab === "memo" ? "resolutions" : rawTab;

  const selectedTab = useMemo(() => {
    return tabConfig.find((tab) => tab.key === activeTab) || tabConfig[0];
  }, [activeTab]);

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 pt-32 pb-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <nav className="flex items-center justify-center text-white/75 text-xs sm:text-sm mb-4 gap-2">
              <Link to="/" className="hover:text-white transition-colors">
                HOME
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-semibold">DOWNLOADABLE FORMS</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Downloadable Forms</h1>
            <p className="text-white/90 max-w-3xl mx-auto text-sm sm:text-base">
              Official barangay documents available for viewing and download. Select a category to browse files.
            </p>
          </motion.div>
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-24 text-gray-50" viewBox="0 0 1200 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0,50 Q 300,0 600,50 T 1200,50 L 1200,100 L 0,100 Z" fill="currentColor" />
        </svg>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {tabConfig.map((tab) => {
              const isActive = tab.key === selectedTab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    isActive
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:text-emerald-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <motion.div
          key={selectedTab.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{selectedTab.title}</h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">{selectedTab.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-8">
            {selectedTab.files.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5 hover:border-emerald-300 hover:bg-white transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{item.summary}</p>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-2">Updated: {item.date}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full font-medium">
                    Placeholder PDF
                  </span>
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-200 text-gray-500 text-xs sm:text-sm font-semibold cursor-not-allowed"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default DownloadableForms;