import mongoose from 'mongoose';

const closingDealSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'cancelled', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
closingDealSchema.index({ userId: 1, createdAt: -1 });
closingDealSchema.index({ propertyId: 1, createdAt: -1 });
closingDealSchema.index({ status: 1 });
closingDealSchema.index({ adminId: 1 });

const ClosingDeal = mongoose.model('ClosingDeal', closingDealSchema);

export default ClosingDeal;
