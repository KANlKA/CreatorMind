'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

interface TestimonialSectionProps {
  title?: string;
  description?: string;
  testimonials: Testimonial[];
  className?: string;
}

export function TestimonialSection({
  title = "What Creators Are Saying",
  description = "Join thousands of creators who've transformed their content strategy",
  testimonials,
  className,
}: TestimonialSectionProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-400 text-lg">{description}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-5 w-5",
              i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
            )}
          />
        ))}
      </div>

      <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>

      <div className="flex items-center gap-3">
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
            {testimonial.name.charAt(0)}
          </div>
        )}
        <div>
          <div className="text-white font-semibold">{testimonial.name}</div>
          <div className="text-gray-400 text-sm">{testimonial.role}</div>
        </div>
      </div>
    </div>
  );
}
