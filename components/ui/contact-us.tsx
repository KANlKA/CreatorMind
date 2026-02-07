'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Mail, MessageSquare, Send } from 'lucide-react';

interface ContactUsProps {
  title?: string;
  description?: string;
  className?: string;
}

export function ContactUs({
  title = "Get In Touch",
  description = "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
  className,
}: ContactUsProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = React.useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Reset after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-gray-400 text-lg">{description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <Button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-xl text-lg"
              >
                {status === 'sending' ? 'Sending...' : status === 'success' ? 'Message Sent!' : 'Send Message'}
                <Send className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <ContactCard
              icon={<Mail className="h-8 w-8 text-purple-400" />}
              title="Email Us"
              description="Get in touch via email"
              contact="support@creatormind.com"
            />
            <ContactCard
              icon={<MessageSquare className="h-8 w-8 text-green-400" />}
              title="Live Chat"
              description="Available Monday - Friday, 9am - 5pm EST"
              contact="Start a conversation"
            />

            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
              <h3 className="text-2xl font-bold text-white mb-3">Quick Response</h3>
              <p className="text-gray-300">
                We typically respond within 24 hours. For urgent inquiries, please email us directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  description,
  contact,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  contact: string;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      <p className="text-purple-400 font-medium">{contact}</p>
    </div>
  );
}
