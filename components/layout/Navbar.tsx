'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Users, Zap, ArrowLeft } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

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
      label: 'Global Race',
      icon: Users,
      isActive: pathname.startsWith('/race/global'),
      description: 'Race with players worldwide'
    },
    {
      href: '/race/private',
      label: 'Private Room',
      icon: Users,
      isActive: pathname.startsWith('/race/private'),
      description: 'Create or join private rooms'
    }
  ];

  const showBackButton = pathname !== '/';

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-primary">
              TypeRace
            </Link>
            
            {/* Back Button */}
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    item.isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                  title={item.description}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {item.description}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
