import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { PRODUCT_STATUS, ProductStatus } from "../types/model.types";

export interface IProduct {
    title: string;
    price: number;
    discount: number;
    stock: number;
    status: ProductStatus;
}

// Below we're actually creating type of document who comes from the DB or mongoDB
// contains data like the interface of "IProduct" and additional mongoDB features
// using mongoose HydratedDocument type 

export type ProductDocument = HydratedDocument<IProduct>;

const productSchema = new Schema<IProduct>({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    discount: {
        type: Number,
        required: true,
        min: 0
    },

    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },

    status: {
        type: String,
        enum: PRODUCT_STATUS,
        default: "ACTIVE"
    }
});


// Ye object ek mongoose model hai jo IProduct type ke documents handle karega.
export const ProductModel : Model<IProduct> = 
    mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);