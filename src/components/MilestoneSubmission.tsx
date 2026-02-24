'use client';

import { Button } from '@/src/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
import { Badge } from '@/src/components/ui/badge';
import { FileText, Send } from 'lucide-react';
import { useBlockchain } from '@/src/hooks/useBlockchain';

interface MilestoneSubmissionProps {
  projectId: string;
}

export function MilestoneSubmission({ projectId }: MilestoneSubmissionProps) {
  const { projects } = useBlockchain();
  
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;

  const pendingMilestones = project.milestones.filter(m => m.status === 'pending');
  
  if (pendingMilestones.length === 0) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex-1">
          <FileText className="h-4 w-4 mr-1" />
          Submit Milestone
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit Milestone for Approval</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select a milestone to submit for payment approval:
          </p>
          
          <div className="space-y-3">
            {pendingMilestones.map((milestone) => (
              <div key={milestone.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{milestone.name}</h4>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    ${milestone.amount.toLocaleString()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // This would trigger the milestone submission logic
                    console.log(`Submitting milestone ${milestone.id} for project ${projectId}`);
                  }}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Submit for Approval
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}