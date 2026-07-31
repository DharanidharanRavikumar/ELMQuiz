const determineScoreRange = require("./determineScoreRange");

// Reverse scoring function
function reverseScore(score) {
  return 5 - score; // Reverse 1 ↔ 4, 2 ↔ 3
}

// PART-I: Self-Efficacy Scoring
function calculateSelfEfficacy(responses) {
  const totalScore = responses.reduce((sum, score) => sum + score, 0);
  return { totalScore, interpretation: determineScoreRange("selfEfficacy", null, totalScore) };
}

// PART-II: Learning Style Scoring
function calculateLearningStyle(responses) {
  const visual = responses[0] + responses[1];
  const auditory = responses[2] + responses[5];
  const kinesthetic = responses[3] + responses[4];

  const dominantStyles = [];
  if (visual >= 4) dominantStyles.push("visual");
  if (auditory >= 4) dominantStyles.push("auditory");
  if (kinesthetic >= 4) dominantStyles.push("kinesthetic");

  // ✅ Ensure correct sorting before returning
  return { 
    visual, 
    auditory, 
    kinesthetic, 
    dominantStyles: dominantStyles.sort() 
  };
}

// PART-III: College Readiness Scoring
function calculateCollegeReadiness(responses) {
  const scores = {
    academicSkill: responses[0] + responses[1],
    executiveFunction: responses[2] + responses[3],
    motivationConfidence: responses[4] + responses[5],
    postEducation: responses[6] + responses[7] + responses[8] + responses[9],
  };

  return {
    academicSkill: { score: scores.academicSkill, interpretation: determineScoreRange("collegeReadiness", "academicSkill", scores.academicSkill) },
    executiveFunction: { score: scores.executiveFunction, interpretation: determineScoreRange("collegeReadiness", "executiveFunction", scores.executiveFunction) },
    motivationConfidence: { score: scores.motivationConfidence, interpretation: determineScoreRange("collegeReadiness", "motivationConfidence", scores.motivationConfidence) },
    postEducation: { score: scores.postEducation, interpretation: determineScoreRange("collegeReadiness", "postEducation", scores.postEducation) },
  };
}

// PART-IV: Temperament Scoring
function calculateTemperament(responses) {
  const categories = ["selfWorth", "interpersonalPatience", "anxious", "situationalConfidence", "irritability"];
  const reverseIndexes = [1, 2, 4];

  return responses.map((score, index) => {
    if (reverseIndexes.includes(index)) score = reverseScore(score);
    return { category: categories[index], level: determineScoreRange("temperament", categories[index], score) };
  });
}

// PART-V: Level of Social Support
function calculateSocialSupport(responses) {
  const counts = { family: 0, friends: 0, socialMedia: 0 };
  const map = { 1: "family", 2: "friends", 3: "socialMedia" };

  responses.forEach((score) => {
    const key = map[score];
    if (key) counts[key]++;
  });

  // 2 questions total: picked both times = High, once = Moderate, never = Low
  const classify = (count) => (count === 2 ? "High" : count === 1 ? "Moderate" : "Low");

  return {
    family: classify(counts.family),
    friends: classify(counts.friends),
    socialMedia: classify(counts.socialMedia),
  };
}

// PART-VI: Aspiration Scoring
function calculateAspiration(responses) {
  const leadershipIds = [0, 1, 3, 4, 6, 11, 14, 23];
  const achievementIds = [2, 7, 8, 12, 16, 19, 20, 21];
  const educationIds = [5, 9, 10, 13, 15, 17, 18, 22];

  const reverseIds = [1, 3, 11, 19, 21];

  let scores = { leadership: 0, achievement: 0, education: 0 };

  responses.forEach((score, index) => {
    if (reverseIds.includes(index)) score = reverseScore(score);
    if (leadershipIds.includes(index)) scores.leadership += score;
    if (achievementIds.includes(index)) scores.achievement += score;
    if (educationIds.includes(index)) scores.education += score;
  });

  return {
    leadership: { score: scores.leadership, interpretation: determineScoreRange("aspiration", "leadership", scores.leadership) },
    achievement: { score: scores.achievement, interpretation: determineScoreRange("aspiration", "achievement", scores.achievement) },
    education: { score: scores.education, interpretation: determineScoreRange("aspiration", "educational", scores.education) },
  };
}

module.exports = {
  calculateSelfEfficacy,
  calculateLearningStyle,
  calculateCollegeReadiness,
  calculateTemperament,
  calculateSocialSupport,
  calculateAspiration,
};
