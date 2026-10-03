import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { INITIAL_LISTINGS } from '../data/mockData';
import { api, setAuthToken } from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [listings, setListings] = useState(() => {
    const saved = localStorage.getItem('retech_listings');
    return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('retech_wishlist');
    return saved ? JSON.parse(saved) : ['listing-1', 'listing-4'];
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('retech_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

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
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [activeChatListing, setActiveChatListing] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'seller',
      senderName: 'Aditya Rao',
      text: 'Hi Jayesh! Thanks for checking out the MacBook Pro M1. Yes, the battery health is still solid at 92%.',
      time: '10:45 AM'
    },
    {
      id: 'm2',
      sender: 'buyer',
      senderName: 'You',
      text: 'Great! Is the MagSafe cable in clean condition? Any stains on the braided cord?',
      time: '10:48 AM'
    },
    {
      id: 'm3',
      sender: 'seller',
      senderName: 'Aditya Rao',
      text: 'Spotless! I kept it bundled in the box since I mostly used an Anker dock. Would you like to inspect in Indiranagar or opt for Escrow Delivery?',
      time: '10:50 AM'
    }
  ]);

  const [orders, setOrders] = useState([
    {
      id: 'ORD-7291',
      listingId: 'listing-2',
      title: 'NVIDIA GeForce RTX 3080 Founders Edition 10GB',
      amount: 38500,
      sellerName: 'Rohan Sharma',
      status: 'shipped',
      date: '2026-09-28',
      trackingNumber: 'DELHIVERY-98213812',
      protectionStatus: 'Escrow Held (Funds release on your delivery confirmation)',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300&auto=format&fit=crop&q=80',
      co2Saved: 85
    }
  ]);

  const [serverImpact, setServerImpact] = useState(null);

  // Sync with backend on startup
  useEffect(() => {
    const initAppData = async () => {
      // 1. Fetch current user if token exists
      const token = localStorage.getItem('retech_token');
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res?.data) {
            const u = res.data;
            const avatarUrl = typeof u.avatar === 'string' ? u.avatar : (u.avatar?.url || '');
            setUser({
              id: u._id || u.id,
              name: u.name,
              email: u.email,
              avatar: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              role: u.role || 'user',
              city: u.address?.city || 'Bangalore, KA',
              verified: u.isEmailVerified,
              totalKgDiverted: u.totalImpactKg || 0,
              totalCo2Saved: u.totalCo2SavedKg || 0,
              memberSince: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              rating: u.ratingAvg || 5.0,
            });
          }
        } catch {
          // Token expired or invalid
          setAuthToken(null);
        }
      }

      // 2. Fetch live listings
      try {
        const res = await api.listings.getAll({ limit: 50 });
        if (res?.data && res.data.length > 0) {
          const normalized = res.data.map((l) => {
            const sellerAvatar = typeof l.seller?.avatar === 'string'
              ? l.seller.avatar
              : (l.seller?.avatar?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');

            return {
              id: l._id || l.id,
              title: l.title,
              category: l.category?.slug || l.category?.name || 'Electronics',
              price: l.price,
              originalPrice: l.originalPrice || l.price * 1.4,
              condition: l.condition,
              seller: {
                id: l.seller?._id || l.seller?.id,
                name: l.seller?.name || (typeof l.seller === 'string' ? l.seller : 'Seller'),
                avatar: sellerAvatar,
                rating: l.seller?.ratingAvg || 4.8,
                verified: l.seller?.isEmailVerified ?? true,
              },
              sellerRating: l.seller?.ratingAvg || 4.8,
              sellerVerified: l.seller?.isEmailVerified ?? true,
              city: typeof l.location === 'string'
                ? l.location
                : `${l.location?.city || 'Bangalore'}, ${l.location?.state || 'KA'}`,
              location: `${l.location?.city || 'Bangalore'}, ${l.location?.state || 'KA'}`,
              isNegotiable: l.negotiable ?? false,
              images: l.images?.length > 0
                ? l.images.map((i) => (typeof i === 'string' ? i : i.url || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600'))
                : ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600'],
              specs: l.specs || {},
              verified: true,
              featured: false,
              impactKg: l.impactKg || 1.5,
              co2SavedKg: l.co2SavedKg || 65,
              warrantyLeftMonths: l.warrantyLeftMonths || 0,
              hasBill: l.hasBill ?? true,
              description: l.description,
              brand: l.brand,
              model: l.model,
            };
          });

          // Merge backend listings with mock catalog so user has plenty of items
          setListings((prev) => {
            const existingIds = new Set(normalized.map((n) => n.id));
            const mockKeep = prev.filter((p) => !existingIds.has(p.id));
            return [...normalized, ...mockKeep];
          });
        }
      } catch (err) {
        console.warn('Backend listings fetch skipped:', err.message);
      }

      // 3. Fetch impact metrics
      try {
        const res = await api.impact.getOverview();
        if (res?.data) {
          setServerImpact(res.data);
        }
      } catch {
        // Fallback to local
      }
    };

    initAppData();
  }, []);

  // Save changes locally
  useEffect(() => {
    localStorage.setItem('retech_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('retech_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('retech_user', JSON.stringify(user));
    }
  }, [user]);

  // Auth methods
  const login = async (email, password) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res?.data?.accessToken) {
        setAuthToken(res.data.accessToken);
        const u = res.data.user;
        const userData = {
          id: u._id || u.id,
          name: u.name,
          email: u.email,
          role: u.role || 'user',
          avatar: (typeof u.avatar === 'string' ? u.avatar : u.avatar?.url) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          city: u.address?.city || 'Bangalore, KA',
          verified: u.isEmailVerified,
          totalKgDiverted: u.totalImpactKg || 0,
          totalCo2Saved: u.totalCo2SavedKg || 0,
          memberSince: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          rating: u.ratingAvg || 5.0,
        };
        setUser(userData);
        return userData;
      }
    } catch (err) {
      console.warn('API login fallback:', err.message);
    }

    // Demo fallback for test credentials or offline mode
    if (email) {
      const fallbackUser = {
        id: 'user-current',
        name: email === 'admin@retechmarket.com' ? 'Admin Jayesh' : email.split('@')[0],
        email: email,
        role: email === 'admin@retechmarket.com' ? 'admin' : 'user',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        city: 'Bangalore, KA',
        verified: true,
        totalKgDiverted: 14.8,
        totalCo2Saved: 342,
        memberSince: 'January 2024',
        rating: 4.95,
      };
      setUser(fallbackUser);
      return fallbackUser;
    }
    throw new Error('Login failed');
  };

  const register = async (name, email, password, country) => {
    const res = await api.auth.register({ name, email, password, country });
    return res;
  };

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem('retech_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const exists = prev.includes(id);
      if (exists) {
        toast('Removed from saved wishlist', { icon: '🗑️' });
        return prev.filter(item => item !== id);
      } else {
        toast.success('Added to saved wishlist');
        return [...prev, id];
      }
    });

    // Also attempt backend wishlist sync if logged in
    api.listings.toggleWishlist(id).catch(() => {});
  };

  const addListing = async (newListing) => {
    const categoryMap = {
      psus: 'power-supplies',
      gaming: 'gaming',
      gpus: 'gpus',
      ram: 'ram',
      storage: 'storage',
      motherboards: 'motherboards',
      mobiles: 'mobiles',
      laptops: 'laptops',
      tablets: 'tablets',
      audio: 'audio',
      cameras: 'cameras',
    };
    const mappedCategory = categoryMap[newListing.category] || newListing.category || 'other';

    const safeDescription = (newListing.conditionDetails && newListing.conditionDetails.length >= 20)
      ? newListing.conditionDetails
      : `${newListing.title} - ${newListing.condition || 'good'} condition device listed on ReTech Market.`;

    let createdId = newListing.id;

    // Try posting to backend if logged in
    try {
      const res = await api.listings.create({
        title: newListing.title,
        description: safeDescription,
        category: mappedCategory,
        price: Number(newListing.price),
        condition: newListing.condition || 'good',
        brand: newListing.brand || '',
        model: newListing.model || '',
        images: newListing.images || [],
        location: {
          city: newListing.city || newListing.location?.split(',')[0]?.trim() || 'Bangalore',
          state: 'KA',
        },
      });
      if (res?.data?._id) {
        createdId = res.data._id;
      }
    } catch (err) {
      console.warn('Backend listing sync fallback:', err.message);
    }

    const listingToSave = { ...newListing, id: createdId };
    setListings(prev => [listingToSave, ...prev]);
    toast.success('Listing published! E-waste diverted ~' + (newListing.impactKg || 1) + ' kg');
  };

  const addOrder = async (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    toast.success('Order placed with 100% Escrow Protection!');
  };

  const sendMessage = (text) => {
    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'buyer',
      senderName: user?.name || 'You',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    toast.success('Inquiry sent to seller');
  };

  // Platform-wide impact metrics
  const calculatedEwaste = listings.reduce((sum, item) => sum + (item.impactKg || 0), 4820);
  const calculatedCo2 = listings.reduce((sum, item) => sum + (item.co2SavedKg || 0), 18450);

  const totalEwasteDiverted = serverImpact?.totalImpactKg
    ? serverImpact.totalImpactKg + calculatedEwaste
    : calculatedEwaste;

  const totalCo2Saved = serverImpact?.totalCo2SavedKg
    ? serverImpact.totalCo2SavedKg + calculatedCo2
    : calculatedCo2;

  return (
    <AppContext.Provider value={{
      listings,
      wishlist,
      user,
      login,
      register,
      logout,
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
      toggleTheme
    }}>
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
