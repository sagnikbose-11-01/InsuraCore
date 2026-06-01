'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Search, Send, Sparkles, MessageSquare, ChevronRight, User } from 'lucide-react';

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

const CATEGORIES = ["All", "General", "Policies", "Claims", "Roles", "Security", "Account"];

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

export function AIAssistantFAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: "Hi! I am the InsuraCore AI Agent. Type a question in the input below, or choose one from the list to start chatting!",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [typedQuery, setTypedQuery] = useState('');
  const [inputSuggestions, setInputSuggestions] = useState<FAQ[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat history
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    ).slice(0, 4);
    setInputSuggestions(matches);
  };

  const handleQuestionClick = (faq: FAQ) => {
    if (isTyping) return;

    // Add user question
    const userMsg: ChatMessage = {
      sender: 'user',
      text: faq.q,
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate bot typing response
    setTimeout(() => {
      const botMsg: ChatMessage = {
        sender: 'bot',
        text: faq.a,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleInputSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedQuery.trim() || isTyping) return;

    const query = typedQuery.trim();
    setTypedQuery('');
    setInputSuggestions([]);

    const userMsg: ChatMessage = {
      sender: 'user',
      text: query,
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      // Find closest match based on word frequency scoring
      const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
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
        if (score > maxScore) {
          maxScore = score;
          bestMatch = faq;
        }
      }

      let responseText = "";
      if (bestMatch && maxScore > 0) {
        responseText = `Based on your question, here is what I found:\n\n**${bestMatch.q}**\n\n${bestMatch.a}`;
      } else {
        responseText = "I couldn't find an exact match for that question in my 25 FAQs. Please select one of the topics on the right, or try searching for keywords like 'claims', 'policies', 'verification', or 'security'.";
      }

      const botMsg: ChatMessage = {
        sender: 'bot',
        text: responseText,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 850);
  };

  const filteredFAQs = FAQ_LIST.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-stretch max-w-7xl mx-auto">
      {/* LEFT: AI Chat Terminal Console */}
      <div className="lg:col-span-6 flex flex-col border border-[var(--color-base-800)] bg-[var(--color-base-950)] rounded-2xl overflow-hidden shadow-2xl min-h-[500px] max-h-[600px] relative">
        {/* Chat Header */}
        <div className="px-5 py-4 bg-[var(--color-base-900)] border-b border-[var(--color-base-800)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[oklch(18%_0.08_230)] border border-[oklch(28%_0.10_230)] flex items-center justify-center text-[var(--color-brand-400)]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--color-base-100)] flex items-center gap-1.5">
                InsuraCore AI Agent
                <span className="inline-flex w-2 h-2 rounded-full bg-[var(--color-success-400)] animate-pulse" />
              </h4>
              <span className="text-[11px] text-[var(--color-base-500)]">Knowledge Base Assistant</span>
            </div>
          </div>
          <span className="text-xs bg-[var(--color-base-800)] text-[var(--color-base-300)] px-2.5 py-1 rounded-md font-medium border border-[var(--color-base-750)]">
            25 FAQs Loaded
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {chatHistory.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {msg.sender === 'bot' ? (
                <div className="w-7 h-7 rounded-full bg-[var(--color-base-900)] border border-[var(--color-base-800)] flex items-center justify-center text-[var(--color-brand-400)] flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[var(--color-brand-900)] flex items-center justify-center text-white flex-shrink-0 text-xs font-bold border border-[var(--color-brand-700)]">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}

              <div 
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed border ${
                  msg.sender === 'user' 
                    ? 'bg-[var(--color-brand-500)] text-white border-transparent shadow-lg rounded-tr-none' 
                    : 'bg-[var(--color-base-900)] text-[var(--color-base-300)] border-[var(--color-base-800)] rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.text}
                <div className="mt-1 text-[9px] text-[var(--color-base-500)] text-right select-none">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-7 h-7 rounded-full bg-[var(--color-base-900)] border border-[var(--color-base-800)] flex items-center justify-center text-[var(--color-brand-400)] flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[var(--color-base-900)] border border-[var(--color-base-800)] rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-400)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-400)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-400)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar with Suggestions */}
        <div className="relative p-4 bg-[var(--color-base-900)] border-t border-[var(--color-base-800)] flex flex-col gap-2">
          {/* Autocomplete Suggestions Popover */}
          {inputSuggestions.length > 0 && (
            <div className="absolute bottom-[calc(100%+4px)] left-4 right-4 bg-[var(--color-base-950)] border border-[var(--color-base-800)] rounded-xl shadow-2xl overflow-hidden z-20 divide-y divide-[var(--color-base-850)]">
              <div className="px-3.5 py-2 bg-[var(--color-base-900)] text-[10px] uppercase font-bold text-[var(--color-brand-400)] tracking-wider flex items-center justify-between">
                <span>Suggested Questions</span>
                <span className="text-[9px] text-[var(--color-base-500)] lowercase normal-case">click to ask</span>
              </div>
              {inputSuggestions.map((faq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleQuestionClick(faq);
                    setTypedQuery('');
                    setInputSuggestions([]);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-[var(--color-base-300)] hover:text-white hover:bg-[var(--color-base-900)] transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{faq.q}</span>
                  <ChevronRight className="w-3 h-3 text-[var(--color-base-600)] group-hover:text-[var(--color-brand-400)] flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleInputSubmit} className="flex items-center gap-3 w-full">
            <input
              type="text"
              value={typedQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Type a question or query here..."
              className="flex-1 bg-[var(--color-base-950)] border border-[var(--color-base-850)] focus:border-[var(--color-brand-500)] focus:outline-none px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-[var(--color-base-200)] placeholder-[var(--color-base-600)] transition-colors"
            />
            <button
              type="submit"
              disabled={!typedQuery.trim() || isTyping}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                typedQuery.trim() && !isTyping
                  ? 'bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] shadow-lg'
                  : 'bg-[var(--color-base-800)] text-[var(--color-base-500)] cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: Questions Explorer list */}
      <div className="lg:col-span-6 flex flex-col border border-[var(--color-base-800)] bg-[var(--color-base-900)] rounded-2xl overflow-hidden min-h-[500px] max-h-[600px]">
        {/* Search & Filter Header */}
        <div className="p-5 border-b border-[var(--color-base-800)] space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-base-500)]" />
            <input 
              type="text" 
              placeholder="Search 25 frequently asked questions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-base-950)] border border-[var(--color-base-800)] focus:border-[var(--color-brand-500)] focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[var(--color-base-200)] placeholder-[var(--color-base-600)] transition-colors"
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  selectedCategory === category
                    ? 'bg-[var(--color-brand-500)] text-white border-transparent shadow-md'
                    : 'bg-[var(--color-base-950)] text-[var(--color-base-400)] border-[var(--color-base-800)] hover:text-[var(--color-base-200)]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Questions list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, idx) => (
              <button
                key={idx}
                onClick={() => handleQuestionClick(faq)}
                disabled={isTyping}
                className="w-full text-left p-3.5 rounded-xl bg-[var(--color-base-950)] border border-[var(--color-base-850)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-base-900)] transition-all group flex items-start gap-3 justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-brand-400)] tracking-wider">
                      {faq.category}
                    </span>
                  </div>
                  <h5 className="text-xs sm:text-sm font-semibold text-[var(--color-base-200)] group-hover:text-white transition-colors leading-snug">
                    {faq.q}
                  </h5>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--color-base-600)] group-hover:text-[var(--color-brand-400)] group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" />
              </button>
            ))
          ) : (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm text-[var(--color-base-500)]">No matching questions found.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} 
                className="text-xs text-[var(--color-brand-400)] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
