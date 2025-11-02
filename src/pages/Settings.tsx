import React, { useState } from 'react';
import { User, CreditCard, Bell, Shield, Globe, Palette, Download } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    emailSales: true,
    emailMarketing: false,
    pushSales: true,
    pushMarketing: true
  });
  const [openAIApiKey, setOpenAIApiKey] = useState('');
  const [openAIModel, setOpenAIModel] = useState('gpt-4o');
  const [aiKeyStatus, setAiKeyStatus] = useState<'idle' | 'saving' | 'success' | 'error' | 'testing'>('idle');
  const [aiKeyError, setAiKeyError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const openAIModels = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4o', label: 'GPT-4o (Recommended)' }
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'domain', label: 'Domain', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'ai', label: 'AI & OpenAI', icon: Download },
  ];

  const handleProfileUpdate = (field: string, value: string) => {
    updateUser({ [field]: value });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and configuration</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {activeTab === 'profile' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        Change Avatar
                      </button>
                      <p className="text-sm text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={user?.firstName || ''}
                        onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={user?.lastName || ''}
                        onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={user?.username || ''}
                        onChange={(e) => handleProfileUpdate('username', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        onChange={(e) => handleProfileUpdate('email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Billing & Subscription</h3>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold capitalize">{user?.subscription.name} Plan</h4>
                        <p className="text-indigo-100">${user?.subscription.price}/month</p>
                      </div>
                      <button className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors">
                        Upgrade Plan
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Plan Features</h4>
                    <ul className="space-y-2">
                      {user?.subscription.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Usage</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Products</span>
                          <span>2 / {user?.subscription.limits.products === -1 ? '∞' : user?.subscription.limits.products}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Storage</span>
                          <span>2.1 GB / {user?.subscription.limits.storage} GB</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '21%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Method</h4>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-6 w-6 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</p>
                          <p className="text-xs text-gray-500">Expires 12/25</p>
                        </div>
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Email Notifications</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Sales notifications</span>
                          <p className="text-xs text-gray-500">Get notified when someone purchases your products</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailSales}
                          onChange={(e) => setNotifications(prev => ({ ...prev, emailSales: e.target.checked }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Marketing emails</span>
                          <p className="text-xs text-gray-500">Receive tips, updates, and promotional content</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailMarketing}
                          onChange={(e) => setNotifications(prev => ({ ...prev, emailMarketing: e.target.checked }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Push Notifications</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Sales notifications</span>
                          <p className="text-xs text-gray-500">Real-time notifications for new sales</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.pushSales}
                          onChange={(e) => setNotifications(prev => ({ ...prev, pushSales: e.target.checked }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Marketing updates</span>
                          <p className="text-xs text-gray-500">Platform updates and feature announcements</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.pushMarketing}
                          onChange={(e) => setNotifications(prev => ({ ...prev, pushMarketing: e.target.checked }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Password</h4>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                      Change Password
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">SMS Authentication</p>
                        <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">KYC Status</h4>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        user?.kycStatus === 'verified' 
                          ? 'bg-green-100 text-green-800' 
                          : user?.kycStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user?.kycStatus}
                      </span>
                      {user?.kycStatus !== 'verified' && (
                        <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                          Complete Verification
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'domain' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Custom Domain</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Current Domain</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-mono text-gray-900">{user?.username}.digiproplat.com</p>
                      <p className="text-xs text-gray-500 mt-1">Your default subdomain</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Custom Domain</h4>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="yourdomain.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        Connect Domain
                      </button>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-900 mb-2">Setup Instructions</h5>
                      <ol className="text-sm text-blue-700 space-y-1">
                        <li>1. Add a CNAME record pointing to digiproplat.com</li>
                        <li>2. Wait for DNS propagation (up to 24 hours)</li>
                        <li>3. We'll automatically provision SSL certificate</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Appearance</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Theme</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {['Light', 'Dark', 'Auto'].map((theme) => (
                        <button
                          key={theme}
                          className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                        >
                          <div className={`w-full h-16 rounded mb-2 ${
                            theme === 'Light' ? 'bg-white border' :
                            theme === 'Dark' ? 'bg-gray-900' : 'bg-gradient-to-r from-white to-gray-900'
                          }`}></div>
                          <p className="text-sm font-medium text-gray-900">{theme}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Brand Colors</h4>
                    <div className="grid grid-cols-6 gap-3">
                      {['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'].map((color) => (
                        <button
                          key={color}
                          className="w-12 h-12 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                          style={{ backgroundColor: color }}
                        ></button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">AI & OpenAI Integration</h3>
                <div className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="openai-api-key">
                      OpenAI API Key
                    </label>
                    <div className="relative">
                      <input
                        id="openai-api-key"
                        type={showApiKey ? 'text' : 'password'}
                        value={openAIApiKey}
                        onChange={e => setOpenAIApiKey(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12"
                        placeholder="sk-..."
                        aria-label="OpenAI API Key"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
                        tabIndex={0}
                        aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                        onClick={() => setShowApiKey(v => !v)}
                      >
                        {showApiKey ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Your key is encrypted and never shared. Required for AI features.</p>
                    {!openAIApiKey && <p className="text-xs text-red-500 mt-1">No API key set. Please add your OpenAI key to use AI features.</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="openai-model">
                      OpenAI Model
                    </label>
                    <select
                      id="openai-model"
                      value={openAIModel}
                      onChange={e => setOpenAIModel(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      aria-label="OpenAI Model"
                    >
                      {openAIModels.map(model => (
                        <option key={model.value} value={model.value}>{model.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Choose your preferred model for AI features.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
                      disabled={aiKeyStatus !== 'idle'}
                      aria-label="Save OpenAI API Key"
                      onClick={async () => {
                        setAiKeyStatus('saving'); setAiKeyError(null);
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          const accessToken = session?.access_token;
                          if (!accessToken) throw new Error('Not authenticated');
                          const res = await fetch('/functions/v1/ai-key-management/save-key', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify({ apiKey: openAIApiKey, model: openAIModel })
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Failed to save key');
                          setAiKeyStatus('success');
                          toast.success('API key saved successfully!');
                          setTimeout(() => setAiKeyStatus('idle'), 2000);
                        } catch (e) {
                          setAiKeyStatus('error');
                          setAiKeyError((e as Error).message);
                          toast.error(e.message || 'Failed to save API key');
                          setTimeout(() => setAiKeyStatus('idle'), 3000);
                        }
                      }}
                    >
                      {aiKeyStatus === 'saving' && <span className="loader mr-2" aria-label="Saving..." />}
                      Save Key
                    </button>
                    <button
                      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center"
                      disabled={aiKeyStatus !== 'idle'}
                      aria-label="Remove OpenAI API Key"
                      onClick={async () => {
                        setAiKeyStatus('saving'); setAiKeyError(null);
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          const accessToken = session?.access_token;
                          if (!accessToken) throw new Error('Not authenticated');
                          const res = await fetch('/functions/v1/ai-key-management/remove-key', {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${accessToken}`,
                            },
                          });
                          if (!res.ok) throw new Error('Failed to remove key');
                          setOpenAIApiKey('');
                          setAiKeyStatus('success');
                          toast.success('API key removed.');
                          setTimeout(() => setAiKeyStatus('idle'), 2000);
                        } catch (e) {
                          setAiKeyStatus('error');
                          setAiKeyError((e as Error).message);
                          toast.error((e as Error).message || 'Failed to remove API key');
                          setTimeout(() => setAiKeyStatus('idle'), 3000);
                        }
                      }}
                    >
                      {aiKeyStatus === 'saving' && <span className="loader mr-2" aria-label="Removing..." />}
                      Remove Key
                    </button>
                    <button
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                      disabled={aiKeyStatus !== 'idle'}
                      aria-label="Test OpenAI API Key"
                      onClick={async () => {
                        setAiKeyStatus('testing'); setAiKeyError(null);
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          const accessToken = session?.access_token;
                          if (!accessToken) throw new Error('Not authenticated');
                          const res = await fetch('/functions/v1/ai-key-management/test-key', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify({ model: openAIModel })
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Test failed');
                          setAiKeyStatus('success');
                          toast.success('API key is valid!');
                          setTimeout(() => setAiKeyStatus('idle'), 2000);
                        } catch (e) {
                          setAiKeyStatus('error');
                          setAiKeyError((e as Error).message);
                          toast.error((e as Error).message || 'API key test failed');
                          setTimeout(() => setAiKeyStatus('idle'), 3000);
                        }
                      }}
                    >
                      {aiKeyStatus === 'testing' && <span className="loader mr-2" aria-label="Testing..." />}
                      Test Key
                    </button>
                  </div>
                  {aiKeyStatus === 'success' && (
                    <div className="text-green-600 text-sm" role="status">Success!</div>
                  )}
                  {aiKeyStatus === 'error' && aiKeyError && (
                    <div className="text-red-600 text-sm" role="alert">{aiKeyError}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Add this CSS for the loader spinner (or use a shadcn/ui spinner if available):
.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #6366F1;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
*/