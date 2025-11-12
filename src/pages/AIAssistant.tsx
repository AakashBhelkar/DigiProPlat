import React, { useState } from 'react';
import { Send, Sparkles, Lightbulb, TrendingUp, FileText, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you with product optimization, landing page copy, marketing strategies, and more. What would you like to work on today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    {
      icon: FileText,
      title: 'Optimize Product Description',
      description: 'Improve your product descriptions for better conversions',
      prompt: 'Help me optimize my product description for better conversions'
    },
    {
      icon: TrendingUp,
      title: 'Marketing Strategy',
      description: 'Get personalized marketing advice for your products',
      prompt: 'Create a marketing strategy for my digital products'
    },
    {
      icon: Lightbulb,
      title: 'Content Ideas',
      description: 'Generate content ideas for social media and blogs',
      prompt: 'Give me content ideas to promote my digital products'
    },
    {
      icon: Zap,
      title: 'Landing Page Copy',
      description: 'Create compelling copy for your landing pages',
      prompt: 'Write compelling copy for my product landing page'
    }
  ];

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(content),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = {
      'optimize': `Here are some tips to optimize your product description:

1. **Start with a compelling headline** - Use power words that grab attention
2. **Focus on benefits, not features** - Tell customers how your product solves their problems
3. **Use social proof** - Include testimonials or download numbers
4. **Create urgency** - Limited time offers or exclusive access
5. **Clear call-to-action** - Make it obvious what you want them to do

Would you like me to help you rewrite a specific product description?`,
      
      'marketing': `Here's a comprehensive marketing strategy for your digital products:

**1. Content Marketing**
- Create valuable blog posts related to your niche
- Share behind-the-scenes content on social media
- Offer free samples or mini-versions of your products

**2. Social Media Strategy**
- Focus on platforms where your audience is active
- Use visual content to showcase your products
- Engage with your community regularly

**3. Email Marketing**
- Build an email list with lead magnets
- Send regular newsletters with tips and product updates
- Create automated sequences for new subscribers

**4. Partnerships**
- Collaborate with other creators in your niche
- Guest post on relevant blogs
- Participate in online communities

Would you like me to elaborate on any of these strategies?`,
      
      'content': `Here are some content ideas to promote your digital products:

**Social Media Posts:**
- Before/after transformations using your products
- Quick tips related to your niche
- Customer success stories and testimonials
- Behind-the-scenes of your creation process

**Blog Content:**
- "How to" tutorials using your products
- Industry trends and insights
- Case studies of successful implementations
- Comparison guides

**Video Content:**
- Product demos and walkthroughs
- Time-lapse creation videos
- Customer interviews
- Educational content in your niche

**Email Content:**
- Weekly tips and tricks
- Exclusive previews of new products
- Customer spotlights
- Industry news roundups

Which type of content would you like to focus on first?`,
      
      'landing': `Here's a high-converting landing page structure:

**Headline:** "Transform Your [Problem] in Just [Time] with [Product Name]"

**Subheadline:** Expand on the main benefit and what makes your product unique.

**Hero Section:**
- Clear value proposition
- Professional product mockup
- Social proof (testimonials, download count)

**Features & Benefits:**
- List 3-5 key features with corresponding benefits
- Use icons or visuals to make it scannable

**Social Proof:**
- Customer testimonials with photos
- Reviews and ratings
- Download numbers or user count

**Pricing:**
- Clear pricing with any bonuses
- Money-back guarantee
- Limited-time offers if applicable

**FAQ Section:**
- Address common objections
- Technical requirements
- Refund policy

**Strong CTA:**
- Use action words like "Get Instant Access"
- Create urgency with limited-time offers
- Make the button stand out visually

Would you like me to help you write copy for any specific section?`
    };

    const input = userInput.toLowerCase();
    if (input.includes('optimize') || input.includes('description')) {
      return responses.optimize;
    } else if (input.includes('marketing') || input.includes('strategy')) {
      return responses.marketing;
    } else if (input.includes('content') || input.includes('ideas')) {
      return responses.content;
    } else if (input.includes('landing') || input.includes('copy')) {
      return responses.landing;
    } else {
      return `I'd be happy to help you with that! I can assist with:

- Product description optimization
- Marketing strategies
- Content creation ideas
- Landing page copywriting
- SEO optimization
- Pricing strategies
- Customer engagement tactics

What specific area would you like to focus on?`;
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
            <p className="text-sm text-gray-600">Get personalized advice for your digital products</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="bg-white border-b border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleQuickAction(action.prompt)}
                className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary/40 hover:bg-primary/10 transition-all text-left"
              >
                <div className="p-2 bg-primary/20 rounded-lg">
                  <action.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{action.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-primary/20' : 'bg-primary/20'}`}>
                  {message.type === 'user' ? (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-foreground">U</span>
                    </div>
                  ) : (
                    <Sparkles className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className={`p-4 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-primary-foreground/80' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary/20 rounded-full">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
              placeholder="Ask me anything about your digital products..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pr-12"
              disabled={isTyping}
            />
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isTyping}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};