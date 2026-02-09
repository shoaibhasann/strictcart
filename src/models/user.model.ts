import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { ROLE, Role } from "../types/model.types";
import jwt, { Secret } from "jsonwebtoken";
import bcrypt from "bcrypt";

export interface IUser {
    username: string;
    email: string;
    password: string;
    role?: Role;
    isActive: boolean;
    refreshToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpiry?: Date;

    generateRefreshToken() : string;
    comparePassword(candidatePassword: string) : Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        trim: true,
        minLength: [5, "username must be at least 5 characters long"],
        maxLength: [15, "username cannot be more than 15 characters long"],
    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: [true, "email must be unique"],
        lowercase: true,
        match: [
            /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
            "Invalid email format",
        ],
    },

    password: {
        type: String,
        required: true,
        select: false,
        minLength: [8, "password must be at least 8 characters long"],
    },

    role: {
        type: String,
        enum: ROLE,
        default : "USER"
    },

    isActive: {
        type: Boolean,
        default: true
    },

    refreshToken: String,
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
}, {
    timestamps: true
});

userSchema.pre("save", async function() {
    if(!this.isModified("password")){
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
        return;
    } catch (error) {
        throw error;
    }
});

userSchema.methods.comparePassword = async function (candidatePassword : string){
    try {
        return await bcrypt.compare(candidatePassword, this.password);
;
    } catch (error) {
        throw error;
    }
}


export interface UserPayload {
    _id: string;
    role: Role;
    name: string;
    email: string;
}


userSchema.methods.generateRefreshToken = function () : string {

    const payload : UserPayload = {
        _id: this._id,
        role: this.role,
        name: this.username,
        email: this.email
    }

    const secretKey : Secret = process.env.REFRESH_TOKEN_SECRET as Secret;

    const token = jwt.sign(
        payload,
        secretKey,
        {
            expiresIn: "7d"
        }
    );

    return token;
};


export const UserModel : Model<IUser> = 
    mongoose.models.User || mongoose.model<IUser>("User", userSchema);