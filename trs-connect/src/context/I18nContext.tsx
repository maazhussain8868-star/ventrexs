import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'te' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    te: string;
    hi: string;
  };
}

export const translations: Translations = {
  // Common Navigation
  navHome: { en: 'Home', te: 'హోమ్', hi: 'होम' },
  navMyArea: { en: 'My Area', te: 'నా ప్రాంతం', hi: 'मेरा क्षेत्र' },
  navEvents: { en: 'Events', te: 'కార్యక్రమాలు', hi: 'आयोजन' },
  navIssues: { en: 'Issues', te: 'సమస్యలు', hi: 'समस्याएं' },
  navProfile: { en: 'Profile', te: 'ప్రొఫైల్', hi: 'प्रोफ़ाइल' },

  // App & Header
  appTitle: { en: 'TRS Connect', te: 'టిఆర్ఎస్ కనెక్ట్', hi: 'टीआरएस कनेक्ट' },
  appTagline: { en: 'Telangana Citizen & Youth Platform', te: 'తెలంగాణ పౌర & యువజన వేదిక', hi: 'तेलंगाना नागरिक व युवा मंच' },
  welcome: { en: 'Namaste', te: 'నమస్కారం', hi: 'नमस्ते' },
  guest: { en: 'Citizen', te: 'పౌరుడు', hi: 'नागरिक' },
  notifications: { en: 'Notifications', te: 'నోటిఫికేషన్లు', hi: 'सूचनाएं' },
  markAllRead: { en: 'Mark all as read', te: 'అన్నీ చదివినట్లు గుర్తించు', hi: 'सभी को पढ़ा हुआ चिह्नित करें' },

  // Home Screen
  membershipCardTitle: { en: 'TRS Official Membership', te: 'టిఆర్ఎస్ అధికారిక సభ్యత్వం', hi: 'टीआरएस आधिकारिक सदस्यता' },
  membershipCardSubtitle: { en: 'Get your verified digital identity & join the mission', te: 'డిజిటల్ గుర్తింపు కార్డు పొంది ఉద్యమంలో చేరండి', hi: 'डिजिटल पहचान पत्र पाएं और मिशन से जुड़ें' },
  joinMembershipBtn: { en: 'Join Membership', te: 'సభ్యత్వం తీసుకోండి', hi: 'सदस्यता लें' },
  viewDigitalCardBtn: { en: 'View Digital Card', te: 'డిజిటల్ కార్డు చూడండి', hi: 'डिजिटल कार्ड देखें' },
  volunteerCardTitle: { en: 'Become a TRS Volunteer', te: 'టిఆర్ఎస్ వాలంటీర్ అవ్వండి', hi: 'टीआरएस वॉलंटियर बनें' },
  volunteerCardSubtitle: { en: 'Lead community welfare and youth initiatives', te: 'సామాజిక సేవ మరియు యువజన నాయకత్వంలో పాలుపంచుకోండి', hi: 'सामुदायिक सेवा और युवा नेतृत्व में भाग लें' },
  volunteerBtn: { en: 'Enlist as Volunteer', te: 'వాలంటీర్‌గా చేరండి', hi: 'वॉलंटियर के रूप में जुड़ें' },
  upcomingEvents: { en: 'Upcoming Events', te: 'రాబోయే కార్యక్రమాలు', hi: 'आगामी कार्यक्रम' },
  recentCitizenIssues: { en: 'Citizen Grievances', te: 'పౌర సమస్యల పరిష్కారం', hi: 'नागरिक समस्याएं' },
  reportAnIssue: { en: 'Report Issue', te: 'సమస్యను నివేదించండి', hi: 'समस्या दर्ज करें' },
  viewAll: { en: 'View All', te: 'అన్నీ చూడండి', hi: 'सभी देखें' },
  youthHubBanner: { en: 'TRSV Youth Hub & Tournaments', te: 'టిఆర్ఎస్వీ యువజన వేదిక & పోటీలు', hi: 'टीआरएसवी युवा मंच व प्रतियोगिताएं' },
  officialUpdates: { en: 'Official Announcements', te: 'అధికారిక ప్రకటనలు', hi: 'आधिकारिक घोषणाएं' },

  // Membership Screen
  membershipFlowTitle: { en: 'Citizen Membership Portal', te: 'పౌర సభ్యత్వ పోర్టల్', hi: 'नागरिक सदस्यता पोर्टल' },
  stepMobile: { en: '1. Mobile', te: '1. మొబైల్', hi: '1. मोबाइल' },
  stepOtp: { en: '2. Verify', te: '2. ధృవీకరణ', hi: '2. सत्यापन' },
  stepProfile: { en: '3. Details', te: '3. వివరాలు', hi: '3. विवरण' },
  stepConsent: { en: '4. Consent', te: '4. సమ్మతి', hi: '4. सहमति' },
  stepStatus: { en: '5. Card', te: '5. కార్డు', hi: '5. कार्ड' },
  digitalCardHeader: { en: 'OFFICIAL MEMBERSHIP CARD', te: 'అధికారిక సభ్యత్వ గుర్తింపు కార్డు', hi: 'आधिकारिक सदस्यता कार्ड' },
  memberId: { en: 'MEMBER ID', te: 'సభ్యత్వ సంఖ్య', hi: 'सदस्य संख्या' },
  joinedOn: { en: 'JOINED ON', te: 'చేరిన తేదీ', hi: 'शामिल होने की तिथि' },
  validUntil: { en: 'VALID UNTIL', te: 'చెల్లుబాటు కాలం', hi: 'वैधता तिथि' },
  constituency: { en: 'CONSTITUENCY', te: 'నియోజకవర్గం', hi: 'विधानसभा क्षेत्र' },
  verifiedStatus: { en: 'VERIFIED MEMBER', te: 'ధృవీకరించబడిన సభ్యుడు', hi: 'सत्यापित सदस्य' },
  shareCard: { en: 'Share Card', te: 'కార్డును షేర్ చేయండి', hi: 'कार्ड साझा करें' },
  downloadCard: { en: 'Download Pass', te: 'పాస్ డౌన్‌లోడ్ చేసుకోండి', hi: 'पास डाउनलोड करें' },

  // Issues Screen
  issuesTitle: { en: 'Citizen Issue Redressal', te: 'పౌర సమస్యల పరిష్కార వేదిక', hi: 'नागरिक समस्या समाधान मंच' },
  reportNewIssue: { en: 'Report New Issue', te: 'కొత్త సమస్యను నమోదు చేయండి', hi: 'नई समस्या दर्ज करें' },
  myIssuesTab: { en: 'My Reported Issues', te: 'నేను నమోదు చేసిన సమస్యలు', hi: 'मेरी दर्ज समस्याएं' },
  allIssuesTab: { en: 'Ward Community Issues', te: 'వార్డు ప్రజా సమస్యలు', hi: 'वार्ड सार्वजनिक समस्याएं' },
  statusSubmitted: { en: 'Submitted', te: 'సమర్పించబడింది', hi: 'दर्ज' },
  statusUnderReview: { en: 'Under Review', te: 'పరిశీలనలో ఉంది', hi: 'समीक्षाधीन' },
  statusAssigned: { en: 'Assigned', te: 'అధికారి కేటాయింపు', hi: 'सौंपा गया' },
  statusResolved: { en: 'Resolved', te: 'పరిష్కరించబడింది', hi: 'समाधान हो गया' },

  // Events Screen
  eventsTitle: { en: 'Party & Community Events', te: 'పార్టీ & ప్రజా కార్యక్రమాలు', hi: 'संगठन व जन कार्यक्रम' },
  allEvents: { en: 'All Events', te: 'అన్ని కార్యక్రమాలు', hi: 'सभी आयोजन' },
  registeredEvents: { en: 'My RSVPs', te: 'నేను నమోదు చేసుకున్నవి', hi: 'मेरे पंजीकृत कार्यक्रम' },
  registerBtn: { en: 'Register Now', te: 'నమోదు చేసుకోండి', hi: 'पंजीकरण करें' },
  registeredBadge: { en: 'Registered (RSVP Confirmed)', te: 'నమోదు పూర్తయింది', hi: 'पंजीकृत (स्वीकृत)' },

  // Youth Hub
  youthHubTitle: { en: 'TRSV Youth Hub', te: 'టిఆర్ఎస్వీ యూత్ హబ్', hi: 'टीआरएसवी यूथ हब' },
  youthTagline: { en: 'Sports, Skills & Civic Leadership', te: 'క్రీడలు, నైపుణ్యాలు & యువ నాయకత్వం', hi: 'खेल, कौशल और युवा नेतृत्व' },

  // Volunteer
  volunteerTitle: { en: 'Volunteer Action Center', te: 'వాలంటీర్ యాక్షన్ సెంటర్', hi: 'वॉलंटियर एक्शन सेंटर' },

  // My Area
  myAreaTitle: { en: 'Constituency & Ward Pulse', te: 'నియోజకవర్గం & వార్డు వివరాలు', hi: 'विधानसभा व वार्ड विवरण' },

  // Profile
  profileTitle: { en: 'Citizen Profile & Privacy', te: 'పౌర ప్రొఫైల్ & గోప్యత', hi: 'नागरिक प्रोफ़ाइल व गोपनीयता' },
  changeLanguage: { en: 'Select Language', te: 'భాషను ఎంచుకోండి', hi: 'भाषा चुनें' },
  logout: { en: 'Log Out', te: 'లాగ్ అవుట్', hi: 'लॉग आउट' },
  deleteAccount: { en: 'Delete My Account & Data', te: 'ఖాతా మరియు డేటాను తొలగించండి', hi: 'खाता व डेटा हटाएं' },
};

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('trs_language');
    return (saved as SupportedLanguage) || 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('trs_language', lang);
  };

  const t = (key: string): string => {
    if (!translations[key]) return key;
    return translations[key][language] || translations[key].en;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
