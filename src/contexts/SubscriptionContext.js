import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from './AuthContext';

// Create context
const SubscriptionContext = createContext();

// Custom hook to use the subscription context
export const useSubscription = () => {
  return useContext(SubscriptionContext);
};

// Provider component
export const SubscriptionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if a user has premium features
  const hasPremium = () => {
    console.log('[SubscriptionContext] Checking hasPremium. Current subscription:', subscription);
    if (!subscription) return false;

    // Check for the admin override first
    if (subscription.isAdminOverride === true && subscription.status === 'active') {
          const result = true;
    console.log('[SubscriptionContext] hasPremium result (admin override or active):', result);
    return result;
    }

    // Original check for regular subscriptions
    if (subscription.status === 'active' && subscription.current_period_end) {
      const endDate = new Date(subscription.current_period_end).getTime(); // Parse string to get timestamp
          const isPremium = endDate > Date.now();
    console.log('[SubscriptionContext] hasPremium result (date check):', isPremium, 'endDate:', new Date(endDate), 'now:', new Date(Date.now()));
    return isPremium;
    }
    
        const result = false;
    console.log('[SubscriptionContext] hasPremium result:', result);
    return result;
  };

  // Get subscription details from Firebase when user changes
  useEffect(() => {
    setLoading(true);
    
    if (!currentUser) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const subscriptionRef = ref(db, `users/${currentUser.uid}/subscription`);
    
    const unsubscribe = onValue(subscriptionRef, (snapshot) => {
      const data = snapshot.val();
      setSubscription(data || null);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUser]);

  // Value to be provided to consumers
  const value = {
    subscription,
    loading,
    hasPremium
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
