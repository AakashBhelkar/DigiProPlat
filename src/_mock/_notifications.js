import { _mock } from './_mock';

// ----------------------------------------------------------------------

export const _notifications = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  title: _mock.postTitle(index),
  message: _mock.sentence(index),
  avatarUrl: _mock.image.avatar(index),
  type: ['order_placed', 'mail', 'chat_message', 'order_shipped', 'payment_done'][index],
  createdAt: _mock.time(index),
  isUnRead: index % 2 === 0,
}));

