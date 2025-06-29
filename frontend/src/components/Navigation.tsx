import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Users, MapPin, Home } from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/players', label: 'Players', icon: Users },
    { path: '/courses', label: 'Courses', icon: MapPin },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-golf-green" />
            <span className="text-xl font-bold text-golf-green font-golf">
              Fantasy Golf
            </span>
          </Link>
          
          <div className="flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-golf-green text-white'
                      : 'text-gray-700 hover:bg-golf-green/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}; 