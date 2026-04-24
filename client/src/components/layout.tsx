import React from 'react';
import Header from './header';
import LeftSidebar from './left-sidebar';
import RightSidebar from './right-sidebar';
import MobileNavigation from './mobile-navigation';
import ChatOverlay from './chat/chat-overlay';

interface LayoutProps {
  children: React.ReactNode;
  showRightSidebar?: boolean;
}

export default function Layout({ children, showRightSidebar = true }: LayoutProps) {
  return (
    <>
      <Header />
      <MobileNavigation />
      
      <main className="container mx-auto pt-20 pb-20 md:pt-24 md:pb-8 px-4 md:flex gap-4">
        <LeftSidebar />
        
        <div className="flex-1 w-full md:w-[calc(100%-25%-1rem)] lg:w-[calc(100%-20%-1rem)] min-w-0">
          {children}
        </div>
        
        {showRightSidebar && <RightSidebar />}
      </main>
      
      <ChatOverlay />
    </>
  );
}
