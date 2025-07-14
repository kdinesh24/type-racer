'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Home, Users, Zap, ArrowLeft, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      isActive: pathname === '/',
      description: 'Main page'
    },
    {
      href: '/practice',
      label: 'Practice',
      icon: Zap,
      isActive: pathname === '/practice',
      description: 'Practice your typing'
    },
    {
      href: '/race/global',
      label: 'Global',
      icon: Users,
      isActive: pathname.startsWith('/race/global'),
      description: 'Race with players worldwide'
    },
    {
      href: '/race/private',
      label: 'Private',
      icon: Users,
      isActive: pathname.startsWith('/race/private'),
      description: 'Create or join private rooms'
    }
  ];

  const showBackButton = pathname !== '/';

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Back Button */}
          <div className="flex items-center space-x-3 min-w-0">
            <Link href="/" className="text-xl font-bold text-primary whitespace-nowrap">
              TypeRace
            </Link>
            
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center space-x-1 hidden sm:flex"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden md:inline">Back</span>
              </Button>
            )}
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 justify-center">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                  title={item.description}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Section - Fixed width to prevent overflow */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {status === 'loading' ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse hidden md:block"></div>
              </div>
            ) : session ? (
              <div className="flex items-center space-x-2">
                {/* Always show default avatar for now */}
                <div className="w-8 h-8 bg-gray-100 border-2 border-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg 
                    className="w-5 h-5 text-gray-600" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div className="hidden md:flex items-center min-w-0 max-w-[120px]">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {session.user?.name || 'User'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 flex-shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button variant="default" size="sm" className="whitespace-nowrap">
                  Sign In
                </Button>
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 flex-shrink-0"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-background/95 py-2">
            <div className="flex flex-col space-y-1">
              {showBackButton && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    window.history.back();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 justify-start w-full"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              )}
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors ${
                      item.isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
