import React, { useEffect, useState } from 'react';
import { DollarSign, Package, Eye, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Stat {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  trend: 'up' | 'down';
}

interface Sale {
  id: string;
  product: string;
  customer: string;
  amount: number;
  date: string;
}

const StatCard: React.FC<Stat> = ({ title, value, change, icon: Icon }) => (
  <Card className="flex flex-col items-start p-6 shadow-card border border-gray-200 dark:border-gray-700 text-white bg-gradient-to-r from-indigo-500 to-purple-600 text-left">
    <div className="flex items-center mb-2">
      <Icon className="h-6 w-6 mr-2 text-white" />
      <span className="text-lg font-semibold text-white">{title}</span>
    </div>
    <div className="text-2xl font-bold mb-1 text-white">{value}</div>
    <div className="text-sm text-white">{change}</div>
  </Card>
);

export function Dashboard() {
  const { user } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatsAndSales = async () => {
      setLoading(true);
      await fetchProducts();
      const { data: revenueData } = await supabase.rpc('get_total_revenue');
      const { data: salesData } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setStats([
        {
          title: 'Total Revenue',
          value: (revenueData && typeof revenueData === 'number') ? `$${revenueData}` : '-',
          change: '',
          icon: DollarSign,
          trend: 'up'
        },
        {
          title: 'Products',
          value: products.length.toString(),
          change: '',
          icon: Package,
          trend: 'up'
        },
      ]);
      setRecentSales((salesData as Sale[]) || []);
      setLoading(false);
    };
    fetchStatsAndSales();
  }, [fetchProducts, products.length]);

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)] mb-1">Welcome back, {user?.firstName || user?.email || 'Loading...'}!</h1>
            <p className="text-[var(--text-sec)] text-base">Your platform overview and quick actions</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button onClick={() => navigate('/products/upload')} className="w-full sm:w-auto bg-primary-500 hover:bg-primary-500/90 text-white">Create Product</Button>
            <Button variant="outline" onClick={() => navigate('/pages/builder/new')} className="w-full sm:w-auto border-[var(--border)] text-[var(--text)]">New Landing Page</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <Card className="col-span-full text-center p-8 bg-white dark:bg-white border border-[var(--border)] text-[var(--text)]">Loading stats...</Card>
          ) : stats.length === 0 ? (
            <Card className="col-span-full text-center p-8 bg-white dark:bg-white border border-[var(--border)] text-[var(--text)]">No stats available.</Card>
          ) : (
            stats.map((stat, index) => (
              <StatCard
                key={index}
                {...stat}
                bgClass={index < 2 ? 'bg-gray-100 dark:bg-gray-800' : undefined}
              />
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Sales */}
          <Card className="p-0 overflow-hidden bg-white dark:bg-white border border-[var(--border)] text-[var(--text)]">
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
              <h3 className="text-lg font-semibold text-[var(--text)]">Recent Sales</h3>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {loading ? (
                <div className="p-8 text-center">Loading sales...</div>
              ) : recentSales.length === 0 ? (
                <div className="p-8 text-center">No recent sales.</div>
              ) : (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 px-6 py-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text)]">{sale.product}</p>
                      <p className="text-xs sm:text-sm text-[var(--text-sec)]">{sale.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--text)]">{sale.amount ? `$${sale.amount}` : '-'}</p>
                      <p className="text-xs sm:text-sm text-[var(--text-sec)]">{sale.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-0 overflow-hidden flex flex-col justify-between bg-white dark:bg-white border border-[var(--border)] text-[var(--text)]">
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
              <h3 className="text-lg font-semibold text-[var(--text)]">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-4">
              <Button
                variant="outline"
                className="w-full flex items-center justify-between px-4 py-2 bg-primary-500 hover:bg-primary-500/90 text-white border-primary-500 dark:border-primary-500 transition-colors"
                onClick={() => navigate('/products/upload')}
              >
                <span className="flex items-center gap-2"><Package className="h-5 w-5 text-white" /> Upload New Product</span>
                <span className="text-white">→</span>
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-between px-4 py-2 bg-primary-500 hover:bg-primary-500/90 text-white border-primary-500 dark:border-primary-500 transition-colors"
                onClick={() => navigate('/pages/builder/new')}
              >
                <span className="flex items-center gap-2"><Eye className="h-5 w-5 text-white" /> Create Landing Page</span>
                <span className="text-white">→</span>
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-between px-4 py-2 bg-primary-500 hover:bg-primary-500/90 text-white border-primary-500 dark:border-primary-500 transition-colors"
                onClick={() => navigate('/marketplace')}
              >
                <span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-white" /> View Marketplace</span>
                <span className="text-white">→</span>
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-between px-4 py-2 bg-primary-500 hover:bg-primary-500/90 text-white border-primary-500 dark:border-primary-500 transition-colors"
                onClick={() => navigate('/wallet')}
              >
                <span className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-white" /> Withdraw Funds</span>
                <span className="text-white">→</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;