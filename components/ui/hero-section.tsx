'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  title?: string | React.ReactNode;
  subtitle?: string;
  description?: string;
  primaryCTA?: {
    label: string;
    href: string;
  };
  secondaryCTA?: {
    label: string;
    href: string;
  };
  note?: string;
  className?: string;
}

export function HeroSection({
  title = "Turn Your Channel Data Into Your Competitive Advantage",
  subtitle,
  description = "Stop guessing what to create. Let your data tell you what your audience actually wants.",
  primaryCTA,
  secondaryCTA,
  className,
}: HeroSectionProps) {
  return (
    <div className={cn("text-center max-w-2xl mx-auto", className)}>
      {/* Subtitle */}
      {subtitle && (
        <div className="inline-block mb-4 px-4 py-2 bg-purple-600/20 border border-purple-500/50 rounded-full">
          <span className="text-purple-300 text-sm font-medium">
            {subtitle}
          </span>
        </div>
      )}

      {/* Title */}
      {typeof title === 'string' ? (
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>
      ) : (
        title
      )}

      {/* Description */}
      {description && (
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          {description}
        </p>
      )}

      {/* CTAs (only render if provided) */}
      {(primaryCTA || secondaryCTA) && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {primaryCTA && (
            <Link href={primaryCTA.href}>
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6 rounded-xl"
              >
                {primaryCTA.label}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}

          {secondaryCTA && (
            <Link href={secondaryCTA.href}>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
              >
                {secondaryCTA.label}
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
