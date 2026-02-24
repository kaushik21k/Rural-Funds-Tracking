'use client';

import { useState, useEffect } from 'react';
import { User, Project } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button, buttonVariants } from '@/src/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Badge } from '@/src/components/ui/badge';
import { Plus, Loader2, CheckCircle, AlertCircle, ExternalLink, Calendar, MapPin, DollarSign, User as UserIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ipfsService, ProjectData } from '@/src/lib/ipfsService';
import { useBlockchain } from '@/src/hooks/useBlockchain';

interface ProjectManagementProps {
  user: User;
}

interface ProjectFormData {
  budget: string;
  projectTitle: string;
  startDate: string;
  totalDuration: string;
  localPresident: string;
  location: string;
  projectDescription: string;
  initialFundReleaseAmount: string;
  pinCode:string;
}

export function ProjectManagement({ user }: ProjectManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState<'idle' | 'connecting' | 'signing' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsWithIPFS, setProjectsWithIPFS] = useState<(Project & { ipfsData?: ProjectData })[]>([]);
  const { addProject, projects, clearAllData } = useBlockchain();
  
  const [formData, setFormData] = useState<ProjectFormData>({
    budget: '',
    projectTitle: '',
    startDate: '',
    totalDuration: '',
    localPresident: '',
    location: '',
    projectDescription: '',
    initialFundReleaseAmount: '',
    pinCode:''
  });

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const requiredFields = ['budget', 'projectTitle', 'startDate', 'totalDuration', 'localPresident', 'location', 'projectDescription', 'initialFundReleaseAmount', 'pinCode'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof ProjectFormData]);
    
    if (missingFields.length > 0) {
      setErrorMessage(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setCreationStep('error');
      return;
    }

    setIsCreating(true);
    setCreationStep('connecting');
    setErrorMessage('');

    try {
      // Step 1: Connect to MetaMask and sign message
      setCreationStep('signing');
      const result = await ipfsService.createProjectWithSignature({
        budget: formData.budget,
        projectTitle: formData.projectTitle,
        startDate: formData.startDate,
        totalDuration: formData.totalDuration,
        localPresident: formData.localPresident,
        location: formData.location,
        projectDescription: formData.projectDescription,
        initialFundReleaseAmount: formData.initialFundReleaseAmount,
        pinCode: formData.pinCode
      });

      // Step 2: Add project to local blockchain state
      setCreationStep('uploading');
      const newProject = addProject({
        name: formData.projectTitle,
        description: formData.projectDescription,
        location: formData.location,
        totalBudget: parseFloat(formData.budget),
        allocatedFunds: parseFloat(formData.initialFundReleaseAmount),
        spentFunds: 0,
        status: 'in_progress',
        contractor: formData.localPresident,
        milestones: [],
        ipfsHash: result.ipfsResult.hash,
        signature: result.signature.signature,
        createdBy: result.signature.address
      });

      console.log('Project created successfully:', {
        project: newProject,
        ipfsHash: result.ipfsResult.hash,
        signature: result.signature.signature
      });

      setCreationStep('success');
      
      // Refresh projects list to include the new project
      setTimeout(async () => {
        // Refresh the projects from blockchain state
        const updatedProjects = [...projects, newProject];
        await fetchIPFSDataForProjects(updatedProjects);
        
        // Reset form after success
        setFormData({
          budget: '',
          projectTitle: '',
          startDate: '',
          totalDuration: '',
          localPresident: '',
          location: '',
          projectDescription: '',
          initialFundReleaseAmount: '',
          pinCode:''
        });
        setIsModalOpen(false);
        setCreationStep('idle');
        setIsCreating(false);
      }, 2000);

    } catch (error: any) {
      console.error('Project creation failed:', error);
      setErrorMessage(error.message);
      setCreationStep('error');
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      budget: '',
      projectTitle: '',
      startDate: '',
      totalDuration: '',
      localPresident: '',
      location: '',
      projectDescription: '',
      initialFundReleaseAmount: '',
      pinCode:''
    });
    setIsModalOpen(false);
    setCreationStep('idle');
    setErrorMessage('');
    setIsCreating(false);
  };

  const testLighthouseConnection = async () => {
    try {
      console.log('Testing Lighthouse connection...');
      const isConnected = await ipfsService.testLighthouseConnection();
      if (isConnected) {
        alert('Lighthouse connection test successful!');
      } else {
        alert('Lighthouse connection test failed. Check console for details.');
      }
    } catch (error: any) {
      console.error('Lighthouse test error:', error);
      alert(`Lighthouse test error: ${error.message}`);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all project data? This action cannot be undone.')) {
      clearAllData();
      setProjectsWithIPFS([]);
      alert('All project data has been cleared.');
    }
  };

  const debugData = () => {
    console.log('Current projects:', projects);
    console.log('Projects with IPFS:', projectsWithIPFS);
    console.log('LocalStorage projects:', localStorage.getItem('blockchain_projects'));
    console.log('LocalStorage transactions:', localStorage.getItem('blockchain_transactions'));
  };

  // Fetch IPFS data for projects that have IPFS hashes
  const fetchIPFSDataForProjects = async (projects: Project[]) => {
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
  };

  // Load projects and fetch IPFS data when component mounts or projects change
  useEffect(() => {
    console.log('Projects changed:', projects);
    if (projects.length > 0) {
      console.log('Fetching IPFS data for', projects.length, 'projects');
      fetchIPFSDataForProjects(projects);
    } else {
      console.log('No projects found, setting empty array');
      setProjectsWithIPFS([]);
    }
  }, [projects]);

  // Helper function to format dates
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-yellow-100 text-yellow-800';
      case 'planning':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
          <div className="flex gap-2 mt-2">
          </div>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                console.log('Button clicked, opening modal');
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget *</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="Enter total budget"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    type="text"
                    placeholder="Enter project title"
                    value={formData.projectTitle}
                    onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalDuration">Total Duration *</Label>
                  <Input
                    id="totalDuration"
                    type="text"
                    placeholder="e.g., 6 months, 1 year"
                    value={formData.totalDuration}
                    onChange={(e) => handleInputChange('totalDuration', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="localPresident">Local President *</Label>
                  <Input
                    id="localPresident"
                    type="text"
                    placeholder="Enter local president name"
                    value={formData.localPresident}
                    onChange={(e) => handleInputChange('localPresident', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter project location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="pinCode">Pin Code *</Label>
                  <Input
                    id="pinCode"
                    type="text"
                    placeholder="e.g., 614616"
                    value={formData.pinCode}
                    onChange={(e) => handleInputChange('pinCode', e.target.value)}
                    required
                  />
                </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Project Description *</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Enter detailed project description"
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                  rows={4}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="initialFundReleaseAmount">Initial Fund Release Amount *</Label>
                <Input
                  id="initialFundReleaseAmount"
                  type="number"
                  placeholder="Enter initial fund release amount"
                  value={formData.initialFundReleaseAmount}
                  onChange={(e) => handleInputChange('initialFundReleaseAmount', e.target.value)}
                  required
                />
              </div>
              
              {/* Status Messages */}
              {creationStep === 'connecting' && (
                <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting to MetaMask...</span>
                </div>
              )}
              
              {creationStep === 'signing' && (
                <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Please sign the message in MetaMask...</span>
                </div>
              )}
              
              {creationStep === 'uploading' && (
                <div className="flex items-center space-x-2 text-purple-600 bg-purple-50 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading project data to IPFS...</span>
                </div>
              )}
              
              {creationStep === 'success' && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-4 w-4" />
                  <span>Project created successfully! Status: In Progress. Stored on IPFS and blockchain.</span>
                </div>
              )}
              
              {creationStep === 'error' && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {creationStep === 'connecting' && 'Connecting...'}
                      {creationStep === 'signing' && 'Signing...'}
                      {creationStep === 'uploading' && 'Uploading...'}
                      {creationStep === 'success' && 'Success!'}
                    </>
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Display */}
      {isLoadingProjects ? (
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading projects from IPFS...</p>
          </CardContent>
        </Card>
      ) : projectsWithIPFS.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsWithIPFS.map((project) => (
            <Card key={project.id} className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {project.ipfsData?.projectTitle || project.name}
                  </CardTitle>
                  <Badge className={cn("text-xs", getStatusColor(project.status))}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Project Description */}
                <p className="text-sm text-gray-600">
                  {project.ipfsData?.projectDescription || project.description}
                </p>

                {/* Project Details */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{project.ipfsData?.location || project.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{project.ipfsData?.localPresident || project.contractor || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {project.ipfsData?.startDate 
                        ? formatDate(new Date(project.ipfsData.startDate).getTime())
                        : formatDate(project.createdAt)
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    <span>${project.ipfsData?.budget || project.totalBudget.toLocaleString()}</span>
                  </div>
                </div>

                {/* IPFS Information */}
                {project.ipfsHash && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Stored on IPFS</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => window.open(`https://gateway.lighthouse.storage/ipfs/${project.ipfsHash}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                    {project.ipfsData?.pinCode && (
                      <div className="text-xs text-gray-500 mt-1">
                        Pin Code: {project.ipfsData.pinCode}
                      </div>
                    )}
                  </div>
                )}

                {/* Project Progress */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((project.spentFunds / project.totalBudget) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((project.spentFunds / project.totalBudget) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-500 mb-6">Create your first project to get started with GramChain!</p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}