const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// Register

exports.register = async(req,res)=>{

    try{

        const {name,email,password}=req.body;

        const userExists = await User.findOne({email});

        if(userExists){

            return res.status(400).json({
                message:"Email already exists"
            });

        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create({

            name,
            email,
            password:hashedPassword

        });

        res.status(201).json({

            success:true,
            message:"User registered successfully"

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};

exports.login = async(req,res)=>{

    try{

        const emailAddress = req.body.email?.trim().toLowerCase();
        const { password } = req.body;

        const user = await User.findOne({ email: emailAddress });

        if(!user){

            return res.status(404).json({

                message:"Email not found. Please check your email address."

            });

        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){

            return res.status(401).json({

                message:"Wrong password. Please try again."

            });

        }

        const token = jwt.sign(

            {
                id:user._id,
                role:user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn:"7d"
            }

        );

        res.status(200).json({

            success:true,
            token

        });

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};

exports.getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id).select("-password");

        const userObj = user.toObject();

        userObj.fullName = userObj.name;

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

exports.updateProfile = async (req, res) => {
    try {
        const { name, avatarUrl } = req.body;
        const updates = { name };

        if (typeof avatarUrl === "string") {
            updates.avatarUrl = avatarUrl;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        res.json({
            success: true,
            message: "Profile updated successfully",
            user
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

exports.changePassword = async (req, res) => {

    try {

        const {
            currentPassword,
            newPassword
        } = req.body;

        const user = await User.findById(req.user.id);

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};