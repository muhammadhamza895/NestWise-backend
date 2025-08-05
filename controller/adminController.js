import Stats from "../models/statsModel.js";
import Property from "../models/propertymodel.js";
import Appointment from "../models/appointmentModel.js";
import User from "../models/Usermodel.js";
// import transporter from "../config/nodemailer.js";
import { getEmailTemplate } from "../email.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import validator from "validator";
import AdminUserModel from "../models/adminUserModel.js";
import jwt from "jsonwebtoken";
import { stripe } from "../server.js";

const createtoken = (id) => {
  return jwt.sign({ id, isAdmin: true }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const formatRecentProperties = (properties) => {
  return properties.map((property) => ({
    type: "property",
    description: `New property listed: ${property.title}`,
    timestamp: property.createdAt,
  }));
};

const formatRecentAppointments = (appointments) => {
  return appointments.map((appointment) => ({
    type: "appointment",
    description:
      appointment.userId && appointment.propertyId
        ? `${appointment.userId.name} scheduled viewing for ${appointment.propertyId.title}`
        : "Appointment scheduled",
    timestamp: appointment.createdAt,
  }));
};

// Add these helper functions before the existing exports
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalProperties,
      activeListings,
      totalUsers,
      pendingAppointments,
      recentActivity,
      viewsData,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: "active" }),
      User.countDocuments(),
      Appointment.countDocuments({ status: "pending" }),
      getRecentActivity(),
      getViewsData(),
    ]);

    res.json({
      success: true,
      stats: {
        totalProperties,
        activeListings,
        totalUsers,
        pendingAppointments,
        recentActivity,
        viewsData,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin statistics",
    });
  }
};

const getRecentActivity = async () => {
  try {
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title createdAt");

    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("propertyId", "title")
      .populate("userId", "name");

    // Filter out appointments with missing user or property data
    const validAppointments = recentAppointments.filter(
      (appointment) => appointment.userId && appointment.propertyId
    );

    return [
      ...formatRecentProperties(recentProperties),
      ...formatRecentAppointments(validAppointments),
    ].sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error getting recent activity:", error);
    return [];
  }
};

const getViewsData = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Stats.aggregate([
      {
        $match: {
          endpoint: /^\/api\/products\/single\//,
          method: "GET",
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Generate dates for last 30 days
    const labels = [];
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      labels.push(dateString);

      const stat = stats.find((s) => s._id === dateString);
      data.push(stat ? stat.count : 0);
    }

    return {
      labels,
      datasets: [
        {
          label: "Property Views",
          data,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  } catch (error) {
    console.error("Error generating chart data:", error);
    return {
      labels: [],
      datasets: [
        {
          label: "Property Views",
          data: [],
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }
};

// Add these new controller functions
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("propertyId", "title location")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    ).populate("propertyId userId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Send email notification using the template from email.js
    const mailOptions = {
      from: process.env.EMAIL,
      to: appointment.userId.email,
      subject: `Viewing Appointment ${status.charAt(0).toUpperCase() + status.slice(1)
        } - BuildEstate`,
      html: getEmailTemplate(appointment, status),
    };

    // await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment",
    });
  }
};


export const signupAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!validator.isEmail(email)) {
      return res.json({ message: "Invalid email", success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdminUser = new AdminUserModel({ name, email, password: hashedPassword });
    await newAdminUser.save();
    const token = createtoken(newAdminUser._id);

    return res.json({ token, user: { name: newAdminUser.name, email: newAdminUser.email, isAdmin: newAdminUser.isAdmin }, success: true });
  } catch (error) {
    if (error.code === 11000 && error.keyValue?.email) {
      return res.status(409).json({ message: "Email already exists", success: false });
    }

    console.error(error);
    return res.json({ message: "Server error", success: false });
  }
}

export const adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const Registeruser = await AdminUserModel.findOne({ email });
    if (!Registeruser) {
      return res.json({ message: "Email not found", success: false });
    }

    const isMatch = await bcrypt.compare(password, Registeruser.password);

    if (isMatch) {
      const token = createtoken(Registeruser._id);
      return res.json({ token, user: { name: Registeruser.name, email: Registeruser.email, isAdmin: Registeruser.isAdmin }, success: true });
    } else {
      return res.json({ message: "Invalid password", success: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};


export const getAdminName = async (req, res) => {
  try {
    const user = await AdminUserModel.findById(req.user.id).select("-password");
    return res.json(user);
  }
  catch (error) {
    console.error(error);
    return res.json({ message: "Server error", success: false });
  }
}


export const getAdminConnectId = async (req, res) => {
  try {
    const user = req.user;
    return res.json({
      success: true,
      connectId: user?.connectId || '',
    });
  }
  catch (error) {
    console.error(error);
    return res.json({ message: "Server error", success: false });
  }
}

export const getStripeAccountStatus = async (req, res) => {
  try {
    const { connectId } = req.body

    if (!connectId) {
      return res.status(400).json({ message: "Connect Id is required", success: false });
    }

    const account = await stripe.accounts.retrieve(connectId);
    console.log(account.details_submitted);
    console.log(account.charges_enabled);
    console.log(account.payouts_enabled);

    return res.json({
      success: true,
      isActivated: account.details_submitted && account.charges_enabled && account.payouts_enabled,
    });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
}

export const generateConnectId = async (req, res) => {
  try {
    const user = req.user;

    const account = await stripe.accounts.create({
      type: 'standard',
      // email: 'seller@example.com',
      // country: 'US',
      // capabilities: {
      //   card_payments: { requested: true },
      //   transfers: { requested: true },
      // },
    });
    console.log({ account: account.id })
    user.connectId = account.id

    await user.save()
    return res.json({
      success: true,
      connectId: account.id
    });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
}


export const generateOnboardingUrl = async (req, res) => {
  try {
    const { connectId } = req.body

    if (!connectId) {
      return res.json({ message: "Connect Id is required", success: false });
    }

    const accountLink = await stripe.accountLinks.create({
      account: connectId,
      type: 'account_onboarding',
      refresh_url: `${process.env.WEBSITE_URL}/admin/stripe-setup`,
      return_url: `${process.env.WEBSITE_URL}/admin/stripe-setup`,
    });

    console.log('Onboarding Link:', accountLink.url);
    return res.json({
      success: true,
      onboardingLink: accountLink.url
    });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
}


export const createCheckoutSession = async (req, res) => {
  try {
    const { connectId, product } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: product.name },
          unit_amount: product.amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.WEBSITE_URL}/admin/stripe-setup`,
      cancel_url: `${process.env.WEBSITE_URL}/admin/stripe-setup`,
    }, {
      stripeAccount: connectId,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
