'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { X, EyeOff, ShieldCheck, Building, Users, Eye as EyeIcon, Loader2 } from 'lucide-react';
import { User, UserRole } from '@/app/page';

interface LoginModalProps {
  role: UserRole;
  onLogin: (user: User) => void;
  onClose: () => void;
}

const roleDetails = {
  government: {
    title: 'Government / NGO Login',
    organization: 'Ministry of Rural Development',
    icon: ShieldCheck,
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    users: [
      { name: 'Sarah Johnson', email: 'sarah.johnson@gov.ru' },
      { name: 'Michael Chen', email: 'michael.chen@ngo.org' }
    ]
  },
  local_authority: {
    title: 'Local Authority Login',
    organization: 'Regional Development Council',
    icon: Building,
    gradient: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    users: [
      { name: 'David Martinez', email: 'david.martinez@regional.gov' },
      { name: 'Emma Thompson', email: 'emma.thompson@council.gov' }
    ]
  },
  contractor: {
    title: 'Contractor Login',
    organization: 'Construction Partners Ltd',
    icon: Users,
    gradient: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    users: [
      { name: 'James Wilson', email: 'james.wilson@builders.com' },
      { name: 'Lisa Garcia', email: 'lisa.garcia@construction.co' }
    ]
  },
  public: {
    title: 'Public Access',
    organization: 'General Public',
    icon: EyeIcon,
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    users: [
      { name: 'Anonymous Viewer', email: 'public@viewer.com' }
    ]
  }
};

export function LoginModal({ role, onLogin, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const details = roleDetails[role];
  const IconComponent = details.icon;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: details.users[0].name,
      email: email || details.users[0].email,
      role,
      organization: details.organization
    };

    onLogin(user);
    setLoading(false);
  };

  const handleDemoLogin = () => {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: details.users[0].name,
      email: details.users[0].email,
      role,
      organization: details.organization
    };
    onLogin(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transition-all duration-300 transform ${
        isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      }`}>
        {/* Header with Role Icon */}
        <div className={`relative p-6 rounded-t-2xl bg-gradient-to-r ${details.gradient} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{details.title}</h2>
                <p className="text-white/80 text-sm">{details.organization}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={details.users[0].email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 px-4 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    disabled={loading}
                  >
                    {/* {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      // <Eye className="h-4 w-4 text-gray-500" />
                    )} */}
                  </button>
                </div>
              </div>
            </div>

            {/* Demo Info Card */}
            <div className={`${details.bgColor} ${details.borderColor} border rounded-xl p-4`}>
              <div className="flex items-start space-x-3">
                <div className={`p-2 ${details.gradient} rounded-lg`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${details.textColor} mb-1`}>
                    Demo Access Available
                  </p>
                  <p className="text-xs text-gray-600">
                    For demonstration purposes, you can use demo credentials or enter any email/password.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDemoLogin}
                disabled={loading}
                className="flex-1 h-12 border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02]"
              >
                <IconComponent className="h-4 w-4 mr-2" />
                Demo Login
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className={`flex-1 h-12 bg-gradient-to-r ${details.gradient} hover:opacity-90 transition-all duration-200 hover:scale-[1.02] shadow-lg`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Login
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}