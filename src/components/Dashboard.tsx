'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { LogOut, Plus, Eye, ArrowUpRight, ArrowDownRight, Clock, CheckCircle } from 'lucide-react';
import { TransactionHistory } from '@/src/components/TransactionHistory';
import { ProjectManagement } from '@/src/components/ProjectManagement';
import { FundAllocation } from '@/src/components/FundAllocation';
import { useBlockchain } from '@/src/hooks/useBlockchain';
import { apiService } from '@/src/lib/api';
import WalletConnect from '../providers';

export function Dashboard() {
  const router = useRouter();
  const { transactions, projects, totalFunds, pendingTransactions } = useBlockchain();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await apiService.logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      apiService.removeToken();
      router.push('/');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const roleDisplayName = {
    government: 'Government Official',
    local_authority: 'Local Authority',
    contractor: 'Contractor',
    public: 'Public Viewer'
  };

  const userProjects = projects.filter(project => 
    user.role === 'public' ? true :
    user.role === 'government' ? true :
    user.role === 'local_authority' ? true :
    project.contractor === user.name
  );

  const userTransactions = transactions.filter(tx => 
    user.role === 'public' ? true : 
    tx.from === user.name || tx.to === user.name || user.role === 'government'
  );

  const stats = [
    {
      title: 'Total Funds',
      value: `$${totalFunds.toLocaleString()}`,
      change: '+12.5%',
      icon: ArrowUpRight,
      color: 'text-green-600'
    },
    {
      title: 'Active Projects',
      value: userProjects.filter(p => p.status === 'in_progress').length.toString(),
      change: '+3',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'Completed Projects',
      value: userProjects.filter(p => p.status === 'completed').length.toString(),
      change: '+8',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Pending Approvals',
      value: pendingTransactions.toString(),
      change: '-2',
      icon: ArrowDownRight,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Brand and user info */}
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-blue-600">Gram Chain</h1>
                <p className="text-sm text-gray-600 truncate">
                  Welcome, {user.name} • {roleDisplayName[user.role]}
                </p>
              </div>
            </div>
            
            {/* Right side - Wallet and logout */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <WalletConnect />
              <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex flex-row  m-5 p-5 bg-blue-600 w-full text-black">
              <TabsList className={`flex flex-row gap-4 w-full ${(user.role === 'government' || user.role === 'local_authority') ? 'grid-cols-4' : 'grid-cols-3'} bg-blue-500 shadow-sm text-white rounded-lg p-1`}>
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="transactions"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
                >
                  Transactions
                </TabsTrigger>
                <TabsTrigger 
                  value="projects"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
                >
                  Projects
                </TabsTrigger>
                {(user.role === 'government' || user.role === 'local_authority') && (
                  <TabsTrigger 
                    value="allocate"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
                  >
                    Allocate Funds
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Tab Content */}
            <TabsContent value="overview" className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <Card key={index} className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border-0">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </CardTitle>
                        <IconComponent className={`h-4 w-4 ${stat.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <p className={`text-xs ${stat.color} flex items-center mt-1`}>
                          <span className="mr-1">{stat.change}</span>
                          from last month
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Recent Transactions */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'allocation' ? 'bg-blue-100' :
                            transaction.type === 'transfer' ? 'bg-green-100' :
                            'bg-orange-100'
                          }`}>
                            <ArrowUpRight className={`h-4 w-4 ${
                              transaction.type === 'allocation' ? 'text-blue-600' :
                              transaction.type === 'transfer' ? 'text-green-600' :
                              'text-orange-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-600">
                              {transaction.from} → {transaction.to}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${transaction.amount.toLocaleString()}
                          </p>
                          <Badge 
                            variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border-0 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction History</h2>
                <TransactionHistory user={user} />
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border-0 p-6">
                <ProjectManagement user={user} />
              </div>
            </TabsContent>

            {(user.role === 'government' || user.role === 'local_authority') && (
              <TabsContent value="allocate" className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border-0 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Fund Allocation</h2>
                  <FundAllocation user={user} />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}