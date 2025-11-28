
export type ProductImageOverlay = {
    id: number;
    campaign_id: number;
    image_url: string;
    image_source: "intelligence" | "uploaded";
    product_intelligence_id?: number | null;
    position_x: number; // 0.0 to 1.0 (percentage-based positioning)
    position_y: number; // 0.0 to 1.0
    scale: number; // 0.1 to 3.0
    rotation: number; // degrees
    opacity: number; // 0.0 to 1.0
    z_index: number; // layer stacking order
    created_by?: number | null;
    created_at: string;
    updated_at: string;
};
