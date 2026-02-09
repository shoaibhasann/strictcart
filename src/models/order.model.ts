import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { ORDER_STATUS, OrderStatus } from "../types/model.types";

interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    priceSnapshot: number;
}

interface IOrder {
    userId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    subtotal: number;
    total: number;
    shipping: number;
    status: OrderStatus
}

export type OrderDocument = HydratedDocument<IOrder>;

const orderItemSchema = new Schema<IOrderItem>({

    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    priceSnapshot: {
        type: Number,
        required: true,
        min: 0
    }
});

const orderSchema = new Schema<IOrder>({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [orderItemSchema],

    subtotal: {
        type: Number,
        required: true,
        min: 0
    },

    total: {
        type: Number,
        required: true,
        min: 0
    },

    shipping: {
        type: Number,
        required: true,
        min: 0
    },

    status: {
        type: String,
        enum: ORDER_STATUS,
        default: "PENDING"
    }
});

export const OrderModel : Model<IOrder> = 
    mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);