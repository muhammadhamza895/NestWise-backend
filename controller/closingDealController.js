import Property from "../models/propertymodel.js";
import ClosingDeal from "../models/closingDealModel.js";

export const closeDealRequest = async (req, res) => {
    try {
        const { propertyId } = req.body;
        const userId = req.user._id;

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        const adminId = property?.adminId

        if (!adminId) {
            return res.status(400).json({
                success: false,
                message: 'Property owner not found'
            });
        }

        // Check for duplicate appointments
        const existingclosingDeal = await ClosingDeal.findOne({
            propertyId,
            userId,
            adminId,
            status: { $in: ['pending', 'completed'] }
        });

        if (existingclosingDeal) {
            return res.status(400).json({
                success: false,
                message: 'Closing deal request is already pending'
            });
        }

        const closingDeal = new ClosingDeal({
            propertyId,
            userId,
            adminId,
        });

        await closingDeal.save();
        await closingDeal.populate(['propertyId', 'userId']);

        // Send confirmation email
        // const mailOptions = {
        //   from: process.env.EMAIL,
        //   to: req.user.email,
        //   subject: "Viewing Scheduled - BuildEstate",
        //   html: getSchedulingEmailTemplate(appointment, date, time, notes)
        // };

        // await transporter.sendMail(mailOptions);

        res.status(201).json({
            success: true,
            message: 'CLosing deal request sent successfully',
            closingDeal
        });
    } catch (error) {
        console.error('Error sending closing deal request:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending closing deal request'
        });
    }
};