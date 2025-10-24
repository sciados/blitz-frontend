export type User = {
    id: number;
    email: string;
    full_name?: string | null;
    created_at: string;
};

export type Campaign = {
    id: number;
    name: string;
    product_url: string;
    affiliate_network: string;
    status: "draft" | "active" | "paused" | "completed";
    created_at: string;
    updated_at: string;
};