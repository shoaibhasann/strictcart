import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { ROLE, Role } from "../types/model.types";

export interface IUser {
    username: string;
    email: string;
    password: string;
    role?: Role;
    isActive: boolean;
    refreshToken?: string
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true,
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

    refreshToken: String
});

export const UserModel : Model<IUser> = 
    mongoose.models.user || mongoose.model<IUser>("User", userSchema);