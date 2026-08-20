/**
 * Domain Taxonomy & Platform Constants
 * Standard academic categories, Nigerian & global universities, citation formats, and pricing configurations.
 * Contains ZERO mock data.
 */

export const INSTITUTIONS = [
  'All Universities',
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU)',
  'Ahmadu Bello University (ABU)',
  'University of Nigeria, Nsukka (UNN)',
  'University of Benin (UNIBEN)',
  'University of Port Harcourt (UNIPORT)',
  'University of Ilorin (UNILORIN)',
  'Federal University of Technology, Akure (FUTA)',
  'Federal University of Technology, Minna (FUTMINNA)',
  'Lagos State University (LASU)',
  'Covenant University',
  'Babcock University',
  'Bowen University',
  'Afe Babalola University (ABUAD)',
  'Rivers State University (RSU)',
  'Delta State University (DELSU)',
  'Nnamdi Azikiwe University (UNIZIK)',
  'Federal Poly Nekede',
  'Yaba College of Technology (YABATECH)',
  'Other / International Institution',
];

export const CATEGORIES = [
  'All Materials',
  'Computer Science & Software Eng',
  'Economics, Accounting & Finance',
  'Law & Jurisprudence',
  'Medicine, Nursing & Health Sciences',
  'Civil, Mech & Electrical Engineering',
  'Business Admin & Marketing',
  'Mass Communication & Media',
  'Biochemistry & Microbiology',
  'Political Science & Sociology',
  'General Studies (GST / General)',
];

export const LEVELS = [
  'All Levels',
  '100L (Freshman)',
  '200L (Sophomore)',
  '300L (Penultimate)',
  '400L (Final Year)',
  '500L (Professional Final Year)',
  'Postgraduate (Masters)',
  'Doctorate (Ph.D)',
];

export const CITATION_STYLES = [
  'APA 7th Edition',
  'MLA 9th Edition',
  'Harvard Style',
  'Chicago / Turabian',
  'IEEE Format',
  'OSCOLA (Law)',
  'Vancouver (Medical)',
];

export const ACADEMIC_SERVICES = [
  {
    id: 'assignments',
    name: 'Assignments / Essays / Coursework',
    multiplier: 1.0,
    unit: 'page',
    basePrice: 1000,
    desc: 'Custom research essays and coursework',
    icon: '📝',
  },
  {
    id: 'slides',
    name: 'PowerPoint Slide Presentation & Defense Deck',
    multiplier: 1.0,
    unit: 'slide',
    basePrice: 1000,
    desc: 'Defense slides with speaker notes',
    icon: '📊',
  },
  {
    id: 'projects',
    name: 'Final Year Projects (Chapters 1–5)',
    multiplier: 1.4,
    unit: 'page',
    basePrice: 1400,
    desc: 'Complete capstone research with questionnaires & methodology',
    icon: '📚',
  },
  {
    id: 'data_analysis',
    name: 'Data Analysis (SPSS, STATA, Python, R, Excel)',
    multiplier: 1.8,
    unit: 'page',
    basePrice: 1800,
    desc: 'Statistical regression, ANOVA, econometric modeling & charts',
    icon: '📈',
  },
  {
    id: 'thesis',
    name: 'Thesis / Dissertation Proposals',
    multiplier: 1.5,
    unit: 'page',
    basePrice: 1500,
    desc: 'Postgraduate & Masters research outlines with literature review',
    icon: '🎓',
  },
  {
    id: 'proofreading',
    name: 'Proofreading & Turnitin Paraphrasing',
    multiplier: 0.6,
    unit: 'page',
    basePrice: 600,
    desc: 'Plagiarism reduction, grammar refinement, and formatting',
    icon: '✨',
  },
];
