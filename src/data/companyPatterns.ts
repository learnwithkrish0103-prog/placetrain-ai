export interface CompanyPlacementPattern {
  id: string;
  name: string;
  logoLetter: string;
  color: string;
  eligibility: string;
  totalDurationMinutes: number;
  sections: {
    name: string;
    questionCount: number;
    timeMinutes: number;
    negativeMarking: boolean;
    keyTopics: string[];
  }[];
  readinessThresholdScore: number;
}

export const COMPANY_PLACEMENT_PATTERNS: CompanyPlacementPattern[] = [
  {
    id: 'tcs-nqt',
    name: 'TCS National Qualifier Test (NQT)',
    logoLetter: 'T',
    color: 'bg-blue-600',
    eligibility: '60% throughout 10th, 12th, and B.Tech / B.E. (Max 1 active backlog)',
    totalDurationMinutes: 75,
    readinessThresholdScore: 70,
    sections: [
      {
        name: 'Numerical Ability (Quant)',
        questionCount: 20,
        timeMinutes: 25,
        negativeMarking: false,
        keyTopics: ['Percentages', 'Time & Work', 'Number Systems', 'Profit & Loss', 'Ratios'],
      },
      {
        name: 'Reasoning Ability (Logical)',
        questionCount: 20,
        timeMinutes: 25,
        negativeMarking: false,
        keyTopics: ['Number Series', 'Blood Relations', 'Syllogisms', 'Coding Decoding', 'Direction Sense'],
      },
      {
        name: 'Verbal Ability (English)',
        questionCount: 25,
        timeMinutes: 25,
        negativeMarking: false,
        keyTopics: ['Error Spotting', 'Reading Comprehension', 'Sentence Correction', 'Para Jumbles'],
      },
    ],
  },
  {
    id: 'infosys',
    name: 'Infosys Specialist & SE Assessment',
    logoLetter: 'I',
    color: 'bg-indigo-600',
    eligibility: '65% or 6.5 CGPA in Graduation with no active backlogs',
    totalDurationMinutes: 100,
    readinessThresholdScore: 75,
    sections: [
      {
        name: 'Mathematical Ability',
        questionCount: 10,
        timeMinutes: 35,
        negativeMarking: false,
        keyTopics: ['Permutations & Combinations', 'Probability', 'Speed & Distance', 'Mixtures'],
      },
      {
        name: 'Logical & Analytical Reasoning',
        questionCount: 15,
        timeMinutes: 25,
        negativeMarking: false,
        keyTopics: ['Data Sufficiency', 'Puzzles', 'Syllogisms', 'Clocks & Calendars'],
      },
      {
        name: 'Verbal Ability',
        questionCount: 20,
        timeMinutes: 20,
        negativeMarking: false,
        keyTopics: ['Sentence Correction', 'Fill in the Blanks', 'Critical Reading'],
      },
    ],
  },
  {
    id: 'accenture',
    name: 'Accenture Cognitive & Technical Assessment',
    logoLetter: 'A',
    color: 'bg-purple-600',
    eligibility: '60% or 6.5 CGPA with all degrees cleared in 1st attempt',
    totalDurationMinutes: 90,
    readinessThresholdScore: 70,
    sections: [
      {
        name: 'Critical Thinking & Analytical Reasoning',
        questionCount: 18,
        timeMinutes: 30,
        negativeMarking: false,
        keyTopics: ['Analogies', 'Direction Sense', 'Seating Arrangements', 'Statement & Conclusion'],
      },
      {
        name: 'Abstract Reasoning & Verbal',
        questionCount: 17,
        timeMinutes: 30,
        negativeMarking: false,
        keyTopics: ['Grammar', 'Synonyms & Antonyms', 'Sentence Completion'],
      },
      {
        name: 'Numerical Ability',
        questionCount: 15,
        timeMinutes: 30,
        negativeMarking: false,
        keyTopics: ['Percentages', 'Averages', 'Simple Interest', 'Time & Work'],
      },
    ],
  },
  {
    id: 'wipro',
    name: 'Wipro Elite National Talent Hunt',
    logoLetter: 'W',
    color: 'bg-emerald-600',
    eligibility: '60% or 6.0 CGPA in 10th, 12th and Graduation (3-year education gap allowed)',
    totalDurationMinutes: 60,
    readinessThresholdScore: 68,
    sections: [
      {
        name: 'Logical Reasoning',
        questionCount: 14,
        timeMinutes: 20,
        negativeMarking: false,
        keyTopics: ['Number Series', 'Coding Decoding', 'Blood Relations', 'Ranking'],
      },
      {
        name: 'Quantitative Aptitude',
        questionCount: 16,
        timeMinutes: 20,
        negativeMarking: false,
        keyTopics: ['HCF & LCM', 'Profit & Loss', 'Time & Work', 'Trains'],
      },
      {
        name: 'English Language',
        questionCount: 18,
        timeMinutes: 20,
        negativeMarking: false,
        keyTopics: ['Error Spotting', 'Grammar', 'Reading Comprehension'],
      },
    ],
  },
];
