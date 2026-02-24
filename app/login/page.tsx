'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { ArrowLeft, Eye, EyeOff, ShieldCheck, Building, Users, Loader2 } from 'lucide-react';
import { User, UserRole } from '@/app/page';
import { apiService } from '@/src/lib/api';

const roleDetails = {
  government: {
    title: 'Government / NGO',
    icon: ShieldCheck,
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  local_authority: {
    title: 'Local Authority',
    icon: Building,
    gradient: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  contractor: {
    title: 'Contractor',
    icon: Users,
    gradient: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200'
  },
  public: {
    title: 'Public Viewer',
    icon: Eye,
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  }
};

const roleOptions = [
  { value: 'government', label: 'Government / NGO', description: 'Allocate funds and oversee projects' },
  { value: 'local_authority', label: 'Local Authority', description: 'Manage local projects and approve payments' },
  { value: 'contractor', label: 'Contractor', description: 'Execute projects and submit milestones' },
  { value: 'public', label: 'Public Viewer', description: 'View transparent fund tracking' }
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as UserRole;
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('public');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const details = roleDetails[role];
  const IconComponent = details?.icon;

  useEffect(() => {
    setIsVisible(true);
    if (!role || !details) {
      router.push('/');
    }
  }, [role, details, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLoginMode) {
        const response = await apiService.login(email, password, role);
        const userData = response.user;
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        const response = await apiService.register({
          name,
          email,
          password,
          role: selectedRole
        });
        const userData = response.user;
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      alert(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleBack = () => {
    router.back();
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setName('');
    setEmail('');
    setPassword('');
    setSelectedRole('public');
  };

  if (!role || !details) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <div>
                  <h1 className="text-lg font-medium text-gray-900">GramChain</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <div className={`w-full max-w-md transition-all duration-300 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {/* Login Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${details.gradient} flex items-center justify-center`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-gray-900">
                      {isLoginMode ? 'Sign in' : 'Create account'}
                    </h2>
                    <p className="text-sm text-gray-500">{isLoginMode ? details.title : roleOptions.find(r => r.value === selectedRole)?.label}</p>
                  </div>
                </div>
                <button
                  onClick={toggleMode}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  {isLoginMode ? 'Create account' : 'Sign in instead'}
                </button>
              </div>
            </div>
            
            {/* Form Content */}
            <div className="px-8 py-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLoginMode && (
                  <>
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400"
                        disabled={loading}
                        required={!isLoginMode}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="role" className="text-sm font-medium text-gray-700 mb-2 block">
                        Select Your Role
                      </Label>
                      <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)} disabled={loading}>
                        <SelectTrigger className="h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400 bg-white w-full">
                          <div className="flex items-center space-x-3">
                            <SelectValue placeholder="Choose your role" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="p-2 bg-white w-full">
                          {roleOptions.map((option) => (
                            <SelectItem 
                              key={option.value} 
                              value={option.value}
                              className="p-3 rounded-lg hover:bg-gray-50 focus:bg-blue-50 transition-colors duration-150 cursor-pointer w-full"
                            >
                              <div className="flex items-start space-x-3 w-full">
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-900 text-sm">{option.label}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={isLoginMode ? "Enter your email" : "Enter your email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400"
                    disabled={loading}
                    required
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
                      className="h-12 px-4 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-md transition-colors duration-200"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>


                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`w-full h-12 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-[1.01] ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isLoginMode ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        {isLoginMode ? 'Sign in' : 'Create account'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
