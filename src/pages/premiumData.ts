export const books = [
  { bookNo: 'BK-1258', game: 'Sunday Lucky', tickets: 200, sold: 182, amount: '₹18,200', assigned: '24 May 2025', status: 'Active' },
  { bookNo: 'BK-1257', game: 'Big Bumper', tickets: 300, sold: 264, amount: '₹26,400', assigned: '24 May 2025', status: 'Active' },
  { bookNo: 'BK-1256', game: 'Million Day', tickets: 200, sold: 151, amount: '₹15,100', assigned: '23 May 2025', status: 'Active' },
  { bookNo: 'BK-1255', game: 'Dear Morning', tickets: 200, sold: 128, amount: '₹12,800', assigned: '23 May 2025', status: 'Settling' },
  { bookNo: 'BK-1254', game: 'Royal Night', tickets: 100, sold: 93, amount: '₹9,300', assigned: '22 May 2025', status: 'Active' },
];

export const games = [
  { name: 'Sunday Lucky', drawDate: '25 May 2025', status: 'Live', books: 25, sold: 18, prize: '₹5,00,000' },
  { name: 'Big Bumper', drawDate: '27 May 2025', status: 'Live', books: 18, sold: 12, prize: '₹10,00,000' },
  { name: 'Million Day', drawDate: '28 May 2025', status: 'Upcoming', books: 20, sold: 8, prize: '₹7,50,000' },
  { name: 'Dear Morning', drawDate: '29 May 2025', status: 'Upcoming', books: 15, sold: 6, prize: '₹2,00,000' },
  { name: 'Royal Night', drawDate: '30 May 2025', status: 'Upcoming', books: 10, sold: 4, prize: '₹3,00,000' },
];

export const sales = [
  { receipt: 'SL-9024', bookNo: 'BK-1258', game: 'Sunday Lucky', tickets: 20, amount: '₹2,000', date: '24 May 2025', mode: 'UPI' },
  { receipt: 'SL-9023', bookNo: 'BK-1257', game: 'Big Bumper', tickets: 30, amount: '₹3,000', date: '24 May 2025', mode: 'Cash' },
  { receipt: 'SL-9022', bookNo: 'BK-1256', game: 'Million Day', tickets: 15, amount: '₹1,500', date: '23 May 2025', mode: 'UPI' },
  { receipt: 'SL-9021', bookNo: 'BK-1255', game: 'Dear Morning', tickets: 25, amount: '₹2,500', date: '23 May 2025', mode: 'Cash' },
  { receipt: 'SL-9020', bookNo: 'BK-1254', game: 'Royal Night', tickets: 10, amount: '₹1,000', date: '22 May 2025', mode: 'Card' },
];

export const results = [
  { game: 'Sunday Lucky', drawNo: 'DR-4521', winning: '458921', prize: '₹5,00,000', date: '24 May 2025', status: 'Published' },
  { game: 'Big Bumper', drawNo: 'DR-4520', winning: '882104', prize: '₹10,00,000', date: '23 May 2025', status: 'Published' },
  { game: 'Million Day', drawNo: 'DR-4519', winning: '220784', prize: '₹7,50,000', date: '22 May 2025', status: 'Published' },
  { game: 'Dear Morning', drawNo: 'DR-4518', winning: '764019', prize: '₹2,00,000', date: '21 May 2025', status: 'Verified' },
];

export const agent = {
  name: 'Rajesh Kumar',
  id: 'AGT1254',
  location: 'Jaipur Zone',
  phone: '+91 98765 43210',
  email: 'rajesh.agent@luckydraw.in',
  avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=160&q=80',
};
