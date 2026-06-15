'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Search, Send, Sparkles, MessageSquare, ChevronRight, User, FileText, ShieldCheck, Activity, CreditCard, Clock, FileCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface FAQ {
  q: string;
  a: string;
  category: string;
}

const FAQ_LIST: FAQ[] = [
  {
    q: "What is InsuraCore?",
    a: "InsuraCore is a modern digital insurance claim management platform that connects policyholders, expert assessors, and administrators in a single source of truth.",
    category: "General"
  },
  {
    q: "Who can use this platform?",
    a: "InsuraCore supports three primary roles: Customers (to purchase policies and file claims), Assessors (to review and verify claims), and Admins (to manage policies, users, and payout settlements).",
    category: "General"
  },
  {
    q: "How do I purchase a policy?",
    a: "Log in as a Customer, navigate to the 'Policies' tab, select a policy that matches your requirements, review details, and click 'Purchase' to activate it instantly.",
    category: "Policies"
  },
  {
    q: "What payment methods are supported?",
    a: "The platform supports all major digital payment methods including credit/debit cards, net banking, UPI, and bank transfers.",
    category: "Policies"
  },
  {
    q: "How long is a policy active?",
    a: "Standard policies are active for exactly one year (12 months) from the date of purchase, unless specified otherwise in the policy terms.",
    category: "Policies"
  },
  {
    q: "Can I cancel a policy after purchasing?",
    a: "Yes, policies can be cancelled within a 15-day free-look period for a full refund, provided no claims have been filed against it.",
    category: "Policies"
  },
  {
    q: "How do I file a claim?",
    a: "Go to your Customer Dashboard, click 'File a Claim', select the active policy, enter claim details (title, description, amount), and upload supporting documents.",
    category: "Claims"
  },
  {
    q: "What documents are needed to file a claim?",
    a: "Typically, medical bills/prescriptions are required for health claims, and damage reports/repair estimates are required for property or auto claims.",
    category: "Claims"
  },
  {
    q: "Can I upload multiple documents to a single claim?",
    a: "Yes, you can upload multiple supporting receipt items, invoices, and diagnostic documents during the multi-step claim filing process.",
    category: "Claims"
  },
  {
    q: "Who reviews my submitted claims?",
    a: "All claims are routed to certified independent Assessors. They examine your documents, verify coverage terms, and make the final approval decision.",
    category: "Claims"
  },
  {
    q: "How long does the assessment process take?",
    a: "Assessments are typically reviewed and finalized within 24 to 48 hours after all required documents have been uploaded.",
    category: "Claims"
  },
  {
    q: "What are the possible claim statuses?",
    a: "Claims progress through: SUBMITTED (awaiting assessor), UNDER REVIEW (being evaluated), APPROVED (verified for payout), REJECTED (disallowed), and PAID (settlement disbursed).",
    category: "Claims"
  },
  {
    q: "How are claim settlements calculated?",
    a: "Assessors verify claim invoices against your policy coverage. The settlement amount cannot exceed the maximum policy coverage limit.",
    category: "Claims"
  },
  {
    q: "How do I receive my settlement payout?",
    a: "Once approved by an assessor, an Admin releases the payment. The funds are disbursed directly to your registered bank account via bank transfer.",
    category: "Claims"
  },
  {
    q: "Is there a limit to the number of claims I can file?",
    a: "You can file multiple claims under a single policy, provided the total approved amount does not exceed the policy's maximum coverage limit.",
    category: "Claims"
  },
  {
    q: "What is the role of an Assessor?",
    a: "Assessors verify the authenticity of uploaded claim documents, check policy validity, assess damages, and set the approved settlement amount.",
    category: "Roles"
  },
  {
    q: "What can an Administrator do on the platform?",
    a: "Admins manage user accounts, register assessors, create and configure new policies, assign assessors to claims, and release payouts.",
    category: "Roles"
  },
  {
    q: "How do I update my profile details?",
    a: "Navigate to the Profile tab in your dashboard to update your registered name, phone number, or email address.",
    category: "Account"
  },
  {
    q: "What should I do if my claim is rejected?",
    a: "If a claim is rejected, check the assessor notes for feedback. You can file a new claim with corrected invoices or supporting documents.",
    category: "Claims"
  },
  {
    q: "Are there any hidden fees or charges?",
    a: "No, InsuraCore is fully transparent. All premiums and maximum coverage limits are displayed upfront before you purchase.",
    category: "Policies"
  },
  {
    q: "How does the platform ensure data security?",
    a: "We employ strict role-based access control, TLS data transit encryption, and secure AES-256 encryption at rest for files.",
    category: "Security"
  },
  {
    q: "What is the system uptime guarantee?",
    a: "InsuraCore offers a 99.9% uptime SLA, ensuring claimants and assessors can access the portal and process claims at any time.",
    category: "Security"
  },
  {
    q: "Can I purchase policies for my family members?",
    a: "Yes, you can purchase multiple policy instances under your account, specifying the beneficiary details for each policy instance.",
    category: "Policies"
  },
  {
    q: "How do notifications work on the platform?",
    a: "You receive in-app notifications whenever your claim status changes, when an assessor is assigned, or when a payment is released.",
    category: "Account"
  },
  {
    q: "Is there a mobile application available?",
    a: "The InsuraCore web portal is fully responsive and optimized for mobile browsers, acting as a Progressive Web App (PWA) on mobile screens.",
    category: "General"
  }
];

const CATEGORIES = ["All", "Policies", "Claims", "Roles", "Security"];

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "How do I file a claim?",
  "Show policy coverage",
  "Claim settlement timeline",
  "Required documents",
];

export function AIAssistantFAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: "Hi! I am the InsuraCore AI Copilot. How can I assist you with your insurance needs today?",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [typedQuery, setTypedQuery] = useState('');
  const [inputSuggestions, setInputSuggestions] = useState<FAQ[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistory.length > 1 || isTyping) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  const handleInputChange = (val: string) => {
    setTypedQuery(val);
    if (!val.trim()) {
      setInputSuggestions([]);
      return;
    }
    const matches = FAQ_LIST.filter(faq => 
      faq.q.toLowerCase().includes(val.toLowerCase()) || 
      faq.a.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 3);
    setInputSuggestions(matches);
  };

  const submitQuestion = (question: string, answer?: string) => {
    if (isTyping) return;

    const userMsg: ChatMessage = { sender: 'user', text: question, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let responseText = answer;
      if (!responseText) {
        // Fallback matching
        const words = question.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        let bestMatch: FAQ | null = null;
        let maxScore = 0;
        
        for (const faq of FAQ_LIST) {
          let score = 0;
          const qLower = faq.q.toLowerCase();
          const aLower = faq.a.toLowerCase();
          for (const w of words) {
            if (qLower.includes(w)) score += 3;
            else if (aLower.includes(w)) score += 1;
          }
          if (score > maxScore) { maxScore = score; bestMatch = faq; }
        }

        if (bestMatch && maxScore > 0) {
          responseText = `Based on your question:\n\n**${bestMatch.q}**\n\n${bestMatch.a}`;
        } else {
          responseText = "I couldn't find an exact match in my knowledge base. Please try selecting a topic on the right, or rephrasing your question!";
        }
      }

      const botMsg: ChatMessage = { sender: 'bot', text: responseText, timestamp: new Date() };
      setChatHistory(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleQuestionClick = (faq: FAQ) => {
    submitQuestion(faq.q, faq.a);
  };

  const handleInputSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedQuery.trim() || isTyping) return;
    const query = typedQuery.trim();
    setTypedQuery('');
    setInputSuggestions([]);
    submitQuestion(query);
  };

  const filteredFAQs = FAQ_LIST.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
      {/* LEFT: AI Chat Assistant */}
      <div className="lg:col-span-4 flex flex-col border border-[var(--color-base-800)] bg-[var(--color-base-950)] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] min-h-[550px] max-h-[600px] relative">
        <div className="px-5 py-4 bg-gradient-to-r from-[var(--color-base-900)] to-[var(--color-base-950)] border-b border-[var(--color-base-800)] flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[oklch(72%_0.20_230)]/10 blur-[30px] -mt-10 -mr-10" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] flex items-center justify-center text-[oklch(72%_0.20_230)] shadow-inner">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                AI Assistant
                <span className="inline-flex w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
              </h4>
              <span className="text-[11px] text-[var(--color-base-400)] font-medium">Online & Ready</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[linear-gradient(to_bottom,var(--color-base-950),var(--color-base-900))]">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 max-w-[90%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              {msg.sender === 'bot' ? (
                <div className="w-8 h-8 rounded-full bg-[var(--color-base-900)] border border-[oklch(28%_0.10_230)] flex items-center justify-center text-[oklch(72%_0.20_230)] flex-shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[oklch(72%_0.20_230)] flex items-center justify-center text-white flex-shrink-0 font-bold border border-[oklch(58%_0.22_230)] shadow-sm mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className={`p-3.5 text-[13px] leading-relaxed shadow-md backdrop-blur-sm ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-[oklch(58%_0.22_230)] to-[oklch(45%_0.20_230)] text-white border-transparent rounded-2xl rounded-tr-sm' 
                    : 'bg-white/[0.03] text-[var(--color-base-200)] border border-[var(--color-base-800)] rounded-2xl rounded-tl-sm whitespace-pre-line'
                }`}
              >
                {msg.text}
                <div className={`mt-1.5 text-[9px] select-none flex items-center gap-1 ${msg.sender === 'user' ? 'text-indigo-100 justify-end' : 'text-[var(--color-base-500)] justify-start'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-[var(--color-base-900)] border border-[oklch(28%_0.10_230)] flex items-center justify-center text-[oklch(72%_0.20_230)] flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white/[0.03] border border-[var(--color-base-800)] rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[oklch(72%_0.20_230)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[oklch(72%_0.20_230)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[oklch(72%_0.20_230)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {chatHistory.length === 1 && !isTyping && (
            <div className="pt-4 flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((qq, idx) => (
                <button
                  key={idx}
                  onClick={() => submitQuestion(qq)}
                  className="px-3 py-1.5 rounded-full bg-[var(--color-base-900)] border border-[var(--color-base-800)] hover:border-[oklch(72%_0.20_230)] text-[11px] text-[var(--color-base-300)] hover:text-white transition-all text-left"
                >
                  {qq}
                </button>
              ))}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="relative p-4 bg-[var(--color-base-950)] border-t border-[var(--color-base-800)]">
          {inputSuggestions.length > 0 && (
            <div className="absolute bottom-[calc(100%+8px)] left-4 right-4 bg-[var(--color-base-900)] border border-[var(--color-base-700)] rounded-xl shadow-2xl overflow-hidden z-20">
              <div className="px-3 py-2 bg-[var(--color-base-950)] text-[10px] uppercase font-bold text-[oklch(72%_0.20_230)] border-b border-[var(--color-base-800)]">
                Suggested
              </div>
              {inputSuggestions.map((faq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { handleQuestionClick(faq); setTypedQuery(''); setInputSuggestions([]); }}
                  className="w-full text-left px-3 py-2.5 text-xs text-[var(--color-base-300)] hover:text-white hover:bg-[var(--color-base-800)] transition-colors border-b border-[var(--color-base-850)] last:border-0"
                >
                  {faq.q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleInputSubmit} className="relative flex items-center">
            <input
              type="text"
              value={typedQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Ask anything..."
              className="w-full bg-[var(--color-base-900)] border border-[var(--color-base-800)] focus:border-[oklch(72%_0.20_230)] focus:outline-none focus:ring-1 focus:ring-[oklch(72%_0.20_230)] rounded-full pl-4 pr-12 py-3 text-xs sm:text-sm text-white placeholder-[var(--color-base-500)] transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!typedQuery.trim() || isTyping}
              className={`absolute right-1.5 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                typedQuery.trim() && !isTyping
                  ? 'bg-gradient-to-r from-[oklch(58%_0.22_230)] to-[oklch(45%_0.20_230)] text-white shadow-lg'
                  : 'bg-transparent text-[var(--color-base-600)] cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* CENTER: AI Suggested Actions */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 px-1">
          <Sparkles className="w-4 h-4 text-[oklch(72%_0.20_230)]" />
          Suggested Actions
        </h3>
        <div className="grid grid-cols-2 gap-3 flex-1 content-start">
          {[
            { icon: FileText, title: "File a Claim", desc: "Start a new claim process", href: "/login", gradient: "from-blue-500/20 to-blue-500/0", iconColor: "text-blue-400" },
            { icon: ShieldCheck, title: "Browse Policies", desc: "View available coverage", href: "/policies", gradient: "from-purple-500/20 to-purple-500/0", iconColor: "text-purple-400" },
            { icon: Activity, title: "Track Settlement", desc: "Check payout status", href: "/login", gradient: "from-emerald-500/20 to-emerald-500/0", iconColor: "text-emerald-400" },
            { icon: Clock, title: "Check Claim Status", desc: "Review ongoing claims", href: "/login", gradient: "from-orange-500/20 to-orange-500/0", iconColor: "text-orange-400" },
            { icon: CreditCard, title: "Coverage Calc", desc: "Estimate premium costs", href: "/policies", gradient: "from-pink-500/20 to-pink-500/0", iconColor: "text-pink-400" },
            { icon: FileCheck, title: "Doc Checklist", desc: "Required documents", href: "/login", gradient: "from-sky-500/20 to-sky-500/0", iconColor: "text-sky-400" },
          ].map((action, idx) => (
            <Link 
              key={idx} 
              href={action.href}
              className="group flex flex-col p-4 rounded-2xl bg-[var(--color-base-900)] border border-[var(--color-base-800)] hover:border-[var(--color-base-600)] transition-all hover:-translate-y-1 shadow-lg relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <action.icon className={`w-6 h-6 mb-3 relative z-10 ${action.iconColor} group-hover:scale-110 transition-transform`} />
              <h4 className="text-[13px] font-bold text-white relative z-10">{action.title}</h4>
              <span className="text-[10px] text-[var(--color-base-400)] mt-1 relative z-10 leading-tight">{action.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* RIGHT: Knowledge Center */}
      <div className="lg:col-span-4 flex flex-col border border-[var(--color-base-800)] bg-[var(--color-base-950)] rounded-2xl overflow-hidden min-h-[550px] max-h-[600px] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="p-5 border-b border-[var(--color-base-800)] bg-gradient-to-br from-[var(--color-base-900)] to-[var(--color-base-950)]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-[oklch(72%_0.20_230)]" />
            Knowledge Base
          </h3>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-base-500)]" />
            <input 
              type="text" 
              placeholder="Search guides & FAQs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-base-950)] border border-[var(--color-base-800)] focus:border-[oklch(72%_0.20_230)] focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--color-base-200)] placeholder-[var(--color-base-500)] transition-all shadow-inner"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border transition-all ${
                  selectedCategory === category
                    ? 'bg-[oklch(18%_0.08_230)] text-[oklch(72%_0.20_230)] border-[oklch(28%_0.10_230)] shadow-inner'
                    : 'bg-transparent text-[var(--color-base-400)] border-[var(--color-base-800)] hover:bg-[var(--color-base-900)] hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-[linear-gradient(to_bottom,var(--color-base-950),var(--color-base-900))]">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, idx) => (
              <button
                key={idx}
                onClick={() => handleQuestionClick(faq)}
                disabled={isTyping}
                className="w-full text-left p-3.5 rounded-xl bg-[var(--color-base-900)] border border-[var(--color-base-800)] hover:border-[oklch(72%_0.20_230)] hover:bg-[oklch(18%_0.08_230)] transition-all group flex items-start gap-3 justify-between shadow-sm"
              >
                <div className="space-y-1.5 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-base-800)] text-[var(--color-base-300)] uppercase font-bold tracking-wider group-hover:bg-[oklch(28%_0.10_230)] group-hover:text-[oklch(72%_0.20_230)] transition-colors">
                      {faq.category}
                    </span>
                  </div>
                  <h5 className="text-[13px] font-semibold text-[var(--color-base-100)] group-hover:text-white transition-colors leading-snug">
                    {faq.q}
                  </h5>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-base-600)] group-hover:text-[oklch(72%_0.20_230)] group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
              </button>
            ))
          ) : (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm text-[var(--color-base-500)]">No guides match your search.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} 
                className="text-xs text-[oklch(72%_0.20_230)] hover:underline font-bold"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
