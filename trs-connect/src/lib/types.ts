// ==============================================================================
// TRS CONNECT - DATA MODELS & TYPES
// Strictly complies with Data Minimization and Privacy Non-Profiling Standards
// ==============================================================================

export type UserRole = 'MEMBER' | 'VOLUNTEER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  constituency: string;
  ward: string;
  address?: string;
  avatarUrl?: string;
  role: UserRole;
  isMember: boolean;
  isVolunteer: boolean;
  createdAt: string;
}

export type MembershipStatus = 'none' | 'pending' | 'approved' | 'rejected' | 'suspended';

export interface MembershipRecord {
  id: string;
  userId: string;
  applicationNumber: string;
  memberName: string;
  membershipNumber?: string; // Only issued AFTER official authorization
  phone: string;
  constituency: string;
  ward: string;
  status: MembershipStatus;
  category: 'General Citizen' | 'Youth Wing (TRSV)' | 'Women Empowerment' | 'Senior Citizen';
  appliedDate: string;
  approvedDate?: string;
  validTill?: string;
  qrCodeUrl?: string; // Active ONLY upon approval
  verificationBadge?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export type IssueStatus = 'submitted' | 'under_review' | 'assigned' | 'resolved';

export type IssueCategory = 
  | 'Roads & Potholes'
  | 'Water Supply & Pipelines'
  | 'Electricity & Transformers'
  | 'Sanitation & Garbage'
  | 'Streetlights & Safety'
  | 'Drainage & Sewage'
  | 'Parks & Public Amenities';

export interface CitizenIssue {
  id: string;
  userId: string;
  reporterName: string;
  reporterPhone: string;
  title: string;
  category: IssueCategory;
  description: string;
  photoUrl?: string;
  locationName: string;
  constituency: string;
  ward: string;
  status: IssueStatus;
  assignedDepartment?: string;
  assignedOfficer?: string;
  assignedOfficerContact?: string;
  submittedAt: string;
  updatedAt: string;
  resolutionNotes?: string;
}

export type EventCategory = 
  | 'Community Welfare Camp'
  | 'Youth Leadership Meet'
  | 'Townhall with MLA'
  | 'Public Tree Plantation'
  | 'Health & Eye Screening';

export interface EngagementEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  constituency: string;
  ward?: string;
  bannerUrl: string;
  speakerInfo: string;
  isRegistered?: boolean;
  passCode?: string;
}

// Data Minimization: Removed blood group and emergency contact
export interface VolunteerApplication {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  domains: string[];
  availability: 'Weekends Only' | 'On-Call Emergencies' | 'Full-Time Active' | 'Flexible Evenings';
  skills: string[];
  status: 'active' | 'pending';
  hoursLogged: number;
  missionsCompleted: number;
}

export interface VolunteerMission {
  id: string;
  title: string;
  domain: string;
  constituency: string;
  date: string;
  hoursCredit: number;
  status: 'open' | 'enlisted' | 'completed';
  description: string;
}

export interface YouthActivity {
  id: string;
  title: string;
  category: 'Sports & Tournaments' | 'Skill & Career Drive' | 'Hackathon & Tech' | 'Leadership Debate';
  description: string;
  date: string;
  venue: string;
  points: number;
  isEnrolled: boolean;
}

export interface AreaRepInfo {
  constituency: string;
  district: string;
  mlaName: string;
  mlaTitle: string;
  mlaPhotoUrl?: string;
  mlaOfficeAddress: string;
  mlaHelpline: string;
  statutoryEmergencyContacts: { service: string; number: string; description: string }[];
  developmentProjectsCount: string;
  resolvedIssuesPercent: string;
  activeWards: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'membership' | 'issue' | 'event' | 'announcement';
  timeAgo: string;
  read: boolean;
  targetScreen?: string;
}

export interface OfficialAnnouncement {
  id: string;
  title: string;
  summary: string;
  tag: 'Public Notice' | 'Community Welfare' | 'Organization Update';
  date: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: 'MEMBERSHIP_APPROVED' | 'MEMBERSHIP_REJECTED' | 'ISSUE_STATUS_UPDATED' | 'ROLE_CHANGED' | 'EVENT_CREATED';
  targetId: string;
  details: string;
  timestamp: string;
}
