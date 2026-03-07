import {
  FileText,
  Home,
  BadgeCheck,
  Building2,
  HandCoins,
  Hammer,
  HeartHandshake,
  Shield,
  Heart,
  Trees,
  Briefcase,
  XCircle,
  Scale,
  Wrench,
  Zap,
  CreditCard,
  UserCheck,
  Landmark,
  Church,
  Truck,
} from "lucide-react";

/**
 * Master list of all barangay services with their requirements,
 * descriptions, procedures and tips.
 *
 * Each key is the URL slug  →  /services/:slug
 */
const servicesData = {
  /* ─────────────────── CERTIFICATES ─────────────────── */

  "certificate-of-indigency": {
    title: "Certificate of Indigency",
    slug: "certificate-of-indigency",
    icon: HeartHandshake,
    category: "Certificates",
    tagline:
      "Proof of economic status for medical, educational, and government assistance programs.",
    description:
      "A Certificate of Indigency is an official document issued by the Barangay certifying that the requesting individual is a bonafide resident of the barangay and belongs to the indigent sector. This certificate is commonly required for availing free medical assistance, educational scholarships, government aid programs, and other social services. The barangay issues this free of charge to help residents access the support they need.",
    fee: "Free",
    processingTime: "Same day",
    requirements: [
      "Photocopy of Government-issued ID or QC ID (must be a Culiat resident)",
      "Endorsement Letter from Purok Leader or HOA Officer",
      "Medical Abstract (if requesting for medical assistance)",
    ],
    procedure: [
      {
        step: 1,
        title: "Prepare Documents",
        description:
          "Gather a photocopy of your valid government ID and secure an endorsement letter from your Purok Leader or HOA Officer. If applying for medical assistance, bring your medical abstract.",
      },
      {
        step: 2,
        title: "Visit the Barangay Hall",
        description:
          "Go to the Barangay Hall and proceed to the designated clearance/certificate window. Inform the staff that you are requesting a Certificate of Indigency.",
      },
      {
        step: 3,
        title: "Submit Requirements",
        description:
          "Hand over your documents to the barangay personnel for verification. They will review your endorsement letter and ID.",
      },
      {
        step: 4,
        title: "Processing",
        description:
          "The barangay staff will verify your details, check residency records, and prepare the certificate. This is typically processed on the same day.",
      },
      {
        step: 5,
        title: "Claim Your Certificate",
        description:
          "Once processed, the certificate is printed, signed by the Barangay Captain or authorized official, and handed to you. No fee is required.",
      },
    ],
    tips: [
      {
        title: "Bring Original ID",
        description:
          "While a photocopy is submitted, bring your original ID for verification purposes.",
      },
      {
        title: "Visit During Office Hours",
        description:
          "Barangay offices generally operate on weekdays, 8:00 AM to 5:00 PM. No lunch break.",
      },
      {
        title: "Get Endorsement First",
        description:
          "Secure your endorsement letter from your Purok Leader before visiting the Barangay Hall to avoid multiple trips.",
      },
    ],
  },

  "burial-financial-assistance": {
    title: "Burial / Financial Assistance",
    slug: "burial-financial-assistance",
    icon: Heart,
    category: "Social Services",
    tagline:
      "Financial support for bereaved families to help cover funeral and burial expenses.",
    description:
      "The Barangay provides burial and financial assistance to residents who have lost a loved one. This program aims to ease the financial burden during difficult times by providing monetary or logistical support for funeral arrangements. Eligible residents can apply by presenting the required documents to the Barangay Hall.",
    fee: "Free",
    processingTime: "1–3 business days",
    requirements: [
      "Photocopy of Government-issued ID or QC ID of the person filing AND the deceased (must be Culiat residents)",
      "Endorsement Letter from Purok Leader or HOA Officer",
      "Death Certificate",
    ],
    procedure: [
      {
        step: 1,
        title: "Prepare Documents",
        description:
          "Gather photocopies of valid IDs for both the applicant and the deceased, along with the death certificate and an endorsement letter.",
      },
      {
        step: 2,
        title: "Visit the Barangay Hall",
        description:
          "Proceed to the Barangay Hall and inform the staff about your request for burial or financial assistance.",
      },
      {
        step: 3,
        title: "Submit Requirements",
        description:
          "Present all required documents to the designated officer. They will verify the information and confirm residency.",
      },
      {
        step: 4,
        title: "Assessment & Processing",
        description:
          "The barangay assesses your application and processes the assistance. Processing time may vary depending on available funds and queue.",
      },
      {
        step: 5,
        title: "Receive Assistance",
        description:
          "Once approved, you will be notified to claim the financial assistance or receive information about funeral support services.",
      },
    ],
    tips: [
      {
        title: "Apply Promptly",
        description:
          "File your request as soon as possible after the passing to ensure timely processing of assistance.",
      },
      {
        title: "Complete Documentation",
        description:
          "Ensure all documents are complete and accurate to avoid delays in processing.",
      },
      {
        title: "Ask About Additional Aid",
        description:
          "Inquire about other government aid programs (DSWD, city social services) that may provide additional support.",
      },
    ],
  },

  "certificate-of-residency": {
    title: "Certificate of Residency",
    slug: "certificate-of-residency",
    icon: Home,
    category: "Certificates",
    tagline:
      "Official proof that you are a bonafide resident of Barangay Culiat.",
    description:
      "A Certificate of Residency is an official document issued by the Barangay confirming that the individual is a current resident of the barangay. This certificate is commonly required for employment applications, school enrollments, utility connections, government transactions, and other legal purposes. It serves as a reliable proof of address and residency within the barangay's jurisdiction.",
    fee: "₱50",
    processingTime: "Same day",
    requirements: [
      "Photocopy of Government-issued ID or QC ID (must be a Culiat resident)",
      "Endorsement Letter from Purok Leader or HOA Officers",
    ],
    procedure: [
      {
        step: 1,
        title: "Prepare Documents",
        description:
          "Get a photocopy of your valid government-issued ID and secure an endorsement letter from your Purok Leader or HOA Officer.",
      },
      {
        step: 2,
        title: "Go to Barangay Hall",
        description:
          "Visit the Barangay Hall and proceed to the certificates counter. Inform personnel you need a Certificate of Residency.",
      },
      {
        step: 3,
        title: "Submit & Pay Fee",
        description:
          "Submit your documents and pay the required fee. The staff will issue a receipt.",
      },
      {
        step: 4,
        title: "Processing",
        description:
          "Staff verifies your details against barangay records and prepares the certificate.",
      },
      {
        step: 5,
        title: "Claim Certificate",
        description:
          "The certificate is printed, signed, and released to you — usually within a few minutes.",
      },
    ],
    tips: [
      {
        title: "Prepare Exact Change",
        description:
          "Bring the exact amount for the fee to speed up your transaction.",
      },
      {
        title: "Visit Early",
        description:
          "Arrive early in the morning to avoid long queues, especially during peak days (Mondays and Fridays).",
      },
      {
        title: "Confirm Requirements",
        description:
          "Call or visit beforehand to confirm the exact requirements and fees.",
      },
    ],
  },

  "cohabitation-jail-visitation-pao": {
    title: "Cohabitation / Jail Visitation / PAO",
    slug: "cohabitation-jail-visitation-pao",
    icon: Scale,
    category: "Legal Services",
    tagline:
      "Certificates for cohabitation proof, jail visitation permits, and Public Attorney's Office referrals.",
    description:
      "These certificates serve different legal and social purposes: Cohabitation certificates prove that two individuals are living together in the same household. Jail visitation certificates allow relatives to visit incarcerated family members. PAO referral certificates provide access to free legal services from the Public Attorney's Office. Each certificate requires residency verification and endorsement from local community leaders.",
    fee: "Varies",
    processingTime: "Same day",
    requirements: [
      "Photocopy of Government-issued ID or QC ID (must be a Culiat resident)",
      "Endorsement Letter from Purok Leader or HOA Officers",
      "Letter from Purok Leader / HOA Officers (Pagpapatunay / Certification)",
    ],
    procedure: [
      {
        step: 1,
        title: "Prepare Documents",
        description:
          "Secure your government ID photocopy, endorsement letter, and a certification letter from your Purok Leader or HOA Officer as proof.",
      },
      {
        step: 2,
        title: "Visit Barangay Hall",
        description:
          "Go to the Barangay Hall and specify which certificate you need — Cohabitation, Jail Visitation, or PAO referral.",
      },
      {
        step: 3,
        title: "Submit Requirements",
        description:
          "Present all required documents. The staff will verify the information and your residency status.",
      },
      {
        step: 4,
        title: "Processing",
        description:
          "The barangay verifies your request, checks for any pending issues, and prepares the appropriate certificate.",
      },
      {
        step: 5,
        title: "Issuance",
        description:
          "Once prepared, the certificate is signed by the authorized official and released to you.",
      },
    ],
    tips: [
      {
        title: "Specify Your Need",
        description:
          "Clearly state which type of certificate you need when you arrive to speed up the process.",
      },
      {
        title: "Bring Companion",
        description:
          "For cohabitation certificates, both parties may need to be present for verification.",
      },
      {
        title: "Check With PAO",
        description:
          "For PAO referrals, check the PAO office schedule first so your certificate is still valid when you visit.",
      },
    ],
  },

  missionary: {
    title: "Missionary Certificate",
    slug: "missionary",
    icon: Church,
    category: "Special Certificates",
    tagline:
      "Certification for foreign missionary workers residing in the barangay.",
    description:
      "A Missionary Certificate is issued to foreign nationals who are conducting missionary or religious work within the barangay. This certificate confirms their residency status and endorses their legitimate presence in the community. It is typically required for visa extensions, reporting to immigration authorities, and proving community engagement.",
    fee: "Varies",
    processingTime: "1–2 business days",
    requirements: [
      "Endorsement Letter from Purok Leader or HOA Officers",
      "ACR ID (Alien Certificate of Registration)",
      "Passport",
    ],
    procedure: [
      {
        step: 1,
        title: "Prepare Documents",
        description:
          "Gather your ACR ID, passport, and an endorsement letter from your Purok Leader or HOA Officer certifying your residency.",
      },
      {
        step: 2,
        title: "Visit Barangay Hall",
        description:
          "Go to the Barangay Hall and request a Missionary Certificate from the certificates counter.",
      },
      {
        step: 3,
        title: "Document Verification",
        description:
          "Barangay staff will verify your identity documents, ACR, and passport details against their records.",
      },
      {
        step: 4,
        title: "Processing",
        description:
          "The certificate is prepared and forwarded for the Barangay Captain's signature.",
      },
      {
        step: 5,
        title: "Claim Certificate",
        description:
          "Return to the Barangay Hall on the designated date to claim your signed Missionary Certificate.",
      },
    ],
    tips: [
      {
        title: "Bring Originals",
        description:
          "Have your original ACR ID and passport with you for verification — not just photocopies.",
      },
      {
        title: "Coordinate With Church",
        description:
          "Your affiliated religious organization may provide additional endorsement that speeds up processing.",
      },
      {
        title: "Check ACR Validity",
        description:
          "Ensure your ACR ID is current and not expired before applying.",
      },
    ],
  },

  "tru-tfb": {
    title: "TRU / TFB Certification",
    slug: "tru-tfb",
    icon: Truck,
    category: "Transport & Permits",
    tagline:
      "Certification for tricycle operators as required by TODA regulations.",
    description:
      "TRU (Tricycle Regulatory Unit) and TFB certifications are required for tricycle operators and drivers within the barangay. This certification is issued as part of the regulatory process for registered TODA (Tricycle Operators and Drivers Association) members. It confirms the operator's legitimacy and compliance with local transportation regulations.",
    fee: "Varies",
    processingTime: "Same day",
    requirements: [
      "Certification from your TODA (Tricycle Operators and Drivers Association)",
    ],
    procedure: [
      {
        step: 1,
        title: "Get TODA Certification",
        description:
          "Obtain a certification from your registered TODA confirming your membership and operational status.",
      },
      {
        step: 2,
        title: "Visit Barangay Hall",
        description:
          "Bring the TODA certification to the Barangay Hall and request a TRU/TFB certification.",
      },
      {
        step: 3,
        title: "Submit & Verify",
        description:
          "Submit the TODA certification for verification by the barangay transport office.",
      },
      {
        step: 4,
        title: "Processing",
        description:
          "The barangay processes and prepares your TRU/TFB certification based on the verified TODA documents.",
      },
      {
        step: 5,
        title: "Claim Certification",
        description:
          "The completed TRU/TFB certification is signed and released to you.",
      },
    ],
    tips: [
      {
        title: "Keep TODA Membership Current",
        description:
          "Ensure your TODA membership is active and dues are paid before applying.",
      },
      {
        title: "Bring Vehicle Documents",
        description:
          "Having your vehicle registration on hand may speed up the verification process.",
      },
      {
        title: "Renew On Time",
        description:
          "Track your certification expiry and renew before it lapses to avoid penalties.",
      },
    ],
  },

  /* ─────────────────── BUSINESS ─────────────────── */

  "business-permit": {
    title: "Business Permit",
    slug: "business-permit",
    icon: Building2,
    category: "Business & Permits",
    tagline:
      "Your first step toward building a thriving, legitimate, and prosperous business in the community!",
    description:
      "This essential document is required for all businesses operating within the barangay. It serves as proof that your business is registered, recognized, and authorized to operate in our community. Plus, it helps you comply with local government regulations while giving your customers the assurance that your business is legitimate. Just visit our barangay hall, submit the necessary requirements, and we'll assist you every step of the way. Remember, a registered business is a trusted business. Secure your Barangay Business Permit today and join us in building a thriving, legitimate, and prosperous community!",
    fee: "₱500",
    processingTime: "Same day",
    requirements: [
      "Photocopy of Government-issued ID or QC ID (must be a Culiat resident)",
      "Endorsement Letter from Purok Leader or HOA Officer",
      "DTI Registration (for new businesses)",
      "Old copy of Business Permit (for renewal)",
    ],
    procedure: [
      {
        step: 1,
        title: "Prepare Documents",
        description:
          "Prepare the necessary documents and go to the Barangay Hall.",
      },
      {
        step: 2,
        title: "Submit Form",
        description:
          "Fill up and submit the necessary application form. Inform the Barangay Personnel of the specific type of certificate you need (e.g., Barangay Clearance, Certificate of Residency).",
      },
      {
        step: 3,
        title: "Required Fee",
        description:
          "Settle the required fee. This will vary depending on the type of certificate and the assessment. Our Barangay Staff should be able to assist you on this.",
      },
      {
        step: 4,
        title: "Processing",
        description:
          "The barangay staff will verify your details, check for any pending disputes, and prepare the certificate.",
      },
      {
        step: 5,
        title: "Issuance of Certificate",
        description:
          "Once processing is complete, the certificate is printed, signed and handed to you, usually within a few minutes.",
      },
    ],
    tips: [
      {
        title: "Prepare All Documents in Advance",
        description:
          "Ensure you have complete and accurate copies of all requirements before visiting the Barangay Hall.",
      },
      {
        title: "Visit During Office Hours",
        description:
          "Barangay offices generally operate during weekdays, 8:00 AM to 5:00 PM. No lunch break.",
      },
      {
        title: "Confirm Requirements",
        description:
          "Call or visit your barangay office beforehand to confirm the exact requirements and fees for your specific request.",
      },
    ],
  },

  "business-closure": {
    title: "Business Closure",
    slug: "business-closure",
    icon: XCircle,
    category: "Business & Permits",
    tagline:
      "Officially close your business registration with the barangay for proper compliance.",
    description:
      "A Business Closure certificate is required when a business owner decides to permanently close their business within the barangay. This document officially records the cessation of business operations and is needed for tax purposes, cancellation of permits, and compliance with local government regulations. Proper business closure ensures that you are no longer liable for future permit renewals, taxes, and regulatory fees.",
    fee: "Varies",
    processingTime: "Same day",
    requirements: [
      "Photocopy of Government-issued ID or QC ID (must be a Culiat resident)",
      "Endorsement Letter from Purok Leader or HOA Officer",
      "Affidavit of Business Closure",
    ],
    procedure: [
      {
        step: 1,
        title: "Prepare Affidavit",
        description:
          "Have an Affidavit of Business Closure notarized. This legal document states your intention to permanently close the business.",
      },
      {
        step: 2,
        title: "Gather Documents",
        description:
          "Collect your ID photocopy, endorsement letter, and the notarized affidavit.",
      },
      {
        step: 3,
        title: "Visit Barangay Hall",
        description:
          "Go to the Barangay Hall and submit your documents to the business permits office.",
      },
      {
        step: 4,
        title: "Verification",
        description:
          "Staff will verify your business records and confirm that there are no outstanding liabilities or issues.",
      },
      {
        step: 5,
        title: "Issuance",
        description:
          "The Business Closure certificate is issued, officially closing your business registration with the barangay.",
      },
    ],
    tips: [
      {
        title: "Settle Outstanding Fees",
        description:
          "Clear any outstanding business permit fees or taxes before filing for closure.",
      },
      {
        title: "Notify Regulatory Bodies",
        description:
          "After barangay closure, also file with DTI, BIR, and your city hall for complete closure.",
      },
      {
        title: "Keep Records",
        description:
          "Retain copies of your closure documents for at least 5 years for tax audit purposes.",
      },
    ],
  },

  /* ─────────────────── LEGAL / PROPERTY ─────────────────── */

  "bail-bond": {
    title: "Bail Bond Certification",
    slug: "bail-bond",
    icon: Scale,
    category: "Legal Services",
    tagline:
      "Barangay certification required for bail bond applications and court proceedings.",
    description:
      "A Bail Bond Certification from the barangay is required when a resident is seeking bail for a detained family member or themselves. This certification confirms the applicant's residency, character standing in the community, and home address. It is a mandatory requirement for bail bond applications submitted to the courts.",
    fee: "Varies",
    processingTime: "1–2 business days",
    requirements: [
      "Photocopy of ID (must be a Culiat resident)",
      "Endorsement Letter from Purok Leader or HOA Officer",
      "Detention Letter",
      "Resolution",
      "Home Address Sketch (2 copies)",
    ],
    procedure: [
      {
        step: 1,
        title: "Secure Detention Documents",
        description:
          "Obtain the detention letter and resolution from the court or detention facility.",
      },
      {
        step: 2,
        title: "Prepare Address Sketch",
        description:
          "Draw or have prepared a clear sketch of the home address with landmarks. You will need 2 copies.",
      },
      {
        step: 3,
        title: "Get Endorsement",
        description:
          "Secure an endorsement letter from your Purok Leader or HOA Officer confirming your residency.",
      },
      {
        step: 4,
        title: "Submit at Barangay Hall",
        description:
          "Submit all documents at the Barangay Hall. Staff will verify information and may conduct a home verification.",
      },
      {
        step: 5,
        title: "Certification Issuance",
        description:
          "After verification, the Bail Bond Certification is prepared, signed, and released.",
      },
    ],
    tips: [
      {
        title: "Prepare Sketch Accurately",
        description:
          "Your home address sketch should be detailed with nearby landmarks and street names.",
      },
      {
        title: "Verify Court Requirements",
        description:
          "Different courts may have additional requirements — confirm with your lawyer first.",
      },
      {
        title: "Allow Processing Time",
        description:
          "This certification may take 1–2 days due to verification procedures, so apply early.",
      },
    ],
  },

  "house-repair-renovation": {
    title: "House Repair / Renovation Permit",
    slug: "house-repair-renovation",
    icon: Wrench,
    category: "Construction & Property",
    tagline:
      "Get authorized before starting any home repairs or renovations in the barangay.",
    description:
      "A House Repair or Renovation Permit from the barangay is required before undertaking any construction, repair, or renovation work on residential properties. This permit ensures that the planned work complies with local safety standards and does not adversely affect neighboring properties. The process includes an ocular inspection by BPSO (Barangay Public Safety Officers) and requires written consent from adjacent neighbors.",
    fee: "Varies",
    processingTime: "3–5 business days",
    requirements: [
      "Photocopy of Government-issued ID or QC ID (must be a Culiat resident)",
      "Endorsement Letter from Purok Leader or HOA Officer",
      "For Ocular Inspection of BPSO",
      "Letter of No Objection from neighbors (with their signatures)",
    ],
    procedure: [
      {
        step: 1,
        title: "Prepare Documents",
        description:
          "Gather your ID, endorsement letter, and a Letter of No Objection signed by your immediate neighbors.",
      },
      {
        step: 2,
        title: "Submit Application",
        description:
          "File your application at the Barangay Hall with all the required documents.",
      },
      {
        step: 3,
        title: "BPSO Ocular Inspection",
        description:
          "BPSO officers will visit your property to conduct an ocular inspection and assess the planned renovation.",
      },
      {
        step: 4,
        title: "Review & Approval",
        description:
          "The barangay reviews the inspection report, neighbor consents, and approves or requests modifications.",
      },
      {
        step: 5,
        title: "Permit Issuance",
        description:
          "Once approved, the House Repair/Renovation Permit is issued, allowing you to begin work.",
      },
    ],
    tips: [
      {
        title: "Talk to Neighbors First",
        description:
          "Get your neighbors' written consent before filing — this is often the step that takes the longest.",
      },
      {
        title: "Plan Your Timeline",
        description:
          "Factor in 3–5 business days for processing and BPSO inspection before your planned construction start date.",
      },
      {
        title: "Describe Work Clearly",
        description:
          "Provide a clear description of the planned repair/renovation to expedite the inspection process.",
      },
    ],
  },

  "cutting-trees": {
    title: "Tree Cutting Permit",
    slug: "cutting-trees",
    icon: Trees,
    category: "Environmental",
    tagline:
      "Authorization required before cutting or trimming trees within the barangay.",
    description:
      "A Tree Cutting Permit is required before any tree removal or significant trimming within the barangay's jurisdiction. This permit ensures environmental compliance and proper documentation. The permit application requires a request letter explaining the reason for cutting, photographs of the tree(s) involved, and standard residency documents.",
    fee: "Varies",
    processingTime: "3–7 business days",
    requirements: [
      "Request Letter explaining the purpose",
      "Picture/Photo of the tree(s) to be cut",
      "Photocopy of Government-issued ID or QC ID (must be a Culiat resident)",
      "Endorsement Letter from Purok Leader or HOA Officer",
    ],
    procedure: [
      {
        step: 1,
        title: "Write Request Letter",
        description:
          "Draft a formal request letter explaining why the tree(s) need to be cut — include safety concerns, construction, or other valid reasons.",
      },
      {
        step: 2,
        title: "Photograph the Trees",
        description:
          "Take clear photographs of the tree(s) from multiple angles showing their condition and location.",
      },
      {
        step: 3,
        title: "Submit Application",
        description:
          "Bring all documents to the Barangay Hall and file your tree cutting permit application.",
      },
      {
        step: 4,
        title: "Site Inspection",
        description:
          "Barangay officers may conduct a site visit to verify the tree's condition and assess environmental impact.",
      },
      {
        step: 5,
        title: "Permit Issuance",
        description:
          "After review and approval, the Tree Cutting Permit is issued. For large trees, DENR coordination may also be required.",
      },
    ],
    tips: [
      {
        title: "Check DENR Rules",
        description:
          "Some tree species are protected — verify with DENR if the tree is a protected species before applying.",
      },
      {
        title: "Take Clear Photos",
        description:
          "Ensure your tree photos clearly show the size, condition, and proximity to structures.",
      },
      {
        title: "State Valid Reasons",
        description:
          "Common valid reasons include safety hazard, disease, or construction necessity. Be specific in your letter.",
      },
    ],
  },

  "building-permit": {
    title: "Building Permit (Barangay Clearance)",
    slug: "building-permit",
    icon: Landmark,
    category: "Construction & Property",
    tagline:
      "Barangay clearance required for building permit applications with the city.",
    description:
      "A Barangay Building Permit Clearance is a prerequisite document needed when applying for a full building permit from the city government. This clearance confirms that the barangay has no objection to the planned construction on the property and that the applicant is a legitimate resident or property owner within the barangay. It requires property documentation, contractor authorization, and community leader endorsement.",
    fee: "Varies",
    processingTime: "3–5 business days",
    requirements: [
      "Photocopy of Government-issued ID or QC ID of the property owner (must be a Culiat resident)",
      "Authorization Letter or SPA of Contractor",
      "Endorsement Letter from Purok Leader or HOA Officer",
      "Photocopy of Land Title",
      "Copy of Perspective / Architectural Plan",
    ],
    procedure: [
      {
        step: 1,
        title: "Gather Property Docs",
        description:
          "Prepare a photocopy of your land title, the architectural/perspective plan, and your government ID.",
      },
      {
        step: 2,
        title: "Contractor Authorization",
        description:
          "If a contractor will handle the construction, prepare an authorization letter or Special Power of Attorney (SPA).",
      },
      {
        step: 3,
        title: "Get Endorsement",
        description:
          "Secure an endorsement letter from your Purok Leader or HOA Officer.",
      },
      {
        step: 4,
        title: "Submit at Barangay Hall",
        description:
          "File your application at the Barangay Hall with all the required documents for review.",
      },
      {
        step: 5,
        title: "Clearance Issuance",
        description:
          "After verification and review, the Barangay Building Permit Clearance is issued, ready for city hall submission.",
      },
    ],
    tips: [
      {
        title: "Plans Must Be Clear",
        description:
          "Ensure your architectural plans are legible and show detailed dimensions and setbacks.",
      },
      {
        title: "Verify Title Authenticity",
        description:
          "Your land title photocopy must be clear — the barangay may verify ownership with the Registry of Deeds.",
      },
      {
        title: "Coordinate With City Hall",
        description:
          "Check with your city hall's building office for any additional requirements beyond the barangay clearance.",
      },
    ],
  },

  "estate-tax": {
    title: "Estate Tax Certification",
    slug: "estate-tax",
    icon: FileText,
    category: "Legal Services",
    tagline:
      "Barangay certification needed for estate tax processing and property inheritance.",
    description:
      "An Estate Tax Certification from the barangay is required when processing the transfer of property ownership due to the death of the original owner. This certification is part of the estate settlement requirements mandated by the Bureau of Internal Revenue (BIR). It confirms the residency of the deceased and the relationship between the heirs and the property.",
    fee: "Varies",
    processingTime: "1–3 business days",
    requirements: [
      "Photocopy of Government-issued ID or QC ID (must be a Culiat resident)",
      "Endorsement Letter from Purok Leader or HOA Officer",
      "Death Certificate of the property owner",
      "Photocopy of Land Title",
    ],
    procedure: [
      {
        step: 1,
        title: "Prepare Documents",
        description:
          "Gather the death certificate, land title photocopy, your ID, and endorsement letter.",
      },
      {
        step: 2,
        title: "Visit Barangay Hall",
        description:
          "Go to the Barangay Hall and request an Estate Tax Certification from the clearance window.",
      },
      {
        step: 3,
        title: "Submit Requirements",
        description:
          "Present all documents for verification. Staff will review property records and confirm details.",
      },
      {
        step: 4,
        title: "Processing & Verification",
        description:
          "The barangay verifies the information and prepares the certification with relevant property details.",
      },
      {
        step: 5,
        title: "Claim Certification",
        description:
          "The completed certification is signed and released for submission to the BIR.",
      },
    ],
    tips: [
      {
        title: "Consult a Lawyer",
        description:
          "Estate tax processing can be complex — consider consulting a lawyer or accountant for guidance.",
      },
      {
        title: "Check BIR Deadlines",
        description:
          "Estate tax returns must be filed within one year from the date of death (extendable up to 2 years).",
      },
      {
        title: "Gather All Heirs' IDs",
        description:
          "The BIR may require IDs and signatures of all heirs — prepare these in advance.",
      },
    ],
  },

  "transfer-of-account": {
    title: "Transfer of Account (Meralco/MWCI)",
    slug: "transfer-of-account",
    icon: Zap,
    category: "Utility Services",
    tagline:
      "Barangay certification for changing the name on your Meralco or Manila Water account.",
    description:
      "When transferring utility accounts (Meralco for electricity or Manila Water/MWCI for water service) to a new name — whether due to inheritance, property sale, or change of occupancy — a barangay certification is required. This document confirms the applicant's identity and residency, supporting the name change request with the utility company.",
    fee: "Varies",
    processingTime: "Same day",
    requirements: [
      "Photocopy of Government-issued ID or QC ID (must be a Culiat resident)",
      "Endorsement Letter from Purok Leader or HOA Officer",
      "Old bills from Meralco or MWCI (for reference)",
      "Application form from Meralco or MWCI",
    ],
    procedure: [
      {
        step: 1,
        title: "Get Utility Forms",
        description:
          "Visit your Meralco or Manila Water office to get the account transfer / name change application form.",
      },
      {
        step: 2,
        title: "Prepare Barangay Docs",
        description:
          "Gather your ID, endorsement letter, and old utility bills showing the current account name.",
      },
      {
        step: 3,
        title: "Visit Barangay Hall",
        description:
          "Go to the Barangay Hall and request a certification for transfer of account.",
      },
      {
        step: 4,
        title: "Processing",
        description:
          "Staff verifies your documents and prepares the certification confirming your identity and residency.",
      },
      {
        step: 5,
        title: "Submit to Utility Company",
        description:
          "Submit the barangay certification along with the completed utility application form to Meralco or MWCI.",
      },
    ],
    tips: [
      {
        title: "Bring Recent Bills",
        description:
          "Have at least the last 3 months of utility bills for reference.",
      },
      {
        title: "Check Utility Requirements",
        description:
          "Meralco and MWCI may have additional requirements — verify with them before visiting the barangay.",
      },
      {
        title: "Clear Outstanding Bills",
        description:
          "Ensure the account has no outstanding balance before requesting a transfer.",
      },
    ],
  },

  "barangay-id": {
    title: "Barangay ID",
    slug: "barangay-id",
    icon: CreditCard,
    category: "Identification",
    tagline:
      "Your official barangay identification card for community transactions and identification.",
    description:
      "The Barangay ID is an official identification card issued by the Barangay to its registered residents. It serves as a valid form of identification for various local and government transactions. The Barangay ID contains the holder's personal information, photograph, and the Barangay Captain's signature. It is widely accepted as a secondary form of ID in government offices, schools, and commercial establishments.",
    fee: "Varies",
    processingTime: "3–5 business days",
    requirements: [
      "Photocopy of Government-issued ID or QC ID (must be a Culiat resident)",
      "Endorsement Letter from Purok Leader or HOA Officers",
    ],
    procedure: [
      {
        step: 1,
        title: "Prepare Documents",
        description:
          "Get a photocopy of your valid government-issued ID and an endorsement letter from your Purok Leader or HOA Officer.",
      },
      {
        step: 2,
        title: "Visit Barangay Hall",
        description:
          "Go to the Barangay Hall and proceed to the Barangay ID counter or designated area.",
      },
      {
        step: 3,
        title: "Submit & Photo Capture",
        description:
          "Submit your documents and have your photo taken for the ID. Some barangays accept passport-size photos instead.",
      },
      {
        step: 4,
        title: "Processing",
        description:
          "The ID is processed and printed — this may take a few days depending on the queue and equipment availability.",
      },
      {
        step: 5,
        title: "Claim Your ID",
        description:
          "Return to the Barangay Hall on the designated date to claim your official Barangay ID.",
      },
    ],
    tips: [
      {
        title: "Dress Appropriately",
        description:
          "Wear a collared shirt for your ID photo — some barangays have dress code requirements for identification photos.",
      },
      {
        title: "Bring 1x1 or 2x2 Photo",
        description:
          "Some barangays require a recent ID photo (1x1 or 2x2) — call ahead to confirm.",
      },
      {
        title: "Keep It Updated",
        description:
          "Renew your Barangay ID regularly, especially when there are changes to your personal information.",
      },
    ],
  },
};

/** Ordered array of all service slugs for navigation */
export const servicesList = Object.values(servicesData).map((s) => ({
  slug: s.slug,
  title: s.title,
  icon: s.icon,
  category: s.category,
}));

export default servicesData;
