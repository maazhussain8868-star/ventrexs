// ==============================================================================
// TRS CONNECT - DEVELOPMENT DATASET
// Compliant with Pre-Launch Authenticity & Security Guidelines
// No fabricated political leaders, fake counts, or invented phone numbers
// ==============================================================================

import {
  UserProfile,
  MembershipRecord,
  CitizenIssue,
  EngagementEvent,
  VolunteerMission,
  VolunteerApplication,
  YouthActivity,
  AreaRepInfo,
  AppNotification,
  OfficialAnnouncement
} from '../lib/types';

// Default development profile (Clearly labeled)
export const initialProfile: UserProfile = {
  id: 'usr_dev_citizen',
  fullName: 'Citizen Member',
  phone: '', // Blank by default, user enters their own number
  email: '',
  constituency: 'Jubilee Hills (AC-61)',
  ward: 'Ward 98',
  role: 'MEMBER',
  isMember: false,
  isVolunteer: false,
  createdAt: new Date().toISOString()
};

// Initial membership record: Defaults to PENDING verification as mandated
export const initialPendingMembership: MembershipRecord = {
  id: 'mem_app_1001',
  userId: 'usr_dev_citizen',
  applicationNumber: 'APP-2026-00892',
  memberName: 'Citizen Applicant',
  phone: '',
  constituency: 'Jubilee Hills (AC-61)',
  ward: 'Ward 98',
  status: 'pending', // NEVER auto-approved
  category: 'Youth Wing (TRSV)',
  appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  verificationBadge: 'Pending Verification by Authorized Committee'
};

// Sample issues: Private to reporting user or community demo
export const mockIssues: CitizenIssue[] = [
  {
    id: 'iss_dev_01',
    userId: 'usr_dev_citizen',
    reporterName: 'Citizen Resident',
    reporterPhone: 'Data Protected',
    title: 'Damaged storm drain slab near Metro Pillar 1402',
    category: 'Drainage & Sewage',
    description: 'Cracked slab observed after rainfall. Poses safety risk for commuters during evening hours.',
    locationName: 'Road 36, Near Peddamma Temple Metro, Jubilee Hills',
    constituency: 'Jubilee Hills (AC-61)',
    ward: 'Ward 98',
    status: 'assigned',
    assignedDepartment: 'GHMC Ward Engineering Wing',
    assignedOfficer: 'Division Junior Engineer (Inspection Team)',
    assignedOfficerContact: 'Official Control Room 112',
    submittedAt: '2026-08-28T14:30:00Z',
    updatedAt: '2026-08-30T09:15:00Z',
    resolutionNotes: 'Site inspection completed. Work order issued to zonal maintenance crew.'
  },
  {
    id: 'iss_dev_02',
    userId: 'usr_dev_citizen',
    reporterName: 'Citizen Resident',
    reporterPhone: 'Data Protected',
    title: 'Low municipal water supply pressure in colony lane 4',
    category: 'Water Supply & Pipelines',
    description: 'Reduced pressure reported over recent days by residents.',
    locationName: 'Lane 4, Prashasan Nagar, Jubilee Hills',
    constituency: 'Jubilee Hills (AC-61)',
    ward: 'Ward 98',
    status: 'under_review',
    assignedDepartment: 'HMWSSB Water Works Sub-Division',
    submittedAt: '2026-09-01T11:00:00Z',
    updatedAt: '2026-09-02T16:00:00Z',
    resolutionNotes: 'Pressure gauge analysis scheduled at local valve node.'
  }
];

// Events: Clearly labeled speaker status and live sync notes
export const mockEvents: EngagementEvent[] = [
  {
    id: 'evt_dev_101',
    title: 'Telangana Youth Leadership & Innovation Forum',
    description: 'Session focused on youth skill opportunities, entrepreneurship incubation, and community civic participation.',
    category: 'Youth Leadership Meet',
    date: '10 Sep 2026',
    time: '10:00 AM - 01:00 PM',
    venue: 'HITEX Exhibition Center, Madhapur',
    constituency: 'Jubilee Hills & Serilingampally',
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
    speakerInfo: 'Official Panel: Keynote Speakers (To be announced upon confirmation)',
    isRegistered: false
  },
  {
    id: 'evt_dev_102',
    title: 'Haritha Haram Public Tree Plantation Drive',
    description: 'Community-led greening drive to plant indigenous saplings along local lake bunds and parks.',
    category: 'Public Tree Plantation',
    date: '15 Sep 2026',
    time: '07:30 AM - 11:00 AM',
    venue: 'Durgam Cheruvu Lake Park Area',
    constituency: 'Jubilee Hills (AC-61)',
    ward: 'Ward 98',
    bannerUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop',
    speakerInfo: 'Ward Environmental Committee Officers',
    isRegistered: false
  },
  {
    id: 'evt_dev_103',
    title: 'Free Community Health & Diagnostic Screening Camp',
    description: 'General health checkup, blood pressure screening, and preventative care consultations for families.',
    category: 'Health & Eye Screening',
    date: '20 Sep 2026',
    time: '09:00 AM - 03:00 PM',
    venue: 'Community Center, Yousufguda',
    constituency: 'Jubilee Hills (AC-61)',
    ward: 'Ward 95',
    bannerUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop',
    speakerInfo: 'Certified Medical Volunteer Doctors',
    isRegistered: false
  }
];

export const mockVolunteerMissions: VolunteerMission[] = [
  {
    id: 'vms_dev_01',
    title: 'Citizen Digital Literacy & Grievance Support Desk',
    domain: 'Field Organizing & Digital Help',
    constituency: 'Jubilee Hills',
    date: 'Saturdays (10 AM - 1 PM)',
    hoursCredit: 4,
    status: 'open',
    description: 'Assist elderly and local citizens with filing road/sanitation reports on the official portal.'
  },
  {
    id: 'vms_dev_02',
    title: 'Sapling Distribution & Neighborhood Greening',
    domain: 'Environmental & Tree Drives',
    constituency: 'Jubilee Hills',
    date: '15 Sep 2026',
    hoursCredit: 4,
    status: 'open',
    description: 'Help coordinate sapling distribution queues and resident care information.'
  }
];

export const mockYouthActivities: YouthActivity[] = [
  {
    id: 'yth_dev_01',
    title: 'TRSV Ward Youth Box Cricket Tournament',
    category: 'Sports & Tournaments',
    description: 'Community sports meet promoting fitness, team camaraderie, and youth participation.',
    date: '12-14 Sep 2026',
    venue: 'Kotla Vijaya Bhaskara Reddy Grounds',
    points: 100,
    isEnrolled: false
  },
  {
    id: 'yth_dev_02',
    title: 'CivicTech Open Innovation Hackathon',
    category: 'Hackathon & Tech',
    description: 'Design prototypes for neighborhood civic routing, disaster warning, and municipal tracking.',
    date: '22-23 Sep 2026',
    venue: 'T-Hub 2.0, Raidurg',
    points: 200,
    isEnrolled: false
  }
];

// Area Information: Genuine statutory public emergency numbers ONLY (no fake personal phone numbers)
export const mockAreaRep: AreaRepInfo = {
  constituency: 'Jubilee Hills (AC-61)',
  district: 'Hyderabad District',
  mlaName: 'Representative data pending official publication',
  mlaTitle: 'Member of Legislative Assembly (Constituency Office)',
  mlaOfficeAddress: 'Official Camp Office address pending verification',
  mlaHelpline: 'Data unavailable (Configure official hotline in admin panel)',
  statutoryEmergencyContacts: [
    { service: 'National All Emergency Helpline', number: '112', description: 'Unified Pan-India Emergency Service' },
    { service: 'Telangana State Police', number: '100', description: 'Immediate Law & Order Response' },
    { service: 'Fire & Rescue Services', number: '101', description: 'Emergency Fire Incident Control' },
    { service: 'Government Ambulance Emergency', number: '108', description: 'Emergency Medical & Trauma Service' },
    { service: 'Women Helpline', number: '181', description: '24x7 Women Safety & Support' },
    { service: 'Child Helpline', number: '1098', description: 'Child Protection & Emergency Care' }
  ],
  developmentProjectsCount: 'Data unavailable (Pending live sync)',
  resolvedIssuesPercent: 'Data unavailable',
  activeWards: ['Ward 95 (Yousufguda)', 'Ward 96 (Vengalrao Nagar)', 'Ward 97 (Somajiguda)', 'Ward 98 (Venkatagiri)', 'Ward 99 (Borabanda)', 'Ward 100 (Rahmath Nagar)']
};

export const mockAnnouncements: OfficialAnnouncement[] = [
  {
    id: 'ann_dev_1',
    title: 'Official Voluntary Membership Portal Initial Launch',
    summary: 'Citizens across all 33 Telangana districts can submit voluntary membership applications subject to authorized committee verification.',
    tag: 'Organization Update',
    date: '02 Sep 2026'
  },
  {
    id: 'ann_dev_2',
    title: 'Citizen Grievance Redressal Protocol Published',
    summary: 'Direct community reporting for road conditions, water shortages, and public amenities active through this portal.',
    tag: 'Public Notice',
    date: '28 Aug 2026'
  }
];

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif_dev_1',
    title: 'Membership Application Received',
    message: 'Your voluntary membership application has been received and is pending review by the authorized constituency committee.',
    type: 'membership',
    timeAgo: 'Just now',
    read: false,
    targetScreen: 'membership'
  },
  {
    id: 'notif_dev_2',
    title: 'Security Notice: Zero Profiling Standard',
    message: 'TRS Connect strictly prohibits ideological profiling, sensitive scoring, and unauthorized data sharing.',
    type: 'announcement',
    timeAgo: '1 day ago',
    read: true,
    targetScreen: 'profile'
  }
];
