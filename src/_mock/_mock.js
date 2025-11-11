import { CONFIG } from '../config-global';

// ----------------------------------------------------------------------

const { assetURL } = CONFIG.site;

// Simple mock data generator
const _id = [...Array(100)].map((_, i) => `id-${i + 1}`);
const _firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank'];
const _lastNames = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];
const _fullNames = _firstNames.flatMap(fn => _lastNames.map(ln => `${fn} ${ln}`));
const _emails = _fullNames.map((name, i) => `${name.toLowerCase().replace(' ', '.')}@example.com`);
const _roles = ['Admin', 'User', 'Manager', 'Editor', 'Viewer'];
const _companyNames = ['Acme Corp', 'Tech Solutions', 'Digital Inc', 'Global Systems', 'Future Tech'];
const _countryNames = ['USA', 'UK', 'Canada', 'Australia', 'Germany'];
const _phoneNumbers = [...Array(100)].map((_, i) => `+1-555-${String(i).padStart(4, '0')}`);
const _fullAddress = [...Array(100)].map((_, i) => `${i + 1} Main St, City ${i + 1}`);
const _sentences = [
  'Lorem ipsum dolor sit amet',
  'Consectetur adipiscing elit',
  'Sed do eiusmod tempor incididunt',
  'Ut labore et dolore magna',
  'Aliqua enim ad minim veniam',
];
const _postTitles = [
  'New Product Launch',
  'System Update',
  'Maintenance Notice',
  'Feature Announcement',
  'Security Alert',
];
const _booleans = [...Array(100)].map((_, i) => i % 2 === 0);
const _prices = [...Array(100)].map((_, i) => (i + 1) * 10);
const _nativeS = [...Array(100)].map((_, i) => i + 1);
const _nativeM = [...Array(100)].map((_, i) => (i + 1) * 10);
const _nativeL = [...Array(100)].map((_, i) => (i + 1) * 100);

// Time helper
const fSub = ({ days = 0, hours = 0 }) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

export const _mock = {
  id: (index) => _id[index % _id.length],
  time: (index) => fSub({ days: index, hours: index }),
  boolean: (index) => _booleans[index % _booleans.length],
  role: (index) => _roles[index % _roles.length],
  email: (index) => _emails[index % _emails.length],
  phoneNumber: (index) => _phoneNumbers[index % _phoneNumbers.length],
  fullAddress: (index) => _fullAddress[index % _fullAddress.length],
  firstName: (index) => _firstNames[index % _firstNames.length],
  lastName: (index) => _lastNames[index % _lastNames.length],
  fullName: (index) => _fullNames[index % _fullNames.length],
  companyNames: (index) => _companyNames[index % _companyNames.length],
  countryNames: (index) => _countryNames[index % _countryNames.length],
  sentence: (index) => _sentences[index % _sentences.length],
  postTitle: (index) => _postTitles[index % _postTitles.length],
  number: {
    price: (index) => _prices[index % _prices.length],
    nativeS: (index) => _nativeS[index % _nativeS.length],
    nativeM: (index) => _nativeM[index % _nativeM.length],
    nativeL: (index) => _nativeL[index % _nativeL.length],
  },
  image: {
    cover: (index) => `${assetURL || ''}/assets/images/cover/cover-${(index % 5) + 1}.webp`,
    avatar: (index) => `${assetURL || ''}/assets/images/avatar/avatar-${(index % 5) + 1}.webp`,
    travel: (index) => `${assetURL || ''}/assets/images/travel/travel-${(index % 5) + 1}.webp`,
    course: (index) => `${assetURL || ''}/assets/images/course/course-${(index % 5) + 1}.webp`,
    company: (index) => `${assetURL || ''}/assets/images/company/company-${(index % 5) + 1}.webp`,
    product: (index) => `${assetURL || ''}/assets/images/m-product/product-${(index % 5) + 1}.webp`,
    portrait: (index) => `${assetURL || ''}/assets/images/portrait/portrait-${(index % 5) + 1}.webp`,
  },
};

