import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';

export const Home = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans">
      {/* Header */}
      <header className="w-full max-w-screen-xl mx-auto flex items-center justify-between py-6 px-4 md:px-10 border-b border-gray-200 bg-white/90 sticky top-0 z-20">
        <span className="text-2xl font-extrabold tracking-tight text-blue-700">DigiProPlat</span>
        <nav className="hidden md:flex gap-8 text-gray-700 font-medium">
          <a href="#features" className="hover:text-blue-600">Features</a>
          <a href="#how" className="hover:text-blue-600">How it Works</a>
          <a href="#pricing" className="hover:text-blue-600">Pricing</a>
          <a href="#about" className="hover:text-blue-600">About</a>
        </nav>
        <div className="flex gap-3">
          <Link to="/login">
            <Button variant="outline" className="font-semibold px-6 py-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50">Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" className="font-semibold px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow">Start Free Trial</Button>
          </Link>
        </div>
      </header>
      {/* Hero Section */}
      <section className="w-full max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 px-4 pt-16 pb-12">
        <div className="flex-1 flex flex-col items-start">
          <span className="inline-block mb-4 px-4 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm">Reduce Churn by 60%+</span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            <span>Build, Launch, and </span>
            <span className="text-green-600">Grow</span>
            <span> with DigiProPlat</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-xl">
            A modern, type-safe platform to create, manage, and scale your digital products, landing pages, and more. Powered by Supabase, React, and the latest UI/UX best practices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register">
              <Button size="lg" variant="primary" className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white shadow">Start Free Trial</Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-gray-300 text-gray-700 bg-white hover:bg-gray-100">Watch Demo</Button>
          </div>
          <div className="flex gap-8 mt-8 text-center">
            <div>
              <div className="text-green-600 text-2xl font-bold">60%</div>
              <div className="text-xs text-gray-500">Faster Launch</div>
            </div>
            <div>
              <div className="text-blue-600 text-2xl font-bold">2.5x</div>
              <div className="text-xs text-gray-500">Productivity</div>
            </div>
            <div>
              <div className="text-orange-500 text-2xl font-bold">95%</div>
              <div className="text-xs text-gray-500">User Satisfaction</div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center gap-6">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white p-2">
            <img src="/screenshots/builder.png" alt="Builder Screenshot" className="w-full h-auto object-cover rounded-xl" />
          </div>
          {/* User-generated image card */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-blue-100 bg-white p-2 w-full max-w-xs">
            <img src="/images/user-generated.png" alt="User Generated" className="w-full h-auto object-cover rounded-xl" />
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="w-full max-w-screen-xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Powerful Features for <span className="text-blue-600">E-commerce Success</span></h2>
        <p className="text-center text-gray-600 mb-12">Comprehensive suite of tools designed to eliminate friction and boost your bottom line</p>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-start">
            <span className="mb-3 text-green-500 text-2xl">⚡</span>
            <h3 className="text-lg font-bold mb-1 text-gray-900">Instant Landing Pages</h3>
            <p className="text-gray-600">Create beautiful, high-converting landing pages in minutes with our drag-and-drop builder and AI-powered content tools.</p>
          </Card>
          <Card className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-start">
            <span className="mb-3 text-blue-500 text-2xl">🔒</span>
            <h3 className="text-lg font-bold mb-1 text-gray-900">Secure & Type-Safe</h3>
            <p className="text-gray-600">Built with Supabase and strict TypeScript for robust security, data integrity, and peace of mind.</p>
          </Card>
          <Card className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-start">
            <span className="mb-3 text-orange-400 text-2xl">🎨</span>
            <h3 className="text-lg font-bold mb-1 text-gray-900">Modern UI/UX</h3>
            <p className="text-gray-600">Enjoy a clean, accessible, and responsive interface powered by Shadcn UI and Tailwind CSS best practices.</p>
          </Card>
        </div>
      </section>
      {/* How It Works Section */}
      <section id="how" className="w-full max-w-screen-xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-4">How It <span className="text-green-600">Works</span></h2>
        <p className="text-center text-gray-600 mb-12">Simple 4-step process that integrates seamlessly with your workflow</p>
        <div className="grid md:grid-cols-4 gap-8">
          <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center">
            <span className="mb-2 text-blue-500 text-2xl">🛒</span>
            <h4 className="font-semibold mb-1 text-gray-900">Order Received</h4>
            <p className="text-gray-600 text-sm text-center">Customer places order on your platform.</p>
          </Card>
          <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center">
            <span className="mb-2 text-green-500 text-2xl">💬</span>
            <h4 className="font-semibold mb-1 text-gray-900">Auto-Confirmation</h4>
            <p className="text-gray-600 text-sm text-center">Instantly confirm orders via WhatsApp, SMS, email, or IVR.</p>
          </Card>
          <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center">
            <span className="mb-2 text-orange-400 text-2xl">📞</span>
            <h4 className="font-semibold mb-1 text-gray-900">Customer Confirms</h4>
            <p className="text-gray-600 text-sm text-center">Customer confirms order with a simple YES/NO reply or phone interaction.</p>
          </Card>
          <Card className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col items-center">
            <span className="mb-2 text-green-600 text-2xl">✅</span>
            <h4 className="font-semibold mb-1 text-gray-900">RTO Eliminated</h4>
            <p className="text-gray-600 text-sm text-center">Confirmed orders ship with confidence, unconfirmed orders get cancelled.</p>
          </Card>
        </div>
      </section>
      {/* Pricing Section */}
      <section id="pricing" className="w-full max-w-screen-xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent <span className="text-blue-600">Pricing</span></h2>
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <Card className="p-10 bg-white border border-gray-100 rounded-2xl shadow-md flex flex-col items-center">
            <h3 className="text-xl font-bold mb-2 text-blue-600">Free</h3>
            <div className="text-3xl font-extrabold mb-4 text-gray-900">$0</div>
            <ul className="mb-6 space-y-2 text-left w-full text-gray-600">
              <li>✔️ Unlimited landing pages</li>
              <li>✔️ AI content generator</li>
              <li>✔️ Analytics dashboard</li>
              <li>✔️ Community support</li>
            </ul>
            <Button variant="primary" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
          </Card>
          <Card className="p-10 bg-white border border-gray-100 rounded-2xl shadow-md flex flex-col items-center">
            <h3 className="text-xl font-bold mb-2 text-green-600">Pro</h3>
            <div className="text-3xl font-extrabold mb-4 text-gray-900">$29<span className="text-base font-normal text-gray-600">/mo</span></div>
            <ul className="mb-6 space-y-2 text-left w-full text-gray-600">
              <li>✔️ Everything in Free</li>
              <li>✔️ Custom domains</li>
              <li>✔️ Advanced integrations</li>
              <li>✔️ Priority support</li>
            </ul>
            <Button variant="outline" className="w-full border-green-600 text-green-600 bg-white hover:bg-green-50">Start Pro Trial</Button>
          </Card>
          <Card className="p-10 bg-white border border-gray-100 rounded-2xl shadow-md flex flex-col items-center">
            <h3 className="text-xl font-bold mb-2 text-orange-500">Enterprise</h3>
            <div className="text-3xl font-extrabold mb-4 text-gray-900">Contact</div>
            <ul className="mb-6 space-y-2 text-left w-full text-gray-600">
              <li>✔️ Everything in Pro</li>
              <li>✔️ Dedicated onboarding</li>
              <li>✔️ Custom SLAs</li>
              <li>✔️ Enterprise security</li>
            </ul>
            <Button variant="outline" className="w-full border-orange-500 text-orange-500 bg-white hover:bg-orange-50">Contact Sales</Button>
          </Card>
        </div>
      </section>
      {/* FAQ */}
      <section id="faq" className="w-full max-w-screen-md mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h4 className="font-semibold mb-2 text-gray-900">Is DigiProPlat really free?</h4>
            <p className="text-gray-700">Yes! You can use all core features for free. Upgrade to Pro or Enterprise for advanced capabilities.</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h4 className="font-semibold mb-2 text-gray-900">Can I use my own domain?</h4>
            <p className="text-gray-700">Absolutely. Pro and Enterprise plans support custom domains.</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h4 className="font-semibold mb-2 text-gray-900">Is my data secure?</h4>
            <p className="text-gray-700">Your data is protected with industry best practices, Supabase security, and strict TypeScript type safety.</p>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full py-10 px-4 border-t border-gray-200 bg-white text-center text-gray-500 mt-8">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold text-blue-700">DigiProPlat</span>
          <span>&copy; {new Date().getFullYear()} DigiProPlat. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-blue-600">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600">Terms of Service</a>
            <a href="#" className="hover:text-blue-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;