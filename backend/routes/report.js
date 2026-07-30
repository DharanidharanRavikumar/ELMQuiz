const express = require("express");
const scoringHelper = require("../utils/scoringHelper");
const determineScoreRange = require("../utils/determineScoreRange");
const Report = require("../models/Report");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const router = express.Router();

// ─── Pronoun helper ──────────────────────────────────────────────────────────
const getPronoun = (gender, type) => {
  const pronouns = {
    Male:   { heShe: "He",   hisHer: "his",   himHer: "him",  himselfHerself: "himself"   },
    Female: { heShe: "She",  hisHer: "her",   himHer: "her",  himselfHerself: "herself"   },
    Other:  { heShe: "They", hisHer: "their", himHer: "them", himselfHerself: "themselves" },
  };
  return pronouns[gender]?.[type] || pronouns["Other"][type];
};

const getDescription = (category, subCategory, range, gender) => {
  if (!range) return `Description not found for ${category} -> ${subCategory || "main"}`;
  let fixedRange = range.charAt(0).toUpperCase() + range.slice(1).toLowerCase();
  if (category === "aspiration" && subCategory === "education") subCategory = "educational";
  let description = subCategory
    ? categoryDescriptions?.[category]?.[subCategory]?.[fixedRange]
    : categoryDescriptions?.[category]?.[fixedRange];
  if (!description) return `Description not found for ${category} -> ${subCategory || "main"} -> ${fixedRange}`;
  const rep = {
    he: getPronoun(gender, "heShe"), his: getPronoun(gender, "hisHer"),
    him: getPronoun(gender, "himHer"), himself: getPronoun(gender, "himselfHerself"),
  };
  Object.keys(rep).forEach(k => {
    description = description.replace(new RegExp(`\\b${k}\\b`, "gi"), rep[k]);
  });
  return description;
};

const getSocialSupportDescription = (supportData, gender) => {
  let sel = [];
  if (supportData.family === "High") sel.push("family");
  if (supportData.friends === "High") sel.push("friends");
  if (supportData.socialMedia === "High") sel.push("socialMedia");
  if (sel.length === 0) return `${getPronoun(gender, "heShe")} has limited social support and may benefit from expanding ${getPronoun(gender, "hisHer")} network.`;
  const key = sel.sort().join("And");
  let desc = categoryDescriptions.socialSupport[key];
  if (!desc) return "Social Support description not found.";
  return desc
    .replace(/\bHe\b/g, getPronoun(gender, "heShe"))
    .replace(/\bhis\b/g, getPronoun(gender, "hisHer"))
    .replace(/\bhim\b/g, getPronoun(gender, "himHer"))
    .replace(/\bhimself\b/g, getPronoun(gender, "himselfHerself"));
};

const categoryDescriptions = {
  selfEfficacy: {
    high: "His score on the self-efficacy measure indicates a high level of self-efficacy. He has a strong sense of self-confidence, is more capable of self-evaluation and self-awareness, and has the willingness to take risks or step outside of his comfort zone.",
    moderate: "His score on the self-efficacy measure indicates a moderate level of self-efficacy. He will therefore be moderately confident in his capacity to achieve his objective and play a partly involved role in his academic life. He will also be aware of himself and capable of identifying the setbacks he has in life. He should attempt to assess his own potential, visualize his success, and have positive self-talk in order to better himself.",
    low: "His score on the self-efficacy measure indicates a low level of self-efficacy. So, he avoids challenging tasks and believes that difficult tasks and situations are beyond his capabilities, only focusing on personal failings and negative outcomes. Due to low self-efficacy, he quickly loses his confidence in personal abilities.",
  },
  learningStyle: {
    all: "His scores indicate that he is efficient in all three learning styles - visual, auditory, and kinesthetic. He doesn't have any preferential way in which he absorbs, processes, comprehends, and retains information. He has widespread recognition in any classroom management strategy.",
    visual: "His scores indicate that he is a visual learner. Visual learners are individuals who prefer to take in their information visually with visual representations like maps, graphs, diagrams, charts, and others. He is able to learn by using visual aids such as PowerPoint lectures, instructional videos, flow charts, etc.",
    auditory: "His scores indicate that he is an auditory learner. Auditory learners learn best when information is presented to them via strategies that involve talking, such as lectures and group discussions. He can benefit from repeating back the lessons, having recordings of the lectures, group activities that require classmates explaining ideas, etc.",
    kinesthetic: "His scores indicate that he is a kinesthetic learner. Kinesthetic learners are individuals who prefer to learn by doing. He enjoys a hands-on experience and is usually more in touch with reality and more connected to it, which is why he requires using tactile experience to understand something better.",
    auditoryKinesthetic: "His scores indicate that he is an auditory and kinesthetic learner. He learns best through talking and doing — combining discussion-based strategies with hands-on activities yields the best results.",
    visualAuditory: "His scores indicate that he is a visual and auditory learner. He is able to learn by using visual and auditory aids such as PowerPoint lectures, instructional videos, flow charts, and recordings.",
    visualKinesthetic: "His scores indicate that he is a visual and kinesthetic learner. He learns best through seeing and doing — visual aids combined with hands-on practice are ideal.",
  },
  collegeReadiness: {
    academicSkill: {
      High: "He has scored high in Academic skills. An individual with a high academic skill score will be resourceful, able to work well in a team, and capable of solving issues. He can pick up new abilities and read and write with a high level of independence.",
      Low: "He has scored low in Academic skills. Low academic skill levels are synonymous with low academic abilities. In order to do better, he can set goals, stick to routines and timetables, reward themselves for finishing challenging tasks, and manage their time effectively.",
    },
    executiveFunction: {
      High: "In executive function of college readiness, he has scored high. He has good leadership abilities and can handle life's tasks. He has skills like working memory, planning flexibility, emotional control, and time management.",
      Low: "In executive function of college readiness, he has scored low. The individual can strive to improve by organizing themselves, maintaining a positive outlook, taking a step-by-step approach to their work, and practicing meditation.",
    },
    motivationConfidence: {
      High: "In motivation and confidence of college readiness, he has scored high. He is highly motivated to pursue life goals and succeed in college. He has a high desire to gain new knowledge and is more confident in the growth of mindset in every opportunity to learn.",
      Low: "In motivation and confidence of college readiness, he has scored low. He can improve by concentrating on objectives, regularly assessing yearly goals, and learning from successes to increase drive and confidence.",
    },
    postEducation: {
      High: "In post-education of college readiness, he has scored high. He can perform well following education and is prepared for college with abilities including critical thinking, self-control, communication, teamwork, and study skills.",
      Low: "In post-education of college readiness, he has scored low. He is not prepared for college. To improve, he can adopt a positive outlook for his post-educational future, organize their work, create a schedule that works, and manage their study space.",
    },
  },
  temperament: {
    personallyReserved: {
      High: "He has a propensity to keep his personal emotions to himself. He is partially reluctant to let friends and acquaintances get to know him too well. He has more good qualities than bad ones.",
      Low: "He doesn't have a propensity to keep his personal emotions to himself. He is not reluctant to let friends and acquaintances get to know him too well.",
    },
    selfCriticism: {
      High: "He can be quite impatient with other people and intolerant or irritable with anything that impedes or delays. His tendency to engage in negative self-evaluation results in feelings of worthlessness, failure, and guilt when expectations are not met.",
      Low: "He cannot be quite impatient with other people. He does not have the tendency to engage in negative self-evaluation and maintains feelings of worth, optimism, and dignity.",
    },
    anxious: {
      High: "He is anxious, worrying, and stressed. Excessive worrying may increase the risk of developing depression. When under stress, he will experience catastrophic thoughts and feel overwhelmed. He can adapt ways to manage anxiety including mindfulness, relaxation techniques, and dietary adjustments.",
      Low: "He is not anxious, worrying, and stressed. His emotions relating to relationships will not fluctuate very quickly.",
    },
    perfectionism: {
      High: "He is very responsible and has high standards for himself with a high commitment to tasks and duties. He feels confident and has the ability to size up and deal with any situation.",
      Low: "He is not very responsible and does not hold high standards for himself. He will not feel confident and lacks the ability to size up and deal with challenging situations.",
    },
    irritability: {
      High: "He has the tendency to be quick-tempered and to externalize stress by becoming snappy and irritated by little things. He has a feeling of agitation and frustration that may also be a symptom of a mental or physical health condition.",
      Low: "He doesn't have the tendency to be quick-tempered and does not externalize stress by becoming snappy and irritated by little things.",
    },
  },
  socialSupport: {
    family: "He is completely free to be himself with his family. When he needs someone to listen to him, his family is the one he can actually rely on more than his friends and social media.",
    friends: "He is completely free to be himself with his friends. When he needs someone to listen to him, his friends are the ones he can actually rely on more than his family and social media.",
    socialMedia: "He is completely free to be himself with social media. When he needs someone to listen to him, he uses electronic gadgets and social media more than his family and friends.",
    familyAndFriends: "He is completely free to be himself with his family and friends. When he needs someone to listen to him, his family and friends are the ones he can actually rely on more than social media.",
    friendsAndSocialMedia: "He is completely free to be himself with his friends and social media. When he needs someone to listen to him, his friends and social media are the ones he can actually rely on more than his family.",
    familyAndSocialMedia: "He is completely free to be himself with his family and social media. When he needs someone to listen to him, his family and social media are the ones he can actually rely on more than his friends.",
  },
  aspiration: {
    leadership: {
      High: "He has a strong ambition and dedication to assume leadership roles and have a beneficial impact on a community or organization. He frequently demonstrates traits such as resilience, teamwork, emotional intelligence, visionary thinking, drive, and effective communication.",
      Moderate: "He has moderate leadership aspirations. He has an interest in taking on leadership roles, but perhaps not at the highest or most intense level. He is open to leadership opportunities but may not be actively seeking executive positions.",
      Low: "He has low leadership aspirations — a lack of desire or ambition to take on leadership roles within an organization or community. He may have a lack of confidence, fear of failure, comfort zone, or unawareness of his potentials.",
    },
    educational: {
      High: "He has high educational aspirations, referring to a strong desire and ambition to achieve significant accomplishments in his education. He sets lofty goals for his academic pursuits and is motivated to excel in studies and make a positive impact in his chosen field.",
      Moderate: "He has moderate educational aspiration and has a desire for education and personal development but may not be aiming for the highest level of academic achievement. He prioritizes a combination of formal education and vocational training.",
      Low: "He has low educational aspiration, referring to a lack of motivation or desire to pursue a higher level of education. He may not see the value or importance of obtaining additional education beyond a certain level.",
    },
    achievement: {
      High: "He has high achievement aspirations. He is quite broad in taking lots of initiatives to achieve in his day-to-day life. He can understand long-term life satisfaction that emphasizes personal success in one or more life domains relative to personal goals.",
      Moderate: "He has moderate achievement aspirations. This could suggest that he has some aspirations and goals but may not be extremely ambitious or overly modest.",
      Low: "He has low achievement aspirations. He has limited motivation or ambition to set and achieve challenging goals. He may not be actively seeking or striving for higher levels of success or accomplishment.",
    },
  },
};

// ─── PDF Helper Functions ────────────────────────────────────────────────────

const COLORS = {
  primary:    "#0A3D7A",   // dark green
  accent:     "#185FA5",   // medium green
  light:      "#E8F0FA",   // light green bg
  dark:       "#060F1E",   // very dark green
  white:      "#FFFFFF",
  text:       "#1A1A2E",
  subtext:    "#4A5568",
  border:     "#B8CFE8",
  sectionBg:  "#F0F5FC",
  tagBg:      "#D0E4F7",
  tagText:    "#0A3D7A",
  highColor:  "#0A3D7A",
  modColor:   "#7B6B00",
  lowColor:   "#8B1A1A",
  highBg:     "#D0E4F7",
  modBg:      "#FFF9C4",
  lowBg:      "#FDDEDE",
};

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Draw page background + subtle side accent bar
function drawPageBase(doc) {
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(COLORS.white);
  doc.rect(0, 0, 5, PAGE_H).fill(COLORS.primary);
}

// Draw cover page
function drawCover(doc, report) {
  drawPageBase(doc);

  // Top header band
  doc.rect(0, 0, PAGE_W, 200).fill(COLORS.dark);

  // Decorative circle top-right
  doc.circle(PAGE_W - 40, 40, 80).fillOpacity(0.08).fill(COLORS.white);
  doc.circle(PAGE_W - 40, 40, 50).fillOpacity(0.08).fill(COLORS.white);

  // Logo / title area
  doc.fillOpacity(1);
  doc.fontSize(11).fillColor(COLORS.accent).font("Helvetica")
     .text("ERODE LINGAM POLYTECHNIC COLLEGE", MARGIN, 50, { width: CONTENT_W });
  doc.fontSize(22).fillColor(COLORS.white).font("Helvetica-Bold")
     .text("Psychiatric Assessment Report", MARGIN, 72, { width: CONTENT_W });
  doc.fontSize(11).fillColor("rgba(255,255,255,0.6)").font("Helvetica")
     .text("Comprehensive Student Psychological Evaluation", MARGIN, 104, { width: CONTENT_W });

  // Date badge
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  doc.fontSize(10).fillColor("rgba(255,255,255,0.5)").text(`Generated: ${dateStr}`, MARGIN, 130);

  // Student info card
  const cardY = 220;
  const cardH = 160;
  doc.roundedRect(MARGIN, cardY, CONTENT_W, cardH, 10).fill(COLORS.sectionBg);
  doc.roundedRect(MARGIN, cardY, 5, cardH, 3).fill(COLORS.accent);

  doc.fontSize(10).fillColor(COLORS.subtext).font("Helvetica")
     .text("STUDENT PROFILE", MARGIN + 20, cardY + 18);

  const infoItems = [
    ["Full Name",       report.name],
    ["Roll Number",     report.rollNumber],
    ["Gender",         report.gender],
    ["12th Percentage", `${report.hsPercentage}%`],
    ["First Graduate",  report.isFirstGraduate ? "Yes" : "No"],
    ["Future Ambition", report.futureIdea],
  ];

  let col = 0, row = 0;
  infoItems.forEach(([label, value]) => {
    const x = MARGIN + 20 + col * (CONTENT_W / 2);
    const y = cardY + 40 + row * 30;
    doc.fontSize(9).fillColor(COLORS.subtext).font("Helvetica").text(label.toUpperCase(), x, y);
    doc.fontSize(11).fillColor(COLORS.text).font("Helvetica-Bold").text(value || "—", x, y + 12);
    col++;
    if (col > 1) { col = 0; row++; }
  });

  // Assessment overview section
  const sectY = cardY + cardH + 30;
  doc.fontSize(13).fillColor(COLORS.primary).font("Helvetica-Bold")
     .text("Assessment Overview", MARGIN, sectY);
  doc.moveTo(MARGIN, sectY + 18).lineTo(MARGIN + CONTENT_W, sectY + 18)
     .strokeColor(COLORS.border).lineWidth(0.5).stroke();

  const domains = [
    { icon: "01", label: "Self-Efficacy",     desc: "Belief in personal capabilities" },
    { icon: "02", label: "Learning Style",    desc: "Preferred information processing" },
    { icon: "03", label: "College Readiness", desc: "Academic and executive preparedness" },
    { icon: "04", label: "Temperament",       desc: "Emotional and behavioral traits" },
    { icon: "05", label: "Social Support",    desc: "Support network analysis" },
    { icon: "06", label: "Aspiration",        desc: "Goals and ambitions" },
  ];

  domains.forEach((d, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN + col * (CONTENT_W / 2 + 10);
    const y = sectY + 30 + row * 50;
    doc.roundedRect(x, y, CONTENT_W / 2 - 10, 40, 6).fill(COLORS.light);
    doc.fontSize(9).fillColor(COLORS.accent).font("Helvetica-Bold").text(d.icon, x + 10, y + 8);
    doc.fontSize(10).fillColor(COLORS.text).font("Helvetica-Bold").text(d.label, x + 30, y + 7);
    doc.fontSize(8).fillColor(COLORS.subtext).font("Helvetica").text(d.desc, x + 30, y + 20);
  });

  // Footer
  doc.fontSize(8).fillColor(COLORS.subtext)
     .text("CONFIDENTIAL — For Academic Use Only", MARGIN, PAGE_H - 40, { width: CONTENT_W, align: "center" });
}

// Draw a section header
function drawSectionHeader(doc, title, subtitle, y) {
  doc.rect(MARGIN, y, CONTENT_W, 42).fill(COLORS.primary);
  doc.roundedRect(MARGIN, y, 4, 42, 2).fill(COLORS.accent);
  doc.fontSize(13).fillColor(COLORS.white).font("Helvetica-Bold")
     .text(title, MARGIN + 16, y + 8, { width: CONTENT_W - 20 });
  if (subtitle) {
    doc.fontSize(9).fillColor("rgba(255,255,255,0.7)").font("Helvetica")
       .text(subtitle, MARGIN + 16, y + 25, { width: CONTENT_W - 20 });
  }
  return y + 42 + 14;
}

// Draw a result item with level badge + description
function drawResultItem(doc, label, level, description, y, pageAddCb) {
  const MIN_H = 20;
  // Estimate height needed
  const descLines = Math.ceil(description.length / 90) + 1;
  const blockH = Math.max(MIN_H, 16 + descLines * 13 + 24);

  if (y + blockH > PAGE_H - 60) {
    doc.addPage();
    drawPageBase(doc);
    y = MARGIN;
  }

  // Card bg
  doc.roundedRect(MARGIN, y, CONTENT_W, blockH, 6).fill(COLORS.sectionBg);
  doc.roundedRect(MARGIN, y, 3, blockH, 2).fill(COLORS.accent);

  // Label
  doc.fontSize(10).fillColor(COLORS.text).font("Helvetica-Bold")
     .text(label, MARGIN + 14, y + 10, { width: CONTENT_W * 0.55 });

  // Level badge
  if (level) {
    const lvl = level.toLowerCase();
    let bgC = COLORS.highBg, txtC = COLORS.highColor;
    if (lvl === "moderate" || lvl === "medium") { bgC = COLORS.modBg; txtC = COLORS.modColor; }
    if (lvl === "low")  { bgC = COLORS.lowBg;  txtC = COLORS.lowColor; }

    const badgeW = 64, badgeH = 18;
    const badgeX = MARGIN + CONTENT_W - badgeW - 10;
    doc.roundedRect(badgeX, y + 8, badgeW, badgeH, 4).fill(bgC);
    doc.fontSize(8).fillColor(txtC).font("Helvetica-Bold")
       .text(level.toUpperCase(), badgeX, y + 13, { width: badgeW, align: "center" });
  }

  // Description
  doc.fontSize(9).fillColor(COLORS.subtext).font("Helvetica")
     .text(description, MARGIN + 14, y + 26, { width: CONTENT_W - 28, lineGap: 2 });

  return y + blockH + 8;
}

// Draw footer on every page
function addFooter(doc, pageNum, name) {
  doc.fontSize(8).fillColor(COLORS.subtext).font("Helvetica")
     .text(`${name} — Psychiatric Assessment Report`, MARGIN, PAGE_H - 28, { width: CONTENT_W * 0.6 });
  doc.text(`Page ${pageNum}`, MARGIN, PAGE_H - 28, { width: CONTENT_W, align: "right" });
  doc.moveTo(MARGIN, PAGE_H - 36).lineTo(MARGIN + CONTENT_W, PAGE_H - 36)
     .strokeColor(COLORS.border).lineWidth(0.5).stroke();
}

// ─── Generate Report Text (same as before) ────────────────────────────────
function buildReportData(scores, gender) {
  const sections = [];

  // Learning Style
  const { dominantStyles } = scores.learningStyle;
  // Normalize styles to lowercase, sort, build camelCase key e.g. ["Visual","Auditory"] -> "visualAuditory"
  const normalizedStyles = dominantStyles.map(s => s.toLowerCase());
  let learningKey;
  if (normalizedStyles.length === 0) {
    learningKey = "all";
  } else if (normalizedStyles.length === 3) {
    learningKey = "all";
  } else if (normalizedStyles.length === 1) {
    learningKey = normalizedStyles[0];
  } else {
    // Sort alphabetically then join as camelCase: first lowercase, rest capitalized
    const sorted = normalizedStyles.sort();
    learningKey = sorted[0] + sorted.slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");
  }
  let learningDesc = categoryDescriptions.learningStyle[learningKey] || categoryDescriptions.learningStyle["all"] || "No description available.";
  learningDesc = learningDesc.replace(/\bHe\b/g, getPronoun(gender, "heShe"))
                             .replace(/\bhis\b/g, getPronoun(gender, "hisHer"));
  sections.push({
    title: "Learning Style",
    subtitle: "How the student best absorbs and processes information",
    items: [{ label: `Style: ${dominantStyles.join(", ")}`, level: null, description: learningDesc }],
  });

  // College Readiness
  const crItems = [];
  const crLabels = { academicSkill: "Academic Skills", executiveFunction: "Executive Function", motivationConfidence: "Motivation & Confidence", postEducation: "Post-Education Readiness" };
  Object.entries(scores.collegeReadiness).forEach(([sub, data]) => {
    const range = data?.interpretation || "N/A";
    crItems.push({ label: crLabels[sub] || sub, level: range, description: getDescription("collegeReadiness", sub, range, gender) });
  });
  sections.push({ title: "College Readiness", subtitle: "Academic preparedness across four key dimensions", items: crItems });

  // Temperament
  const tempItems = [];
  const tempLabels = { personallyReserved: "Personally Reserved", selfCriticism: "Self-Criticism", anxious: "Anxiety Level", perfectionism: "Perfectionism", irritability: "Irritability" };
  scores.temperament.forEach(({ category, level }) => {
    tempItems.push({ label: tempLabels[category] || category, level, description: getDescription("temperament", category, level, gender) });
  });
  sections.push({ title: "Temperament", subtitle: "Emotional and behavioral personality traits", items: tempItems });

  // Social Support
  const highSources = Object.keys(scores.socialSupport).filter(k => scores.socialSupport[k] === "High");
  const socialDesc = getSocialSupportDescription(scores.socialSupport, gender);
  sections.push({
    title: "Social Support",
    subtitle: "Primary sources of emotional and social support",
    items: [{ label: `Primary Support: ${highSources.length > 0 ? highSources.join(", ") : "Limited"}`, level: highSources.length > 1 ? "High" : highSources.length === 1 ? "Moderate" : "Low", description: socialDesc }],
  });

  // Aspiration
  const aspItems = [];
  const aspLabels = { leadership: "Leadership Aspiration", educational: "Educational Aspiration", education: "Educational Aspiration", achievement: "Achievement Aspiration" };
  Object.entries(scores.aspiration).forEach(([sub, data]) => {
    const range = data?.interpretation || "N/A";
    aspItems.push({ label: aspLabels[sub] || sub, level: range, description: getDescription("aspiration", sub, range, gender) });
  });
  sections.push({ title: "Aspiration", subtitle: "Goals, ambitions, and future-oriented motivations", items: aspItems });

  return sections;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post("/generate-report", async (req, res) => {
  const { name, rollNumber, gender, isFirstGraduate, hsPercentage, futureIdea, responses } = req.body;
  if (!name || !rollNumber || !gender || isFirstGraduate === undefined || !hsPercentage || !futureIdea || !responses)
    return res.status(400).json({ message: "Missing required fields" });

  try {
    const scores = {
      selfEfficacy:     scoringHelper.calculateSelfEfficacy(responses.part1),
      learningStyle:    scoringHelper.calculateLearningStyle(responses.part2),
      collegeReadiness: scoringHelper.calculateCollegeReadiness(responses.part3),
      temperament:      scoringHelper.calculateTemperament(responses.part4),
      socialSupport:    scoringHelper.calculateSocialSupport(responses.part5),
      aspiration:       scoringHelper.calculateAspiration(responses.part6),
    };

    // Build PDF sections as structured data
    const pdfSections = [];

    // Self Efficacy
    const seRange = scores.selfEfficacy?.interpretation || "moderate";
    pdfSections.push({
      sectionTitle: "Self-Efficacy", sectionSubtitle: "Belief in personal ability to succeed",
      items: [{ label: "Self-Efficacy Level", level: seRange, description: getDescription("selfEfficacy", null, seRange, gender) }]
    });

    // Learning Style
    const domStyles = scores.learningStyle?.dominantStyles || [];
    const normStyles = domStyles.map(s => s.toLowerCase());
    let lKey = normStyles.length === 0 || normStyles.length === 3 ? "all"
      : normStyles.length === 1 ? normStyles[0]
      : normStyles.sort()[0] + normStyles.sort().slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");
    let lDesc = categoryDescriptions.learningStyle[lKey] || categoryDescriptions.learningStyle["all"];
    lDesc = lDesc.replace(/\bHe\b/g, getPronoun(gender, "heShe")).replace(/\bhis\b/g, getPronoun(gender, "hisHer"));
    pdfSections.push({
      sectionTitle: "Learning Style", sectionSubtitle: "Preferred information processing method",
      items: [{ label: `Style: ${domStyles.join(", ") || "All Styles"}`, level: null, description: lDesc }]
    });

    // College Readiness
    const crLabels = { academicSkill: "Academic Skills", executiveFunction: "Executive Function", motivationConfidence: "Motivation & Confidence", postEducation: "Post-Education Readiness" };
    const crItems = [];
    Object.entries(scores.collegeReadiness).forEach(([sub, data]) => {
      const range = data?.interpretation || "Low";
      crItems.push({ label: crLabels[sub] || sub, level: range, description: getDescription("collegeReadiness", sub, range, gender) });
    });
    pdfSections.push({ sectionTitle: "College Readiness", sectionSubtitle: "Academic preparedness across four key dimensions", items: crItems });

    // Temperament
    const tempLabels = { personallyReserved: "Personally Reserved", selfCriticism: "Self-Criticism", anxious: "Anxiety & Worrying", perfectionism: "Perfectionism", irritability: "Irritability" };
    const tempItems = [];
    scores.temperament.forEach(({ category, level }) => {
      tempItems.push({ label: tempLabels[category] || category, level, description: getDescription("temperament", category, level, gender) });
    });
    pdfSections.push({ sectionTitle: "Temperament", sectionSubtitle: "Emotional and behavioral personality traits", items: tempItems });

    // Social Support
    const highSources = Object.keys(scores.socialSupport).filter(k => scores.socialSupport[k] === "High");
    const sourceLabel = highSources.length > 0 ? highSources.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ") : "Limited Support";
    const socialLevel = highSources.length >= 2 ? "High" : highSources.length === 1 ? "Moderate" : "Low";
    pdfSections.push({
      sectionTitle: "Social Support", sectionSubtitle: "Primary sources of emotional and social support",
      items: [{ label: `Primary Support: ${sourceLabel}`, level: socialLevel, description: getSocialSupportDescription(scores.socialSupport, gender) }]
    });

    // Aspiration
    const aspLabels = { leadership: "Leadership Aspiration", educational: "Educational Aspiration", education: "Educational Aspiration", achievement: "Achievement Aspiration" };
    const aspItems = [];
    Object.entries(scores.aspiration).forEach(([sub, data]) => {
      const range = data?.interpretation || "Moderate";
      const normalizedSub = sub === "education" ? "educational" : sub;
      aspItems.push({ label: aspLabels[sub] || sub, level: range, description: getDescription("aspiration", normalizedSub, range, gender) });
    });
    pdfSections.push({ sectionTitle: "Aspiration", sectionSubtitle: "Goals, ambitions, and future-oriented motivations", items: aspItems });

    // Save to MongoDB — store sections as JSON for PDF, plain text for readability
    let reportText = `Report for ${name}, Roll No: ${rollNumber}\nGender: ${gender}\n`;
    reportText += `First Graduate: ${isFirstGraduate ? "Yes" : "No"}\n`;
    reportText += `12th Grade Percentage: ${hsPercentage}%\nFuture Ambition: ${futureIdea}\n`;

    const newReport = new Report({
      name, rollNumber, gender, isFirstGraduate, hsPercentage, futureIdea,
      generatedReport: JSON.stringify(pdfSections), // store sections as JSON
    });
    await newReport.save();

    res.status(200).json({ report: reportText, message: "Report generated and saved successfully!" });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/saved-reports", async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-report", async (req, res) => {
  const { query } = req.query;
  try {
    const report = await Report.findOne({ $or: [{ name: query }, { rollNumber: query }] });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Professional PDF Download ────────────────────────────────────────────────
router.get("/download/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${report.name.replace(/\s+/g, "_")}_Report.pdf`);
    doc.pipe(res);

    // ── PAGE 1: Cover ──
    drawCover(doc, report);
    addFooter(doc, 1, report.name);

    // ── PAGE 2+: Detailed Results using saved scores ──
    doc.addPage();
    drawPageBase(doc);

    let y = MARGIN;
    let pageNum = 2;

    // Helper to start new page if needed
    const checkPage = (needed) => {
      if (y + needed > PAGE_H - 60) {
        addFooter(doc, pageNum, report.name);
        doc.addPage();
        drawPageBase(doc);
        pageNum++;
        y = MARGIN + 10;
      }
    };

    // Section title banner
    doc.rect(MARGIN, y, CONTENT_W, 50).fill(COLORS.primary);
    doc.fontSize(16).fillColor(COLORS.white).font("Helvetica-Bold")
       .text("Detailed Assessment Results", MARGIN + 16, y + 10, { width: CONTENT_W - 32 });
    doc.fontSize(9).fillColor("rgba(255,255,255,0.65)").font("Helvetica")
       .text("Individual scores and interpretations across all six psychological domains", MARGIN + 16, y + 32, { width: CONTENT_W - 32 });
    y += 64;

    // Load structured sections from MongoDB (stored as JSON)
    let pdfSections = [];
    try {
      const parsed = JSON.parse(report.generatedReport);
      if (Array.isArray(parsed)) pdfSections = parsed;
    } catch(e) {
      // Old record - plain text fallback
      pdfSections = [];
    }

    if (pdfSections.length > 0) {
      // Render each section with header + items
      pdfSections.forEach(section => {
        checkPage(80);
        y = drawSectionHeader(doc, section.sectionTitle, section.sectionSubtitle, y);
        (section.items || []).forEach(item => {
          checkPage(60);
          y = drawResultItem(doc, item.label, item.level, item.description || "No description available.", y);
        });
      });
    } else {
      // Fallback for old reports - plain text
      const lines = (report.generatedReport || "").split("\n").filter(l => l.trim());
      lines.forEach(line => {
        checkPage(30);
        doc.fontSize(10).fillColor(COLORS.text).font("Helvetica").text(line, MARGIN, y, { width: CONTENT_W });
        y += 18;
      });
    }

        // ── Final Page: Summary ──
    addFooter(doc, pageNum, report.name);
    doc.addPage();
    drawPageBase(doc);
    pageNum++;

    // Summary banner
    doc.rect(MARGIN, MARGIN, CONTENT_W, 50).fill(COLORS.dark);
    doc.fontSize(16).fillColor(COLORS.white).font("Helvetica-Bold")
       .text("Report Summary", MARGIN + 16, MARGIN + 14, { width: CONTENT_W - 32 });

    y = MARGIN + 70;

    // Closing note card
    doc.roundedRect(MARGIN, y, CONTENT_W, 130).fill(COLORS.light);
    doc.roundedRect(MARGIN, y, 4, 130, 2).fill(COLORS.primary);
    doc.fontSize(12).fillColor(COLORS.primary).font("Helvetica-Bold")
       .text("Important Notice", MARGIN + 16, y + 14);
    doc.fontSize(10).fillColor(COLORS.subtext).font("Helvetica")
       .text(
         "This assessment report is generated based on self-reported responses and is intended for academic and guidance purposes only. The results should be interpreted by a qualified counselor or psychologist in the context of the student's overall profile.\n\nThis report is strictly confidential and should not be shared without appropriate consent.",
         MARGIN + 16, y + 34, { width: CONTENT_W - 32, lineGap: 3 }
       );

    y += 150;

    // Sign-off
    doc.fontSize(11).fillColor(COLORS.text).font("Helvetica-Bold")
       .text("Prepared by:", MARGIN, y);
    doc.fontSize(11).fillColor(COLORS.subtext).font("Helvetica")
       .text("ELM Quiz Assessment System — Erode Lingam Polytechnic College", MARGIN, y + 16);
    doc.fontSize(10).fillColor(COLORS.subtext)
       .text(`Date: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, MARGIN, y + 32);

    // Horizontal rule
    doc.moveTo(MARGIN, y + 55).lineTo(MARGIN + CONTENT_W, y + 55)
       .strokeColor(COLORS.border).lineWidth(0.5).stroke();

    doc.fontSize(8).fillColor(COLORS.subtext)
       .text("© ELM Quiz — Psychiatric Assessment Platform. All rights reserved.", MARGIN, y + 65, { width: CONTENT_W, align: "center" });

    addFooter(doc, pageNum, report.name);

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
