// ---- Photo print sizes (from LOVORA portfolio) ----
export const PRINT_SIZES = [
  { id: '4x4', label: '4 × 4"', format: 'Square', ratio: 1, price: 29 },
  { id: '5x5', label: '5 × 5"', format: 'Square', ratio: 1, price: 39 },
  { id: '6x4', label: '6 × 4"', format: 'Landscape', ratio: 6 / 4, price: 25 },
  { id: '8x6', label: '8 × 6"', format: 'Landscape', ratio: 8 / 6, price: 59 },
  { id: 'A4', label: 'A4', format: 'Large format', ratio: 297 / 210, price: 149 },
]

export const FINISHES = [
  { id: 'glossy', label: 'Glossy', extra: 0 },
  { id: 'matte', label: 'Matte', extra: 0 },
  { id: 'polaroid', label: 'Polaroid border', extra: 5 },
]

export const SHIPPING_FEE = 49
export const FREE_SHIPPING_ABOVE = 499

export const getSize = (id) => PRINT_SIZES.find((s) => s.id === id) || PRINT_SIZES[0]
export const getFinish = (id) => FINISHES.find((f) => f.id === id) || FINISHES[0]
export const printUnitPrice = (sizeId, finishId) => getSize(sizeId).price + getFinish(finishId).extra

// ---- Gift catalogue (FNP-style) ----
export const CATEGORIES = [
  { id: 'photo-prints', name: 'Photo Prints', art: 'polaroid', tint: '#F9D7DE' },
  { id: 'personalised', name: 'Personalised', art: 'mug', tint: '#FBE3D3' },
  { id: 'frames', name: 'Photo Frames', art: 'frame', tint: '#F3E1EA' },
  { id: 'flowers', name: 'Flowers', art: 'bouquet', tint: '#F8D3D3' },
  { id: 'cakes', name: 'Cakes', art: 'cake', tint: '#F6E4D6' },
  { id: 'hampers', name: 'Hampers', art: 'hamper', tint: '#EADFF0' },
]

export const OCCASIONS = [
  { id: 'anniversary', name: 'Anniversary', note: 'Celebrate your story' },
  { id: 'birthday', name: 'Birthday', note: 'Make their day' },
  { id: 'valentine', name: "Valentine's", note: 'Say it with love' },
  { id: 'long-distance', name: 'Long Distance', note: 'Closer, in print' },
]

export const PRODUCTS = [
  { id: 'p1', name: 'Our Story Polaroid Set (12 prints)', cat: 'photo-prints', price: 349, mrp: 449, art: 'polaroid', rating: 4.8, reviews: 1240, personalise: 'multi', tag: 'Bestseller', occasion: ['anniversary', 'valentine', 'long-distance'] },
  { id: 'p2', name: 'Love Memory Mini Album', cat: 'photo-prints', price: 599, mrp: 799, art: 'album', rating: 4.7, reviews: 418, personalise: 'multi', occasion: ['anniversary', 'birthday'] },
  { id: 'p3', name: 'Personalised Couple Mug', cat: 'personalised', price: 399, mrp: 499, art: 'mug', rating: 4.6, reviews: 2210, personalise: 'single', tag: 'Trending', occasion: ['birthday', 'valentine'] },
  { id: 'p4', name: 'Heart Photo Cushion', cat: 'personalised', price: 549, mrp: 699, art: 'cushion', rating: 4.7, reviews: 980, personalise: 'single', occasion: ['valentine', 'anniversary'] },
  { id: 'p5', name: 'Personalised LED Night Lamp', cat: 'personalised', price: 899, mrp: 1199, art: 'lamp', rating: 4.8, reviews: 652, personalise: 'single', tag: 'New', occasion: ['anniversary', 'birthday', 'long-distance'] },
  { id: 'p6', name: 'Rose Gold Photo Frame', cat: 'frames', price: 649, mrp: 849, art: 'frame', rating: 4.6, reviews: 731, personalise: 'single', occasion: ['anniversary', 'birthday'] },
  { id: 'p7', name: 'Collage Wall Frame (6 photos)', cat: 'frames', price: 1299, mrp: 1599, art: 'collage', rating: 4.9, reviews: 345, personalise: 'multi', tag: 'Premium', occasion: ['anniversary', 'long-distance'] },
  { id: 'p8', name: '12 Red Roses Bouquet', cat: 'flowers', price: 549, mrp: 649, art: 'bouquet', rating: 4.7, reviews: 3120, occasion: ['valentine', 'anniversary', 'birthday'] },
  { id: 'p9', name: 'Pink Lilies & Roses Basket', cat: 'flowers', price: 849, mrp: 999, art: 'basket', rating: 4.6, reviews: 802, occasion: ['birthday', 'anniversary'] },
  { id: 'p10', name: 'Red Velvet Heart Cake (500g)', cat: 'cakes', price: 699, mrp: 799, art: 'cake', rating: 4.8, reviews: 1870, tag: 'Bestseller', occasion: ['birthday', 'anniversary', 'valentine'] },
  { id: 'p11', name: 'Photo Cake – Chocolate (1kg)', cat: 'cakes', price: 1149, mrp: 1349, art: 'photocake', rating: 4.5, reviews: 690, personalise: 'single', occasion: ['birthday', 'anniversary'] },
  { id: 'p12', name: 'Forever Yours Love Hamper', cat: 'hampers', price: 1599, mrp: 1999, art: 'hamper', rating: 4.8, reviews: 512, personalise: 'multi', tag: 'Gift Set', occasion: ['anniversary', 'valentine', 'long-distance'] },
]

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id)
export const getCategory = (id) => CATEGORIES.find((c) => c.id === id)

export const ORDER_STATUSES = ['Paid', 'Printing', 'Packed', 'Shipped', 'Delivered']
export const COURIERS = ['Delhivery', 'Blue Dart', 'DTDC', 'Ekart', 'India Post']

export const TESTIMONIALS = [
  { name: 'Ananya & Rohit', city: 'Pune', text: 'We printed 40 photos from our trips — the colours are gorgeous and the packaging felt like opening a love letter.' },
  { name: 'Simran K.', city: 'Delhi', text: 'Sent a polaroid set to my boyfriend in Bangalore for our anniversary. He literally called me crying. 10/10.' },
  { name: 'Arjun M.', city: 'Jaipur', text: 'Super easy to crop and choose sizes on my phone. Delivered in 3 days with tracking the whole way.' },
]

export const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN')
