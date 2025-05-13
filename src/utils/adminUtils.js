/**
 * Admin Utilities
 * 
 * This file contains utility functions for administrative purposes.
 * These functions are not meant to be used by regular users.
 */

/**
 * Get API quota information from localStorage
 * @returns {Object} Object containing quota information or null if not available
 */
export const getApiQuotaInfo = () => {
  try {
    const quotaInfo = localStorage.getItem('apiQuotaInfo');
    if (!quotaInfo) {
      console.log('No API quota information available');
      return null;
    }
    
    const parsedQuota = JSON.parse(quotaInfo);
    const lastChecked = new Date(parsedQuota.lastChecked);
    
    console.log('=== API QUOTA INFORMATION ===');
    console.log(`Remaining: ${parsedQuota.remaining}`);
    console.log(`Used: ${parsedQuota.used}`);
    console.log(`Total: ${parsedQuota.total}`);
    console.log(`Last checked: ${lastChecked.toLocaleString()}`);
    console.log('============================');
    
    return parsedQuota;
  } catch (error) {
    console.error('Error retrieving API quota information:', error);
    return null;
  }
};

/**
 * Force a check of the API quota by making a minimal API call
 * @returns {Promise<Object>} Promise resolving to quota information
 */
export const checkApiQuota = async () => {
  try {
    // Import dependencies only when function is called
    const axios = (await import('axios')).default;
    const config = (await import('../config')).default;
    
    console.log('Checking API quota...');
    
    // Make a minimal API call to check quota
    const response = await axios.get(`${config.API_BASE_URL}/sports`, {
      params: {
        apiKey: config.API_KEY
      }
    });
    
    if (response.headers && response.headers['x-requests-remaining']) {
      const remaining = parseInt(response.headers['x-requests-remaining']);
      const used = parseInt(response.headers['x-requests-used']);
      const total = remaining + used;
      
      const quotaInfo = {
        remaining,
        used,
        total,
        lastChecked: new Date().toISOString()
      };
      
      // Store in localStorage
      localStorage.setItem('apiQuotaInfo', JSON.stringify(quotaInfo));
      
      console.log('=== API QUOTA INFORMATION ===');
      console.log(`Remaining: ${remaining}`);
      console.log(`Used: ${used}`);
      console.log(`Total: ${total}`);
      console.log(`Last checked: ${new Date().toLocaleString()}`);
      console.log('============================');
      
      return quotaInfo;
    } else {
      console.error('Could not retrieve quota information from API response');
      return null;
    }
  } catch (error) {
    console.error('Error checking API quota:', error);
    return null;
  }
};

/**
 * Admin utilities object for browser console usage
 */
const adminUtils = {
  getApiQuota: getApiQuotaInfo,
  checkApiQuota: checkApiQuota
};

// Make adminUtils available in the browser console
if (typeof window !== 'undefined') {
  window.adminUtils = adminUtils;
}

export default adminUtils;
