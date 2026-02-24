'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Users, ShieldCheck, Building, Eye, ArrowRight, Coins, FileText, BarChart3, Sparkles, TrendingUp, Globe, Lock } from 'lucide-react';
import WalletConnect from '@/src/providers';
import { useAccount } from 'wagmi';

export type UserRole = 'government' | 'local_authority' | 'contractor' | 'public';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
}

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: number;
  type: 'allocation' | 'transfer' | 'payment';
  projectId: string;
  description: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'completed';
  blockHeight: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  totalBudget: number;
  allocatedFunds: number;
  spentFunds: number;
  status: 'planning' | 'approved' | 'in_progress' | 'completed';
  contractor?: string;
  milestones: Milestone[];
  createdAt: number;
  ipfsHash?: string;
  signature?: string;
  createdBy?: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  amount: number;
  status: 'pending' | 'submitted' | 'approved' | 'paid';
  submittedAt?: number;
  approvedAt?: number;
}

const roleData = [
  {
    role: 'government' as UserRole,
    title: 'Government / NGO',
    description: 'Allocate funds and oversee projects',
    icon: ShieldCheck,
    permissions: ['Allocate Funds', 'View All Projects', 'Create Projects'],
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  {
    role: 'local_authority' as UserRole,
    title: 'Local Authority',
    description: 'Manage local projects and approve payments',
    icon: Building,
    permissions: ['Receive Funds', 'Approve Payments', 'Manage Local Projects'],
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    gradient: 'bg-gradient-to-br from-green-500 to-green-600'
  },
  {
    role: 'contractor' as UserRole,
    title: 'Contractor',
    description: 'Execute projects and submit milestones',
    icon: Users,
    permissions: ['Submit Milestones', 'Request Payments', 'View Project Status'],
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    gradient: 'bg-gradient-to-br from-orange-500 to-orange-600'
  },
  {
    role: 'public' as UserRole,
    title: 'Public Viewer',
    description: 'View transparent fund tracking',
    icon: Eye,
    permissions: ['View Transactions', 'Track Fund Usage', 'Public Audit'],
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
  }
];

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const { isConnected } = useAccount();

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    // Trigger animations
    setIsVisible(true);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    router.push(`/login?role=${role}`);
  };

  if (currentUser && isConnected) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="px-5 py-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <span className="text-white text-2xl font-bold">G</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  GramChain
                </h1>
                <p className="text-sm text-gray-600 font-medium">Rural Funds Tracking</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Revolutionizing Public Fund Management</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transparent{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Public Fund
              </span>{' '}
              Management
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              A blockchain-powered platform ensuring complete transparency and accountability 
              in the allocation and tracking of rural public recreation facility funds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={() => handleRoleSelect('public')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Globe className="h-5 w-5 mr-2" />
                View Public Ledger
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 text-lg font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Card className="group p-8 text-center bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border-0 hover:-translate-y-2">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Coins className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">$2.4M</h3>
            <p className="text-gray-600 font-medium">Total Funds Tracked</p>
            <div className="mt-4 flex items-center justify-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+12.5% this month</span>
            </div>
          </Card>
          <Card className="group p-8 text-center bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border-0 hover:-translate-y-2">
            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">156</h3>
            <p className="text-gray-600 font-medium">Active Projects</p>
            <div className="mt-4 flex items-center justify-center text-blue-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+8 new this week</span>
            </div>
          </Card>
          <Card className="group p-8 text-center bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 border-0 hover:-translate-y-2">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">98.2%</h3>
            <p className="text-gray-600 font-medium">Transparency Score</p>
            <div className="mt-4 flex items-center justify-center text-purple-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Industry leading</span>
            </div>
          </Card>
        </div>

        {/* User Roles */}
        <div className={`mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Role to Access the Platform
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Different stakeholders have different access levels and capabilities. 
              Select your role to get started.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleData.map((role, index) => {
              const IconComponent = role.icon;
              return (
                <Card 
                  key={role.role}
                  className={`group cursor-pointer hover:shadow-2xl transition-all duration-500 border-2 hover:border-blue-300 bg-white/80 backdrop-blur-sm hover:-translate-y-3 transform ${role.borderColor}`}
                  onClick={() => handleRoleSelect(role.role)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6 text-center">
                    <div className={`p-5 ${role.gradient} rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="h-10 w-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {role.title}
                    </h4>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {role.description}
                    </p>
                    <div className="space-y-3 mb-6">
                      {role.permissions.map((permission, permIndex) => (
                        <Badge 
                          key={permIndex} 
                          variant="outline" 
                          className={`text-xs font-medium ${role.bgColor} ${role.textColor} ${role.borderColor} group-hover:scale-105 transition-transform duration-300`}
                        >
                          {permission}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                      <span className="text-sm font-semibold">Access Platform</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 mb-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Platform Features
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge technology to ensure transparency, security, and efficiency
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">Immutable Records</h4>
              <p className="text-gray-600 leading-relaxed">
                All transactions are permanently recorded on the blockchain with cryptographic security
              </p>
            </div>
            <div className="text-center group">
              <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">Full Transparency</h4>
              <p className="text-gray-600 leading-relaxed">
                Public access to all fund movements and project progress in real-time
              </p>
            </div>
            <div className="text-center group">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">Role-Based Access</h4>
              <p className="text-gray-600 leading-relaxed">
                Secure permissions and workflows for different stakeholder types
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`text-center transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Card className="p-12 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Experience Transparent Fund Management?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of stakeholders already using our platform to ensure accountability 
              and transparency in public fund management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => handleRoleSelect('public')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Globe className="h-5 w-5 mr-2" />
                Start Exploring
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 text-lg font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Schedule Demo
              </Button>
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
}