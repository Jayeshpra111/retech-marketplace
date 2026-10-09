import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api, setAuthToken, getAuthToken } from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [isListingsLoading, setIsListingsLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [serverImpact, setServerImpact] = useState(null);

  // Theme Mode: 'light' or 'dark'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('retech_theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('retech_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Chat State
  const [activeChatListing, setActiveChatListing] = useState(null);
  const [messages, setMessages] = useState([]);

  // Normalize user payload
  const formatUser = (u) => {
    if (!u) return null;
    const avatarUrl = typeof u.avatar === 'string' ? u.avatar : u.avatar?.url || '';
    return {
      id: u._id || u.id,
      _id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'user',
      avatar: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      phone: u.phone || '',
      sharePhone: u.sharePhone || false,
      address: u.address || {},
      city: u.address?.city || 'Bangalore, KA',
      verified: u.isEmailVerified,
      isEmailVerified: u.isEmailVerified,
      totalKgDiverted: u.totalImpactKg || 0,
      totalCo2Saved: u.totalCo2SavedKg || 0,
      memberSince: u.createdAt
        ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Member',
      rating: u.ratingAvg || 5.0,
      ratingAvg: u.ratingAvg || 5.0,
      ratingCount: u.ratingCount || 0,
    };
  };

  // Normalize listing payload for client components
  const normalizeListing = (l) => {
    const sellerAvatar =
      typeof l.seller?.avatar === 'string'
        ? l.seller.avatar
        : l.seller?.avatar?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    return {
      id: l._id || l.id,
      _id: l._id || l.id,
      title: l.title,
      slug: l.slug,
      category: l.category?.slug || l.category?.name || 'electronics',
      categoryData: l.category,
      price: l.price,
      originalPrice: l.originalPrice || Math.round(l.price * 1.35),
      condition: l.condition,
      seller: {
        id: l.seller?._id || l.seller?.id,
        _id: l.seller?._id || l.seller?.id,
        name: l.seller?.name || 'Verified Seller',
        avatar: sellerAvatar,
        rating: l.seller?.ratingAvg || 4.9,
        ratingAvg: l.seller?.ratingAvg || 4.9,
        ratingCount: l.seller?.ratingCount || 0,
        verified: l.seller?.isEmailVerified ?? true,
      },
      sellerRating: l.seller?.ratingAvg || 4.9,
      sellerVerified: l.seller?.isEmailVerified ?? true,
      city: typeof l.location === 'string' ? l.location : `${l.location?.city || 'Bangalore'}, ${l.location?.state || 'KA'}`,
      location: typeof l.location === 'string' ? l.location : `${l.location?.city || 'Bangalore'}, ${l.location?.state || 'KA'}`,
      isNegotiable: l.negotiable ?? false,
      images:
        l.images?.length > 0
          ? l.images.map((i) => (typeof i === 'string' ? i : i.url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600'))
          : ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600'],
      specs: l.specs || {},
      verified: true,
      status: l.status || 'active',
      impactKg: l.impactKg || 1.5,
      co2SavedKg: l.co2SavedKg || 65,
      warrantyLeftMonths: l.warrantyLeftMonths || 0,
      hasBill: l.hasBill ?? true,
      description: l.description,
      brand: l.brand || '',
      model: l.model || '',
      createdAt: l.createdAt,
    };
  };

  // Load public listings
  const fetchListings = useCallback(async () => {
    try {
      setIsListingsLoading(true);
      const res = await api.listings.getAll({ limit: 50 });
      if (res?.data) {
        setListings(res.data.map(normalizeListing));
      }
    } catch (err) {
      console.warn('Could not load listings:', err.message);
    } finally {
      setIsListingsLoading(false);
    }
  }, []);

  // Fetch initial impact stats
  const fetchImpact = useCallback(async () => {
    try {
      const res = await api.impact.getOverview();
      if (res?.data) setServerImpact(res.data);
    } catch {
      // Ignore
    }
  }, []);

  // Initialize Auth & App Data on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res?.data) {
            setUser(formatUser(res.data));
            // Load user's wishlist and orders
            try {
              const [wlRes, ordersRes] = await Promise.all([
                api.listings.getWishlist(),
                api.orders.getMyOrders({ limit: 20 }),
              ]);
              if (wlRes?.data) {
                setWishlist(wlRes.data.map((item) => (typeof item === 'string' ? item : item._id || item.id)));
              }
              if (ordersRes?.data) {
                setOrders(ordersRes.data);
              }
            } catch {
              // Ignore secondary failures
            }
          }
        } catch {
          // Token expired or invalid
          setAuthToken(null);
          setUser(null);
        }
      }
      setIsAuthLoading(false);
    };

    initAuth();
    fetchListings();
    fetchImpact();
  }, [fetchListings, fetchImpact]);

  // Auth: Login
  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res?.data?.accessToken) {
      setAuthToken(res.data.accessToken);
      const formatted = formatUser(res.data.user);
      setUser(formatted);

      // Load user's wishlist and orders upon successful login
      try {
        const [wlRes, ordersRes] = await Promise.all([
          api.listings.getWishlist(),
          api.orders.getMyOrders({ limit: 20 }),
        ]);
        if (wlRes?.data) {
          setWishlist(wlRes.data.map((item) => (typeof item === 'string' ? item : item._id || item.id)));
        }
        if (ordersRes?.data) {
          setOrders(ordersRes.data);
        }
      } catch {
        // Non-fatal
      }

      toast.success(`Welcome back, ${formatted.name}!`);
      return formatted;
    }
    throw new Error('Login failed: invalid response from server.');
  };

  // Auth: Register
  const register = async (name, email, password, country) => {
    const res = await api.auth.register({ name, email, password, country });
    toast.success('Registration successful! Please check your email to verify your account.');
    return res;
  };

  // Auth: Logout
  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    }
    setAuthToken(null);
    setUser(null);
    setWishlist([]);
    setOrders([]);
    toast.success('Logged out successfully.');
  };

  // Wishlist Toggle
  const toggleWishlist = async (id) => {
    if (!user) {
      toast.error('Please log in to save items to your wishlist.');
      return;
    }

    const isSaved = wishlist.includes(id);
    setWishlist((prev) => (isSaved ? prev.filter((item) => item !== id) : [...prev, id]));

    try {
      await api.listings.toggleWishlist(id);
      toast.success(isSaved ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (err) {
      // Revert on failure
      setWishlist((prev) => (isSaved ? [...prev, id] : prev.filter((item) => item !== id)));
      toast.error(err.message || 'Could not update wishlist.');
    }
  };

  // Add Listing (wired to real API)
  const addListing = async (formDataOrObj) => {
    try {
      const res = await api.listings.create(formDataOrObj);
      toast.success('Listing submitted! It is now pending admin review before going live.');
      fetchListings();
      return res.data;
    } catch (err) {
      toast.error(err.message || 'Failed to create listing.');
      throw err;
    }
  };

  // Add Order / Place Order
  const addOrder = async (orderData) => {
    try {
      const res = await api.orders.create(orderData);
      setOrders((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      toast.error(err.message || 'Failed to place order.');
      throw err;
    }
  };

  // Send message
  const sendMessage = async (text) => {
    if (!user) {
      toast.error('Please log in to send messages.');
      return;
    }
    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'buyer',
      senderName: user.name,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);

    if (activeChatListing) {
      try {
        // Create or find conversation then send
        const sellerId = activeChatListing.seller?.id || activeChatListing.seller?._id;
        const convRes = await api.chat.createConversation(sellerId, activeChatListing.id || activeChatListing._id);
        if (convRes?.data?._id) {
          await api.chat.sendMessage(convRes.data._id, text);
        }
      } catch (err) {
        console.warn('Realtime chat sync:', err.message);
      }
    }
    toast.success('Message sent to seller');
  };

  // Refresh user profile
  const refreshUser = async () => {
    if (!getAuthToken()) return;
    try {
      const res = await api.auth.getMe();
      if (res?.data) setUser(formatUser(res.data));
    } catch {
      // Ignore
    }
  };

  // Platform impact calculations
  const totalEwasteDiverted = serverImpact?.totalImpactKg || listings.reduce((sum, item) => sum + (item.impactKg || 0), 0);
  const totalCo2Saved = serverImpact?.totalCo2SavedKg || listings.reduce((sum, item) => sum + (item.co2SavedKg || 0), 0);

  return (
    <AppContext.Provider
      value={{
        listings,
        isListingsLoading,
        fetchListings,
        wishlist,
        user,
        isAuthLoading,
        login,
        register,
        logout,
        refreshUser,
        activeChatListing,
        setActiveChatListing,
        messages,
        sendMessage,
        orders,
        addOrder,
        toggleWishlist,
        addListing,
        totalEwasteDiverted: Number(totalEwasteDiverted.toFixed(1)),
        totalCo2Saved: Number(totalCo2Saved.toFixed(0)),
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
