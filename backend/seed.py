import random
from supabase_client import supabase

CATEGORIES = ['Furniture', 'Electronics', 'Decor', 'Toys', 'Fashion', 'Sports', 'Kitchen', 'Wellness', 'Art']

CATEGORY_DATA = {
    'Furniture': {
        'prefix': ['Minimalist', 'Velvet', 'Nordic', 'Industrial', 'Contemporary', 'Royal', 'Oak', 'Marble', 'Sleek', 'Classic'],
        'images': [
            'https://images.unsplash.com/photo-1592078615290-033ee584e267',
            'https://images.unsplash.com/photo-1595428774223-ef52624120d2',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
            'https://images.unsplash.com/photo-1567016432779-094069958ad5',
        ],
        'nouns': ['Chair', 'Table', 'Sofa', 'Sideboard', 'Stool', 'Cabinet', 'Bed', 'Shelf', 'Desk', 'Lounge']
    },
    'Electronics': {
        'prefix': ['Quantum', 'Cyber', 'Sonic', 'Neural', 'Titan', 'Apex', 'Nova', 'Ultra', 'Core', 'Vortex'],
        'images': [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
            'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0',
            'https://images.unsplash.com/photo-1525547718511-ad74bc362300',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        ],
        'nouns': ['Headphones', 'Tablet', 'Monitor', 'Speaker', 'Watch', 'Camera', 'Console', 'Drone', 'Mouse', 'Keyboard']
    },
    'Decor': {
        'prefix': ['Aurelian', 'Ethereal', 'Zen', 'Bohemian', 'Crystal', 'Gilded', 'Abstract', 'Vintage', 'Modern', 'Lush'],
        'images': [
            'https://images.unsplash.com/photo-1581783898377-1c85bf937427',
            'https://images.unsplash.com/photo-1584132967334-10e028bd69f7',
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38',
            'https://images.unsplash.com/photo-1616489953149-864c2975968d',
        ],
        'nouns': ['Vase', 'Lamp', 'Tray', 'Cushion', 'Mirror', 'Clock', 'Frame', 'Candle', 'Pot', 'Rug']
    },
    'Toys': {
        'prefix': ['Wonder', 'Magic', 'Turbo', 'Robo', 'Dino', 'Star', 'Galaxy', 'Hero', 'Spark', 'Action'],
        'images': [
            'https://images.unsplash.com/photo-1558060370-d644479cb6f7',
            'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55',
            'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1',
            'https://images.unsplash.com/photo-1533550880246-42d622f3099d',
        ],
        'nouns': ['Bot', 'Rover', 'Castle', 'Set', 'Vehicle', 'Action Figure', 'Puzzle', 'Kit', 'Model', 'Ship']
    },
    'Fashion': {
        'prefix': ['Apollo', 'Stark', 'Velvet', 'Silk', 'Elite', 'Urban', 'Vogue', 'Chic', 'Prism', 'Luxe'],
        'images': [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
            'https://images.unsplash.com/photo-1524592094714-0f0654e20314',
            'https://images.unsplash.com/photo-1491553895911-0055eca6402d',
            'https://images.unsplash.com/photo-1483985988355-79175ff4571d',
        ],
        'nouns': ['Sneakers', 'Watch', 'Bag', 'Belt', 'Sunglasses', 'Scarf', 'Hat', 'Wallet', 'Jacket', 'Coat']
    },
    'Sports': {
        'prefix': ['Titan', 'Pro', 'Aero', 'Endurance', 'Sprint', 'Peak', 'Force', 'Action', 'Velocity', 'Nitro'],
        'images': [
            'https://images.unsplash.com/photo-1583454110551-21f2fa20211c',
            'https://images.unsplash.com/photo-1592432676556-26d5630e6202',
            'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
        ],
        'nouns': ['Dumbbells', 'Mat', 'Ball', 'Racket', 'Weights', 'Bike', 'Helmet', 'Gloves', 'Shoes', 'Bench']
    },
    'Kitchen': {
        'prefix': ['Gourmet', 'Chef', 'Artisan', 'Copper', 'Glass', 'Steel', 'Prime', 'Elite', 'Master', 'Pure'],
        'images': [
            'https://images.unsplash.com/photo-1531358341662-75f10b784a3c',
            'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
            'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1',
            'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c',
        ],
        'nouns': ['Set', 'Pan', 'Knife', 'Pot', 'Bowl', 'Scale', 'Mixer', 'Kettle', 'Grater', 'Board']
    },
    'Wellness': {
        'prefix': ['Zen', 'Silk', 'Pure', 'Heal', 'Calm', 'Vital', 'Essence', 'Bloom', 'Grace', 'Soul'],
        'images': [
            'https://images.unsplash.com/photo-1602928321679-560bb453f190',
            'https://images.unsplash.com/photo-1584583151847-cc3c38676d91',
            'https://images.unsplash.com/photo-1540555700478-4be289aefec9',
            'https://images.unsplash.com/photo-1515377905703-c4788e51af15',
        ],
        'nouns': ['Diffuser', 'Mask', 'Oil', 'Cream', 'Candle', 'Kit', 'Spray', 'Salt', 'Tea', 'Journal']
    },
    'Art': {
        'prefix': ['Canvas', 'Masterpiece', 'Gallery', 'Stroke', 'Prism', 'Infinite', 'Vision', 'Muse', 'Origin', 'Pure'],
        'images': [
            'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
            'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9',
            'https://images.unsplash.com/photo-1541963463532-d68292c34b19',
            'https://images.unsplash.com/photo-1574362848149-11496d93a7c7',
        ],
        'nouns': ['Canvas', 'Print', 'Sculpture', 'Sketch', 'Painting', 'Frame', 'Bust', 'Installation', 'Relief', 'Carving']
    },
}

import random
import asyncio
from supabase_client import supabase

CATEGORIES = ['Furniture', 'Electronics', 'Decor', 'Toys', 'Fashion', 'Sports', 'Kitchen', 'Wellness', 'Art']

# ... (CATEGORY_DATA remains the same)

async def seed_database():
    print("Starting database seeding...")
    
    # 2. Seed Categories
    category_map = {}
    for cat_name in CATEGORIES:
        result = await supabase.upsert("categories", {"name": cat_name})
        if result:
            category_map[cat_name] = result[0]['id']
            print(f"Seeded category: {cat_name}")

    # 3. Seed Products
    products_to_insert = []
    global_id = 1
    
    for cat_name in CATEGORIES:
        data = CATEGORY_DATA[cat_name]
        prefixes = data['prefix']
        nouns = data['nouns']
        images = data['images']
        cat_id = category_map[cat_name]
        
        for i in range(1, 41):
            prefix = prefixes[i % 10]
            noun = nouns[i % 10]
            img = f"{images[i % 4]}?q=80&w=500&auto=format&fit=crop&sig={global_id}"
            
            raw_price = random.randint(2, 122) * 1000
            
            products_to_insert.append({
                "name": f"{prefix} {noun}",
                "price_ksh": raw_price,
                "category_id": cat_id,
                "image_url": img,
                "description": f"A masterfully crafted {cat_name.lower()} piece, the {prefix} {noun} embodies the essence of modern luxury and functional art. Designed for the discerning collector."
            })
            global_id += 1
            
            # Insert in chunks of 50 to avoid request size limits
            if len(products_to_insert) >= 50:
                await supabase.insert("products", products_to_insert)
                print(f"Inserted {len(products_to_insert)} products...")
                products_to_insert = []

    if products_to_insert:
        await supabase.insert("products", products_to_insert)
        print(f"Inserted final {len(products_to_insert)} products.")

    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_database())
