import { _mock } from './_mock';

// ----------------------------------------------------------------------

export const _contacts = [...Array(20)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  email: _mock.email(index),
  avatarUrl: _mock.image.avatar(index),
  role: _mock.role(index),
  address: _mock.fullAddress(index),
  phoneNumber: _mock.phoneNumber(index),
  company: _mock.companyNames(index),
  status: (index % 2 && 'online') || (index % 3 && 'alway') || 'offline',
  lastActivity: _mock.time(index),
}));

