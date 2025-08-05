import mongoose from 'mongoose';

const AdminUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin : {
        type : Boolean,
        default :true
    },
    resetToken: { type: String },
    resetTokenExpire: { type: Date },
});

const AdminUserModel = mongoose.model('AdminUser', AdminUserSchema);

export default AdminUserModel;