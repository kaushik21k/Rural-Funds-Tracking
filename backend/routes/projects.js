const express = require('express');
const { authenticateToken, requireAdmin, requireGovernment, requireLocalAuthority, requireContractor } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Mock project data - replace with actual database queries
    const projects = [
      {
        id: '1',
        name: 'Rural Community Center',
        description: 'Construction of a community center in rural area',
        location: 'Village A, District X',
        totalBudget: 500000,
        allocatedFunds: 450000,
        spentFunds: 200000,
        status: 'in_progress',
        contractor: 'ABC Construction Ltd',
        milestones: [
          { id: '1', name: 'Foundation', amount: 100000, status: 'completed' },
          { id: '2', name: 'Structure', amount: 200000, status: 'in_progress' },
          { id: '3', name: 'Finishing', amount: 150000, status: 'pending' }
        ],
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Water Supply System',
        description: 'Installation of water supply system',
        location: 'Village B, District Y',
        totalBudget: 300000,
        allocatedFunds: 300000,
        spentFunds: 150000,
        status: 'in_progress',
        contractor: 'Water Works Inc',
        milestones: [
          { id: '4', name: 'Pipeline Installation', amount: 150000, status: 'completed' },
          { id: '5', name: 'Pump Installation', amount: 100000, status: 'in_progress' },
          { id: '6', name: 'Testing', amount: 50000, status: 'pending' }
        ],
        createdAt: new Date('2024-02-01')
      }
    ];

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Government only)
router.post('/', authenticateToken, requireGovernment, async (req, res) => {
  try {
    const { name, description, location, totalBudget, contractor } = req.body;

    // Mock project creation - replace with actual database operation
    const newProject = {
      id: Date.now().toString(),
      name,
      description,
      location,
      totalBudget,
      allocatedFunds: 0,
      spentFunds: 0,
      status: 'planning',
      contractor,
      milestones: [],
      createdAt: new Date()
    };

    res.status(201).json({
      message: 'Project created successfully',
      project: newProject
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id/allocate
// @desc    Allocate funds to project
// @access  Private (Government only)
router.put('/:id/allocate', authenticateToken, requireGovernment, async (req, res) => {
  try {
    const { amount } = req.body;
    const projectId = req.params.id;

    // Mock fund allocation - replace with actual database operation
    res.json({
      message: 'Funds allocated successfully',
      projectId,
      allocatedAmount: amount,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Allocate funds error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id/approve-payment
// @desc    Approve payment for milestone
// @access  Private (Local Authority only)
router.put('/:id/approve-payment', authenticateToken, requireLocalAuthority, async (req, res) => {
  try {
    const { milestoneId } = req.body;
    const projectId = req.params.id;

    // Mock payment approval - replace with actual database operation
    res.json({
      message: 'Payment approved successfully',
      projectId,
      milestoneId,
      approvedBy: req.user.name,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects/:id/milestones
// @desc    Submit milestone
// @access  Private (Contractor only)
router.post('/:id/milestones', authenticateToken, requireContractor, async (req, res) => {
  try {
    const { name, description, amount } = req.body;
    const projectId = req.params.id;

    // Mock milestone submission - replace with actual database operation
    const newMilestone = {
      id: Date.now().toString(),
      name,
      description,
      amount,
      status: 'submitted',
      submittedAt: new Date(),
      submittedBy: req.user.name
    };

    res.status(201).json({
      message: 'Milestone submitted successfully',
      projectId,
      milestone: newMilestone
    });
  } catch (error) {
    console.error('Submit milestone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/:id/transactions
// @desc    Get project transactions
// @access  Private
router.get('/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;

    // Mock transaction data - replace with actual database queries
    const transactions = [
      {
        id: '1',
        hash: '0x1234567890abcdef',
        from: 'Government Treasury',
        to: 'ABC Construction Ltd',
        amount: 100000,
        type: 'allocation',
        projectId,
        description: 'Initial fund allocation',
        timestamp: new Date('2024-01-15'),
        status: 'completed',
        blockHeight: 12345
      },
      {
        id: '2',
        hash: '0xabcdef1234567890',
        from: 'Government Treasury',
        to: 'ABC Construction Ltd',
        amount: 50000,
        type: 'payment',
        projectId,
        description: 'Foundation milestone payment',
        timestamp: new Date('2024-02-01'),
        status: 'completed',
        blockHeight: 12350
      }
    ];

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
