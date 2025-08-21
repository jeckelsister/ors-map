import clsx from 'clsx';
import { Home, Menu, Mountain } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import Logo from './Logo';

const navigationItems = [
  { path: '/', icon: Home, label: 'Home', mobileLabel: 'Home' },
  {
    path: '/hiking',
    icon: Mountain,
    label: 'Randonnée',
    mobileLabel: 'Planificateur Randonnée',
  },
];

export default function Navigation(): React.JSX.Element {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-lg sm:text-xl font-bold text-foreground hover:text-primary transition-colors"
            onClick={closeMobileMenu}
          >
            <Logo size="sm" />
            <span>WayMaker</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2 lg:space-x-4">
            {navigationItems.map(({ path, icon: Icon, label }) => (
              <Button
                key={path}
                asChild
                variant={isActive(path) ? 'default' : 'ghost'}
                size="sm"
                className={clsx(
                  'gap-2 text-sm font-medium transition-all',
                  isActive(path)
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Link to={path}>
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/50"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px] p-4">
                <div className="flex flex-col space-y-4 mt-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Logo size="sm" />
                    <span className="text-lg font-bold">WayMaker</span>
                  </div>

                  {navigationItems.map(({ path, icon: Icon, mobileLabel }) => (
                    <Button
                      key={path}
                      asChild
                      variant={isActive(path) ? 'default' : 'ghost'}
                      className={clsx(
                        'justify-start gap-3 h-12 text-base',
                        isActive(path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                      onClick={closeMobileMenu}
                    >
                      <Link to={path}>
                        <Icon className="w-5 h-5" />
                        {mobileLabel}
                      </Link>
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
