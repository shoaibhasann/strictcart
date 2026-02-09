import mongoose, { HydratedDocument, Model, Schema } from "mongoose";

interface ICartItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    priceSnapshot: number;
}

interface ICart {
    userId: mongoose.Types.ObjectId;
    items: ICartItem[];
    subtotal: number;
    total: number;
    shipping: number;
}

export type CartDocument = HydratedDocument<ICart>;

const cartItemSchema = new Schema<ICartItem>({

    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },

    priceSnapshot: {
        type: Number,
        required: true,
        min: 0
    }
})

const cartSchema = new Schema<ICart>({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [cartItemSchema],

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
    }
});

cartSchema.pre("save", function (this: CartDocument) {
    if(!this.isModified("items") && !this.isModified("shipping")) return;
    const subtotal = this.items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity,  0);
    this.subtotal = subtotal;
    this.total = subtotal + this.shipping;
});


export const CartModel : Model<ICart> = 
    mongoose.models.cart || mongoose.model<ICart>("Cart", cartSchema);