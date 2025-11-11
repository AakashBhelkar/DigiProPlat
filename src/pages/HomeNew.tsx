import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Stack,
  Paper,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  alpha,
  Divider,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ArrowForward,
  CheckCircle,
  Speed,
  Security,
  Palette,
  Code,
  Cloud,
  TrendingUp,
  People,
  Star,
  ShoppingCart,
  Dashboard,
  ExpandMore,
  Rocket,
  AutoAwesome,
  Support,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);
const MotionPaper = motion.create(Paper);

export const HomeNew: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '50K+', label: 'Products Sold' },
    { value: '95%', label: 'Satisfaction' },
    { value: '$2M+', label: 'Revenue Generated' },
  ];

  const features = [
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Lightning Fast',
      description: 'Built with React and optimized for performance. Launch in minutes, not months.',
      color: theme.palette.primary.main,
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Bank-Level Security',
      description: 'Enterprise-grade security with Supabase. Your data is encrypted and protected.',
      color: theme.palette.success.main,
    },
    {
      icon: <Palette sx={{ fontSize: 40 }} />,
      title: 'Beautiful Design',
      description: 'Modern MUI components with customizable themes. Create stunning products.',
      color: theme.palette.secondary.main,
    },
    {
      icon: <Code sx={{ fontSize: 40 }} />,
      title: 'Developer Friendly',
      description: 'Clean TypeScript code with full API access. Extend and customize freely.',
      color: theme.palette.warning.main,
    },
    {
      icon: <Cloud sx={{ fontSize: 40 }} />,
      title: 'Cloud Native',
      description: 'Fully hosted on Supabase. Scale effortlessly without infrastructure worries.',
      color: theme.palette.info.main,
    },
    {
      icon: <Support sx={{ fontSize: 40 }} />,
      title: '24/7 Support',
      description: 'Get help when you need it. Our team is always here for you.',
      color: theme.palette.error.main,
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Sign Up Free',
      description: 'Create your account in seconds. No credit card required.',
      icon: <People />,
    },
    {
      number: '2',
      title: 'Upload Products',
      description: 'Add your digital products with our easy-to-use interface.',
      icon: <ShoppingCart />,
    },
    {
      number: '3',
      title: 'Build Pages',
      description: 'Create beautiful landing pages with drag-and-drop builder.',
      icon: <Dashboard />,
    },
    {
      number: '4',
      title: 'Start Selling',
      description: 'Launch your store and start making money today.',
      icon: <TrendingUp />,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Digital Creator',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: 'DigiProPlat transformed my business. I went from zero to $10k/month in just 3 months. The platform is incredibly easy to use!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Course Creator',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: 'Best decision I ever made. The analytics and payment integration are seamless. Highly recommend to anyone selling digital products.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Designer',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      content: 'The page builder is amazing! I can create professional landing pages without any coding. My conversion rate doubled!',
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'Forever',
      description: 'Perfect for getting started',
      features: [
        'Up to 5 products',
        'Basic analytics',
        'Community support',
        'Landing page builder',
        'Payment integration',
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'outlined' as const,
      popular: false,
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      description: 'For serious creators',
      features: [
        'Unlimited products',
        'Advanced analytics',
        'Priority support',
        'Custom domain',
        'AI-powered tools',
        'White-label branding',
        'Email marketing',
      ],
      buttonText: 'Start 14-Day Trial',
      buttonVariant: 'contained' as const,
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'Contact us',
      description: 'For large teams',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'Advanced security',
        'Training & onboarding',
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outlined' as const,
      popular: false,
    },
  ];

  const faqs = [
    {
      question: 'Is DigiProPlat really free to start?',
      answer: 'Yes! Our Starter plan is completely free forever. You can upgrade anytime as your business grows.',
    },
    {
      question: 'What payment methods do you support?',
      answer: 'We integrate with Stripe, supporting all major credit cards, Apple Pay, Google Pay, and more.',
    },
    {
      question: 'Can I use my own domain?',
      answer: 'Absolutely! Professional and Enterprise plans include custom domain support.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! We use enterprise-grade security with Supabase, including encryption at rest and in transit.',
    },
    {
      question: 'Can I migrate from another platform?',
      answer: 'Yes! We offer free migration assistance for Professional and Enterprise customers.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee. If you are not satisfied, we will refund you, no questions asked.',
    },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1 }}>
            <Typography
              variant="h5"
              fontWeight={900}
              sx={{
                flexGrow: { xs: 1, md: 0 },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              DigiProPlat
            </Typography>

            {/* Desktop Navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 4 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  sx={{ color: 'text.primary', fontWeight: 600 }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Desktop Actions */}
            <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button component={Link} to="/login" variant="outlined">
                Login
              </Button>
              <Button component={Link} to="/register" variant="contained" endIcon={<ArrowForward />}>
                Start Free
              </Button>
            </Stack>

            {/* Mobile Menu Button */}
            <IconButton
              sx={{ display: { xs: 'block', md: 'none' } }}
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 280, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={700}>Menu</Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton onClick={() => scrollToSection(item.href)}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <Button component={Link} to="/login" variant="outlined" fullWidth>
              Login
            </Button>
            <Button component={Link} to="/register" variant="contained" fullWidth>
              Start Free
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 16 },
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Chip
                  icon={<Rocket />}
                  label="Trusted by 10,000+ creators worldwide"
                  color="primary"
                  sx={{ mb: 3, fontWeight: 600 }}
                />
                <Typography
                  variant="h1"
                  fontWeight={900}
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                    lineHeight: 1.1,
                    mb: 3,
                    letterSpacing: '-1px',
                  }}
                >
                  Sell Digital Products.{' '}
                  <Box
                    component="span"
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Earn More Money.
                  </Box>
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                  The complete platform for creators to build, launch, and scale their digital product business.
                  Beautiful landing pages, secure payments, and powerful analytics - all in one place.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={4}>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                    }}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => scrollToSection('#how-it-works')}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                    }}
                  >
                    See How It Works
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Rating value={5} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    4.9/5 from 2,000+ reviews
                  </Typography>
                </Stack>
              </MotionBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -20,
                      left: -20,
                      right: 20,
                      bottom: 20,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
                      borderRadius: 4,
                      zIndex: -1,
                    },
                  }}
                >
                  <Paper
                    elevation={8}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      component="img"
                      src="https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="Dashboard Preview"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: 2,
                      }}
                    />
                  </Paper>
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <MotionPaper
                elevation={0}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h3" fontWeight={900} color="primary.main" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={600}>
                  {stat.label}
                </Typography>
              </MotionPaper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box id="features" sx={{ py: 12, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="xl">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{ textAlign: 'center', mb: 8 }}
          >
            <Chip
              icon={<AutoAwesome />}
              label="FEATURES"
              color="primary"
              sx={{ mb: 2, fontWeight: 700 }}
            />
            <Typography variant="h2" fontWeight={900} gutterBottom>
              Everything You Need to{' '}
              <Box component="span" color="primary.main">
                Succeed
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth="md" mx="auto">
              Powerful features designed to help you create, sell, and grow your digital product business
            </Typography>
          </MotionBox>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  sx={{
                    height: '100%',
                    p: 4,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      borderColor: feature.color,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: alpha(feature.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box id="how-it-works" sx={{ py: 12 }}>
        <Container maxWidth="xl">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{ textAlign: 'center', mb: 8 }}
          >
            <Chip
              label="SIMPLE PROCESS"
              color="secondary"
              sx={{ mb: 2, fontWeight: 700 }}
            />
            <Typography variant="h2" fontWeight={900} gutterBottom>
              Get Started in{' '}
              <Box component="span" color="secondary.main">
                4 Easy Steps
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth="md" mx="auto">
              Launch your digital product business in minutes, not months
            </Typography>
          </MotionBox>

          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <MotionCard
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  sx={{
                    height: '100%',
                    p: 4,
                    textAlign: 'center',
                    border: `2px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 900,
                    }}
                  >
                    {step.number}
                  </Box>
                  <Box
                    sx={{
                      mt: 4,
                      mb: 2,
                      color: 'primary.main',
                      display: 'flex',
                      justifyContent: 'center',
                      '& svg': { fontSize: 48 },
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box id="testimonials" sx={{ py: 12, bgcolor: alpha(theme.palette.secondary.main, 0.02) }}>
        <Container maxWidth="xl">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{ textAlign: 'center', mb: 8 }}
          >
            <Chip
              icon={<Star />}
              label="TESTIMONIALS"
              color="warning"
              sx={{ mb: 2, fontWeight: 700 }}
            />
            <Typography variant="h2" fontWeight={900} gutterBottom>
              Loved by{' '}
              <Box component="span" color="secondary.main">
                Thousands
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth="md" mx="auto">
              See what our amazing customers have to say about DigiProPlat
            </Typography>
          </MotionBox>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  sx={{
                    height: '100%',
                    p: 4,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                    "{testimonial.content}"
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={testimonial.avatar} sx={{ width: 48, height: 48 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Stack>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box id="pricing" sx={{ py: 12 }}>
        <Container maxWidth="xl">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{ textAlign: 'center', mb: 8 }}
          >
            <Chip
              label="PRICING"
              color="primary"
              sx={{ mb: 2, fontWeight: 700 }}
            />
            <Typography variant="h2" fontWeight={900} gutterBottom>
              Simple, Transparent{' '}
              <Box component="span" color="primary.main">
                Pricing
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth="md" mx="auto">
              Choose the plan that's right for you. Start free, upgrade anytime.
            </Typography>
          </MotionBox>

          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  sx={{
                    height: '100%',
                    p: 4,
                    border: plan.popular
                      ? `2px solid ${theme.palette.primary.main}`
                      : `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    position: 'relative',
                    bgcolor: plan.popular ? alpha(theme.palette.primary.main, 0.02) : 'background.paper',
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="MOST POPULAR"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontWeight: 700,
                      }}
                    />
                  )}
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {plan.name}
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={0.5} mb={1}>
                    <Typography variant="h3" fontWeight={900}>
                      {plan.price}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {plan.period}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mb={4}>
                    {plan.description}
                  </Typography>
                  <Button
                    component={Link}
                    to="/register"
                    variant={plan.buttonVariant}
                    fullWidth
                    size="large"
                    sx={{ mb: 4, py: 1.5, fontWeight: 700 }}
                  >
                    {plan.buttonText}
                  </Button>
                  <Stack spacing={2}>
                    {plan.features.map((feature, idx) => (
                      <Stack key={idx} direction="row" spacing={1} alignItems="center">
                        <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                        <Typography variant="body2">{feature}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box id="faq" sx={{ py: 12, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        <Container maxWidth="md">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{ textAlign: 'center', mb: 8 }}
          >
            <Chip
              label="FAQ"
              color="info"
              sx={{ mb: 2, fontWeight: 700 }}
            />
            <Typography variant="h2" fontWeight={900} gutterBottom>
              Frequently Asked{' '}
              <Box component="span" color="primary.main">
                Questions
              </Box>
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Everything you need to know about DigiProPlat
            </Typography>
          </MotionBox>

          {faqs.map((faq, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Accordion
                sx={{
                  mb: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px !important',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6" fontWeight={700}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </MotionBox>
          ))}
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box
        sx={{
          py: 12,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Typography variant="h2" fontWeight={900} gutterBottom>
              Ready to Start Selling?
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Join 10,000+ creators already growing their business with DigiProPlat
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  py: 2,
                  px: 5,
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.9),
                  },
                }}
              >
                Start Your Free Trial
              </Button>
              <Button
                onClick={() => scrollToSection('#pricing')}
                variant="outlined"
                size="large"
                sx={{
                  py: 2,
                  px: 5,
                  borderColor: 'white',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                  },
                }}
              >
                View Pricing
              </Button>
            </Stack>
            <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
              No credit card required • Cancel anytime • 30-day money-back guarantee
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 6,
          bgcolor: 'background.paper',
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" fontWeight={900} gutterBottom>
                DigiProPlat
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                The complete platform for selling digital products. Start your journey today.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} DigiProPlat. All rights reserved.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Product
              </Typography>
              <Stack spacing={1}>
                <Button onClick={() => scrollToSection('#features')} sx={{ justifyContent: 'flex-start', p: 0, color: 'text.secondary' }}>
                  Features
                </Button>
                <Button onClick={() => scrollToSection('#pricing')} sx={{ justifyContent: 'flex-start', p: 0, color: 'text.secondary' }}>
                  Pricing
                </Button>
                <Button onClick={() => scrollToSection('#faq')} sx={{ justifyContent: 'flex-start', p: 0, color: 'text.secondary' }}>
                  FAQ
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Company
              </Typography>
              <Stack spacing={1}>
                <Button sx={{ justifyContent: 'flex-start', p: 0, color: 'text.secondary' }}>
                  About
                </Button>
                <Button sx={{ justifyContent: 'flex-start', p: 0, color: 'text.secondary' }}>
                  Blog
                </Button>
                <Button sx={{ justifyContent: 'flex-start', p: 0, color: 'text.secondary' }}>
                  Careers
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Resources
              </Typography>
              <Stack spacing={1}>
                <Button sx={{ justifyContent: 'flex-start', p: 0, color: 'text.secondary' }}>
                  Documentation
                </Button>
                <Button sx={{ justifyContent: 'flex-start', p: 0, color: 'text.secondary' }}>
                  Help Center
                </Button>
                <Button sx={{ justifyContent: 'flex-start', p: 0, color: 'text.secondary' }}>
                  Contact
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Legal
              </Typography>
              <Stack spacing={1}>
                <Button sx={{ justifyContent: 'flex-start', p: 0, color: 'text.secondary' }}>
                  Privacy
                </Button>
                <Button sx={{ justifyContent: 'flex-start', p: 0, color: 'text.secondary' }}>
                  Terms
                </Button>
                <Button sx={{ justifyContent: 'flex-start', p: 0, color: 'text.secondary' }}>
                  Security
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default HomeNew;
