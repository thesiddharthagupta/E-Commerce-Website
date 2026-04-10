const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/techmart';

// Define mini-schemas for raw insertion if models aren't available
const CategorySchema = new mongoose.Schema({ name: String, slug: String, isActive: Boolean });
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  shortDescription: String,
  price: Number,
  salePrice: Number,
  stock: Number,
  category: mongoose.Schema.Types.ObjectId,
  brand: String,
  images: [{ url: String, alt: String, isPrimary: Boolean }],
  features: [String],
  ratings: { average: Number, count: Number },
  isActive: { type: Boolean, default: true },
  isFeatured: Boolean,
  isNewArrival: Boolean,
  tags: [String],
  sku: String
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const seedInventory = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Ensure Categories exist and map them
    const categories = await Category.find({ isActive: true });
    const catMap = {};
    categories.forEach(c => catMap[c.name] = c._id);

    // Fallback if missing some
    const requiredCats = ['Laptops', 'Smartphones', 'Tablets', 'Audio', 'Gaming', 'Accessories', 'Cameras', 'Smart Home', 'Smart Watches', 'Peripherals'];
    for (const catName of requiredCats) {
      if (!catMap[catName]) {
        const nc = await Category.create({ name: catName, slug: catName.toLowerCase().replace(' ', '-'), isActive: true });
        catMap[catName] = nc._id;
      }
    }

    const now = new Date();
    const products = [];

    // HELPER: Generate slug
    const makeSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);

    // ─── 1. SMALL ACCESSORIES (20-25 items) ───
    const subAccessories = [
      { name: "Anker PowerLine+ II USB-C to Lightning", brand: "Anker", price: 1899, stock: 85, category: 'Accessories', sub: 'Cables', desc: "Ultra-durable cable with MFi certification for high-speed charging.", features: ["MFi Certified","30,000 bend lifespan","High-speed data transfer","Double-braided nylon","6ft Length"] },
      { name: "Samsung 25W USB-C Wall Charger", brand: "Samsung", price: 1499, stock: 50, category: 'Accessories', sub: 'Chargers', desc: "Super Fast Charging for your Galaxy devices.", features: ["PD 3.0 support","Compact design","Safety protections","Over-current protection","Official Samsung Quality"] },
      { name: "Boat BassHeads 100 Earphones", brand: "Boat", price: 599, stock: 100, category: 'Audio', sub: 'Wired Earphones', desc: "Superior sound quality with integrated microphone.", features: ["Hawk-inspired design","10mm drivers","Passive noise cancellation","In-line mic","1.2m Cable"] },
      { name: "Sony MDR-EX15AP Earbuds", brand: "Sony", price: 999, stock: 45, category: 'Audio', sub: 'Wired Earphones', desc: "Lightweight earbuds with inline remote and mic.", features: ["Comfortable silicone fit","9mm neodymium drivers","Lightweight design","Integrated mic","Smartphone compatible"] },
      { name: "Mi Power Bank 3i 10000mAh", brand: "Xiaomi", price: 1299, stock: 70, category: 'Accessories', sub: 'Power Banks', desc: "Triple output with multiple layers of circuit protection.", features: ["18W Fast Charge","Triple output ports","Dual input (Micro/Type-C)","12 layers protection","Meta design"] },
      { name: "Anker 737 Power Bank (PowerCore 24K)", brand: "Anker", price: 14999, stock: 15, category: 'Accessories', sub: 'Power Banks', desc: "Ultra-powerful 140W two-way charging power bank.", features: ["Smart display","140W Fast charging","24,000mAh capacity","Charge 3 devices at once","GaN technology"] },
      { name: "SanDisk Ultra 128GB MicroSDXC", brand: "SanDisk", price: 1299, stock: 90, category: 'Accessories', sub: 'Memory', desc: "Up to 140MB/s read speed for faster performance.", features: ["Class 10 for FHD","A1-rated for apps","Waterproof","Temperature proof","Perfect for Android"] },
      { name: "Samsung EVO Plus 256GB MicroSD", brand: "Samsung", price: 2499, stock: 65, category: 'Accessories', sub: 'Memory', desc: "Reliable and fast storage for your 4K UHD video recordings.", features: ["130MB/s Speed","6-proof protection","10-year warranty","V30 Video Speed","UHS-1 interface"] },
      { name: "Spigen Rugged Armor Case (iPhone 16)", brand: "Spigen", price: 1599, stock: 40, category: 'Accessories', sub: 'Covers', desc: "Signature carbon fiber look with matte black finish.", features: ["Air Cushion Tech","Slim profile","Raised lips for screen","Tactile buttons","Shock absorption"] },
      { name: "Apple MagSafe Charger", brand: "Apple", price: 4500, stock: 30, category: 'Accessories', sub: 'Chargers', desc: "Simple, magnetic wireless charging for iPhone 12 or newer.", features: ["Magnetic alignment","Up to 15W wireless","USB-C connector","Compatible with AirPods","Official Apple accessory"] },
      { name: "Belkin BoostCharge Pro 3-in-1", brand: "Belkin", price: 13999, stock: 10, category: 'Accessories', sub: 'Chargers', desc: "Premium MagSafe charging stand for iPhone, Watch, and AirPods.", features: ["Official MagSafe","15W Fast Wireless","Stainless steel finish","Non-slip weighted base","LED status light"] },
      { name: "Sandisk Cruzer Blade 64GB USB 2.0", brand: "SanDisk", price: 549, stock: 100, category: 'Accessories', sub: 'Memory', desc: "Compact and light, take your files anywhere with ease.", features: ["Ultra-portable","SecureAccess safety","Capless design","Drag-and-drop file save","Strap hole"] },
      { name: "Logitech Pebble M350 Mouse", brand: "Logitech", price: 1999, stock: 35, category: 'Peripherals', sub: 'Mice', desc: "Modern, slim, and silent wireless mouse.", features: ["Silent clicks/scroll","Bluetooth & USB receiver","18-month battery","Organic pebble shape","Precise tracking"] },
      { name: "Airtel Xstream Dual Band Router", brand: "Airtel", price: 2999, stock: 20, category: 'Accessories', sub: 'Networking', desc: "High-speed dual-band WiFi for seamless streaming.", features: ["1200Mbps Speed","4 External antennas","Parental controls","Guest network","WPS support"] },
      { name: "TP-Link Nano USB WiFi Adapter", brand: "TP-Link", price: 699, stock: 80, category: 'Accessories', sub: 'Networking', desc: "Miniature design, stable WiFi for your desktop or laptop.", features: ["150Mbps Speed","Nano size","Soft AP mode","Windows/Mac/Linux support","Easy setup"] },
      { name: "Realme 10000mAh Power Bank 2", brand: "Realme", price: 999, stock: 55, category: 'Accessories', sub: 'Power Banks', desc: "Grid-texture finish for a comfortable grip and 18W fast charging.", features: ["18W Two-way Charge","Dual output (USB-A/C)","Low-current mode","Multiple protection","Stylish design"] },
      { name: "OnePlus 80W SuperVOOC Power Adapter", brand: "OnePlus", price: 2999, stock: 25, category: 'Accessories', sub: 'Chargers', desc: "Blazing fast charging for OnePlus flagships.", features: ["80W Max output","Intelligent heat control","Safety certified","Compact size","Compatible with Type-C"] },
      { name: "Razer DeathAdder Essential", brand: "Razer", price: 1499, stock: 40, category: 'Gaming', sub: 'Mice', desc: "High-performance gaming mouse with 6,400 DPI optical sensor.", features: ["Ergonomic design","5 Hyperesponse buttons","10M click durability","Razer Synapse support","Gaming-grade tactile scroll"] },
      { name: "Kingston DataTraveler Exodia 128GB", brand: "Kingston", price: 1199, stock: 60, category: 'Accessories', sub: 'Memory', desc: "Quick and convenient storage with large loop for keyrings.", features: ["USB 3.2 Gen 1","Protective cap","Colorful key ring loop","Multiple capacities","5-year warranty"] },
      { name: "Amazon Basics Laptop Sleeve 14-inch", brand: "Amazon Basics", price: 899, stock: 50, category: 'Accessories', sub: 'Bags', desc: "Slim-line design allows this case to be carried solo or in your bag.", features: ["Neoprene material","Front pocket storage","Easy-access zipper","Form-fitting","Shock protection"] }
    ];

    // ─── 2. MEDIUM DEVICES (Smartphones, Tablets, etc - 30 items) ───
    const subMedium = [
      { name: "iPhone 16 Pro 256GB Black", brand: "Apple", price: 129990, stock: 15, category: 'Smartphones', sub: 'iOS', desc: "The ultimate iPhone with a titanium frame and A18 Pro chip.", features: ["A18 Pro chip","ProMotion 120Hz display","48MP Triple camera","Titanium design","USB-C Charging"] },
      { name: "Samsung Galaxy S24 Ultra", brand: "Samsung", price: 124999, stock: 20, category: 'Smartphones', sub: 'Android', desc: "Galaxy AI is here. Epic zoom with 200MP camera.", features: ["Titanium frame","Snapdragon 8 Gen 3","Built-in S-Pen","200MP Main lens","Galaxy AI features"] },
      { name: "Google Pixel 9 Pro XL", brand: "Google", price: 104999, stock: 12, category: 'Smartphones', sub: 'Android', desc: "The most intelligent Pixel yet with Gemini AI integration.", features: ["Tensor G4 Chip","Gemini AI built-in","Pro camera system","7 years OS updates","Super Actua display"] },
      { name: "OnePlus 12 5G Silk Black", brand: "OnePlus", price: 64999, stock: 25, category: 'Smartphones', sub: 'Android', desc: "Smooth Beyond Belief. Snapdragon 8 Gen 3 and 4th Gen Hasselblad Camera.", features: ["80W AirVOOC","Snapdragon 8 Gen 3","Hasselblad Camera","5400mAh Battery","Curved OLED display"] },
      { name: "Nothing Phone (2a)", brand: "Nothing", price: 23999, stock: 40, category: 'Smartphones', sub: 'Android', desc: "Fresh eyes. Powerful performance and a unique Glyph Interface.", features: ["Dimensity 7200 Pro","Glyph Interface","Transparent design","50MP Dual camera","Nothing OS 2.5"] },
      { name: "iPad Air 11-inch (M2)", brand: "Apple", price: 59900, stock: 18, category: 'Tablets', sub: 'iOS', desc: "Serious performance in a thin and light design with the M2 chip.", features: ["Apple M2 Chip","Liquid Retina display","Landscape Front Camera","Magic Keyboard support","Apple Pencil Pro ready"] },
      { name: "Samsung Galaxy Tab S9 FE+", brand: "Samsung", price: 36999, stock: 22, category: 'Tablets', sub: 'Android', desc: "Vibrant screen, IP68 water resistance, and S Pen in the box.", features: ["IP68 Water Resistance","Included S Pen","90Hz display","Dual speakers by AKG","Large 10090mAh battery"] },
      { name: "Lenovo Tab P11 Gen 2", brand: "Lenovo", price: 21999, stock: 30, category: 'Tablets', sub: 'Android', desc: "Stream your favorite shows on a 2K display with quad speakers.", features: ["2K 11.5\" Display","MediaTek Helio G99","Quad JBL speakers","120Hz refresh rate","Dolby Atmos support"] },
      { name: "Apple Watch Series 10", brand: "Apple", price: 46900, stock: 15, category: 'Smart Watches', sub: 'Wearables', desc: "The thinnest Apple Watch ever with the biggest display.", features: ["Always-On OLED","Sleep Apnea detection","Fast charging","Thinner titanium case","Breath app"] },
      { name: "Samsung Galaxy Watch 7", brand: "Samsung", price: 29999, stock: 18, category: 'Smart Watches', sub: 'Wearables', desc: "Power through your day with a faster processor and AI health tracking.", features: ["BioActive Sensor","Advanced Sleep Coaching","AI Health insights","Daily Readiness score","Sapphire Glass"] },
      { name: "Sony WH-1000XM5 ANC", brand: "Sony", price: 26999, stock: 22, category: 'Audio', sub: 'Over-ear', desc: "Industry-leading noise cancellation and exceptional sound.", features: ["8 Microphones","30-hour battery","Speak-to-chat","Precise voice pickup","Foldable design"] },
      { name: "Bose QuietComfort Headphones", brand: "Bose", price: 22999, stock: 15, category: 'Audio', sub: 'Over-ear', desc: "The sequel to the legendary QC45 with better noise cancelling.", features: ["Aware Mode","Adjustable EQ","Immersive audio","Quiet/Aware modes","Custom tune sound"] },
      { name: "Apple AirPods Pro (2nd Gen)", brand: "Apple", price: 24900, stock: 35, category: 'Audio', sub: 'TWS', desc: "Now with USB-C and up to 2x more Active Noise Cancellation.", features: ["H2 Apple Chip","Adaptive Audio","Loud Sound Reduction","Personalized Spatial","USB-C MagSafe case"] },
      { name: "JBL Flip 6 Waterproof", brand: "JBL", price: 9999, stock: 45, category: 'Audio', sub: 'Speakers', desc: "Bold sound for every adventure. IP67 waterproof and dustproof.", features: ["2-way speaker system","12 hours of playtime","PartyBoost compatible","Eco-friendly packaging","JBL Portable app"] },
      { name: "Sony SRS-XE300 Bluetooth", brand: "Sony", price: 14999, stock: 20, category: 'Audio', sub: 'Speakers', desc: "Line-Shape Diffuser spreads sound wider for an immersive experience.", features: ["IP67 Water/Dustproof","24h battery life","Ambient Noise Sensing","Fast charge","Echo Cancelling mic"] },
      { name: "Marshall Emberton II", brand: "Marshall", price: 17499, stock: 12, category: 'Audio', sub: 'Speakers', desc: "The heavy hitting portable speaker with Marshall's iconic design.", features: ["30+ hours playtime","360° Sound (True Stereophonic)","IP67 Resistance","Stack Mode","Rich signature sound"] },
      { name: "TP-Link AX3000 WiFi 6 Router", brand: "TP-Link", price: 5499, stock: 25, category: 'Accessories', sub: 'Networking', desc: "Stream 4K movies with blazing fast WiFi 6 speeds.", features: ["WiFi 6 technology","3.0 Gbps dual-band","Connect 2x more devices","Reduced latency","WPA3 security"] },
      { name: "Netgear Nighthawk RAX50", brand: "Netgear", price: 19999, stock: 10, category: 'Accessories', sub: 'Networking', desc: "AX5400 WiFi 6 Router for large homes and heavy streaming.", features: ["6 Stream WiFi","Powerful Triple-Core CPU","Beamforming+","Amazon Alexa support","5 Gigabit ports"] },
      { name: "Redmi Note 13 Pro+ 5G", brand: "Xiaomi", price: 30999, stock: 35, category: 'Smartphones', sub: 'Android', desc: "Curved 1.5K AMOLED and a massive 200MP OIS camera.", features: ["200MP Ultra-clear","120W HyperCharge","IP68 Protection","Dimensity 7200 Ultra","CrystalRes display"] },
      { name: "Realme 13 Pro+ 5G", brand: "Realme", price: 32999, stock: 28, category: 'Smartphones', sub: 'Android', desc: "Master of Portraits with Dual Sony Lytea sensors.", features: ["Periscope Telephoto","80W SuperVOOC","Hyperspace design","50MP Sony Main OIS","120Hz AMOLED"] },
      { name: "Sennheiser HD 450BT", brand: "Sennheiser", price: 12999, stock: 15, category: 'Audio', sub: 'Over-ear', desc: "Great wireless sound with deep dynamic bass and active noise cancellation.", features: ["30-hour battery","USB-C fast charge","Virtual Assistant button","Foldable design","Smart Control App"] },
      { name: "OnePlus Pad 2 (Snapdragon 8 Gen 3)", brand: "OnePlus", price: 39999, stock: 15, category: 'Tablets', sub: 'Android', desc: "First tablet with Snapdragon 8 Gen 3. The smooth tablet with 144Hz.", features: ["Snapdragon 8 Gen 3","7:5 screen ratio","6 High-quality speakers","67W SuperVOOC","Omnibearing sound"] },
      { name: "Garmin Venu 3 Smartwatch", brand: "Garmin", price: 44990, stock: 8, category: 'Smart Watches', sub: 'Wearables', desc: "Know the real you with advanced health and fitness features.", features: ["AMOLED Display","Built-in speaker/mic","Sleep Coach","Nap detection","Wheelchair mode"] },
      { name: "Amazfit GTR 4", brand: "Amazfit", price: 16999, stock: 20, category: 'Smart Watches', sub: 'Wearables', desc: "Vintage look, modern performance. Industry-first dual-band GPS.", features: ["14 days battery life","150+ Sports modes","Always-on AMOLED","One-tap health measure","Alexa built-in"] },
      { name: "Xiaomi Pad 6", brand: "Xiaomi", price: 26999, stock: 30, category: 'Tablets', sub: 'Android', desc: "Snapdragon 870, 144Hz display, and a sleek metal body.", features: ["Snapdragon 870","144Hz WQHD+ Display","Quad Speakers","Stylus Support","8840mAh Battery"] },
      { name: "Samsung Galaxy Buds 3 Pro", brand: "Samsung", price: 19999, stock: 25, category: 'Audio', sub: 'TWS', desc: "Galaxy AI powered sound for a perfect fit and adaptive noise control.", features: ["Blade design","Adaptive Noise Control","Hi-Fi Audio","Interpreter built-in","Siren detection"] },
      { name: "Fitbit Charge 6", brand: "Fitbit", price: 14999, stock: 22, category: 'Smart Watches', sub: 'Wearables', desc: "Google essentials on your wrist. Our most accurate heart rate yet.", features: ["Built-in GPS","Google Maps Support","EDA Stress sensor","ECG App","6 months Premium"] },
      { name: "Soundcore Anker Liberty 4 NC", brand: "Anker", price: 7999, stock: 40, category: 'Audio', sub: 'TWS', desc: "Cancel up to 98.5% of noise with Adaptive ANC 2.0.", features: ["Adaptive ANC 2.0","10h single charge","Hi-Res Wireless audio","LDAC support","6-Mics for calls"] },
      { name: "Nintendo Switch (OLED Model)", brand: "Nintendo", price: 30999, stock: 12, category: 'Gaming', sub: 'Consoles', desc: "Vibrant OLED screen to elevate your gaming experience anywhere.", features: ["7-inch OLED screen","Wide adjustable stand","Wired LAN port","64GB Internal storage","Enhanced audio"] },
      { name: "Skullcandy Crusher Evo", brand: "Skullcandy", price: 15999, stock: 15, category: 'Audio', sub: 'Over-ear', desc: "Sensory Bass that you can feel in your bones.", features: ["Adjustable Sensory Bass","40 Hour Battery","Tile Finding Tech","Personal Sound App","Foldable design"] }
    ];

    // ─── 3. LARGE ELECTRONICS (Laptops, TVs, etc - 30 items) ───
    const subLarge = [
      { name: "Apple MacBook Pro 14 M4", brand: "Apple", price: 169900, stock: 10, category: 'Laptops', sub: 'macOS', desc: "Unmatched performance with the new M4 chip. Longest battery life yet.", features: ["Apple M4 Chip","120Hz ProMotion XDR","Center Stage Camera","Thunderbolt 4","MagSafe 3"] },
      { name: "Dell XPS 13 (2024)", brand: "Dell", price: 134900, stock: 12, category: 'Laptops', sub: 'Windows', desc: "The most compact XPS ever. Stunning InfinityEdge display.", features: ["Intel Core Ultra 7","Zero-lattice keyboard","Touch function row","Corning Gorilla Glass 3","Thin titanium build"] },
      { name: "ASUS ROG Zephyrus G16", brand: "ASUS", price: 219990, stock: 6, category: 'Laptops', sub: 'Gaming', desc: "Super sleek 16-inch gaming laptop with OLED display and RTX 4080.", features: ["Intel Core Ultra 9","RTX 4080 GPU","2.5K 240Hz OLED","Slash lighting","Tri-Fan technology"] },
      { name: "HP Spectre x360 14", brand: "HP", price: 144990, stock: 8, category: 'Laptops', sub: 'Windows', desc: "Versatile 2-in-1 laptop with built-in AI and a 2.8K OLED screen.", features: ["Intel Core Ultra 7","9MP Camera with AI","haptic touchpad","Included rechargeable Tilt pen","IMAX Enhanced OLED"] },
      { name: "Samsung Odyssey Neo G9 (57\")", brand: "Samsung", price: 199990, stock: 4, category: 'Gaming', sub: 'Monitors', desc: "World's first Dual UHD monitor. Immersive 1000R curvature.", features: ["57-inch Dual UHD","Quantum Mini LED","240Hz Refresh","DisplayPort 2.1","CoreSync lighting"] },
      { name: "LG C3 55-inch OLED 4K TV", brand: "LG", price: 144990, stock: 15, category: 'Smart Home', sub: 'TVs', desc: "The gold standard of OLED TVs. a9 Gen 6 AI Processor 4K.", features: ["Infinite Contrast","Dolby Vision & Atmos","G-Sync/FreeSync support","webOS 23","Ultra-slim Gallery design"] },
      { name: "Sony BRAVIA XR A80L (65\")", brand: "Sony", price: 249990, stock: 8, category: 'Smart Home', sub: 'TVs', desc: "Pure Black OLED with the Cognitive Processor XR for natural sound and picture.", features: ["XR OLED Contrast Pro","Acoustic Surface Audio+","Google TV built-in","HDMI 2.1 for PS5","Dolby Vision"] },
      { name: "Sony PlayStation 5 Slim", brand: "Sony", price: 44990, stock: 25, category: 'Gaming', sub: 'Consoles', desc: "Experience lightning-fast loading and deeper 4K gaming immersion.", features: ["Ultra-high speed SSD","Haptic feedback","Adaptive triggers","3D Audio Tech","1TB storage"] },
      { name: "Xbox Series X", brand: "Microsoft", price: 49990, stock: 20, category: 'Gaming', sub: 'Consoles', desc: "The fastest, most powerful Xbox ever. True 4K gaming at 120 FPS.", features: ["12 Teraflops power","Quick Resume","Velocity Architecture","Dolby Vision/Atmos Gaming","Backward compatible"] },
      { name: "Lenovo Legion Slim 5", brand: "Lenovo", price: 119990, stock: 15, category: 'Laptops', sub: 'Gaming', desc: "Performance meets portability. AI-powered gaming laptop.", features: ["Ryzen 7 7840HS","RTX 4060 GPU","165Hz WQXGA screen","Legion ColdFront 5.0","RGB Backlit keyboard"] },
      { name: "Samsung 65\" QN90C Neo QLED", brand: "Samsung", price: 189990, stock: 10, category: 'Smart Home', sub: 'TVs', desc: "Brilliant 4K Neo QLED picture with Mini LED backlighting.", features: ["Quantum Matrix Tech","Neural Quantum Processor","Anti-Glare screen","Dolby Atmos + OTS+","144Hz Refresh rate"] },
      { name: "MSI Katana 15", brand: "MSI", price: 89990, stock: 18, category: 'Laptops', sub: 'Gaming', desc: "Forge your weapon. 13th Gen Intel Core and RTX 40 series.", features: ["Intel i7-13620H","RTX 4050 GPU","144Hz FHD Panel","Cooler Boost 5","4-Zone RGB keyboard"] },
      { name: "Acer Predator Helios Neo 16", brand: "Acer", price: 124990, stock: 14, category: 'Laptops', sub: 'Gaming', desc: "Cooling-focused beast with liquid metal and 5th Gen AeroBlade fans.", features: ["Intel i9-13900HX","RTX 4070 GPU","WQXGA 165Hz display","Thunderbolt 4 porta","PredatorSense app"] },
      { name: "BenQ PD2705U 4K DesignVue", brand: "BenQ", price: 42990, stock: 12, category: 'Peripherals', sub: 'Monitors', desc: "Professional designer monitor with USB-C and sRGB factory calibration.", features: ["4K UHD Resolution","USB-C with 65W PD","KVM Switch built-in","Pantone/Calman verified","Ergonomic stand"] },
      { name: "LG UltraGear 27GR95QE OLED", brand: "LG", price: 79990, stock: 7, category: 'Gaming', sub: 'Monitors', desc: "First 240Hz OLED gaming monitor for ultimate speed.", features: ["27-inch QHD OLED","240Hz / 0.03ms GTG","98.5% DCI-P3 color","DTS Headphone:X","G-Sync compatible"] },
      { name: "Xiaomi Smart TV X 55 (2024)", brand: "Xiaomi", price: 37999, stock: 30, category: 'Smart Home', sub: 'TVs', desc: "Premium 4K experience with Dolby Vision and Google TV.", features: ["4K Dolby Vision","30W Dolby Audio","PatchWall integration","Metal bezel-less design","Google Assistant"] },
      { name: "Mackbook Air 13 M3", brand: "Apple", price: 104900, stock: 25, category: 'Laptops', sub: 'macOS', desc: "Strikingly thin, fast, and light. The M3 chip makes it a portable powerhouse.", features: ["Apple M3 Chip","18-hour battery","13.6\" Liquid Retina","1080p FaceTime camera","Silent, fanless design"] },
      { name: "Dell G15 5530 Gaming", brand: "Dell", price: 74990, stock: 22, category: 'Laptops', sub: 'Gaming', desc: "Robust gaming laptop with Alienware-inspired cooling.", features: ["Intel Core i5-13450HX","RTX 3050 6GB","120Hz FHD Screen","G-key boost","Advanced Thermal Design"] },
      { name: "Sony HT-A7000 Soundbar", brand: "Sony", price: 119990, stock: 5, category: 'Audio', sub: 'Home Theater', desc: "7.1.2 channel premium soundbar with 360 Spatial Sound Mapping.", features: ["Dolby Atmos / DTS:X","Built-in up-firing speakers","S-Force PRO Front Surround","Sound Field Optimization","8K/4K 120 pass-thru"] },
      { name: "Samsung Q990C Soundbar", brand: "Samsung", price: 94990, stock: 8, category: 'Audio', sub: 'Home Theater', desc: "The ultimate 11.1.4 channel home cinema experience.", features: ["Wireless Dolby Atmos","Q-Symphony support","SpaceFit Sound Pro","Includes rear speakers","Amazon Alexa built-in"] },
      { name: "Logitech G Pro X Superlight 2", brand: "Logitech", price: 15499, stock: 15, category: 'Gaming', sub: 'Mice', desc: "The world's lightest and most preferred professional gaming mouse.", features: ["LIGHTSPEED Wireless","HERO 2 Sensor (32K DPI)","Low latency clicks","95h battery life","PTFE feet"] },
      { name: "Razer BlackWidow V4 Pro", brand: "Razer", price: 21999, stock: 10, category: 'Gaming', sub: 'Keyboards', desc: "The battlestation keyboard with localized macro keys and underglow RGB.", features: ["Green Mechanical Switches","Razer Command Dial","Magnetic leatherette wrist rest","Underglow RGB","Alumni top plate"] },
      { name: "SteelSeries Arctis Nova Pro", brand: "SteelSeries", price: 34999, stock: 7, category: 'Gaming', sub: 'Headsets', desc: "Hear the game like never before with high-fidelity drivers and active noise cancellation.", features: ["Multi-system Connect","Dual USB hubs","ANC for gaming","ClearCast Gen 2 Mic","Hot-swappable batteries"] },
      { name: "ASUS ProArt Display PA329C", brand: "ASUS", price: 124990, stock: 5, category: 'Peripherals', sub: 'Monitors', desc: "32-inch 4K HDR monitor with high color accuracy for creators.", features: ["100% Adobe RGB","Hardware Calibration","USB-C with 60W PD","VESA DisplayHDR 600","ProArt Preset/Palette"] },
      { name: "HP Victus 15 (2024)", brand: "HP", price: 64990, stock: 30, category: 'Laptops', sub: 'Gaming', desc: "Versatile gaming laptop for work and play. Clean finish.", features: ["Intel Core i5-13420H","RTX 4050 6GB","144Hz FHD Screen","Performance Blue finish","Dual speakers by B&O"] },
      { name: "Samsung Galaxy Book 4 Pro", brand: "Samsung", price: 154990, stock: 10, category: 'Laptops', sub: 'Windows', desc: "Ultra-thin, premium laptop with Dynamic AMOLED 2X touchscreen.", features: ["Intel Core Ultra 7","Dynamic AMOLED 2X","Touch screen capability","Connected Experience","Long-lasting battery"] },
      { name: "Gigabyte M28U 4K Gaming Monitor", brand: "Gigabyte", price: 49990, stock: 12, category: 'Gaming', sub: 'Monitors', desc: "First gaming monitor with built-in KVM for easier workflow and fun.", features: ["4K@144Hz SS IPS","0.5ms Response time","KVM built-in","HDMI 2.1 for consoles","RGB Fusion 2.0"] },
      { name: "Bose Smart Soundbar 900", brand: "Bose", price: 84990, stock: 10, category: 'Audio', sub: 'Home Theater', desc: "The most immersive soundbar from Bose with PhaseGuide technology.", features: ["Dolby Atmos","Up-firing dipoles","QuietPort technology","Voice4Video control","WiFi/Bluetooth streaming"] },
      { name: "Sony XR-55X90L 4K Full Array", brand: "Sony", price: 109990, stock: 15, category: 'Smart Home', sub: 'TVs', desc: "Full Array LED for deep blacks and vivid brightness. PS5 ready.", features: ["Cognitive Processor XR","Full Array LED","XR Contrast Booster 10","4K/120Hz 지원","Google TV"] },
      { name: "Logitech Z906 5.1 Surround", brand: "Logitech", price: 32999, stock: 20, category: 'Audio', sub: 'Speakers', desc: "THX-certified 5.1 system with 1000W peak power.", features: ["1000W Peak / 500W RMS","THX Certified","Dolby Digital/DTS decoding","Connect up to 6 devices","Wall-mountable satellites"] }
    ];

    // ─── 4. ADVANCED TECH (Cameras, Drones, VR - 20 items) ───
    const subAdvanced = [
      { name: "Sony Alpha a7 IV Mirrorless", brand: "Sony", price: 219990, stock: 8, category: 'Cameras', sub: 'Mirrorless', desc: "The hybrid standard. 33MP Exmor R sensor with 4K 60p video.", features: ["33MP Full-frame CMOS","759-point AF system","4K 60p 10-bit recording","S-Cinetone colors","Dual card slots"] },
      { name: "Canon EOS R6 Mark II", brand: "Canon", price: 204990, stock: 6, category: 'Cameras', sub: 'Mirrorless', desc: "Master stills and video. 40fps electronic shutter and 6K RAW.", features: ["24.2MP CMOS sensor","In-body IS up to 8 stops","Dual Pixel CMOS AF II","Internal 4K 60p","Subject detection"] },
      { name: "DJI Mini 4 Pro Fly More Combo", brand: "DJI", price: 109990, stock: 15, category: 'Cameras', sub: 'Drones', desc: "All-in-one mini drone. Lightweight under 249g with omni-directional sensing.", features: ["Under 249g 무게","Omnidirectional Sensing","ActiveTrack 360°","4K/60fps HDR Video","20km Video Transmission"] },
      { name: "DJI Avata 2 Explorer Combo", brand: "DJI", price: 119990, stock: 10, category: 'Cameras', sub: 'Drones', desc: "Thrilling FPV flight with an intuitive motion controller.", features: ["Immersive FPV experience","1/1.3-inch sensor","Super-Wide 155° FOV","RockSteady 3.0+ EIS","Propeller guard built-in"] },
      { name: "Meta Quest 3 128GB", brand: "Meta", price: 49990, stock: 20, category: 'Gaming', sub: 'VR', desc: "Mixed reality is here. Powerful performance and breakthrough resolution.", features: ["Snapdragon XR2 Gen 2","Full-color Passthrough","Infinite Display resolution","3D Spatial Audio","Touch Plus controllers"] },
      { name: "GoPro HERO13 Black", brand: "GoPro", price: 44990, stock: 35, category: 'Cameras', sub: 'Action', desc: "The ultimate action camera with new HB-Series Lens support.", features: ["5.3K60 / 4K120 Video","HyperSmooth 6.0","Enduro Battery included","GPS built-in","Waterproof to 33ft"] },
      { name: "Insta360 X4 8K 360 Camera", brand: "Insta360", price: 54990, stock: 18, category: 'Cameras', sub: 'Action', desc: "Breakthrough 8K 360° capture. Unbelievable detail and invisible selfie stick.", features: ["8K 30fps 360° Video","Invisible Selfie Stick Effect","FlowState Stabilization","Waterproof to 10m","Removable lens guards"] },
      { name: "Philips Hue Bridge & Bulb Starter Kit", brand: "Philips", price: 9999, stock: 40, category: 'Smart Home', sub: 'Lighting', desc: "Transform your home with millions of colors and smart control.", features: ["16 million colors","Voice control support","Automate lighting schedules","Sync with movies/music","Connect up to 50 bulbs"] },
      { name: "Amazon Echo Show 10 (3rd Gen)", brand: "Amazon", price: 24999, stock: 15, category: 'Smart Home', sub: 'Smart Display', desc: "Alexa with a screen that moves with you for video calls and entertainment.", features: ["10\" HD screen moves","Built-in smart home hub","13MP camera with auto-framing","Premium sound","Privacy shutter"] },
      { name: "Arlo Pro 5-2K Wireless Security", brand: "Arlo", price: 18999, stock: 12, category: 'Smart Home', sub: 'Security', desc: "Industry-leading security with 2K HDR video and color night vision.", features: ["2K HDR Video","160° Viewing angle","Integrated spotlight","Dual-band WiFi","Two-way audio"] },
      { name: "Fujifilm X-T5 Mirrorless", brand: "Fujifilm", price: 149990, stock: 5, category: 'Cameras', sub: 'Mirrorless', desc: "Photography first. 40.2MP sensor and classic dial controls.", features: ["40.2MP X-Trans CMOS","6.2K/30p 10-bit Video","7-stop IBIS","Tilt LCD screen","Film Simulation modes"] },
      { name: "Nikon Z6 III Body", brand: "Nikon", price: 214990, stock: 4, category: 'Cameras', sub: 'Mirrorless', desc: "Partially-Stacked CMOS sensor. Speed beyond imagination for its class.", features: ["24.5MP Sensor","Up to 120fps burst","6K internal RAW video","Brightest EVF in class","Dual card slots"] },
      { name: "TP-Link Tapo C210 Smart Cam", brand: "TP-Link", price: 2499, stock: 100, category: 'Smart Home', sub: 'Security', desc: "360° Pan/Tilt coverage for your baby or pet monitoring.", features: ["2K Ultra HD","Night Vision","Motion Detection","Two-Way Audio","Privacy Mode"] },
      { name: "August Wi-Fi Smart Lock (4th Gen)", brand: "August", price: 17999, stock: 10, category: 'Smart Home', sub: 'Security', desc: "Upgrade your existing deadbolt without changing the outside lock.", features: ["WIFI Built-in","Auto-Unlock feature","Biometric verification","Guest access keys","Alexa/Google/Siri compatible"] },
      { name: "Godox V1 Flash for Sony", brand: "Godox", price: 19999, stock: 20, category: 'Cameras', sub: 'Lighting', desc: "Round head flash for natural and soft light distribution.", features: ["76Ws power","Li-ion Battery (480 flashes)","Recycle time 1.5s","Wireless Control","Magnetic accessory port"] },
      { name: "Ring Video Doorbell 4", brand: "Ring", price: 15999, stock: 15, category: 'Smart Home', sub: 'Security', desc: "Enhanced security with color pre-roll video and real-time alerts.", features: ["1080p HD Video","Color Pre-Roll","Quick Replies","Adjustable Motion Zones","Dual-band WiFi"] },
      { name: "Dyson V15 Detect Extra", brand: "Dyson", price: 65900, stock: 10, category: 'Smart Home', sub: 'Appliances', desc: "The most powerful, intelligent cordless vacuum with laser illumination.", features: ["Laser detects micro dust","HEPA filtration","60 mins runtime","LCD screen reports","Tangle-comb technology"] },
      { name: "Xiaomi Smart Air Purifier 4", brand: "Xiaomi", price: 14999, stock: 25, category: 'Smart Home', sub: 'Appliances', desc: "Breathe clean air. CADR of up to 400m³/h for large rooms.", features: ["Triple-layer filtration","OLED touch display","Smart APP control","Negative Ionization","PM2.5 Sensor"] },
      { name: "Yale Assure Lock 2", brand: "Yale", price: 14999, stock: 20, category: 'Smart Home', sub: 'Security', desc: "The Bluetooth-enabled keyless lock with sleek touchscreen design.", features: ["Auto-unlock feature","Share digital keys","Keyless touchscreen","Compact design","Apple HomeKit compatible"] },
      { name: "DJI Osmo Pocket 3 Creator Combo", brand: "DJI", price: 64990, stock: 5, category: 'Cameras', sub: 'Vlogging', desc: "Powerful 1-inch CMOS pocket gimbal for steady cinematic shots.", features: ["1-inch CMOS Sensor","4K/120fps capture","Rotatable 2\" Screen","Mechanical Stabilization","ActiveTrack 6.0"] }
    ];

    const generateBatch = (list, typeTags = []) => {
      list.forEach(p => {
        const catId = catMap[p.category];
        if (!catId) return;

        products.push({
          name: p.name,
          slug: makeSlug(p.name),
          brand: p.brand,
          category: catId,
          price: p.price,
          salePrice: Math.round(p.price * 0.9), // Default 10% discount for seed
          stock: p.stock,
          sku: p.name.split(' ').map(w => w[0]).join('').toUpperCase() + Math.floor(Math.random()*1000),
          description: p.desc,
          shortDescription: p.desc.split('.')[0] + '.',
          features: p.features,
          images: [{ url: `https://placehold.co/600x600/1d8dac/white?text=${encodeURIComponent(p.name)}`, alt: p.name, isPrimary: true }],
          ratings: { average: (Math.random() * 1.5 + 3.5).toFixed(1), count: Math.floor(Math.random() * 4900 + 10) },
          tags: [p.brand.toLowerCase(), p.category.toLowerCase(), p.sub.toLowerCase(), ...typeTags],
          isActive: p.stock > 0,
          isFeatured: typeTags.includes('trending') || Math.random() > 0.8,
          isNewArrival: typeTags.includes('new-arrival') || Math.random() > 0.7,
        });
      });
    };

    generateBatch(subAccessories);
    generateBatch(subMedium);
    generateBatch(subLarge);
    generateBatch(subAdvanced);

    // ─── BONUS: TRENDING, BEST SELLERS, NEW ARRIVALS ───
    const bonusBatch = [];
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    // 10 Trending
    for(let i=0; i<10; i++) products[i].isFeatured = true;
    for(let i=10; i<15; i++) products[i].tags.push('best-seller');
    for(let i=15; i<20; i++) products[i].isNewArrival = true;

    // Drop and Re-insert
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Successfully seeded ${products.length} products!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedInventory();
