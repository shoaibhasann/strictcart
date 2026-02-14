import connectDB from "@/src/lib/connectDB";
import { ProductModel } from "@/src/models/product.model";
import { PipelineStage } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const SORT_FILTERS = [
    "price_asc",
    "price_dsc",
    "best_selling",
    "newest",
    "trending",
] as const;

type SortFilters = (typeof SORT_FILTERS)[number];

interface Query {
    q?: string;
    priceMin?: number;
    priceMax?: number;
    instock?: boolean;
    sort?: SortFilters;
    page: number;
    limit: number;
}

type PriceQuery = {
    $gte?: number;
    $lte?: number;
};

export async function GET(request: NextRequest) {
    await connectDB();

    try {
        const url = new URL(request.url);
        const rawQuery = Object.fromEntries(url.searchParams.entries());

        const query: Query = {
            q: rawQuery.q,
            sort: SORT_FILTERS.includes(rawQuery.sort as SortFilters)
                ? (rawQuery.sort as SortFilters)
                : undefined,
            instock:
                rawQuery.instock !== undefined
                    ? rawQuery.instock === "true"
                    : undefined,
            priceMin: rawQuery.priceMin ? Number(rawQuery.priceMin) : undefined,
            priceMax: rawQuery.priceMax ? Number(rawQuery.priceMax) : undefined,
            page: rawQuery.page ? Math.max(Number(rawQuery.page), 1) : 1,
            limit: rawQuery.limit
                ? Math.min(Number(rawQuery.limit), 50)
                : 10,
        };

        const { q, priceMin, priceMax, instock, sort, page, limit } = query;

        const pageNumber = page;
        const limitNumber = limit;
        const skip = (pageNumber - 1) * limitNumber;

        const pipeline: PipelineStage[] = [
            {
                $match: {
                    status: "ACTIVE",
                },
            },
        ];

        // 🔍 Search
        if (q) {
            pipeline.push({
                $match: {
                    title: { $regex: q, $options: "i" },
                },
            });
        }

        // 📦 Stock filter
        if (instock !== undefined) {
            pipeline.push({
                $match: instock
                    ? { stock: { $gt: 0 } }
                    : { stock: { $lte: 0 } },
            });
        }

        // 💰 Price filter
        if (priceMin !== undefined || priceMax !== undefined) {
            const priceQuery: PriceQuery = {};
            if (priceMin !== undefined) priceQuery.$gte = priceMin;
            if (priceMax !== undefined) priceQuery.$lte = priceMax;

            pipeline.push({
                $match: {
                    price: priceQuery,
                },
            });
        }

        // 🔃 Sorting
        switch (sort) {
            case "price_asc":
                pipeline.push({ $sort: { price: 1 } });
                break;

            case "price_dsc":
                pipeline.push({ $sort: { price: -1 } });
                break;

            case "newest":
                pipeline.push({ $sort: { createdAt: -1 } });
                break;

            case "best_selling":
                pipeline.push({
                    $sort: { soldCount: -1, createdAt: -1 },
                });
                break;

            case "trending":
                pipeline.push({
                    $sort: { lastSoldAt: -1, soldCount: -1, createdAt: -1 },
                });
                break;

            default:
                pipeline.push({ $sort: { createdAt: -1 } });
        }

        // 📊 Pagination + total count
        pipeline.push({
            $facet: {
                data: [{ $skip: skip }, { $limit: limitNumber }],
                meta: [{ $count: "total" }],
            },
        });

        const results = await ProductModel.aggregate(pipeline);

        const products = results[0]?.data || [];
        const total = results[0]?.meta[0]?.total || 0;
        const totalPages = Math.ceil(total / limitNumber);

        return NextResponse.json({
            success: true,
            message: "Products fetched successfully",
            data: products,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages,
                hasNextPage: pageNumber < totalPages,
            },
        });
    } catch (error) {
        console.error("GET /api/products error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
