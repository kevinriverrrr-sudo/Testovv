import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeCompetitors(category, limit = 50) {
  try {
    const mockCompetitors = [];
    
    for (let i = 1; i <= Math.min(limit, 20); i++) {
      mockCompetitors.push({
        id: `comp-${i}`,
        seller: `Seller ${i}`,
        rating: (4.0 + Math.random()).toFixed(1),
        reviews: Math.floor(Math.random() * 200) + 10,
        price: Math.floor(Math.random() * 1000) + 500,
        category,
        url: `https://funpay.com/seller/${i}`,
        deliverySpeed: ['instant', 'fast', 'normal'][Math.floor(Math.random() * 3)],
        timestamp: Date.now(),
      });
    }

    return mockCompetitors;
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  }
}

export async function trackCompetitor(url, seller) {
  try {
    return {
      id: `comp-${Date.now()}`,
      url,
      seller,
      rating: 4.5,
      reviews: 100,
      productsCount: 25,
      avgPrice: 1500,
      tracked: true,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Track competitor error:', error);
    throw error;
  }
}

export async function scrapeFunPayPage(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    
    const products = [];
    $('.tc-item').each((index, element) => {
      const $el = $(element);
      
      products.push({
        id: $el.attr('data-id') || `product-${index}`,
        title: $el.find('.tc-item-title').text().trim(),
        price: extractPrice($el.find('.tc-price').text()),
        seller: $el.find('.media-user-name').text().trim(),
        url: $el.find('a').attr('href'),
      });
    });

    return products;
  } catch (error) {
    console.error('Scrape page error:', error);
    return [];
  }
}

function extractPrice(priceText) {
  if (!priceText) return 0;
  const match = priceText.match(/[\d\s]+/);
  return match ? parseFloat(match[0].replace(/\s/g, '')) : 0;
}

export default {
  scrapeCompetitors,
  trackCompetitor,
  scrapeFunPayPage,
};
