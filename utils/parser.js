const FunPayParser = {
  parseLots(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const lots = [];

    const lotElements = doc.querySelectorAll('.tc-item, .offer-list-item, [class*="lot-"]');
    
    lotElements.forEach(element => {
      const lot = {
        id: element.getAttribute('data-lot-id') || element.getAttribute('data-id'),
        title: element.querySelector('.tc-title, .offer-title')?.textContent?.trim(),
        price: this.parsePrice(element.querySelector('.tc-price, .offer-price')?.textContent),
        seller: this.parseSeller(element),
        url: element.querySelector('a')?.href,
        timestamp: Date.now()
      };

      if (lot.id && lot.price) {
        lots.push(lot);
      }
    });

    return lots;
  },

  parsePrice(priceText) {
    if (!priceText) return null;
    
    const cleaned = priceText.replace(/[^\d.,]/g, '');
    const price = parseFloat(cleaned.replace(',', '.'));
    
    return isNaN(price) ? null : price;
  },

  parseSeller(element) {
    const sellerElement = element.querySelector('[data-seller-id], .seller-name, .username');
    
    return {
      id: sellerElement?.getAttribute('data-seller-id'),
      name: sellerElement?.textContent?.trim(),
      url: sellerElement?.href
    };
  },

  parseSellerProfile(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const accountAge = this.parseAccountAge(doc);
    const reviewStats = this.parseReviewStats(doc);
    const totalDeals = this.parseTotalDeals(doc);
    const hasContacts = this.parseContactInfo(doc);

    return {
      accountAge,
      reviewStats,
      totalDeals,
      hasContacts,
      lastSeen: this.parseLastSeen(doc)
    };
  },

  parseAccountAge(doc) {
    const registeredText = doc.querySelector('.account-info, .user-info, [class*="registered"]')?.textContent;
    if (!registeredText) return null;

    const match = registeredText.match(/(\d+)\s*(год|лет|месяц|мес|день|дней)/i);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    if (unit.includes('год') || unit.includes('лет')) {
      return value * 365;
    } else if (unit.includes('месяц') || unit.includes('мес')) {
      return value * 30;
    } else if (unit.includes('день') || unit.includes('дней')) {
      return value;
    }

    return null;
  },

  parseReviewStats(doc) {
    const positiveElement = doc.querySelector('[class*="positive"], .review-positive, .rating-positive');
    const negativeElement = doc.querySelector('[class*="negative"], .review-negative, .rating-negative');

    const positive = parseInt(positiveElement?.textContent?.match(/\d+/)?.[0] || '0');
    const negative = parseInt(negativeElement?.textContent?.match(/\d+/)?.[0] || '0');

    const total = positive + negative;
    const percentage = total > 0 ? (positive / total) * 100 : 0;

    return {
      positive,
      negative,
      total,
      percentage
    };
  },

  parseTotalDeals(doc) {
    const dealsElement = doc.querySelector('[class*="deals"], .total-orders, .completed-orders');
    if (!dealsElement) return 0;

    const match = dealsElement.textContent.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  },

  parseContactInfo(doc) {
    const description = doc.querySelector('.user-description, .profile-description, [class*="about"]')?.textContent || '';
    
    const hasTelegram = /@[a-zA-Z0-9_]{5,}|t\.me\/[a-zA-Z0-9_]+|telegram/i.test(description);
    const hasDiscord = /discord|[a-zA-Z0-9_]+#\d{4}/i.test(description);

    return {
      telegram: hasTelegram,
      discord: hasDiscord
    };
  },

  parseLastSeen(doc) {
    const lastSeenElement = doc.querySelector('[class*="last-seen"], .online-status');
    if (!lastSeenElement) return null;

    const text = lastSeenElement.textContent.toLowerCase();
    
    if (text.includes('онлайн') || text.includes('online')) {
      return 'online';
    }

    const match = text.match(/(\d+)\s*(минут|час|день)/i);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      return { value, unit };
    }

    return null;
  },

  calculateStats(lots) {
    if (!lots || lots.length === 0) {
      return {
        median: 0,
        average: 0,
        min: 0,
        max: 0,
        count: 0
      };
    }

    const prices = lots.map(lot => lot.price).filter(p => p > 0).sort((a, b) => a - b);
    
    const median = prices.length > 0 
      ? prices[Math.floor(prices.length / 2)] 
      : 0;
    
    const average = prices.length > 0
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length
      : 0;

    return {
      median: median.toFixed(2),
      average: average.toFixed(2),
      min: prices.length > 0 ? prices[0] : 0,
      max: prices.length > 0 ? prices[prices.length - 1] : 0,
      count: lots.length
    };
  },

  countOnlineSellers(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const onlineIndicators = doc.querySelectorAll('.online, [class*="online-status"], .seller-online');
    return onlineIndicators.length;
  },

  calculateNewLotsPercentage(currentLots, previousLots) {
    if (!previousLots || previousLots.length === 0) return 0;

    const previousIds = new Set(previousLots.map(lot => lot.id));
    const newLots = currentLots.filter(lot => !previousIds.has(lot.id));

    return ((newLots.length / currentLots.length) * 100).toFixed(1);
  }
};
