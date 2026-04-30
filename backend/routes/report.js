const express = require("express");
const scoringHelper = require("../utils/scoringHelper");
const determineScoreRange = require("../utils/determineScoreRange");
const Report = require("../models/Report"); // Import MongoDB Model
const PDFDocument = require("pdfkit");
const fs = require("fs");


const router = express.Router();

// **🔹 Function to return the correct pronoun based on gender**
const getPronoun = (gender, type) => {
  const pronouns = {
    Male: { heShe: "He", hisHer: "his", himHer: "him", himselfHerself: "himself" },
    Female: { heShe: "She", hisHer: "her", himHer: "her", himselfHerself: "herself" },
    Other: { heShe: "They", hisHer: "their", himHer: "them", himselfHerself: "themselves" },
  };

  return pronouns[gender]?.[type] || pronouns["Other"][type]; // Default to "Other" if gender is unknown
};

const getDescription = (category, subCategory, range, gender) => {
  if (!range) {
    console.warn(`❌ Missing range for ${category} -> ${subCategory || "main"}`);
    return `Description not found for ${category} -> ${subCategory || "main"}`;
  }

  let fixedRange = range.charAt(0).toUpperCase() + range.slice(1).toLowerCase(); // Ensures case consistency

  

  if (category === "aspiration" && subCategory === "education") {
    subCategory = "educational"; // Correcting the key to match categoryDescriptions
  }

  let description;
  if (subCategory) {
    description = categoryDescriptions?.[category]?.[subCategory]?.[fixedRange];
  } else {
    description = categoryDescriptions?.[category]?.[fixedRange];
  }

  if (!description) {
    console.warn(`❌ Missing description for ${category} -> ${subCategory || "main"} -> ${fixedRange}`);
    return `Description not found for ${category} -> ${subCategory || "main"} -> ${fixedRange}`;
  }

  const pronounReplacements = {
    he: getPronoun(gender, "heShe"),
    his: getPronoun(gender, "hisHer"),
    him: getPronoun(gender, "himHer"),
    himself: getPronoun(gender, "himselfHerself"),
  };

  Object.keys(pronounReplacements).forEach((key) => {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    description = description.replace(regex, pronounReplacements[key]);
  });

  return description;
};


// **🔹 Function to determine the social support description**
const getSocialSupportDescription = (supportData, gender) => {
  let selectedSources = [];
  if (supportData.family === "High") selectedSources.push("family");
  if (supportData.friends === "High") selectedSources.push("friends");
  if (supportData.socialMedia === "High") selectedSources.push("socialMedia");

  if (selectedSources.length === 0) {
    return `${getPronoun(gender, "heShe")} has limited social support and may benefit from expanding ${getPronoun(gender, "hisHer")} network.`;
  }

  const key = selectedSources.sort().join("And");
  let description = categoryDescriptions.socialSupport[key];

  if (!description) {
    console.warn(`❌ Missing Social Support Description for key: ${key}`);
    return "Social Support description not found.";
  }

  return description
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
    all: "His scores indicate that he is efficient in all three learning styles - visual, auditory, and kinesthetic. He doesn’t have any preferential way in which he absorbs, processes, comprehends, and retains information. He has widespread recognition in any classroom management strategy.",
    visual: "His scores indicate that he is a visual learner. Visual learners are individuals who prefer to take in their information visually with visual representations like maps, graphs, diagrams, charts, and others. He is able to learn by using visual aids such as PowerPoint lectures, instructional videos, flow charts, etc.",
    auditory: "His scores indicate that he is an auditory learner. Auditory learners learn best when information is presented to them via strategies that involve talking, such as lectures and group discussions. He can benefit from repeating back the lessons, having recordings of the lectures, group activities that require classmates explaining ideas, etc.",
    kinesthetic: "His scores indicate that he is a kinesthetic learner. Kinesthetic learners are individuals who prefer to learn by doing. He enjoys a hands-on experience and is usually more in touch with reality and more connected to it, which is why he requires using tactile experience to understand something better. The best way to present new information to him is through personal experience, practice, examples, or simulations.",
    auditoryKinesthetic: "His scores indicate that he is an auditory learner and kinesthetic learner. Auditory learners learn best when information is presented to them via strategies that involve talking, such as lectures and group discussions. Kinesthetic learners are individuals who prefer to learn by doing. He enjoys a hands-on experience and is usually more in touch with reality and more connected to it, which is why he requires using tactile experience to understand something better.",
    visualAuditory: "His scores indicate that he is a visual and auditory learner. Visual learners are individuals who prefer to take in their information visually with visual representations like maps, graphs, diagrams, charts, and others. Auditory learners learn best when information is presented to them via strategies that involve talking, such as lectures and group discussions. He is able to learn by using visual and auditory aids such as PowerPoint lectures, instructional videos, flow charts, repeating back the lessons, having recordings of the lectures, group activities that require classmates explaining ideas, etc.",
    visualKinesthetic: "His scores indicate that he is a visual and kinesthetic learner. Visual learners are individuals who prefer to take in their information visually with visual representations like maps, graphs, diagrams, charts, and others. Kinesthetic learners are individuals who prefer to learn by doing. He enjoys a hands-on experience and is usually more in touch with reality and more connected to it, and he is able to learn by using visual aids such as PowerPoint lectures, instructional videos, flow charts, etc.",
  },
  collegeReadiness: {
    academicSkill: {
      High: "He has scored high in Academic skills. An individual with a high academic skill score will be resourceful, able to work well in a team, and capable of solving issues. He can pick up new abilities. He can read and write with a high level of independence.",
      Low: "He has scored low in Academic skills. Low academic skill levels are synonymous with low academic abilities. In order to do better, he can set goals, stick to routines and timetables, reward themselves for finishing challenging tasks, and manage their time effectively.",
    },
    executiveFunction: {
      High: "In executive function of college readiness, he has scored high. An individual with a high executive function score will be well-suited to tasks requiring flexibility of thought and internal control. He has good leadership abilities and can handle life's tasks. He has skills like working memory, planning flexibility, emotional control, and time management and has the ability in initiating tasks, and is highly attentive. He can keep track of assignments, organize books/materials, and manage time independently.",
      Low: "In executive function of college readiness, he has scored low. The individual with the lowest executive function score can strive to improve by organizing themselves, maintaining a positive outlook on themselves, taking a step-by-step approach to their work, and practicing meditation on a date night.",
    },
    motivationConfidence: {
      High: "In motivation and confidence of college readiness, he has scored high. The individual with the highest motivation and confidence score will be highly motivated to pursue life goals and succeed in college. He has a high desire to gain new knowledge and skills in a particular field. He is highly motivated towards the current education and is more confident in the growth of mindset in every opportunity to learn and grow academically and personally. He will also have a positive outlook on the future and be highly curious to learn new things. He can have clear set goals and believe that he can succeed.",
      Low: "In motivation and confidence of college readiness, he has scored low. The person with the lowest motivation and confidence score will not have much confidence. He can't therefore concentrate on their objectives, regularly assess his year's goals, and learn from his successes in order to increase his drive and confidence.",
    },
    postEducation: {
      High: "In post-education of college readiness, he has scored high. In terms of post-school preparedness, he can perform well. Following education and being prepared for college, he has these abilities: critical thinking, self-control, communication, teamwork, and study skills, etc. He can invest in his own education, see the value of obtaining some type of training or education past high school, and attend based on the correct motivation.",
      Low: "In post-education of college readiness, he has scored low. He is not prepared for college and will not be able to pay attention and is hugely non-serious in concern of studies and taking things for granted, wasting his time on unproductive activities, and his daily schedule will be based on his mood, not on priorities. Therefore, in order to improve, he can adopt a positive outlook for his post-educational future. Only then he will be able to organize their work, create a schedule that works, and manage their study space.",
    },
  },
  temperament: {
    personallyReserved: {
      High: "He has a propensity to keep his personal emotions to himself. He is partially reluctant to let friends and acquaintances get to know him too well. He has more good qualities than bad ones.",
      Low: "He doesn't have a propensity to keep his personal emotions to himself. He is not reluctant to let friends and acquaintances get to know him too well. He is less endowed with virtues than vices.",
    },
    selfCriticism: {
      High: "He can be quite impatient with other people and intolerant or irritable with anything that impedes or delays, restless desire for change and excitement. His tendency to engage in negative self-evaluation that results in feelings of worthlessness, failure, and guilt when expectations are not met; it was originally seen as particularly relevant to the development of depression.",
      Low: "He cannot be quite impatient with other people and intolerant or irritable with anything that impedes or delays, restless desire for change and excitement. He does not have the tendency to engage in negative self-evaluation that results in feelings of worth, optimism, and dignity.",
    },
    anxious: {
      High: "He is anxious, worrying, and stressed. Excessive worrying may increase the risk of developing depression. When under stress, he will experience catastrophic thoughts and feel overwhelmed. He can adapt ways to manage anxiety and worrying, including learning about anxiety, mindfulness, relaxation techniques, correct breathing techniques, dietary adjustments, exercise, learning to be assertive, building self-esteem, etc.",
      Low: "He is not anxious, worrying, and stressed. His emotions relating to relationships will not fluctuate very quickly.",
    },
    perfectionism: {
      High: "He is very responsible to have high standards for himself and to be highly committed to tasks and duties. He feels confident and has the ability to size up and deal with any situation. He'll always do his best. He exudes confidence and is capable of assessing and handling any circumstance.",
      Low: "He is not very responsible to have high standards for himself and to be highly committed to tasks and duties. He will not feel confident and has the ability to size up and deal with any situation. He doesn't exude confidence and is not capable of assessing and handling any circumstance.",
    },
    irritability: {
      High: "He has the tendency to be quick-tempered and to externalize stress by becoming snappy and irritated by little things. He has a feeling of agitation, frustration, or upset easily. He might experience it in response to stressful situations. It may also be a symptom of a mental or physical health condition.",
      Low: "He doesn't have the tendency to be quick-tempered and not to externalize stress by becoming snappy and irritated by little things.",
    },
  },
  socialSupport: {
    family: "He is completely free to be himself with his family. When he needs someone to listen to him, his family is the one he can actually rely on more than his friends and social media. He is less involved in social sectors because of his low communication level in terms of socialization.",
    friends: "He is completely free to be himself with his friends. When he needs someone to listen to him, his friends are the one he can actually rely on more than his family and social media. He is more involved in social sectors because of his high communication level in terms of socialization.",
    socialMedia: "He is completely free to be himself with social media. When he needs someone to listen to him, he uses to chat and engage himself in electronic gadgets. He can actually rely on social media more than his family and friends. He is not involved in social sectors because of his low communication level in terms of socialization. He will talk more, be more repetitive, communicate with less diverse vocabulary, and use more formal language and fewer positive emotion words.",
    familyAndFriends: "He is completely free to be himself with his family and friends. When he needs someone to listen to him, his family and friends are the ones he can actually rely on more than social media. He is more involved in social sectors because of his high communication level in terms of socialization.",
    friendsAndSocialMedia: "He is completely free to be himself with his friends and social media. When he needs someone to listen to him, his friends and social media are the ones he can actually rely on more than his family. He is more involved in social sectors because of his high communication level in terms of socialization.",
    familyAndSocialMedia:"He is completely free to be himself with his family and social media. When he needs someone to listen to him, his family and social media are the ones he can actually rely on more than his friends. He is more involved in social sectors because of his high communication level in terms of socialization.",
  },
  aspiration: {
    leadership: {
      High: "He scored 12 in leadership aspiration which advocates that he has a strong ambition and dedication to assume leadership roles and have a beneficial impact on a community or organization. He frequently demonstrates traits and attributes such as resilience, teamwork, emotional intelligence, visionary thinking, drive, ambition, effective communication, flexibility, and continual learning. He intentionally focuses on positively influencing the capacity to flourish in his professional and personal life and to strive to perform at their best.",
      Moderate: "He scored 12 in leadership aspiration which advocates that he has moderate leadership aspirations. He has an interest in taking on leadership roles, but perhaps not at the highest or most intense level. This could mean he is open to leadership opportunities and responsibilities, but he may not be actively seeking out executive or top-tier management positions.",
      Low: "He scored 12 in leadership aspiration which advocates that he has low leadership aspirations, a lack of desire or ambition to take on leadership roles or responsibilities within an organization or community. This can manifest in various ways, such as a reluctance to seek out leadership positions, a lack of interest in developing leadership skills, or a preference for staying within a more passive or follower role. He may have a lack of confidence, fear of failure, comfort zone, unawareness of potentials, etc.",
    },
    educational: {
      High: "His score 12 indicates that he has high educational aspirations, referring to a strong desire and ambition to achieve significant accomplishments in his education. He sets lofty goals for his academic pursuits and is motivated to excel in studies. This often extends beyond simply obtaining a degree and involves a commitment to continuous learning, personal development, and making a positive impact in his chosen field.",
      Moderate: "His score 12 indicates that he has moderate educational aspiration and has a desire for education and personal development but may not be aiming for the highest level of academic achievement. He often seeks a balance between acquiring practical skills and gaining a reasonable level of academic achievement. He prioritizes a combination of formal education, vocational training, or professional certifications that directly contribute to his career objective.",
      Low: "His score 12 indicates that he has low educational aspiration, referring to a lack of motivation or desire to pursue a higher level of education. This manifests in various ways, such as a disinterest in academic achievement, a belief that education is not important, or a perception that his current level of education is sufficient for his needs. He may not see the value or importance of obtaining additional education beyond a certain level.",
    },
    achievement: {
      High: "He has high achievement aspirations indicated by the score 12. Refer that he is quite broad and could refer to various contexts, such as academic achievements, career goals, sports, personal accomplishments, setting realistic goals, staying focused, and consistently working towards achievements. He takes lots of initiatives to achieve in his day-to-day life events. He can understand long-term life satisfaction that emphasizes the importance of an individual's perception of his success in one or more life domains relative to personal goals.",
      Moderate: "He has moderate achievement aspirations indicated by the score 12. This could suggest that he has some aspirations and goals but may not be extremely ambitious or overly modest.",
      Low: "He has low achievement aspirations indicated by the score 12. Suggests that he has limited motivation or ambition to set and achieve challenging goals. It could be indicative of a mindset where he is not actively seeking or striving for higher levels of success or accomplishment.",
    },
  },
};
// **🔹 Report generation endpoint**
router.post("/generate-report", async (req, res) => {
  const { name, rollNumber, gender, isFirstGraduate, hsPercentage, futureIdea, responses } = req.body;

  if (!name || !rollNumber || !gender || isFirstGraduate === undefined || !hsPercentage || !futureIdea || !responses) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  console.log("Data received:", req.body);

  try {
    const scores = {
      selfEfficacy: scoringHelper.calculateSelfEfficacy(responses.part1),
      learningStyle: scoringHelper.calculateLearningStyle(responses.part2),
      collegeReadiness: scoringHelper.calculateCollegeReadiness(responses.part3),
      temperament: scoringHelper.calculateTemperament(responses.part4),
      socialSupport: scoringHelper.calculateSocialSupport(responses.part5),
      aspiration: scoringHelper.calculateAspiration(responses.part6),
    };

    let report = `Report for ${name}, Roll No: ${rollNumber}\n`;
    report += `Gender: ${gender}\n`;
    report += `First Graduate: ${isFirstGraduate ? `${getPronoun(gender, "heShe")} is a first graduate in ${getPronoun(gender, "hisHer")} family` : `${getPronoun(gender, "heShe")} is not a first graduate in ${getPronoun(gender, "hisHer")} family`}\n`;
    report += `12th Grade Percentage: ${hsPercentage}%\n`;
    report += `Future Ambition: ${futureIdea}\n\n`;

    /*const selfEfficacyRange = scores.selfEfficacy?.interpretation || "No interpretation available";
    let selfEfficacyDesc = getDescription("selfEfficacy", null, selfEfficacyRange, gender);
    report += `Self-Efficacy: ${selfEfficacyRange}\nDescription: ${selfEfficacyDesc}\n\n`;*/

    const { dominantStyles } = scores.learningStyle;
    let learningKey = dominantStyles.length === 3 ? "all" : dominantStyles.sort().join("And");
    let learningDescription = categoryDescriptions.learningStyle[learningKey] || "No description available.";
    report += `Learning Style: ${dominantStyles.join(", ")}\nDescription: ${learningDescription.replace(/\bHe\b/g, getPronoun(gender, "heShe"))}\n\n`;

    Object.entries(scores.collegeReadiness).forEach(([subCategory, data]) => {
      let range = data?.interpretation || "No interpretation available";
      let description = getDescription("collegeReadiness", subCategory, range, gender);
      report += `${subCategory}: ${range}\nDescription: ${description}\n\n`;
    });

    scores.temperament.forEach(({ category, level }) => {
      let description = getDescription("temperament", category, level, gender);
      report += `${category}: ${level}\nDescription: ${description}\n\n`;
    });

    report += `Social Support: ${Object.keys(scores.socialSupport).filter(key => scores.socialSupport[key] === "High").join(", ")}\n`;
    report += `Description: ${getSocialSupportDescription(scores.socialSupport, gender)}\n\n`;

    Object.entries(scores.aspiration).forEach(([subCategory, data]) => {
      let range = data?.interpretation || "No interpretation available";
      let description = getDescription("aspiration", subCategory, range, gender);
      report += `${subCategory} Aspiration: ${range}\nDescription: ${description}\n\n`;
    });

    console.log("Generated Report:\n", report);

    // **✅ Save Report to MongoDB**
    const newReport = new Report({
      name,
      rollNumber,
      gender,
      isFirstGraduate,
      hsPercentage,
      futureIdea,
      generatedReport: report,
    });

    await newReport.save();

    res.status(200).json({ report, message: "Report generated and saved successfully!" });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// **✅ GET: Fetch All Saved Reports**
router.get("/saved-reports", async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get('/get-report', async (req, res) => {

  const { query } = req.query;

  try {
      const report = await Report.findOne({ $or: [{ name: query }, { rollNumber: query }] });

      if (!report) {
          return res.status(404).json({ message: "Report not found" });
      }

      res.json(report);
  } catch (error) {
      res.status(500).json({ message: "Server error" });
  }
});


router.get("/download/:id", async (req, res) => {
  try {
      const report = await Report.findById(req.params.id);
      if (!report) {
          return res.status(404).json({ message: "Report not found" });
      }

      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${report.name}_Report.pdf`);
      
      doc.pipe(res);

      doc.fontSize(18).text(`Report for ${report.name}`, { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Roll Number: ${report.rollNumber}`);
      doc.text(`Gender: ${report.gender}`);
      doc.text(`12th Grade Percentage: ${report.hsPercentage}%`);
      doc.text(`First Graduate: ${report.isFirstGraduate ? "Yes" : "No"}`);
      doc.text(`Future Ambition: ${report.futureIdea}`);
      doc.moveDown();
      
      doc.fontSize(14).text("Generated Report:", { underline: true });
      doc.moveDown();
      doc.fontSize(10).text(report.generatedReport, { lineGap: 4 });

      doc.end();
  } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});




module.exports = router;
