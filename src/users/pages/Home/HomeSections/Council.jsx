import React, { useState, useEffect } from "react";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { User } from "lucide-react";
import ImageHover from "../../../../components/Animation/ImageHover";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Position labels for display
const positionLabels = {
  barangay_captain: "Barangay Captain",
  barangay_kagawad: "Barangay Kagawad",
  sk_chairman: "SK Chairman",
  barangay_secretary: "Barangay Secretary",
  barangay_treasurer: "Barangay Treasurer",
  administrative_officer: "Administrative Officer",
  deputy_officer: "Deputy Officer",
  other: "Official",
};

const Council = () => {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficials();
  }, []);

  const fetchOfficials = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/officials`);
      if (response.data.success) {
        // Filter to get only active kagawads and other officials (not captain)
        const councilMembers = response.data.data.filter(
          (official) => official.position !== "barangay_captain" && official.isActive
        );
        setOfficials(councilMembers);
      }
    } catch (error) {
      console.error("Failed to fetch officials:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get full name
  const getFullName = (official) => {
    const parts = [official.firstName];
    if (official.middleName) parts.push(official.middleName.charAt(0) + ".");
    parts.push(official.lastName);
    return parts.join(" ");
  };

  // Helper to get position label
  const getPositionLabel = (position) => {
    return positionLabels[position] || position;
  };

  return (
    <section className="py-20 bg-neutral overflow-hidden " id="council">
      <div className="max-w-6xl mx-auto  px-4">
        {/* --- Barangay Captain Section --- */}
        <div className="flex flex-wrap-reverse items-center gap-12 md:gap-[5em] justify-between mb-20 ">
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
            className="flex-1 basis-xs"
          >
            <h3 className="text-3xl md:text-5xl font-extrabold text-secondary mb-6">
              Meet the Barangay Captain of Culiat
            </h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              Hon. Cristina V. Benardino has dedicated over 15 years to public
              service, fostering inclusive growth and transparency in Barangay
              Culiat. Her leadership continues to uplift families and empower
              community-driven initiatives.
            </p>
            <p className="text-text-secondary leading-relaxed mb-4">
              Focused on health, education, and local livelihood, she ensures
              that every citizen has a voice in shaping a progressive and
              sustainable Barangay.
            </p>

            <div className="border-l-4 border-accent pl-4 mt-6">
              <p className="italic text-lg text-text-color mb-1">
                “Leadership through Service”
              </p>
              <p className="text-sm text-text-secondary">
                — Hon. Cristina V. Benardino, Barangay Captain
              </p>
            </div>
          </motion.div>
          {/* Right Image */}
          <div className="flex-1 relative md:min-h-[480px] basis-xs ">
            {/* Right-side image (slides from right) */}
            {/* <motion.div
              initial={{ opacity: 0.5, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.3 }}
              className="cursor-brgy"
            >
              <div className="relative rounded-xl max-h-[620px] md:max-h-[550px] overflow-hidden shadow-2xl">
                <img
                  src="https://scontent.fmnl17-5.fna.fbcdn.net/v/t39.30808-6/481457033_572251952496279_7892937193905517506_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFaK-ibay8cIHBFxkUFcIbhzhiO2cMa6FXOGI7ZwxroVVI1A9G1A9znzggGOFQQX6fHThuXEpK_9tsQaCX11YuY&_nc_ohc=-rF4C6SYRwkQ7kNvwHwHvya&_nc_oc=Adm8DOLnIB5GRfsDEJCnnU69qMNqM0iquiFYZLYNjJAsJcpuThTLQ7ZXWstfZWehpnI&_nc_zt=23&_nc_ht=scontent.fmnl17-5.fna&_nc_gid=m9LXVWFuYpzb7zQHOde-Hg&oh=00_AffyW6R7NNHc8w2fQA8HFyBEQcV-_hvatplm5KmGMSwMVQ&oe=69017FB0"
                  alt="Barangay Captain"
                  className="w-full  object-top-right"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"></div>
              </div>
            </motion.div> */}
            <ImageHover />
            {/* Left-side image (slides from below) */}
            {/* <motion.div
              initial={{ opacity: 0, y: 200 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.3 }}
              className="absolute top-16 left-0 z-10"
            >
              <div className="relative w-[85%] rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="https://scontent.fmnl17-5.fna.fbcdn.net/v/t39.30808-6/480878973_570497736005034_381990214192133786_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHtDp-vrSFno1oeWdhqvswYXQoAJ3f-Q9RdCgAnd_5D1L6HlIQGcFWF1smpTQ-XHYEJbFmeiDuCsLMYI9zFZIw4&_nc_ohc=AXh3JsccRk8Q7kNvwGdN4qc&_nc_oc=Adl8-nnEWQtwdifICXTTH-BdHKB9WfG8SoKCfmoWi0eZafTno_20jJ2Q5YnJqyeE88c&_nc_zt=23&_nc_ht=scontent.fmnl17-5.fna&_nc_gid=GTOJeBmXjGYa_JydCOslkg&oh=00_AfejW7zuaaMWEsduh6WqMUTbZZxlwKpF0b0_0SozmerhOg&oe=69017105"
                  alt="Barangay Captain"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute  inset-0 bg-linear-to-t from-black/30 to-transparent"></div>
              </div>
            </motion.div> */}
          </div>
        </div>

        {/* --- Council Members Grid (Hierarchical Layout) --- */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h3 className="text-center text-2xl font-bold text-text-color mb-10">
            Our Dedicated Council Members
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : officials.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {officials.map((official, index) => (
                <motion.div
                  key={official._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-md border border-gray-100 text-center p-5 hover:shadow-lg transition-shadow"
                >
                  {/* Official Image or Fallback Icon */}
                  <div className="mx-auto mb-4 flex items-center justify-center">
                    {official.photo ? (
                      <img
                        src={official.photo}
                        alt={getFullName(official)}
                        className="w-24 h-24 rounded-full object-cover border-3 border-blue-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-3 border-gray-200">
                        <User size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h4 className="font-bold text-secondary text-sm mb-1">
                    Hon. {getFullName(official)}
                  </h4>

                  {/* Position */}
                  <p className="text-xs text-primary font-semibold mb-1">
                    {getPositionLabel(official.position)}
                  </p>

                  {/* Committee */}
                  {official.committee && (
                    <p className="text-xs text-gray-500">
                      {official.committee}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No council members available</p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Council;
