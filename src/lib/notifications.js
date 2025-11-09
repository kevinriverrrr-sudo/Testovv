class NotificationManager {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  async show(title, message, options = {}) {
    const notification = {
      type: options.type || 'basic',
      iconUrl: options.iconUrl || chrome.runtime.getURL('src/icons/icon128.png'),
      title: title,
      message: message,
      priority: options.priority || 1,
      requireInteraction: options.requireInteraction || false,
    };

    if (options.buttons) {
      notification.buttons = options.buttons;
    }

    try {
      const notificationId = await chrome.notifications.create('', notification);
      
      if (options.onClick) {
        this.addClickHandler(notificationId, options.onClick);
      }

      return notificationId;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  addClickHandler(notificationId, handler) {
    const listener = (clickedId) => {
      if (clickedId === notificationId) {
        handler();
        chrome.notifications.onClicked.removeListener(listener);
      }
    };
    chrome.notifications.onClicked.addListener(listener);
  }

  async showPriceAlert(productName, oldPrice, newPrice, competitorName) {
    const priceChange = ((newPrice - oldPrice) / oldPrice * 100).toFixed(1);
    const direction = newPrice < oldPrice ? 'снизил' : 'повысил';
    
    return this.show(
      'Изменение цены конкурента!',
      `${competitorName} ${direction} цену на "${productName}": ${oldPrice}₽ → ${newPrice}₽ (${priceChange}%)`,
      {
        priority: 2,
        requireInteraction: true,
        buttons: [
          { title: 'Открыть анализ' },
          { title: 'Изменить цену' }
        ]
      }
    );
  }

  async showRecommendation(productName, currentPrice, recommendedPrice) {
    const savings = ((recommendedPrice - currentPrice) / currentPrice * 100).toFixed(1);
    
    return this.show(
      'Рекомендация по цене',
      `Для "${productName}" рекомендуется цена ${recommendedPrice}₽ (текущая: ${currentPrice}₽)`,
      {
        priority: 1,
        buttons: [
          { title: 'Применить' },
          { title: 'Подробнее' }
        ]
      }
    );
  }

  async showSaleNotification(productName, price) {
    return this.show(
      'Товар продан!',
      `"${productName}" продан за ${price}₽`,
      {
        priority: 2,
        requireInteraction: false,
      }
    );
  }

  async showTrendAlert(productName, trend) {
    return this.show(
      'Трендовый товар!',
      `"${productName}" набирает популярность. Тренд: ${trend}`,
      {
        priority: 1,
        buttons: [{ title: 'Посмотреть' }]
      }
    );
  }

  async showAutomationResult(action, success, details) {
    const title = success ? 'Автоматизация выполнена' : 'Ошибка автоматизации';
    return this.show(title, details, {
      priority: success ? 0 : 2,
      type: 'basic'
    });
  }

  async clear(notificationId) {
    try {
      await chrome.notifications.clear(notificationId);
    } catch (error) {
      console.error('Failed to clear notification:', error);
    }
  }

  async clearAll() {
    try {
      const notifications = await chrome.notifications.getAll();
      for (const id of Object.keys(notifications)) {
        await this.clear(id);
      }
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  }
}

const notificationManager = new NotificationManager();
export default notificationManager;
