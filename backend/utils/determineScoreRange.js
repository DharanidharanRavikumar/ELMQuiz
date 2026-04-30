const determineScoreRange = (category, subCategory, score) => {
  const ranges = {
    selfEfficacy: { High: [13, 16], Moderate: [9, 12], Low: [4, 8] },
    learningStyle: {
      visual: [4, 8],
      auditory: [4, 8],
      kinesthetic: [4, 8],
    },
    collegeReadiness: {
      academicSkill: { High: [2, 2], Low: [0, 1] },
      executiveFunction: { High: [2, 2], Low: [0, 1] },
      motivationConfidence: { High: [2, 2], Low: [0, 1] },
      postEducation: { High: [3, 4], Low: [1, 2] },
    },
    temperament: {
      personallyReserved: { High: [3, 4], Low: [1, 2] },
      selfCriticism: { High: [3, 4], Low: [1, 2] },
      anxious: { High: [3, 4], Low: [1, 2] },
      perfectionism: { High: [3, 4], Low: [1, 2] },
      irritability: { High: [3, 4], Low: [1, 2] },
    },
    socialSupport: {
      family: { High: [3, 4], Low: [1, 2] },
      friends: { High: [3, 4], Low: [1, 2] },
      socialMedia: { High: [3, 4], Low: [1, 2] },
    },
    aspiration: {
      leadership: { High: [24, 32], Moderate: [17, 23], Low: [8, 16] },
      educational: { High: [24, 32], Moderate: [17, 23], Low: [8, 16] },
      achievement: { High: [24, 32], Moderate: [17, 23], Low: [8, 16] },
    },
  };

  if (!ranges[category]) {
    console.warn(`⚠️ Warning: Category "${category}" not found.`);
    return null;
  }

  if (subCategory) {
    if (!ranges[category][subCategory]) {
      console.warn(`⚠️ Warning: Subcategory "${subCategory}" not found in category "${category}".`);
      return null;
    }

    for (const [range, limits] of Object.entries(ranges[category][subCategory])) {
      if (score >= limits[0] && score <= limits[1]) return range;
    }
  } else {
    for (const [range, limits] of Object.entries(ranges[category])) {
      if (score >= limits[0] && score <= limits[1]) return range;
    }
  }

  return null; // Return `null` instead of "No interpretation available" for better debugging
};

module.exports = determineScoreRange;
