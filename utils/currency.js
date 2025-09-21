const axios = require('axios');

// Supported currencies
const SUPPORTED_CURRENCIES = {
  USD: { name: 'US Dollar', symbol: '$', decimals: 2, code: 'USD' },
  USDT: { name: 'Tether USD', symbol: '₮', decimals: 6, code: 'USDT' },
  AED: { name: 'UAE Dirham', symbol: 'د.إ', decimals: 2, code: 'AED' },
  BDT: { name: 'Bangladeshi Taka', symbol: '৳', decimals: 2, code: 'BDT' },
  INR: { name: 'Indian Rupee', symbol: '₹', decimals: 2, code: 'INR' },
  PKR: { name: 'Pakistani Rupee', symbol: '₨', decimals: 2, code: 'PKR' }
};

// Exchange rate cache
let exchangeRateCache = {
  rates: {},
  lastUpdated: null,
  cacheExpiry: 5 * 60 * 1000 // 5 minutes
};

// Default exchange rates (fallback)
const DEFAULT_RATES = {
  USD: 1.0,
  USDT: 1.0,
  AED: 3.67,
  BDT: 110.0,
  INR: 83.0,
  PKR: 280.0
};

// Exchange rate API configurations
const EXCHANGE_APIS = {
  primary: {
    name: 'ExchangeRate-API',
    url: 'https://api.exchangerate-api.com/v4/latest/USD',
    key: process.env.EXCHANGE_RATE_API_KEY
  },
  secondary: {
    name: 'Fixer.io',
    url: 'http://data.fixer.io/api/latest',
    key: process.env.FIXER_API_KEY
  },
  crypto: {
    name: 'CoinGecko',
    url: 'https://api.coingecko.com/api/v3/simple/price',
    key: null // Free API
  }
};

// Get exchange rates from API
const fetchExchangeRates = async (baseCurrency = 'USD') => {
  try {
    // Try primary API first
    if (EXCHANGE_APIS.primary.key) {
      const response = await axios.get(EXCHANGE_APIS.primary.url, {
        timeout: 10000
      });
      
      if (response.data && response.data.rates) {
        return {
          success: true,
          rates: response.data.rates,
          source: 'ExchangeRate-API',
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Try secondary API
    if (EXCHANGE_APIS.secondary.key) {
      const response = await axios.get(EXCHANGE_APIS.secondary.url, {
        params: {
          access_key: EXCHANGE_APIS.secondary.key,
          base: baseCurrency
        },
        timeout: 10000
      });
      
      if (response.data && response.data.rates) {
        return {
          success: true,
          rates: response.data.rates,
          source: 'Fixer.io',
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Fallback to default rates
    console.warn('Using default exchange rates - API unavailable');
    return {
      success: true,
      rates: DEFAULT_RATES,
      source: 'default',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error fetching exchange rates:', error.message);
    
    // Return cached rates if available
    if (exchangeRateCache.rates && Object.keys(exchangeRateCache.rates).length > 0) {
      console.log('Using cached exchange rates');
      return {
        success: true,
        rates: exchangeRateCache.rates,
        source: 'cache',
        timestamp: exchangeRateCache.lastUpdated
      };
    }
    
    // Final fallback to default rates
    return {
      success: true,
      rates: DEFAULT_RATES,
      source: 'default',
      timestamp: new Date().toISOString()
    };
  }
};

// Get crypto prices
const fetchCryptoPrices = async () => {
  try {
    const response = await axios.get(EXCHANGE_APIS.crypto.url, {
      params: {
        ids: 'tether',
        vs_currencies: 'usd'
      },
      timeout: 10000
    });
    
    if (response.data && response.data.tether) {
      return {
        success: true,
        USDT: response.data.tether.usd,
        source: 'CoinGecko',
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      success: false,
      error: 'Invalid crypto price response'
    };
    
  } catch (error) {
    console.error('Error fetching crypto prices:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update exchange rate cache
const updateExchangeRates = async () => {
  try {
    const [fiatRates, cryptoPrices] = await Promise.all([
      fetchExchangeRates(),
      fetchCryptoPrices()
    ]);
    
    const rates = { ...fiatRates.rates };
    
    // Add crypto prices
    if (cryptoPrices.success) {
      rates.USDT = cryptoPrices.USDT;
    }
    
    // Ensure all supported currencies are present
    Object.keys(SUPPORTED_CURRENCIES).forEach(currency => {
      if (!rates[currency]) {
        rates[currency] = DEFAULT_RATES[currency];
      }
    });
    
    exchangeRateCache = {
      rates,
      lastUpdated: new Date().toISOString(),
      cacheExpiry: 5 * 60 * 1000
    };
    
    console.log('Exchange rates updated successfully');
    return {
      success: true,
      rates,
      source: fiatRates.source,
      timestamp: exchangeRateCache.lastUpdated
    };
    
  } catch (error) {
    console.error('Error updating exchange rates:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get current exchange rates
const getExchangeRates = async (forceUpdate = false) => {
  const now = Date.now();
  const lastUpdate = exchangeRateCache.lastUpdated ? new Date(exchangeRateCache.lastUpdated).getTime() : 0;
  const isExpired = (now - lastUpdate) > exchangeRateCache.cacheExpiry;
  
  if (forceUpdate || isExpired || !exchangeRateCache.rates || Object.keys(exchangeRateCache.rates).length === 0) {
    await updateExchangeRates();
  }
  
  return {
    rates: exchangeRateCache.rates,
    lastUpdated: exchangeRateCache.lastUpdated,
    isExpired: isExpired
  };
};

// Convert currency
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (!amount || amount <= 0) {
    return {
      success: false,
      error: 'Invalid amount'
    };
  }
  
  if (!SUPPORTED_CURRENCIES[fromCurrency] || !SUPPORTED_CURRENCIES[toCurrency]) {
    return {
      success: false,
      error: 'Unsupported currency'
    };
  }
  
  if (fromCurrency === toCurrency) {
    return {
      success: true,
      originalAmount: amount,
      convertedAmount: amount,
      fromCurrency,
      toCurrency,
      rate: 1,
      timestamp: new Date().toISOString()
    };
  }
  
  try {
    const { rates } = await getExchangeRates();
    
    // Convert to USD first, then to target currency
    const usdAmount = fromCurrency === 'USD' ? amount : amount / rates[fromCurrency];
    const convertedAmount = toCurrency === 'USD' ? usdAmount : usdAmount * rates[toCurrency];
    
    const rate = rates[toCurrency] / rates[fromCurrency];
    
    // Round to appropriate decimal places
    const decimals = SUPPORTED_CURRENCIES[toCurrency].decimals;
    const roundedAmount = Math.round(convertedAmount * Math.pow(10, decimals)) / Math.pow(10, decimals);
    
    return {
      success: true,
      originalAmount: amount,
      convertedAmount: roundedAmount,
      fromCurrency,
      toCurrency,
      rate: rate,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Currency conversion error:', error.message);
    return {
      success: false,
      error: 'Currency conversion failed'
    };
  }
};

// Format currency amount
const formatCurrency = (amount, currency, options = {}) => {
  if (!SUPPORTED_CURRENCIES[currency]) {
    return `${amount} ${currency}`;
  }
  
  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  const decimals = options.decimals !== undefined ? options.decimals : currencyInfo.decimals;
  
  // Round to specified decimal places
  const roundedAmount = Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
  
  // Format with commas
  const formattedNumber = roundedAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  if (options.symbolOnly) {
    return `${currencyInfo.symbol}${formattedNumber}`;
  }
  
  if (options.codeOnly) {
    return `${formattedNumber} ${currency}`;
  }
  
  return `${currencyInfo.symbol}${formattedNumber} ${currency}`;
};

// Parse currency string
const parseCurrency = (currencyString) => {
  if (!currencyString || typeof currencyString !== 'string') {
    return {
      success: false,
      error: 'Invalid currency string'
    };
  }
  
  // Remove spaces and common symbols
  const cleaned = currencyString.replace(/[\s,]/g, '');
  
  // Try to extract amount and currency
  const patterns = [
    /^([₮$د\.إ৳₹₨]?)([\d.]+)\s*([A-Z]{3})?$/,
    /^([\d.]+)\s*([A-Z]{3})$/,
    /^([A-Z]{3})\s*([\d.]+)$/
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      let amount, currency;
      
      if (match[3]) {
        // Symbol + Amount + Code
        amount = parseFloat(match[2]);
        currency = match[3];
      } else if (match[1] && /^[₮$د\.إ৳₹₨]/.test(match[1])) {
        // Symbol + Amount
        amount = parseFloat(match[2]);
        currency = Object.keys(SUPPORTED_CURRENCIES).find(code => 
          SUPPORTED_CURRENCIES[code].symbol === match[1]
        ) || 'USD';
      } else {
        // Amount + Code or Code + Amount
        amount = parseFloat(match[1]);
        currency = match[2];
        
        if (isNaN(amount)) {
          amount = parseFloat(match[2]);
          currency = match[1];
        }
      }
      
      if (!isNaN(amount) && SUPPORTED_CURRENCIES[currency]) {
        return {
          success: true,
          amount,
          currency
        };
      }
    }
  }
  
  return {
    success: false,
    error: 'Could not parse currency string'
  };
};

// Get currency info
const getCurrencyInfo = (currency) => {
  return SUPPORTED_CURRENCIES[currency] || null;
};

// Get all supported currencies
const getSupportedCurrencies = () => {
  return Object.keys(SUPPORTED_CURRENCIES).map(code => ({
    code,
    ...SUPPORTED_CURRENCIES[code]
  }));
};

// Calculate transaction fee
const calculateTransactionFee = (amount, currency, feeType = 'standard') => {
  const feeRates = {
    standard: {
      USD: 0.02, // 2%
      USDT: 0.015, // 1.5%
      AED: 0.02,
      BDT: 0.025, // 2.5%
      INR: 0.025,
      PKR: 0.03 // 3%
    },
    express: {
      USD: 0.035, // 3.5%
      USDT: 0.025, // 2.5%
      AED: 0.035,
      BDT: 0.04, // 4%
      INR: 0.04,
      PKR: 0.045 // 4.5%
    }
  };
  
  const rate = feeRates[feeType]?.[currency] || 0.02;
  const fee = amount * rate;
  
  // Minimum fee
  const minFees = {
    USD: 0.5,
    USDT: 0.5,
    AED: 2,
    BDT: 50,
    INR: 40,
    PKR: 150
  };
  
  const minFee = minFees[currency] || 0.5;
  const finalFee = Math.max(fee, minFee);
  
  return {
    amount,
    currency,
    feeType,
    feeRate: rate,
    feeAmount: finalFee,
    totalAmount: amount + finalFee,
    minFee
  };
};

// Validate currency amount
const validateCurrencyAmount = (amount, currency) => {
  if (!amount || amount <= 0) {
    return {
      valid: false,
      error: 'Amount must be greater than zero'
    };
  }
  
  if (!SUPPORTED_CURRENCIES[currency]) {
    return {
      valid: false,
      error: 'Unsupported currency'
    };
  }
  
  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  const maxDecimals = currencyInfo.decimals;
  
  // Check decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > maxDecimals) {
    return {
      valid: false,
      error: `${currency} supports maximum ${maxDecimals} decimal places`
    };
  }
  
  // Check minimum amounts
  const minAmounts = {
    USD: 0.01,
    USDT: 0.000001,
    AED: 0.01,
    BDT: 1,
    INR: 1,
    PKR: 1
  };
  
  const minAmount = minAmounts[currency] || 0.01;
  if (amount < minAmount) {
    return {
      valid: false,
      error: `Minimum amount for ${currency} is ${formatCurrency(minAmount, currency)}`
    };
  }
  
  return { valid: true };
};

// Start exchange rate update interval
const startExchangeRateUpdates = (intervalMinutes = 5) => {
  // Initial update
  updateExchangeRates();
  
  // Set up interval
  setInterval(() => {
    updateExchangeRates();
  }, intervalMinutes * 60 * 1000);
  
  console.log(`Exchange rate updates started: every ${intervalMinutes} minutes`);
};

module.exports = {
  SUPPORTED_CURRENCIES,
  getExchangeRates,
  updateExchangeRates,
  convertCurrency,
  formatCurrency,
  parseCurrency,
  getCurrencyInfo,
  getSupportedCurrencies,
  calculateTransactionFee,
  validateCurrencyAmount,
  startExchangeRateUpdates,
  fetchExchangeRates,
  fetchCryptoPrices
};