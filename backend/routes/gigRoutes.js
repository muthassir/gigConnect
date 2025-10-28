const express = require('express');
const {
    createGig,
    getGigs,
    getGig,
    updateGig,
    deleteGig,
    getMyGigs,
    searchGigs,
    applyToGig,
    updateApplicationStatus,
    getMyApplications,
    updateGigStatus
} = require('../controllers/gigController.js')
const auth = require('../middleware/authMiddleware.js');

const router = express.Router();

// Public routes 
router.get('/', getGigs);
router.get('/search', searchGigs);
router.get('/:id', getGig);

// Protected routes 
router.post('/', auth, createGig);
router.put('/:id', auth, updateGig);
router.delete('/:id', auth, deleteGig);
router.get('/client/my-gigs', auth, getMyGigs);
router.put('/:id/application-status', auth, updateApplicationStatus);
router.post('/:id/apply', auth, applyToGig);
router.get('/freelancer/my-applications', auth, getMyApplications);
router.put('/:id/status', auth, updateGigStatus);

module.exports = router;