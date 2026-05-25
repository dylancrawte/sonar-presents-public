import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    clerkID: {
        type: String,
        required: false,
        unique: true,
    },
    email: {
        type: String,
        required: false,
        unique: true,
    },
    password: {
        type: String,
        required: false,
        minLength: 6,
    },    
});

const User = mongoose.model('User', userSchema);

export default User;