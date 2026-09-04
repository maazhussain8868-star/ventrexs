import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { I18nProvider } from './context/I18nContext';
import { MobileFrame } from './components/layout/MobileFrame';
import { TopHeader } from './components/layout/TopHeader';
import { BottomNav } from './components/layout/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { OtpScreen } from './screens/OtpScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MembershipScreen } from './screens/MembershipScreen';
import { YouthHubScreen } from './screens/YouthHubScreen';
import { VolunteerScreen } from './screens/VolunteerScreen';
import { EventsScreen } from './screens/EventsScreen';
import { CitizenIssuesScreen } from './screens/CitizenIssuesScreen';
import { MyAreaScreen } from './screens/MyAreaScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { ProfileScreen } from './screens/ProfileScreen';

const MainRouter: React.FC = () => {
  const { currentScreen } = useApp();

  // Non-app-shell auth/intro screens
  const isAuthOrIntro = ['splash', 'onboarding', 'login', 'otp'].includes(currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'login':
        return <LoginScreen />;
      case 'otp':
        return <OtpScreen />;
      case 'home':
        return <HomeScreen />;
      case 'membership':
        return <MembershipScreen />;
      case 'youth_hub':
        return <YouthHubScreen />;
      case 'volunteer':
        return <VolunteerScreen />;
      case 'events':
        return <EventsScreen />;
      case 'issues':
        return <CitizenIssuesScreen />;
      case 'my_area':
        return <MyAreaScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  if (isAuthOrIntro) {
    return (
      <main className="flex-1 flex flex-col">
        {renderScreen()}
      </main>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen relative bg-slate-50">
      <TopHeader />
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {renderScreen()}
      </main>
      <BottomNav />
    </div>
  );
};

export function App() {
  return (
    <I18nProvider>
      <AppProvider>
        <MobileFrame>
          <ToastContainer />
          <MainRouter />
        </MobileFrame>
      </AppProvider>
    </I18nProvider>
  );
}

export default App;
