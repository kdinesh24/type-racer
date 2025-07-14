'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FiZap, FiTarget, FiUsers, FiPlay, FiTrendingUp } from 'react-icons/fi';

export default function Home() {
  // Don't initialize socket on homepage, just show a simple status
  const gameMode = [
    {
      title: 'Practice Mode',
      description: 'Improve your typing speed and accuracy with practice sessions',
      icon: FiTarget,
      href: '/practice',
      color: 'from-blue-500 to-blue-600',
      features: ['No time pressure', 'Unlimited attempts', 'Track your progress']
    },
    {
      title: 'Global Race',
      description: 'Compete with players worldwide in real-time typing races',
      icon: FiUsers,
      href: '/race/global',
      color: 'from-green-500 to-green-600',
      features: ['Real-time competition', 'Global leaderboard', 'Instant matchmaking']
    },
    {
      title: 'Private Room',
      description: 'Create or join private rooms to race with friends',
      icon: FiZap,
      href: '/race/private',
      color: 'from-purple-500 to-purple-600',
      features: ['Create custom rooms', 'Invite friends', 'Private competitions']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <FiZap className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">TypeRace</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Master your typing skills with practice sessions or compete with players worldwide in real-time races. 
            Improve your speed, accuracy, and ranking.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">150+</div>
              <div className="text-gray-600">WPM Average</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Choose Your Game Mode
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {gameMode.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${mode.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {mode.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {mode.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-2 mb-6">
                      {mode.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <FiTrendingUp className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Link href={mode.href} className="block">
                      <Button 
                        className={`w-full bg-gradient-to-r ${mode.color} hover:shadow-lg transition-all duration-300 text-white border-0`}
                        disabled={false} // All modes are always available
                      >
                        <FiPlay className="w-4 h-4 mr-2" />
                        Start {mode.title}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Why Choose TypeRace?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: FiZap, title: 'Lightning Fast', description: 'Real-time typing races with instant feedback' },
              { icon: FiTarget, title: 'Precise Tracking', description: 'Detailed statistics and progress monitoring' },
              { icon: FiUsers, title: 'Global Community', description: 'Compete with typists from around the world' },
              { icon: FiTrendingUp, title: 'Skill Development', description: 'Structured practice to improve your typing' }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
