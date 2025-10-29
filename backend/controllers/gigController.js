const Gig = require("../models/Gig.js")
const User = require("../models/User.js")

exports.createGig = async(req, res)=>{
    try {
        const {
            title,
            description,
            category,
            budget,
            budgetType,
            location,
            skillsRequired
        } = req.body;

        if (!title || !description || !category || !budget || !budgetType || !location) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // if user is a client
        const user = await User.findById(req.userId);
        if (user.role !== 'client') {
            return res.status(403).json({
                success: false,
                message: 'Only clients can create gigs'
            });
        }

        const gig = await Gig.create({
            title,
            description,
            category,
            budget: Number(budget),
            budgetType,
            location,
            skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : [skillsRequired],
            client: req.userId
        });

        await gig.populate('client', 'username email avatar');

        res.status(201).json({
            success: true,
            data: gig,
            message: 'Gig created successfully'
        });
    } catch (error) {
        console.error('Create gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gig creation',
            error: error.message
        });
    }
}

exports.getGigs = async(req, res)=>{
    try {
        const { page = 1, limit = 10, status = 'open' } = req.query;
        
        const gigs = await Gig.find({ status })
            .populate('client', 'username email avatar')
            .populate('hiredFreelancer', 'username email avatar')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Gig.countDocuments({ status });

        res.json({
            success: true,
            data: gigs,
            pagination: {
                current: Number(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get gigs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

exports.getGig = async(req, res)=>{
    try {
        const gig = await Gig.findById(req.params.id)
            .populate('client', 'username email avatar phone')
            .populate('hiredFreelancer', 'username email avatar skills')
            .populate('applications.freelancer', 'username email avatar skills bio');

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found'
            });
        }

        res.json({
            success: true,
            data: gig
        });
    } catch (error) {
        console.error('Get gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

exports.updateGig = async(req, res)=>{
    try {
        let gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found'
            });
        }

        if (gig.client.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this gig'
            });
        }

        gig = await Gig.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
        .populate('client', 'username email avatar')
        .populate('hiredFreelancer', 'username email avatar');

        res.json({
            success: true,
            data: gig,
            message: 'Gig updated successfully'
        });
    } catch (error) {
        console.error('Update gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gig update',
            error: error.message
        });
    }
}

exports.deleteGig = async(req, res)=>{
    try {
        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found'
            });
        }

        if (gig.client.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this gig'
            });
        }

        await Gig.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Gig deleted successfully'
        });
    } catch (error) {
        console.error('Delete gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during gig deletion',
            error: error.message
        });
    }
}

exports.getMyGigs = async(req, res)=>{
    try {
        // Check if user is a client
        const user = await User.findById(req.userId);
        if (user.role !== 'client') {
            return res.status(403).json({
                success: false,
                message: 'Only clients can access this endpoint'
            });
        }

        const gigs = await Gig.find({ client: user })
            .populate('client', 'username email avatar')
            .populate('hiredFreelancer', 'username email avatar')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: gigs
        });
    } catch (error) {
        console.error('Get client gigs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

exports.searchGigs = async(req, res)=>{
    try {
        const { 
            search, 
            category, 
            skills, 
            minBudget, 
            maxBudget, 
            budgetType,
            location,
            page = 1, 
            limit = 10 
        } = req.query;
        
        let query = { status: 'open' };
        
        // title and description search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Category filter
        if (category) {
            query.category = { $regex: category, $options: 'i' };
        }
        
        // Skills filter
        if (skills) {
            const skillsArray = skills.split(',');
            query.skillsRequired = { $in: skillsArray };
        }
        
        // Budget filter
        if (minBudget || maxBudget) {
            query.budget = {};
            if (minBudget) query.budget.$gte = Number(minBudget);
            if (maxBudget) query.budget.$lte = Number(maxBudget);
        }

        // Budgettype filter
        if (budgetType) {
            query.budgetType = budgetType;
        }

        // Location filter
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        const gigs = await Gig.find(query)
            .populate('client', 'username email avatar')
            .populate('hiredFreelancer', 'username email avatar')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Gig.countDocuments(query);

        res.json({
            success: true,
            data: gigs,
            pagination: {
                current: Number(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Search gigs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during search',
            error: error.message
        });
    }
}

exports.applyToGig = async(req, res)=>{
    try {
        const { proposal, bidAmount } = req.body;
        const gigId = req.params.id;

        if (!proposal || !bidAmount) {
            return res.status(400).json({
                success: false,
                message: 'Please provide proposal and bid amount'
            });
        }

        // Check if user is a freelancer
        const user = await User.findById(req.userId);
        if (user.role !== 'freelancer') {
            return res.status(403).json({
                success: false,
                message: 'Only freelancers can apply to gigs'
            });
        }

        const gig = await Gig.findById(gigId);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found'
            });
        }

        // Check if gig is open
        if (gig.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'This gig is not accepting applications'
            });
        }

        // if user has already applied
        const alreadyApplied = gig.applications.find(
            app => app.freelancer.toString() === req.userId
        );

        if (alreadyApplied) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this gig'
            });
        }

        // Add application
        gig.applications.push({
            freelancer: req.userId,
            proposal,
            bidAmount: Number(bidAmount)
        });

        await gig.save();
        await gig.populate('applications.freelancer', 'username email avatar skills bio');

        res.json({
            success: true,
            data: gig,
            message: 'Application submitted successfully'
        });
    } catch (error) {
        console.error('Apply to gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during application',
            error: error.message
        });
    }
}

exports.updateApplicationStatus = async(req, res)=>{
    try {
        const { applicationId, status } = req.body;
        const gigId = req.params.id;

        const gig = await Gig.findById(gigId);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found'
            });
        }

        // Check if user owns the gig
        if (gig.client.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update application status'
            });
        }

        const application = gig.applications.id(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        application.status = status;

        // If application is accepted, update gig status and hired freelancer
        if (status === 'accepted') {
            gig.status = 'in-progress';
            gig.hiredFreelancer = application.freelancer;
            
            // Reject all other applications
            gig.applications.forEach(app => {
                if (app._id.toString() !== applicationId) {
                    app.status = 'rejected';
                }
            });
        }

        await gig.save();
        await gig.populate('applications.freelancer', 'username email avatar skills bio');
        await gig.populate('hiredFreelancer', 'username email avatar skills');

        res.json({
            success: true,
            data: gig,
            message: `Application ${status} successfully`
        });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during status update',
            error: error.message
        });
    }
}

exports.getMyApplications = async(req, res)=>{
    try {
        // if user is a freelancer
        const user = await User.findById(req.userId);
        if (user.role !== 'freelancer') {
            return res.status(403).json({
                success: false,
                message: 'Only freelancers can access this endpoint'
            });
        }

        const gigs = await Gig.find({
            'applications.freelancer': req.userId
        })
        .populate('client', 'username email avatar')
        .populate('hiredFreelancer', 'username email avatar')
        .sort({ createdAt: -1 });

        // Filter to only include applications from this freelancer
        const gigsWithMyApplications = gigs.map(gig => {
            const myApplications = gig.applications.filter(
                app => app.freelancer.toString() === req.userId
            );
            return {
                ...gig.toObject(),
                applications: myApplications
            };
        });

        res.json({
            success: true,
            data: gigsWithMyApplications
        });
    } catch (error) {
        console.error('Get my applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

exports.updateGigStatus = async(req, res)=>{
    try {
        const { status } = req.body;
        const gigId = req.params.id;

        const gig = await Gig.findById(gigId);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found'
            });
        }

        // Check if user owns the gig or is the hired freelancer
        const isClient = gig.client.toString() === req.userId;
        const isHiredFreelancer = gig.hiredFreelancer && gig.hiredFreelancer.toString() === req.userId;

        if (!isClient && !isHiredFreelancer) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update gig status'
            });
        }

        gig.status = status;
        await gig.save();

        await gig.populate('client', 'username email avatar');
        await gig.populate('hiredFreelancer', 'username email avatar skills');

        res.json({
            success: true,
            data: gig,
            message: `Gig status updated to ${status}`
        });
    } catch (error) {
        console.error('Update gig status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during status update',
            error: error.message
        });
    }
}