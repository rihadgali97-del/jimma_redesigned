export interface ServiceItem {
  id: string;
  title: string;
  arabicTitle?: string;
  category: 'Family & Marriage' | 'Welfare & Zakat' | 'Education & Guidance' | 'Funeral & Bereavement' | 'Governance & Legal';
  icon: string;
  shortDesc: string;
  fullDesc: string;
  eligibility: string;
  howItWorks: string[];
  requiredDocs: string[];
  processingTime: string;
  feeETB: string;
  contactPerson: string;
}

export const publicServiceCatalog: ServiceItem[] = [
  {
    id: 'srv-2',
    title: 'Zakat Assistance & Social Welfare Application',
    arabicTitle: 'طلب مساعدة الزكاة والرعاية الاجتماعية',
    category: 'Welfare & Zakat',
    icon: 'HandHeart',
    shortDesc: 'Submit and track a Zakat assistance application for council review.',
    fullDesc: 'Use the council application form to request Zakat assistance. The council reviews submitted applications and provides a tracking reference.',
    eligibility: 'Eligibility is assessed by the council after an application is submitted.',
    howItWorks: [
      'Submit the online application with accurate contact and household information.',
      'Save the tracking reference to check the application status.',
    ],
    requiredDocs: ['Supporting documents may be requested during the review.'],
    processingTime: 'Contact the council for current processing times.',
    feeETB: 'Contact the council for current fee information.',
    contactPerson: 'Council service desk',
  },
  {
    id: 'srv-3',
    title: 'Janazah Support Request',
    arabicTitle: 'طلب خدمات الجنازة',
    category: 'Funeral & Bereavement',
    icon: 'ShieldAlert',
    shortDesc: 'Submit a Janazah support request for council coordination.',
    fullDesc: 'Submit a request through the council form. A tracking reference is provided for follow-up.',
    eligibility: 'Requests are reviewed by the council.',
    howItWorks: [
      'Submit the Janazah request with accurate contact and service information.',
      'Save the tracking reference for follow-up.',
    ],
    requiredDocs: ['Supporting information may be requested during the review.'],
    processingTime: 'Contact the council to confirm current availability and response times.',
    feeETB: 'Contact the council for current fee information.',
    contactPerson: 'Council service desk',
  },
];
