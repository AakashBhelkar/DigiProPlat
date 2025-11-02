import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Download, Upload, CreditCard, Ban as Bank, Calendar, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: string;
  type: 'sale' | 'withdrawal' | 'refund' | 'deposit';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  date: string;
  productTitle?: string;
}

export const Wallet: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'withdraw'>('overview');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [walletBalance, setWalletBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData: () => Promise<void> = async () => {
      setLoading(true);
      // Fetch wallet balances from Supabase (replace with your actual queries)
      // Example: fetch from a 'wallets' table or aggregate from 'transactions'
      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .single();
      if (walletData && typeof walletData === 'object') {
        setWalletBalance((walletData as { balance?: number }).balance || 0);
        setPendingBalance((walletData as { pending?: number }).pending || 0);
        setTotalEarnings((walletData as { total_earnings?: number }).total_earnings || 0);
      } else {
        setWalletBalance(0);
        setPendingBalance(0);
        setTotalEarnings(0);
      }
      // Fetch transactions
      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      if (Array.isArray(txs)) {
        setTransactions(txs as Transaction[]);
      } else {
        setTransactions([]);
      }
      setLoading(false);
    };
    fetchWalletData();
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale': return TrendingUp;
      case 'withdrawal': return Download;
      case 'refund': return Upload;
      case 'deposit': return DollarSign;
      default: return DollarSign;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    // Implement withdrawal logic here
    alert(`Withdrawal request of $${withdrawAmount} submitted successfully!`);
    setWithdrawAmount('');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      {/* Responsive Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600 text-sm sm:text-base">Manage your earnings and withdrawals</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-xs sm:text-sm">Available Balance</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">${walletBalance.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-xs sm:text-sm">Pending Balance</p>
              <p className="text-xl sm:text-2xl font-bold text-white">${pendingBalance.toFixed(2)}</p>
            </div>
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <p className="text-xs sm:text-sm text-white mt-2">Available in 3-5 days</p>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-xs sm:text-sm">Total Earnings</p>
              <p className="text-xl sm:text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <p className="text-xs sm:text-sm text-white mt-2">+12.5% this month</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex flex-row space-x-4 px-4 sm:px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'transactions', label: 'Transactions' },
              { id: 'withdraw', label: 'Withdraw' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'transactions' | 'withdraw')}
                className={`py-3 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="p-6 text-center">Loading transactions...</div>
                    ) : transactions.length === 0 ? (
                      <div className="p-6 text-center">No transactions found.</div>
                    ) : (
                      transactions.slice(0, 5).map((transaction) => {
                      const Icon = getTransactionIcon(transaction.type);
                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white rounded-full">
                              <Icon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-900">{transaction.description}</p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(transaction.date))} ago
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                              <p className={`text-xs sm:text-sm font-semibold ${getTransactionColor(transaction.type, transaction.amount)}`}>
                              {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('withdraw')}
                      className="w-full flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Download className="h-5 w-5 text-indigo-600" />
                        <span className="text-xs sm:text-sm font-medium">Withdraw Funds</span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-green-600" />
                        <span className="text-xs sm:text-sm font-medium">Payment Methods</span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Download className="h-5 w-5 text-purple-600" />
                        <span className="text-xs sm:text-sm font-medium">Download Statement</span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">All Transactions</h3>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs sm:text-sm">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
              </div>
              
              <div className="space-y-2">
                {loading ? (
                  <div className="p-6 text-center">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="p-6 text-center">No transactions found.</div>
                ) : (
                  transactions.map((transaction, index) => {
                  const Icon = getTransactionIcon(transaction.type);
                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-900">{transaction.description}</p>
                          {transaction.productTitle && (
                            <p className="text-xs text-gray-500">Product: {transaction.productTitle}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()} at {new Date(transaction.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                        <div className="text-right mt-2 sm:mt-0">
                          <p className={`text-xs sm:text-sm font-semibold ${getTransactionColor(transaction.type, transaction.amount)}`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="max-w-md space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Withdraw Funds</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Transfer your earnings to your preferred payment method</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                      placeholder="0.00"
                      max={walletBalance}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Available: ${walletBalance.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Method
                  </label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                  >
                    <option value="bank">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="stripe">Stripe</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Bank className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-blue-900">Withdrawal Information</h4>
                      <p className="text-xs sm:text-sm text-blue-700 mt-1">
                        Withdrawals typically take 3-5 business days to process. A small processing fee may apply.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > walletBalance}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  Request Withdrawal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};