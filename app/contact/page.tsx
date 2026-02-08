"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import GlareButton from "@/components/ui/GlareButton";

export default function ContactUsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">
                Please sign in to contact us. Redirecting to sign in...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error("Name is required");
      }
      if (!formData.email.trim()) {
        throw new Error("Email is required");
      }
      if (!formData.subject.trim()) {
        throw new Error("Subject is required");
      }
      if (!formData.message.trim()) {
        throw new Error("Message is required");
      }

      // Submit to API
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          userEmail: session?.user?.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit contact form");
      }

      // Success
      setSubmitted(true);
      setSuccessMessage(
        data.message ||
          "Your query has been received! Check your email for our response.",
      );
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Reset form after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Contact form error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="h-20" />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold text-white">Get in Touch</h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Have a question about CreatorMind? We're here to help. Submit your
            query below and we'll get back to you with a detailed response via
            email.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6 text-center">
              <h3 className="font-semibold text-white mb-2">Email</h3>
              <p className="text-sm text-gray-400">support@creatormind.ai</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6 text-center">
              <h3 className="font-semibold text-white mb-2">Response Time</h3>
              <p className="text-sm text-gray-400">Usually within 24 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6 text-center">
              <h3 className="font-semibold text-white mb-2">Support</h3>
              <p className="text-sm text-gray-400">
                24/7 AI-powered assistance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              Send us a Message
            </CardTitle>
            <p className="text-sm text-gray-400 mt-2">
              Fill out the form below and we'll respond to your query promptly.
            </p>
          </CardHeader>
          <CardContent>
            {submitted && successMessage ? (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Query Submitted Successfully!
                  </h3>
                  <p className="text-green-800 mb-4">{successMessage}</p>
                  <p className="text-sm text-green-700">
                    Please check your email for our detailed response.
                  </p>
                </div>
                <GlareButton
                  onClick={() => {
                    setSubmitted(false);
                    router.push("/dashboard");
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Back to Dashboard
                </GlareButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white font-semibold">
                    Your Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="bg-black border border-zinc-800 text-white focus:border-zinc-700 rounded-lg"
                    disabled={loading}
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white font-semibold">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="bg-black border border-zinc-800 text-white focus:border-zinc-700 rounded-lg"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    We'll use this email to send you our response
                  </p>
                </div>

                {/* Subject Field */}
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-white font-semibold">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g., How to use video ideas feature?"
                    className="bg-black border border-zinc-800 text-white focus:border-zinc-700 rounded-lg"
                    disabled={loading}
                  />
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white font-semibold">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Please describe your question or issue in detail..."
                    className="bg-black border border-zinc-800 text-white focus:border-zinc-700 rounded-lg min-h-40"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    Be as detailed as possible to help us provide a better
                    response
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 py-3"
                >
                  {loading ? "Submitting..." : "Send Message"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  * All fields are required
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-gray-400">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const faqs = [
  {
    question: "How long does it take to get a response?",
    answer:
      "Most queries are answered within 24 hours. Our AI-powered system processes your question and sends a detailed response directly to your email.",
  },
  {
    question: "What types of questions can I ask?",
    answer:
      "You can ask about features, how to use them, troubleshooting issues, content creation strategies, and more. Our system will help with technical and content-related questions.",
  },
  {
    question: "Will I receive the response via email?",
    answer:
      "Yes! Your response will be sent to the email address you provide in the form. Make sure to check your spam/promotions folder if you don't see it.",
  },
  {
    question: "Can I ask multiple questions at once?",
    answer:
      "Yes, you can include multiple questions in your message. We'll address each one in our response.",
  },
  {
    question: "Is there a limit to message length?",
    answer:
      "No, there's no limit. The more details you provide, the better we can help you with a comprehensive response.",
  },
  {
    question: "Who handles my query?",
    answer:
      "Your query is processed by our AI system which understands CreatorMind features. Complex collaboration inquiries are forwarded to our team.",
  },
];
