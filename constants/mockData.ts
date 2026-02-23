export const CATEGORIES = ['All', 'Furniture', 'Electronics', 'Decor', 'Toys', 'Fashion', 'Sports', 'Kitchen', 'Wellness', 'Art'];

export interface Product {
    id: string;
    name: string;
    price: string;
    category: string;
    image: string;
    description?: string;
}

const generateProducts = () => {
    const products: Product[] = [];
    const categories = CATEGORIES.filter(c => c !== 'All');

    const categoryData: Record<string, { prefix: string[], images: string[] }> = {
        'Furniture': {
            prefix: ['Minimalist', 'Velvet', 'Nordic', 'Industrial', 'Contemporary', 'Royal', 'Oak', 'Marble', 'Sleek', 'Classic'],
            images: [
                'https://images.unsplash.com/photo-1592078615290-033ee584e267',
                'https://images.unsplash.com/photo-1595428774223-ef52624120d2',
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
                'https://images.unsplash.com/photo-1567016432779-094069958ad5',
            ]
        },
        'Electronics': {
            prefix: ['Quantum', 'Cyber', 'Sonic', 'Neural', 'Titan', 'Apex', 'Nova', 'Ultra', 'Core', 'Vortex'],
            images: [
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
                'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0',
                'https://images.unsplash.com/photo-1525547718511-ad74bc362300',
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
            ]
        },
        'Decor': {
            prefix: ['Aurelian', 'Ethereal', 'Zen', 'Bohemian', 'Crystal', 'Gilded', 'Abstract', 'Vintage', 'Modern', 'Lush'],
            images: [
                'https://images.unsplash.com/photo-1581783898377-1c85bf937427',
                'https://images.unsplash.com/photo-1584132967334-10e028bd69f7',
                'https://images.unsplash.com/photo-1513519245088-0e12902e5a38',
                'https://images.unsplash.com/photo-1616489953149-864c2975968d',
            ]
        },
        'Toys': {
            prefix: ['Wonder', 'Magic', 'Turbo', 'Robo', 'Dino', 'Star', 'Galaxy', 'Hero', 'Spark', 'Action'],
            images: [
                'https://images.unsplash.com/photo-1558060370-d644479cb6f7',
                'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55',
                'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1',
                'https://images.unsplash.com/photo-1533550880246-42d622f3099d',
            ]
        },
        'Fashion': {
            prefix: ['Apollo', 'Stark', 'Velvet', 'Silk', 'Elite', 'Urban', 'Vogue', 'Chic', 'Prism', 'Luxe'],
            images: [
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
                'https://images.unsplash.com/photo-1524592094714-0f0654e20314',
                'https://images.unsplash.com/photo-1491553895911-0055eca6402d',
                'https://images.unsplash.com/photo-1483985988355-79175ff4571d',
            ]
        },
        'Sports': {
            prefix: ['Titan', 'Pro', 'Aero', 'Endurance', 'Sprint', 'Peak', 'Force', 'Action', 'Velocity', 'Nitro'],
            images: [
                'https://images.unsplash.com/photo-1583454110551-21f2fa20211c',
                'https://images.unsplash.com/photo-1592432676556-26d5630e6202',
                'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
                'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
            ]
        },
        'Kitchen': {
            prefix: ['Gourmet', 'Chef', 'Artisan', 'Copper', 'Glass', 'Steel', 'Prime', 'Elite', 'Master', 'Pure'],
            images: [
                'https://images.unsplash.com/photo-1531358341662-75f10b784a3c',
                'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
                'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1',
                'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c',
            ]
        },
        'Wellness': {
            prefix: ['Zen', 'Silk', 'Pure', 'Heal', 'Calm', 'Vital', 'Essence', 'Bloom', 'Grace', 'Soul'],
            images: [
                'https://images.unsplash.com/photo-1602928321679-560bb453f190',
                'https://images.unsplash.com/photo-1584583151847-cc3c38676d91',
                'https://images.unsplash.com/photo-1540555700478-4be289aefec9',
                'https://images.unsplash.com/photo-1515377905703-c4788e51af15',
            ]
        },
        'Art': {
            prefix: ['Canvas', 'Masterpiece', 'Gallery', 'Stroke', 'Prism', 'Infinite', 'Vision', 'Muse', 'Origin', 'Pure'],
            images: [
                'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
                'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9',
                'https://images.unsplash.com/photo-1541963463532-d68292c34b19',
                'https://images.unsplash.com/photo-1574362848149-11496d93a7c7',
            ]
        },
    };

    const nouns: Record<string, string[]> = {
        'Furniture': ['Chair', 'Table', 'Sofa', 'Sideboard', 'Stool', 'Cabinet', 'Bed', 'Shelf', 'Desk', 'Lounge'],
        'Electronics': ['Headphones', 'Tablet', 'Monitor', 'Speaker', 'Watch', 'Camera', 'Console', 'Drone', 'Mouse', 'Keyboard'],
        'Decor': ['Vase', 'Lamp', 'Tray', 'Cushion', 'Mirror', 'Clock', 'Frame', 'Candle', 'Pot', 'Rug'],
        'Toys': ['Bot', 'Rover', 'Castle', 'Set', 'Vehicle', 'Action Figure', 'Puzzle', 'Kit', 'Model', 'Ship'],
        'Fashion': ['Sneakers', 'Watch', 'Bag', 'Belt', 'Sunglasses', 'Scarf', 'Hat', 'Wallet', 'Jacket', 'Coat'],
        'Sports': ['Dumbbells', 'Mat', 'Ball', 'Racket', 'Weights', 'Bike', 'Helmet', 'Gloves', 'Shoes', 'Bench'],
        'Kitchen': ['Set', 'Pan', 'Knife', 'Pot', 'Bowl', 'Scale', 'Mixer', 'Kettle', 'Grater', 'Board'],
        'Wellness': ['Diffuser', 'Mask', 'Oil', 'Cream', 'Candle', 'Kit', 'Spray', 'Salt', 'Tea', 'Journal'],
        'Art': ['Canvas', 'Print', 'Sculpture', 'Sketch', 'Painting', 'Frame', 'Bust', 'Installation', 'Relief', 'Carving'],
    };

    let globalId = 1;

    categories.forEach(cat => {
        const data = categoryData[cat];
        const catNouns = nouns[cat];

        for (let i = 1; i <= 40; i++) {
            const prefix = data.prefix[i % 10];
            const noun = catNouns[i % 10];
            const img = `${data.images[i % 4]}?q=80&w=500&auto=format&fit=crop&sig=${globalId}`;

            // Random-ish price between 2,000 and 150,000
            const rawPrice = Math.floor(Math.random() * 120 + 2) * 1000;

            products.push({
                id: globalId.toString(),
                name: `${prefix} ${noun}`,
                price: `Ksh ${rawPrice.toLocaleString()}`,
                category: cat,
                image: img,
                description: `A masterfully crafted ${cat.toLowerCase()} piece, the ${prefix} ${noun} embodies the essence of modern luxury and functional art. Designed for the discerning collector.`
            });
            globalId++;
        }
    });

    return products;
};

export const ALL_PRODUCTS = generateProducts();
