'use client';

import { useState, useEffect } from 'react';
import { User, Project } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Badge } from '@/src/components/ui/badge';
import { DollarSign, Send, AlertCircle, CheckCircle, MapPin, User as UserIcon, Calendar, ExternalLink } from 'lucide-react';
import { useBlockchain } from '@/src/hooks/useBlockchain';
import { ipfsService, ProjectData } from '@/src/lib/ipfsService';

interface FundAllocationProps {
  user: User;
}

interface AllocationForm {
  recipientType: 'local_authority' | 'contractor';
  recipient: string;
  amount: string;
  projectId: string;
  description: string;
}

const recipients = {
  local_authority: [
    'Regional Council North',
    'Regional Council South',
    'Regional Council East',
    'Regional Council West'
  ],
  contractor: [
    'GreenSpace Contractors',
    'SportsBuild Inc',
    'Community Builders LLC',
    'Urban Development Co'
  ]
};

const NO_PROJECT_VALUE = 'no_project';

export function FundAllocation({ user }: FundAllocationProps) {
  const { projects, addTransaction, addProject, updateProject } = useBlockchain();
  const [form, setForm] = useState<AllocationForm>({
    recipientType: 'local_authority',
    recipient: '',
    amount: '',
    projectId: '',
    description: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectsWithIPFS, setProjectsWithIPFS] = useState<(Project & { ipfsData?: ProjectData })[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // New project form
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    location: '',
    budget: '',
    contractor: ''
  });
  const [showProjectForm, setShowProjectForm] = useState(false);

  // Fetch IPFS data for projects
  useEffect(() => {
    const fetchIPFSData = async () => {
      if (projects.length > 0) {
        setIsLoadingProjects(true);
        try {
          const projectsWithIPFSData = await Promise.all(
            projects.map(async (project) => {
              if (project.ipfsHash) {
                try {
                  const ipfsData = await ipfsService.getProjectFromIPFS(project.ipfsHash);
                  return { ...project, ipfsData };
                } catch (error) {
                  console.error(`Failed to fetch IPFS data for project ${project.id}:`, error);
                  return { ...project, ipfsData: undefined };
                }
              }
              return { ...project, ipfsData: undefined };
            })
          );
          setProjectsWithIPFS(projectsWithIPFSData);
        } catch (error) {
          console.error('Error fetching IPFS data:', error);
          setProjectsWithIPFS(projects.map(p => ({ ...p, ipfsData: undefined })));
        } finally {
          setIsLoadingProjects(false);
        }
      } else {
        setProjectsWithIPFS([]);
      }
    };

    fetchIPFSData();
  }, [projects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planning': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipient || !form.amount || !form.description) return;

    setLoading(true);

    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const transaction = addTransaction({
      from: user.role === 'government' ? 'Government Treasury' : user.name,
      to: form.recipient,
      amount: parseInt(form.amount),
      type: form.recipientType === 'local_authority' ? 'allocation' : 'payment',
      projectId: form.projectId,
      description: form.description,
      status: 'completed'
    });

    // Update project allocated funds if project is selected
    if (form.projectId) {
      const project = projects.find(p => p.id === form.projectId);
      if (project) {
        updateProject(form.projectId, {
          allocatedFunds: project.allocatedFunds + parseInt(form.amount)
        });
      }
    }

    setForm({
      recipientType: 'local_authority',
      recipient: '',
      amount: '',
      projectId: '',
      description: ''
    });

    setLoading(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.budget) return;

    setLoading(true);

    const project = addProject({
      name: newProject.name,
      description: newProject.description,
      location: newProject.location,
      totalBudget: parseInt(newProject.budget),
      allocatedFunds: 0,
      spentFunds: 0,
      status: 'planning',
      contractor: newProject.contractor || undefined,
      milestones: [
        {
          id: 'ms_' + Math.random().toString(36).substr(2, 6),
          name: 'Project Initiation',
          description: 'Initial project setup and planning',
          amount: Math.floor(parseInt(newProject.budget) * 0.2),
          status: 'pending'
        },
        {
          id: 'ms_' + Math.random().toString(36).substr(2, 6),
          name: 'Development Phase',
          description: 'Main construction and development work',
          amount: Math.floor(parseInt(newProject.budget) * 0.6),
          status: 'pending'
        },
        {
          id: 'ms_' + Math.random().toString(36).substr(2, 6),
          name: 'Project Completion',
          description: 'Final touches and project handover',
          amount: Math.floor(parseInt(newProject.budget) * 0.2),
          status: 'pending'
        }
      ]
    });

    setNewProject({
      name: '',
      description: '',
      location: '',
      budget: '',
      contractor: ''
    });

    setLoading(false);
    setShowProjectForm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Fund Allocation</h2>
        {user.role === 'government' && (
          <Button 
            onClick={() => setShowProjectForm(!showProjectForm)}
            variant={showProjectForm ? 'outline' : 'default'}
            className={!showProjectForm ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {showProjectForm ? 'Cancel' : 'Create New Project'}
          </Button>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Transaction successfully added to blockchain!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Cards Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Available Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProjects ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg">Loading projects...</p>
            </div>
          ) : projectsWithIPFS.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No projects available</p>
              <p className="text-sm">Create a new project to start fund allocation</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectsWithIPFS.map((project) => (
                <Card key={project.id} className="p-4 hover:shadow-md transition-shadow border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(project.createdAt)}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900">
                      {project.ipfsData?.projectTitle || project.name}
                    </h4>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.ipfsData?.projectDescription || project.description}
                    </p>
                    
                    {/* Project Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{project.ipfsData?.location || project.location}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{project.ipfsData?.localPresident || project.contractor || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        <span>${project.totalBudget.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Budget Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Allocated: ${project.allocatedFunds.toLocaleString()}</span>
                        <span className="text-gray-600">Spent: ${project.spentFunds.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((project.allocatedFunds / project.totalBudget) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* IPFS and Wallet Info */}
                    {(project.ipfsHash || project.createdBy) && (
                      <div className="pt-2 border-t border-gray-100 space-y-1">
                        {project.ipfsHash && (
                          <div className="flex items-center text-xs text-gray-500">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            <span className="truncate">IPFS: {project.ipfsHash}</span>
                          </div>
                        )}
                        {project.createdBy && (
                          <div className="flex items-center text-xs text-gray-500">
                            <UserIcon className="h-3 w-3 mr-1" />
                            <span className="truncate">Wallet: {project.createdBy.slice(0, 6)}...{project.createdBy.slice(-4)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Allocate Fund Button */}
                    <Button 
                      onClick={() => {
                        setForm(prev => ({ ...prev, projectId: project.id }));
                        // Scroll to allocation form
                        const formElement = document.getElementById('allocation-form');
                        if (formElement) {
                          formElement.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={project.status === 'completed'}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Allocate Fund
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create New Project */}
        {user.role === 'government' && showProjectForm && (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span>Create New Project</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    placeholder="e.g., Community Recreation Center"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newProject.location}
                    onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                    placeholder="e.g., Downtown District, Eastern Region"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Total Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                    placeholder="1000000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contractor">Contractor (Optional)</Label>
                  <Select value={newProject.contractor} onValueChange={(value) => setNewProject({...newProject, contractor: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contractor" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipients.contractor.map((contractor) => (
                        <SelectItem key={contractor} value={contractor}>
                          {contractor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="projectDescription">Description</Label>
                  <Textarea
                    id="projectDescription"
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Detailed project description..."
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Creating Project...' : 'Create Project'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Fund Allocation Form */}
        <Card id="allocation-form" className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-blue-600" />
              <span>Allocate Funds</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAllocation} className="space-y-4">
              <div>
                <Label htmlFor="recipientType">Recipient Type</Label>
                <Select value={form.recipientType} onValueChange={(value: 'local_authority' | 'contractor') => setForm({...form, recipientType: value, recipient: ''})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local_authority">Local Authority</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="recipient">Recipient</Label>
                <Select value={form.recipient} onValueChange={(value) => setForm({...form, recipient: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipients[form.recipientType].map((recipient) => (
                      <SelectItem key={recipient} value={recipient}>
                        {recipient}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="project">Project (Optional)</Label>
                <Select
                  value={form.projectId || NO_PROJECT_VALUE}
                  onValueChange={(value) => setForm({...form, projectId: value === NO_PROJECT_VALUE ? '' : value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PROJECT_VALUE}>No specific project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: e.target.value})}
                  placeholder="100000"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Purpose of fund allocation..."
                  rows={3}
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Blockchain Transaction</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      This allocation will be permanently recorded on the blockchain and cannot be reversed.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !form.recipient || !form.amount || !form.description}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Processing on Blockchain...' : 'Allocate Funds'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}