export const PRODUCT_STATUS = ["ACTIVE", "OUT_OF_STOCK"] as const;
export type ProductStatus = (typeof PRODUCT_STATUS)[number];


export const ROLE = ["USER", "ADMIN", "PROVIDER"] as const;
export type Role = (typeof ROLE)[number];


export const ORDER_STATUS = [
    "PENDING",
    "PAID",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED"
] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];



// “is array ke sab possible elements ka union type”
// (arrayType)[number]

