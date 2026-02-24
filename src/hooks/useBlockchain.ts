'use client';

import { useState, useEffect } from 'react';
import { Transaction, Project, Milestone } from '@/app/page';

// Simulated blockchain data
const initialTransactions: Transaction[] = [];

const initialProjects: Project[] = [];

export function useBlockchain() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Load data from localStorage or use initial data
    const savedTransactions = localStorage.getItem('blockchain_transactions');
    const savedProjects = localStorage.getItem('blockchain_projects');

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      setTransactions(initialTransactions);
      localStorage.setItem('blockchain_transactions', JSON.stringify(initialTransactions));
    }

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      setProjects(initialProjects);
      localStorage.setItem('blockchain_projects', JSON.stringify(initialProjects));
    }
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'hash' | 'timestamp' | 'blockHeight'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      hash: '0x' + Math.random().toString(16).substr(2, 5) + '...',
      timestamp: Date.now(),
      blockHeight: 12000 + transactions.length + 1
    };

    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    localStorage.setItem('blockchain_transactions', JSON.stringify(updatedTransactions));

    return newTransaction;
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map(project =>
      project.id === projectId ? { ...project, ...updates } : project
    );
    setProjects(updatedProjects);
    localStorage.setItem('blockchain_projects', JSON.stringify(updatedProjects));
  };

  const addProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: 'proj_' + Math.random().toString(36).substr(2, 6),
      createdAt: Date.now()
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('blockchain_projects', JSON.stringify(updatedProjects));

    return newProject;
  };

  const totalFunds = transactions
    .filter(tx => tx.status === 'completed' && tx.type === 'allocation')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pendingTransactions = transactions.filter(tx => tx.status === 'pending').length;

  // Function to clear all data (useful for testing)
  const clearAllData = () => {
    localStorage.removeItem('blockchain_transactions');
    localStorage.removeItem('blockchain_projects');
    setTransactions(initialTransactions);
    setProjects(initialProjects);
  };

  return {
    transactions,
    projects,
    addTransaction,
    updateProject,
    addProject,
    totalFunds,
    pendingTransactions,
    clearAllData
  };
}