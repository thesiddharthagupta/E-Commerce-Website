require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/techmart';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB:', MONGO_URI);

  const db = mongoose.connection.db;

  // Drop all collections cleanly
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.collection(col.name).drop().catch(() => {});
  }
  console.log('✅ Cleared database');

  // Hash passwords
  const adminPwd = await bcrypt.hash('admin123', 12);
  const custPwd  = await bcrypt.hash('customer123', 12);

  // Users
  const usersCol = db.collection('users');
  const adminResult = await usersCol.insertOne({
    name: 'TechMart Admin', email: 'admin@techmart.com',
    password: adminPwd, role: 'admin', isActive: true,
    phone: '+977-9800000000', wishlist: [], createdAt: new Date(), updatedAt: new Date()
  });
  await usersCol.insertOne({
    name: 'Test Customer', email: 'customer@techmart.com',
    password: custPwd, role: 'customer', isActive: true,
    phone: '+977-9800000001', wishlist: [], createdAt: new Date(), updatedAt: new Date()
  });
  console.log('✅ Users created');

  // Categories
  const catsCol = db.collection('categories');
  const catDocs = [
    { name:'Laptops',      slug:'laptops',      icon:'💻', sortOrder:1, isActive:true },
    { name:'Smartphones',  slug:'smartphones',  icon:'📱', sortOrder:2, isActive:true },
    { name:'Tablets',      slug:'tablets',      icon:'📟', sortOrder:3, isActive:true },
    { name:'Audio',        slug:'audio',        icon:'🎧', sortOrder:4, isActive:true },
    { name:'Gaming',       slug:'gaming',       icon:'🎮', sortOrder:5, isActive:true },
    { name:'Accessories',  slug:'accessories',  icon:'🔌', sortOrder:6, isActive:true },
    { name:'Cameras',      slug:'cameras',      icon:'📷', sortOrder:7, isActive:true },
    { name:'Smart Home',   slug:'smart-home',   icon:'🏠', sortOrder:8, isActive:true },
    { name:'Peripherals',  slug:'peripherals',  icon:'🖱', sortOrder:9, isActive:true },
    { name:'Smart Watches',slug:'smart-watches',icon:'⌚', sortOrder:10,isActive:true },
  ];
  const catRes = await catsCol.insertMany(catDocs);
  const catIds = catRes.insertedIds;
  console.log('✅ Categories created');

  // Products
  const prodsCol = db.collection('products');
  const now = new Date();
  const prods = [
    { name:"MacBook Pro 14\" M3 Pro", slug:'macbook-pro-14-m3-pro', brand:'Apple', categoryId:catIds[0],
      shortDescription:'M3 Pro chip · 18GB RAM · 512GB SSD · Liquid Retina XDR',
      description:'The MacBook Pro 14-inch with M3 Pro chip. Built for professionals who demand peak performance. Features Liquid Retina XDR display, up to 18 hours battery, and the most advanced Apple chip.',
      price:329000, salePrice:299000, stock:12, sku:'MBP14M3PRO', isFeatured:true, isNew:true, isActive:true,
      images:[{url:'https://placehold.co/600x450/1d8dac/white?text=MacBook+Pro+M3',alt:'MacBook Pro M3',isPrimary:true}],
      features:['M3 Pro chip 11-core CPU','18GB unified memory','512GB SSD','Liquid Retina XDR display','Up to 18h battery','MagSafe 3 charging','Three Thunderbolt 4 ports'],
      specifications:[{key:'Processor',value:'Apple M3 Pro'},{key:'RAM',value:'18GB Unified'},{key:'Storage',value:'512GB SSD'},{key:'Display',value:'14.2" Liquid Retina XDR'},{key:'Battery',value:'Up to 18 hours'},{key:'Weight',value:'1.61 kg'},{key:'OS',value:'macOS Sonoma'}],
      tags:['laptop','apple','macbook','m3'], warranty:'1 Year Apple Warranty', ratings:{average:4.8,count:24}, views:340, soldCount:18, createdAt:now },
    { name:"Dell XPS 15 OLED", slug:'dell-xps-15-oled', brand:'Dell', categoryId:catIds[0],
      shortDescription:'Intel i9 · RTX 4060 · 32GB · 15.6" 3.5K OLED',
      description:'The Dell XPS 15 OLED is the ultimate creator laptop. A stunning 3.5K OLED display, Intel Core i9 processor, and NVIDIA RTX 4060 give creators the power they need.',
      price:299000, stock:8, sku:'DXPS15OLED', isFeatured:true, isActive:true,
      images:[{url:'https://placehold.co/600x450/0f5f7a/white?text=Dell+XPS+15+OLED',alt:'Dell XPS 15',isPrimary:true}],
      features:['Intel Core i9-13900H','NVIDIA RTX 4060 8GB','32GB DDR5 RAM','3.5K OLED touchscreen 60Hz','1TB NVMe SSD','Thunderbolt 4 x2','Killer WiFi 6E'],
      specifications:[{key:'Processor',value:'Intel Core i9-13900H'},{key:'GPU',value:'RTX 4060 8GB'},{key:'RAM',value:'32GB DDR5'},{key:'Display',value:'15.6" 3.5K OLED'},{key:'Storage',value:'1TB NVMe'}],
      tags:['laptop','dell','xps','oled'], warranty:'1 Year Dell Warranty', ratings:{average:4.6,count:18}, views:210, soldCount:11, createdAt:now },
    { name:"ASUS ROG Zephyrus G14 2024", slug:'asus-rog-zephyrus-g14-2024', brand:'ASUS', categoryId:catIds[0],
      shortDescription:'Ryzen 9 8945HS · RTX 4070 · 32GB · 14" QHD+ 165Hz',
      description:'The ROG Zephyrus G14 2024 packs the most powerful AMD processor and NVIDIA GPU into a sleek 14-inch chassis. Perfect for gaming and content creation.',
      price:279000, salePrice:249000, stock:6, sku:'ROGG14-2024', isFeatured:true, isNew:true, isActive:true,
      images:[{url:'https://placehold.co/600x450/1d2d44/white?text=ROG+Zephyrus+G14',alt:'ROG Zephyrus G14',isPrimary:true}],
      features:['AMD Ryzen 9 8945HS','NVIDIA RTX 4070 8GB','32GB LPDDR5X','QHD+ 165Hz ROG Nebula Display','1TB PCIe 4.0 SSD','AniMe Matrix LED lid'],
      specifications:[{key:'CPU',value:'AMD Ryzen 9 8945HS'},{key:'GPU',value:'RTX 4070 8GB'},{key:'RAM',value:'32GB LPDDR5X'},{key:'Display',value:'14" QHD+ 165Hz'}],
      tags:['gaming','asus','rog','laptop'], warranty:'2 Year ASUS Warranty', ratings:{average:4.7,count:31}, views:450, soldCount:22, createdAt:now },
    { name:"iPhone 15 Pro Max 256GB", slug:'iphone-15-pro-max-256gb', brand:'Apple', categoryId:catIds[1],
      shortDescription:'A17 Pro · Titanium · 48MP 5x Zoom · USB 3 · Always-On',
      description:'iPhone 15 Pro Max. Forged in titanium. A17 Pro chip drives incredible gaming performance and a 5x telephoto camera for studio-quality portraits from 120mm.',
      price:199000, salePrice:185000, stock:25, sku:'IP15PROMAX256', isFeatured:true, isNew:true, isActive:true,
      images:[{url:'https://placehold.co/600x450/1c1c1e/white?text=iPhone+15+Pro+Max',alt:'iPhone 15 Pro Max',isPrimary:true}],
      features:['A17 Pro chip 6-core GPU','Titanium frame','48MP Fusion + 5x telephoto','USB 3 data transfer','Action Button','ProMotion 120Hz OLED'],
      specifications:[{key:'Chip',value:'A17 Pro'},{key:'Display',value:'6.7" Super Retina XDR'},{key:'Camera',value:'48MP + 12MP + 12MP'},{key:'Storage',value:'256GB'},{key:'Battery',value:'4422mAh'}],
      tags:['iphone','apple','smartphone'], warranty:'1 Year Apple Warranty', ratings:{average:4.9,count:87}, views:820, soldCount:65, createdAt:now },
    { name:"Samsung Galaxy S24 Ultra 256GB", slug:'samsung-galaxy-s24-ultra-256', brand:'Samsung', categoryId:catIds[1],
      shortDescription:'Snapdragon 8 Gen 3 · 200MP · S Pen · 5000mAh',
      description:'Galaxy AI is here. The Galaxy S24 Ultra redefines what a smartphone can do. Built-in S Pen, 200MP camera system, and titanium frame make it the ultimate Android flagship.',
      price:175000, stock:18, sku:'SGS24U256', isFeatured:true, isActive:true,
      images:[{url:'https://placehold.co/600x450/2d3748/white?text=Galaxy+S24+Ultra',alt:'Galaxy S24 Ultra',isPrimary:true}],
      features:['Snapdragon 8 Gen 3 for Galaxy','200MP Quad Camera','Built-in S Pen','5000mAh + 45W fast charge','Titanium frame','Galaxy AI features','7 years OS updates'],
      specifications:[{key:'Processor',value:'Snapdragon 8 Gen 3'},{key:'RAM',value:'12GB'},{key:'Display',value:'6.8" QHD+ AMOLED 120Hz'},{key:'Battery',value:'5000mAh'}],
      tags:['samsung','android','smartphone'], warranty:'1 Year Samsung Warranty', ratings:{average:4.7,count:56}, views:610, soldCount:43, createdAt:now },
    { name:"Sony WH-1000XM5 Wireless", slug:'sony-wh-1000xm5', brand:'Sony', categoryId:catIds[3],
      shortDescription:'Industry-leading ANC · 30hr battery · Hi-Res Audio',
      description:'The WH-1000XM5 headphones feature eight microphones and two processors for industry-leading noise cancellation, 30-hour battery, and exceptional sound quality.',
      price:45000, salePrice:36000, stock:40, sku:'SNYWH1000XM5', isFeatured:true, isActive:true,
      images:[{url:'https://placehold.co/600x450/1a1a2e/white?text=Sony+WH-1000XM5',alt:'Sony WH-1000XM5',isPrimary:true}],
      features:['8-mic industry-leading ANC','30-hour battery','Multipoint Bluetooth 5.2','Hi-Res Audio certified','Speak-to-Chat auto pause','Quick charge 3min=3hrs'],
      specifications:[{key:'Type',value:'Over-ear wireless'},{key:'Battery',value:'30 hours'},{key:'Connectivity',value:'Bluetooth 5.2 + 3.5mm'},{key:'ANC',value:'Yes, 8-mic system'},{key:'Weight',value:'250g'}],
      tags:['headphones','sony','anc','audio'], warranty:'1 Year Sony Warranty', ratings:{average:4.8,count:112}, views:380, soldCount:89, createdAt:now },
    { name:"iPad Pro 13\" M4 WiFi 256GB", slug:'ipad-pro-13-m4-wifi-256gb', brand:'Apple', categoryId:catIds[2],
      shortDescription:'M4 chip · 13" Ultra Retina XDR · Nano-texture · OLED',
      description:'The iPad Pro 13-inch with M4 chip is the most powerful iPad ever. Featuring the world\'s most advanced display, Ultra Retina XDR tandem OLED, it\'s impossibly thin and powerful.',
      price:215000, stock:10, sku:'IPDPRO13M4', isNew:true, isActive:true,
      images:[{url:'https://placehold.co/600x450/f0f0f5/1d8dac?text=iPad+Pro+M4',alt:'iPad Pro M4',isPrimary:true}],
      features:['Apple M4 chip','Ultra Retina XDR tandem OLED','Apple Pencil Pro support','Landscape front camera','Thunderbolt / USB 4','WiFi 6E + Bluetooth 5.3'],
      specifications:[{key:'Chip',value:'Apple M4'},{key:'Display',value:'13" Ultra Retina XDR OLED'},{key:'Storage',value:'256GB'},{key:'Connectivity',value:'WiFi 6E'}],
      tags:['ipad','apple','tablet'], warranty:'1 Year Apple Warranty', ratings:{average:4.8,count:43}, views:290, soldCount:19, createdAt:now },
    { name:"ASUS ROG Ally X Gaming Handheld", slug:'asus-rog-ally-x', brand:'ASUS', categoryId:catIds[4],
      shortDescription:'Z1 Extreme · 1080p 120Hz · 24GB RAM · 1TB SSD',
      description:'The ROG Ally X is the ultimate Windows gaming handheld. Powered by AMD Ryzen Z1 Extreme, with a bright 1080p 120Hz display and the biggest battery in any gaming handheld.',
      price:149000, salePrice:135000, stock:8, sku:'ROGALLYX', isNew:true, isActive:true,
      images:[{url:'https://placehold.co/600x450/1a1a2e/white?text=ROG+Ally+X',alt:'ROG Ally X',isPrimary:true}],
      features:['AMD Ryzen Z1 Extreme','24GB LPDDR5X RAM','1TB PCIe 4.0 SSD','7" FHD 120Hz display','80Wh battery','65W USB-C charging','Windows 11 + Armory Crate'],
      specifications:[{key:'CPU/GPU',value:'AMD Ryzen Z1 Extreme'},{key:'RAM',value:'24GB LPDDR5X'},{key:'Display',value:'7" 1080p 120Hz'},{key:'Battery',value:'80Wh'}],
      tags:['gaming','asus','rog','handheld'], warranty:'2 Year ASUS Warranty', ratings:{average:4.6,count:28}, views:510, soldCount:14, createdAt:now },
    { name:"Anker 778 USB-C Docking Station", slug:'anker-778-docking-station', brand:'Anker', categoryId:catIds[5],
      shortDescription:'12-in-1 · Dual 4K · 85W PD · Ethernet · USB Hub',
      description:'The Anker 778 Thunderbolt 4 docking station gives you 12 ports including dual 4K HDMI, 85W Power Delivery, and a built-in 2.5Gbps Ethernet port.',
      price:22000, salePrice:18500, stock:60, sku:'ANKR778DOCK', isActive:true,
      images:[{url:'https://placehold.co/600x450/2d3748/white?text=Anker+778+Dock',alt:'Anker 778',isPrimary:true}],
      features:['Thunderbolt 4 connection','Dual 4K@60Hz display','85W Power Delivery','2.5Gbps Ethernet','5x USB-A 3.1 ports','SD + MicroSD reader'],
      specifications:[{key:'Ports',value:'12'},{key:'Video',value:'Dual 4K@60Hz HDMI'},{key:'Power',value:'85W PD'},{key:'Network',value:'2.5Gbps Ethernet'}],
      tags:['dock','anker','accessories','usb-c'], warranty:'18 Month Warranty', ratings:{average:4.5,count:78}, views:190, soldCount:55, createdAt:now },
    { name:"Apple Watch Ultra 2", slug:'apple-watch-ultra-2', brand:'Apple', categoryId:catIds[9],
      shortDescription:'49mm · Alpine Loop · GPS+Cellular · Action Button · Dive',
      description:'Apple Watch Ultra 2 is the most rugged and capable Apple Watch ever. Built for athletes, adventurers, and divers who demand the most from their gear.',
      price:115000, stock:15, sku:'AWULTRA2', isFeatured:true, isNew:true, isActive:true,
      images:[{url:'https://placehold.co/600x450/ff9500/white?text=Apple+Watch+Ultra+2',alt:'Apple Watch Ultra 2',isPrimary:true}],
      features:['49mm titanium case','S9 SiP chip','2000 nit display','60hr battery + Low Power 36hr','Dive to 100m (EN 13319)','Action Button','Precision GPS'],
      specifications:[{key:'Case',value:'49mm Titanium'},{key:'Display',value:'2000 nit LTPO OLED'},{key:'Battery',value:'36-60 hours'},{key:'Water',value:'100m EN 13319'}],
      tags:['apple','watch','smartwatch','ultra'], warranty:'1 Year Apple Warranty', ratings:{average:4.9,count:34}, views:420, soldCount:21, createdAt:now },
    { name:"Samsung 49\" Odyssey G9 OLED", slug:'samsung-49-odyssey-g9-oled', brand:'Samsung', categoryId:catIds[4],
      shortDescription:'49" Dual QHD · 240Hz · 0.03ms · OLED · Curved',
      description:'The Odyssey OLED G9 gaming monitor delivers an immersive super ultra-wide gaming experience with a 49-inch dual QHD OLED panel, 240Hz refresh rate, and 0.03ms response time.',
      price:399000, salePrice:349000, stock:4, sku:'SAMG9OLED49', isNew:true, isActive:true,
      images:[{url:'https://placehold.co/600x450/0d0d0d/00d4ff?text=Odyssey+G9+OLED',alt:'Odyssey G9 OLED',isPrimary:true}],
      features:['49" DQHD OLED (5120x1440)','240Hz refresh rate','0.03ms response time','1000R curved panel','HDR True Black 400','Smart TV features built-in'],
      specifications:[{key:'Size',value:'49 inch curved'},{key:'Resolution',value:'5120×1440 DQHD'},{key:'Refresh',value:'240Hz'},{key:'Panel',value:'OLED'}],
      tags:['gaming','samsung','monitor','oled'], warranty:'2 Year Samsung Warranty', ratings:{average:4.7,count:19}, views:380, soldCount:7, createdAt:now },
  ];

  // Insert products using raw collection
  const prodsResult = await prodsCol.insertMany(prods.map(p => ({
    ...p, category: p.categoryId, createdAt:now, updatedAt:now
  })));
  console.log('✅ Products created:', prods.length);

  // Settings
  const settingsCol = db.collection('settings');
  await settingsCol.insertMany([
    { key:'site_name',           value:'TechMart Nepal',                  group:'general' },
    { key:'site_tagline',        value:"Nepal's Biggest Electronics Store", group:'general' },
    { key:'site_logo',           value:'',                                  group:'general' },
    { key:'site_favicon',        value:'',                                  group:'general' },
    { key:'hero_title',          value:'Next-Gen Tech\nStarting Here',      group:'homepage' },
    { key:'hero_subtitle',       value:'Nepal\'s largest selection of genuine laptops, phones & accessories', group:'homepage' },
    { key:'hero_btn_text',       value:'Shop Now',                          group:'homepage' },
    { key:'show_featured',       value:true,                                group:'homepage' },
    { key:'show_new_arrivals',   value:true,                                group:'homepage' },
    { key:'show_categories',     value:true,                                group:'homepage' },
    { key:'show_banner',         value:true,                                group:'homepage' },
    { key:'banner1_title',       value:'Premium Laptops',                   group:'homepage' },
    { key:'banner1_subtitle',    value:'MacBook, Dell XPS, ASUS ROG & more', group:'homepage' },
    { key:'banner1_link',        value:'/shop?category=laptops',            group:'homepage' },
    { key:'banner2_title',       value:'Gaming Gear',                       group:'homepage' },
    { key:'banner2_subtitle',    value:'Consoles, monitors, peripherals',   group:'homepage' },
    { key:'banner2_link',        value:'/shop?category=gaming',             group:'homepage' },
    { key:'contact_email',       value:'info@techmart.com.np',              group:'contact' },
    { key:'contact_phone',       value:'+977-01-4567890',                   group:'contact' },
    { key:'contact_phone2',      value:'+977-9800000000',                   group:'contact' },
    { key:'contact_address',     value:'New Road, Kathmandu 44600, Nepal',  group:'contact' },
    { key:'contact_hours',       value:'Sun–Fri 10am–7pm, Sat 11am–5pm',   group:'contact' },
    { key:'currency',            value:'Rs.',                               group:'shop' },
    { key:'free_shipping_above', value:5000,                                group:'shop' },
    { key:'shipping_fee',        value:150,                                 group:'shop' },
    { key:'tax_rate',            value:0,                                   group:'shop' },
    { key:'facebook',            value:'https://facebook.com/techmart',     group:'social' },
    { key:'instagram',           value:'https://instagram.com/techmart',    group:'social' },
    { key:'youtube',             value:'',                                  group:'social' },
    { key:'tiktok',              value:'',                                  group:'social' },
    { key:'footer_text',         value:'© 2024 TechMart Nepal Pvt. Ltd. All rights reserved.', group:'general' },
  ]);
  console.log('✅ Settings created');

  // Notices
  await db.collection('notices').insertMany([
    { title:'🚚 Free Shipping on orders above Rs. 5,000!', content:'Free delivery within Kathmandu valley.', type:'promo', showOnHomepage:true, isActive:true, createdAt:now },
    { title:'📞 Call us: +977-01-4567890', content:'Mon-Fri 10am-7pm', type:'info', showOnHomepage:true, isActive:true, createdAt:now },
  ]);

  // Pages
  await db.collection('pages').insertMany([
    { title:'About Us', slug:'about', content:'<h2>About TechMart Nepal</h2><p>TechMart is Nepal\'s leading electronics retailer since 2014.</p>', showInFooter:true, showInNav:true, isPublished:true },
    { title:'Privacy Policy', slug:'privacy', content:'<h2>Privacy Policy</h2><p>We respect your privacy and protect your data.</p>', showInFooter:true, isPublished:true },
    { title:'Return Policy', slug:'returns', content:'<h2>Return Policy</h2><p>7-day easy returns on all products.</p>', showInFooter:true, isPublished:true },
    { title:'Terms & Conditions', slug:'terms', content:'<h2>Terms</h2><p>By using TechMart you agree to these terms.</p>', showInFooter:true, isPublished:true },
  ]);

  console.log('\n🎉 Seed complete!');
  console.log('   Admin:    admin@techmart.com     / admin123');
  console.log('   Customer: customer@techmart.com  / customer123\n');
  process.exit(0);
};

seed().catch(err => { console.error('❌ Seed error:', err.message); process.exit(1); });
