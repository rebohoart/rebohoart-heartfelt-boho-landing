import canvasArt from "@/assets/product-canvas-art.jpg";
import ceramicPlanter from "@/assets/product-ceramic-planter.jpg";
import macrameWall from "@/assets/product-macrame-wall.jpg";
import wovenBasket from "@/assets/product-woven-basket.jpg";

export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  category: string;
}

export const products: Product[] = [
  {
    id: "macrame-wall-hanging",
    title: "Macramé Wall Hanging",
    description: "Handwoven cotton macramé with natural wood accent. Adds texture and warmth to any space.",
    image: macrameWall,
    price: 45.00,
    category: "Wall Art",
  },
  {
    id: "ceramic-planter",
    title: "Ceramic Planter Set",
    description: "Hand-painted terracotta planters in earthy tones. Perfect for your favorite greenery.",
    image: ceramicPlanter,
    price: 38.00,
    category: "Home Decor",
  },
  {
    id: "woven-basket",
    title: "Woven Storage Basket",
    description: "Natural seagrass basket with organic patterns. Functional art for mindful living.",
    image: wovenBasket,
    price: 32.00,
    category: "Storage",
  },
  {
    id: "canvas-art",
    title: "Abstract Canvas Art",
    description: "Original painting on canvas featuring warm desert tones and organic shapes.",
    image: canvasArt,
    price: 65.00,
    category: "Wall Art",
  },
];
