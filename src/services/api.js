/**
 * MOCK API SERVICE
 * Replaces backend calls with in-memory data for frontend-only demo.
 */

// --- MOCK DATA ---

const MOCK_USER = {
    _id: 'admin_123',
    name: 'Admin User',
    email: 'admin@easybooking.uz',
    role: 'admin',
    avatar: '/assets/img/team-1.jpg'
};

const MOCK_TOURS = [
    {
        _id: 'tour_001',
        title: 'Ajoyib Tour',
        fromCity: 'Tashkent',
        toCity: 'Samarkand',
        duration: '3 days / 2 nights',
        startDate: new Date().toISOString().split('T')[0],
        isVisaRequired: false,
        description: 'Experience the magic of the ancient Silk Road in this amazing tour of Samarkand. Ajoyib ("Amazing") Tour offers a deep dive into history and culture.',
        tourType: 'B2C',
        packageType: 'Full',
        priceAdult: 150,
        priceChild: 75,
        capacity: 25,
        agencyCommission: 0,
        itinerary: [
            { day: 1, title: 'Departure to Samarkand', description: 'Morning train to Samarkand. Check-in and city tour.' },
            { day: 2, title: 'Historical Exploration', description: 'Visit Registan Square, Bibi-Khanym Mosque, and Shah-i-Zinda.' },
            { day: 3, title: 'Return', description: 'Shopping at Siab Bazaar and return to Tashkent.' }
        ],
        included: ['Transportation', 'Hotel', 'Breakfast', 'Guide'],
        notIncluded: ['Dinner', 'Personal expenses'],
        images: [
            '/assets/img/demo/tile-tours-browse-trevi-fountain.webp',
            '/assets/img/demo/young-couple-taking-break-from-sightseeing-for-selfie.webp'
        ],
        status: 'Active',
        isGreatPackage: true
    },
    {
        _id: 'tour_002',
        title: 'Mashhur Tour',
        fromCity: 'Tashkent',
        toCity: 'Bukhara',
        duration: '4 days / 3 nights',
        startDate: new Date().toISOString().split('T')[0],
        isVisaRequired: false,
        description: 'The Mashhur ("Famous") Tour takes you to the holy city of Bukhara. Walk through the old streets and feel the spirit of the past.',
        tourType: 'B2B',
        packageType: 'Full',
        priceAdult: 220,
        priceChild: 100,
        capacity: 20,
        agencyCommission: 20,
        itinerary: [
            { day: 1, title: 'Arrival in Bukhara', description: 'Flight to Bukhara. Evening walk in Lyabi-Hauz.' },
            { day: 2, title: 'Old City Tour', description: 'Visit Poi Kalyan complex and The Ark Fortress.' },
            { day: 3, title: 'Cultural Immersion', description: 'Workshop at a carpet weaving factory and free time.' },
            { day: 4, title: 'Departure', description: 'Transfer to airport and flight back.' }
        ],
        included: ['Flights', 'Hotel 4*', 'Breakfasts', 'Transfers'],
        notIncluded: ['Lunch & Dinner', 'Entrance fees'],
        images: [
            '/assets/img/demo/two-young-female-friends-embracing-on-the-street-in-dubrovnik.webp',
            '/assets/img/demo/happy-woman-enjoying-sunlight-on-face-during-vacation.webp'
        ],
        flightVendors: ['Uzbekistan Airways'],
        status: 'Active',
        isPopular: true
    }
];

let bookings = [];

// Helper to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// --- API IMPLEMENTATION ---

export const authAPI = {
    login: async (credentials) => {
        await delay();
        // Always succeed
        return { ...MOCK_USER, token: 'mock_token_xyz' };
    },
    register: async (userData) => {
        await delay();
        return { ...MOCK_USER, ...userData, token: 'mock_token_xyz' };
    },
    getProfile: async () => {
        await delay();
        return MOCK_USER;
    }
};

export const toursAPI = {
    getAll: async (filters = '') => {
        await delay();
        // Return filtered tours if needed, but for now just return all
        // Packages.jsx expects an array, not { data: ... }
        return MOCK_TOURS;
    },
    getById: async (id) => {
        await delay();
        const tour = MOCK_TOURS.find(t => t._id === id);
        if (!tour) throw new Error('Tour not found');
        return tour;
    },
    create: async (tourData) => {
        await delay();
        const newTour = { ...tourData, _id: `tour_${Date.now()}` };
        MOCK_TOURS.push(newTour);
        return newTour;
    },
    update: async (id, tourData) => {
        await delay();
        const index = MOCK_TOURS.findIndex(t => t._id === id);
        if (index === -1) throw new Error('Tour not found');
        MOCK_TOURS[index] = { ...MOCK_TOURS[index], ...tourData };
        return MOCK_TOURS[index];
    },
    delete: async (id) => {
        await delay();
        const index = MOCK_TOURS.findIndex(t => t._id === id);
        if (index !== -1) MOCK_TOURS.splice(index, 1);
        return { message: 'Deleted successfully' };
    }
};

export const bookingsAPI = {
    create: async (bookingData) => {
        await delay();
        const newBooking = {
            ...bookingData,
            _id: `book_${Date.now()}`,
            user: MOCK_USER,
            createdAt: new Date()
        };
        bookings.push(newBooking);
        return newBooking;
    },
    getAll: async () => {
        await delay();
        return bookings;
    },
    getMy: async () => {
        await delay();
        return bookings; // In mock mode, admin sees "my" bookings as all bookings or empty
    },
    getById: async (id) => {
        await delay();
        return bookings.find(b => b._id === id);
    },
    updateStatus: async (id, status) => {
        await delay();
        const booking = bookings.find(b => b._id === id);
        if (booking) booking.status = status;
        return booking;
    }
};

export const usersAPI = {
    getAll: async () => {
        await delay();
        return [MOCK_USER];
    },
    getPending: async () => {
        await delay();
        return [];
    },
    approve: async (id) => {
        await delay(300);
        return { message: 'Approved' };
    },
    delete: async (id) => {
        await delay(300);
        return { message: 'Deleted' };
    }
};

export default { authAPI, toursAPI, bookingsAPI, usersAPI };
