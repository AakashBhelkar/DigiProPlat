import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Lock, 
  Zap, 
  Palette, 
  Code, 
  Cloud, 
  Headphones,
  Users,
  ShoppingCart,
  LayoutGrid,
  TrendingUp,
  Star,
  CheckCircle2,
  Sparkles,
  Target,
  BarChart3
} from "lucide-react";

// Using a placeholder image URL - you can replace this with your actual hero image
const heroImage = "https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1200";

export const HomeNew = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              DigiProPlat
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-muted-foreground hover:text-primary transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-muted-foreground hover:text-primary transition-colors">
                How it Works
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-muted-foreground hover:text-primary transition-colors">
                Testimonials
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </button>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="hidden md:inline-flex text-muted-foreground hover:text-primary" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-soft" asChild>
                <Link to="/register">Start Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-30"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
                <Lock className="w-4 h-4 mr-2" />
                Trusted by 10,000+ creators worldwide
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Sell Digital Products.{" "}
                <span className="text-primary" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Earn More Money.
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                The complete platform for creators to build, launch, and scale their digital product 
                business. Beautiful landing pages, secure payments, and powerful analytics - all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all shadow-glow hover:shadow-xl text-lg px-8 py-6"
                  onClick={() => scrollToSection('pricing')}
                >
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary/30 text-primary hover:bg-primary/10 text-lg px-8 py-6"
                  onClick={() => scrollToSection('how-it-works')}
                >
                  See How It Works
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>
                <span className="text-muted-foreground ml-2">4.9/5 from 2,000+ reviews</span>
              </div>
            </div>
            
            <div className={`relative ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <div className="absolute -inset-4 bg-gradient-primary rounded-3xl opacity-30 blur-3xl animate-glow"></div>
              <img 
                src={heroImage} 
                alt="Team collaboration" 
                className="relative rounded-3xl shadow-soft w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "50K+", label: "Products Sold" },
              { value: "95%", label: "Satisfaction" },
              { value: "$2M+", label: "Revenue Generated" }
            ].map((stat, index) => (
              <Card key={index} className="p-8 text-center bg-background border-border/50 hover:border-primary/40 transition-all hover:scale-105 shadow-soft">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-primary" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-60"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              FEATURES
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Everything You Need to <span className="text-primary" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Succeed</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you create, sell, and grow your digital product business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Built with React and optimized for performance. Launch in minutes, not months.",
                color: "text-primary"
              },
              {
                icon: Lock,
                title: "Bank-Level Security",
                description: "Enterprise-grade security with Supabase. Your data is encrypted and protected.",
                color: "text-primary"
              },
              {
                icon: Palette,
                title: "Beautiful Design",
                description: "Modern MUI components with customizable themes. Create stunning products.",
                color: "text-primary"
              },
              {
                icon: Code,
                title: "Developer Friendly",
                description: "Clean TypeScript code with full API access. Extend and customize freely.",
                color: "text-accent"
              },
              {
                icon: Cloud,
                title: "Cloud Native",
                description: "Fully hosted on Supabase. Scale effortlessly without infrastructure worries.",
                color: "text-accent"
              },
              {
                icon: Headphones,
                title: "24/7 Support",
                description: "Get help when you need it. Our team is always here for you.",
                color: "text-destructive"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="p-8 bg-background hover:bg-card border-border/50 hover:border-primary/40 transition-all hover:scale-105 hover:shadow-soft group"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color === 'text-primary' ? 'bg-primary/10' : feature.color === 'text-accent' ? 'bg-accent/10' : 'bg-destructive/10'}`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 bg-gradient-to-br from-card/50 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2 mb-6">
              SIMPLE PROCESS
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Get Started in <span className="text-primary" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>4 Easy Steps</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Launch your digital product business in minutes, not months
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: "1",
                icon: Users,
                title: "Sign Up Free",
                description: "Create your account in seconds. No credit card required."
              },
              {
                number: "2",
                icon: ShoppingCart,
                title: "Upload Products",
                description: "Add your digital products with our easy-to-use interface."
              },
              {
                number: "3",
                icon: LayoutGrid,
                title: "Build Pages",
                description: "Create beautiful landing pages with drag-and-drop builder."
              },
              {
                number: "4",
                icon: TrendingUp,
                title: "Start Selling",
                description: "Launch your store and start making money today."
              }
            ].map((step, index) => (
              <Card key={index} className="relative p-8 bg-background border-border/50 hover:border-primary/40 transition-all hover:scale-105 group shadow-soft">
                <div className="absolute -top-6 left-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-soft">
                    {step.number}
                  </div>
                </div>
                <div className="mt-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-accent/20 text-accent border-accent/30 px-4 py-2 mb-6">
              <Star className="w-4 h-4 mr-2" />
              TESTIMONIALS
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Loved by <span className="text-primary" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Thousands</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our amazing customers have to say about DigiProPlat
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Digital Creator",
                content: "DigiProPlat transformed my business. I went from zero to $10k/month in just 3 months. The platform is incredibly easy to use!",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Course Creator",
                content: "Best decision I ever made. The analytics and payment integration are seamless. Highly recommend to anyone selling digital products.",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "Designer",
                content: "The page builder is amazing! I can create professional landing pages without any coding. My conversion rate doubled!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-8 bg-background border-border/50 hover:border-primary/40 transition-all hover:scale-105 shadow-soft">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-lg mb-6 italic leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary"></div>
                  <div>
                    <div className="font-bold text-primary">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-gradient-to-br from-background to-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2 mb-6">
              PRICING
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Simple, <span className="text-primary" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Transparent Pricing</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that&apos;s right for you. Start free, upgrade anytime.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "Forever",
                description: "Perfect for getting started",
                features: [
                  "Up to 5 products",
                  "Basic analytics",
                  "Community support",
                  "Landing page builder",
                  "Payment integration"
                ],
                cta: "Get Started Free",
                highlighted: false
              },
              {
                name: "Professional",
                price: "$29",
                period: "/month",
                description: "For serious creators",
                badge: "MOST POPULAR",
                features: [
                  "Unlimited products",
                  "Advanced analytics",
                  "Priority support",
                  "Custom domain",
                  "AI-powered tools",
                  "White-label branding",
                  "Email marketing"
                ],
                cta: "Start 14-Day Trial",
                highlighted: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "Contact us",
                description: "For large teams",
                features: [
                  "Everything in Pro",
                  "Dedicated account manager",
                  "Custom integrations",
                  "SLA guarantee",
                  "Advanced security",
                  "Training & onboarding"
                ],
                cta: "Contact Sales",
                highlighted: false
              }
            ].map((plan, index) => (
              <Card 
                key={index} 
                className={`relative p-8 ${
                  plan.highlighted 
                    ? 'bg-gradient-to-br from-primary/15 to-accent/10 border-primary/60 shadow-soft scale-105' 
                    : 'bg-background border-border/50 shadow-soft'
                } hover:scale-105 transition-all`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-accent text-accent-foreground px-4 py-1">
                    {plan.badge}
                  </Badge>
                )}
                
                <div className="text-center mb-8">
                  <div className="text-muted-foreground mb-2">{plan.name}</div>
                  <div className="text-5xl font-bold mb-2">
                    <span className="text-primary" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{plan.price}</span>
                    <span className="text-lg text-muted-foreground ml-2">{plan.period}</span>
                  </div>
                  <div className="text-muted-foreground">{plan.description}</div>
                </div>
                
                <Button 
                  className={`w-full mb-8 ${
                    plan.highlighted 
                      ? 'bg-gradient-primary text-primary-foreground shadow-soft' 
                      : 'bg-card text-foreground'
                  }`}
                  size="lg"
                  asChild
                >
                  <Link to="/register">{plan.cta}</Link>
                </Button>
                
                <div className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-accent/20 text-accent border-accent/30 px-4 py-2 mb-6">
              FAQ
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Frequently Asked <span className="text-primary" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Questions</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about DigiProPlat
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "How quickly can I start selling?",
                a: "You can start selling within minutes! Sign up, upload your products, and create your first landing page. Our intuitive interface makes it incredibly easy."
              },
              {
                q: "What payment methods do you support?",
                a: "We support all major payment methods including credit cards, PayPal, Apple Pay, and Google Pay. Payments are processed securely through Stripe."
              },
              {
                q: "Can I use my own domain?",
                a: "Yes! Professional and Enterprise plans include custom domain support. You can use your own branded domain for a professional look."
              },
              {
                q: "Is there a transaction fee?",
                a: "The Starter plan has a 5% transaction fee. Professional and Enterprise plans have 0% transaction fees - you keep 100% of your earnings (minus payment processor fees)."
              },
              {
                q: "What kind of support do you offer?",
                a: "Starter plans get community support, Professional plans get priority email support, and Enterprise plans get dedicated account managers with 24/7 support."
              }
            ].map((faq, index) => (
              <Card key={index} className="p-8 bg-background border-border/50 hover:border-primary/40 transition-all shadow-soft">
                <h3 className="text-xl font-bold mb-4">{faq.q}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-primary-foreground">
              Ready to Start Selling?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/70">
              Join 10,000+ creators already growing their business with DigiProPlat
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-6 shadow-soft"
                onClick={() => scrollToSection('pricing')}
              >
                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground/20 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 text-lg px-8 py-6"
                onClick={() => scrollToSection('pricing')}
              >
                View Pricing
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/60">
              No credit card required • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-card/50 border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold mb-4 text-primary" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                DigiProPlat
              </div>
              <p className="text-muted-foreground mb-6">
                The complete platform for selling digital products. Start your journey today.
              </p>
              <p className="text-sm text-muted-foreground">
                © 2025 DigiProPlat. All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-foreground">Product</h4>
              <div className="space-y-3">
                <button onClick={() => scrollToSection('features')} className="block text-muted-foreground hover:text-primary transition-colors">Features</button>
                <button onClick={() => scrollToSection('pricing')} className="block text-muted-foreground hover:text-primary transition-colors">Pricing</button>
                <button onClick={() => scrollToSection('faq')} className="block text-muted-foreground hover:text-primary transition-colors">FAQ</button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-foreground">Company</h4>
              <div className="space-y-3">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">About</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Blog</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Careers</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-foreground">Resources</h4>
              <div className="space-y-3">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Documentation</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Help Center</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Contact</a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
                <a href="#" className="hover:text-primary transition-colors">Security</a>
              </div>
              <div className="flex items-center gap-4">
                <Target className="w-5 h-5 text-primary/60" />
                <BarChart3 className="w-5 h-5 text-primary/60" />
                <Sparkles className="w-5 h-5 text-accent/60" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
