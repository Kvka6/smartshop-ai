/**
 * Mock product data used as fallback when no API keys are configured.
 * Simulates realistic results from multiple platforms.
 */

const mockProducts = {
  shirt: [
    { id: 'm1', title: "Allen Solly Men's Regular Fit Formal Shirt - XL", price: '₹799', priceRaw: 799, originalPrice: '₹1,499', originalPriceRaw: 1499, discount: 47, image: 'https://m.media-amazon.com/images/I/71nIE7FCUYL._AC_UY879_.jpg', link: 'https://www.amazon.in/s?k=allen+solly+formal+shirt+XL+men', source: 'Amazon', rating: 4.2, reviews: 3421, delivery: 'Free delivery' },
    { id: 'm2', title: "Van Heusen Men's Slim Fit Shirt XL - White", price: '₹1,049', priceRaw: 1049, originalPrice: '₹1,999', originalPriceRaw: 1999, discount: 48, image: 'https://assets.myntrassets.com/h_1440,q_90,w_1080/v1/assets/images/2023/9/22/bcb5c67f-1d1b-4e64-bf47-df7b7ebe7a2b1695386040126-Van-Heusen-Men-Shirts-5031695386039618-1.jpg', link: 'https://www.myntra.com/shirts/van+heusen', source: 'Myntra', rating: 4.4, reviews: 5892, delivery: 'Free delivery above ₹499' },
    { id: 'm3', title: "Peter England Men's Regular Fit Casual Shirt - XL", price: '₹629', priceRaw: 629, originalPrice: '₹1,299', originalPriceRaw: 1299, discount: 52, image: 'https://assets.myntrassets.com/h_1440,q_90,w_1080/v1/assets/images/2312843/2017/2/20/11487579617043-Peter-England-Men-Navy-Blue--Maroon-Regular-Fit-Striped-Ca-4.jpg', link: 'https://www.flipkart.com/search?q=peter+england+shirt+xl', source: 'Flipkart', rating: 4.1, reviews: 2104, delivery: '₹40 delivery' },
    { id: 'm4', title: "Louis Philippe Men's Slim Fit Oxford Shirt XL", price: '₹1,349', priceRaw: 1349, originalPrice: '₹2,499', originalPriceRaw: 2499, discount: 46, image: 'https://assets.myntrassets.com/h_1440,q_90,w_1080/v1/assets/images/2023/8/10/e5d2bb83-45f6-4b9d-b2ab-2d7cd14d88e11691651188456-Louis-Philippe-Men-Shirts-4291691651187972-1.jpg', link: 'https://www.myntra.com/shirts/louis+philippe', source: 'Myntra', rating: 4.5, reviews: 7820, delivery: 'Free delivery above ₹499' },
    { id: 'm5', title: "Wrogn Men's Slim Fit Printed Shirt - XL", price: '₹549', priceRaw: 549, originalPrice: '₹1,299', originalPriceRaw: 1299, discount: 58, image: 'https://assets.myntrassets.com/h_1440,q_90,w_1080/v1/assets/images/2023/4/4/d0a6f9e7-ea7c-4ad5-aaee-04cc74d7c9671680605419408-WROGN-Men-Shirts-6791680605418697-1.jpg', link: 'https://www.myntra.com/shirts/wrogn', source: 'Myntra', rating: 4.0, reviews: 1356, delivery: 'Free delivery above ₹499' },
    { id: 'm6', title: "Arrow Men's Regular Fit Formal Shirt XL - Blue", price: '₹1,199', priceRaw: 1199, originalPrice: '₹2,199', originalPriceRaw: 2199, discount: 45, image: 'https://m.media-amazon.com/images/I/61+XJdQ4J1L._AC_UY879_.jpg', link: 'https://www.amazon.in/s?k=arrow+formal+shirt+xl', source: 'Amazon', rating: 4.3, reviews: 4501, delivery: 'Free delivery' },
  ],
  pant: [
    { id: 'p1', title: "Levi's 511 Slim Fit Jeans - Men's 36W - Dark Indigo", price: '₹2,099', priceRaw: 2099, originalPrice: '₹3,999', originalPriceRaw: 3999, discount: 48, image: 'https://m.media-amazon.com/images/I/71wZMHkwLFL._AC_UX679_.jpg', link: 'https://www.amazon.in/s?k=levis+511+jeans+36', source: 'Amazon', rating: 4.4, reviews: 12045, delivery: 'Free delivery' },
    { id: 'p2', title: "Peter England Men Slim Fit Chinos - Size 36 - Khaki", price: '₹1,349', priceRaw: 1349, originalPrice: '₹2,499', originalPriceRaw: 2499, discount: 46, image: 'https://assets.myntrassets.com/h_1440,q_90,w_1080/v1/assets/images/2023/9/20/e3fad71a-5db0-4e54-bac7-3fad4b7f17071695211453820-Peter-England-Men-Trousers-5381695211452882-1.jpg', link: 'https://www.myntra.com/trousers/peter+england', source: 'Myntra', rating: 4.2, reviews: 3208, delivery: 'Free delivery above ₹499' },
    { id: 'p3', title: "Allen Solly Men Regular Fit Formal Trousers - 36 - Grey", price: '₹1,049', priceRaw: 1049, originalPrice: '₹2,099', originalPriceRaw: 2099, discount: 50, image: 'https://assets.myntrassets.com/h_1440,q_90,w_1080/v1/assets/images/2023/8/16/3fe9d5af-4dd8-4d9a-9d4e-7bb3c6e75cdd1692185044093-Allen-Solly-Men-Trousers-2101692185043433-1.jpg', link: 'https://www.myntra.com/trousers/allen+solly', source: 'Myntra', rating: 4.3, reviews: 5670, delivery: 'Free delivery above ₹499' },
    { id: 'p4', title: "Lee Men's Regular Fit Jeans - 36 - Mid Blue", price: '₹1,799', priceRaw: 1799, originalPrice: '₹3,499', originalPriceRaw: 3499, discount: 49, image: 'https://m.media-amazon.com/images/I/51TbEfWnjHL._AC_UX679_.jpg', link: 'https://www.flipkart.com/search?q=lee+jeans+36', source: 'Flipkart', rating: 4.2, reviews: 6890, delivery: '₹40 delivery' },
    { id: 'p5', title: "Wrangler Men Regular Fit Stretch Jeans - 36 - Black", price: '₹1,499', priceRaw: 1499, originalPrice: '₹2,999', originalPriceRaw: 2999, discount: 50, image: 'https://m.media-amazon.com/images/I/61BKdZNbmQL._AC_UX679_.jpg', link: 'https://www.amazon.in/s?k=wrangler+jeans+36+black', source: 'Amazon', rating: 4.1, reviews: 4210, delivery: 'Free delivery' },
    { id: 'p6', title: "Van Heusen Men Slim Fit Formal Trousers - 36 - Navy", price: '₹1,249', priceRaw: 1249, originalPrice: '₹2,399', originalPriceRaw: 2399, discount: 48, image: 'https://assets.myntrassets.com/h_1440,q_90,w_1080/v1/assets/images/2023/6/28/fc2df6e0-e5cb-4a96-8f4f-89ccfbe9de3c1687946869498-Van-Heusen-Men-Trousers-311687946868900-1.jpg', link: 'https://www.myntra.com/trousers/van+heusen', source: 'Myntra', rating: 4.4, reviews: 8902, delivery: 'Free delivery above ₹499' },
  ],
  mobile: [
    { id: 'e1', title: 'Samsung Galaxy M34 5G (Midnight Blue, 6GB RAM, 128GB)', price: '₹13,999', priceRaw: 13999, originalPrice: '₹18,999', originalPriceRaw: 18999, discount: 26, image: 'https://m.media-amazon.com/images/I/71QrYDeJrNL._AC_SX679_.jpg', link: 'https://www.amazon.in/s?k=samsung+galaxy+m34+5g', source: 'Amazon', rating: 4.3, reviews: 25600, delivery: 'Free delivery' },
    { id: 'e2', title: 'Redmi Note 13 5G (Arctic White, 8GB+256GB)', price: '₹17,999', priceRaw: 17999, originalPrice: '₹22,999', originalPriceRaw: 22999, discount: 22, image: 'https://m.media-amazon.com/images/I/61GzR1EerXL._AC_SX679_.jpg', link: 'https://www.flipkart.com/search?q=redmi+note+13+5g', source: 'Flipkart', rating: 4.4, reviews: 42300, delivery: 'Free delivery' },
    { id: 'e3', title: 'realme narzo N63 5G (Pioneer Green, 6GB+128GB)', price: '₹9,499', priceRaw: 9499, originalPrice: '₹12,999', originalPriceRaw: 12999, discount: 27, image: 'https://m.media-amazon.com/images/I/71EF4tnrGTL._AC_SX679_.jpg', link: 'https://www.amazon.in/s?k=realme+narzo+n63', source: 'Amazon', rating: 4.1, reviews: 18700, delivery: 'Free delivery' },
    { id: 'e4', title: 'OnePlus Nord CE 3 Lite 5G (Chromatic Gray, 8GB RAM, 128GB)', price: '₹16,999', priceRaw: 16999, originalPrice: '₹19,999', originalPriceRaw: 19999, discount: 15, image: 'https://m.media-amazon.com/images/I/71P5oF6tgML._AC_SX679_.jpg', link: 'https://www.amazon.in/s?k=oneplus+nord+ce+3+lite', source: 'Amazon', rating: 4.3, reviews: 31200, delivery: 'Free delivery' },
  ],
  laptop: [
    { id: 'l1', title: 'Lenovo IdeaPad Slim 3 Intel Core i5-12th Gen (8GB/512GB SSD/Win11)', price: '₹39,990', priceRaw: 39990, originalPrice: '₹54,990', originalPriceRaw: 54990, discount: 27, image: 'https://m.media-amazon.com/images/I/71iu-ZEHCWL._AC_SX679_.jpg', link: 'https://www.amazon.in/s?k=lenovo+ideapad+slim+3+i5', source: 'Amazon', rating: 4.3, reviews: 14200, delivery: 'Free delivery' },
    { id: 'l2', title: 'ASUS VivoBook 15 AMD Ryzen 5 (8GB RAM/512GB SSD/Win11)', price: '₹37,990', priceRaw: 37990, originalPrice: '₹52,990', originalPriceRaw: 52990, discount: 28, image: 'https://m.media-amazon.com/images/I/81EAuJlMFwL._AC_SX679_.jpg', link: 'https://www.flipkart.com/search?q=asus+vivobook+15+ryzen+5', source: 'Flipkart', rating: 4.4, reviews: 9800, delivery: 'Free delivery' },
  ],
};

function getMockProducts(query, budgetMax) {
  const q = query.toLowerCase();
  let results = [];

  if (q.includes('shirt') || q.includes('t-shirt') || q.includes('tshirt') || q.includes('top')) {
    results = mockProducts.shirt;
  } else if (q.includes('pant') || q.includes('jean') || q.includes('trouser') || q.includes('chino')) {
    results = mockProducts.pant;
  } else if (q.includes('mobile') || q.includes('phone') || q.includes('smartphone')) {
    results = mockProducts.mobile;
  } else if (q.includes('laptop') || q.includes('notebook')) {
    results = mockProducts.laptop;
  } else {
    // Return a mix
    results = [...mockProducts.shirt.slice(0, 2), ...mockProducts.pant.slice(0, 2), ...mockProducts.mobile.slice(0, 2)];
  }

  if (budgetMax) {
    results = results.filter((p) => p.priceRaw <= budgetMax);
  }

  return results;
}

module.exports = { getMockProducts };
