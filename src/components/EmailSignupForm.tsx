"use client";

import { useState } from "react";
import { z } from "zod";
import { api } from "src/lib/appClient";
import { toast } from "sonner";

// Zod validation schema
const emailSignupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  audience_type: z.enum(["business", "affiliate", "product-dev"], {
    errorMap: () => ({ message: "Please select an audience type" }),
  }),
});

type EmailSignupFormData = z.infer<typeof emailSignupSchema>;

interface EmailSignupFormProps {
  audienceType: "business" | "affiliate" | "product-dev";
  source?: string;
  buttonText?: string;
  placeholder?: string;
  className?: string;
  variant?: "default" | "compact";
  onSuccess?: () => void;
}

export function EmailSignupForm({
  audienceType,
  source = "coming-soon",
  buttonText = "Get Early Access",
  placeholder = "Enter your email",
  className = "",
  variant = "default",
  onSuccess,
}: EmailSignupFormProps) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data
      const formData: EmailSignupFormData = {
        email: email.trim(),
        audience_type: audienceType,
      };

      const validation = emailSignupSchema.safeParse(formData);

      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      // Submit to API
      const response = await api.post("/api/signup", {
        email: formData.email,
        audience_type: formData.audience_type,
        source: source,
      });

      if (response.status === 201 || response.status === 200) {
        setIsSubmitted(true);
        setEmail("");
        toast.success("Thanks for signing up! We'll be in touch soon.");
        onSuccess?.();
      }
    } catch (error: any) {
      console.error("Signup error:", error);

      if (error.response?.status === 409) {
        // Email already exists
        setErrors({ email: "This email is already signed up" });
        toast.info("You're already on our list!");
      } else if (error.response?.status === 422) {
        // Validation error from server
        const serverErrors = error.response.data?.detail;
        if (Array.isArray(serverErrors)) {
          const fieldErrors: Record<string, string> = {};
          serverErrors.forEach((err: any) => {
            if (err.loc && err.loc[0]) {
              fieldErrors[err.loc[0] as string] = err.msg;
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ submit: "Please check your information and try again" });
        }
      } else {
        setErrors({ submit: "Something went wrong. Please try again." });
        toast.error("Failed to sign up. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className={`w-full ${className}`}>
        {isSubmitted ? (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-center">
            <p className="text-green-400 font-semibold">
              ✓ Thanks for signing up!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {errors.submit && (
              <p className="text-red-400 text-sm">{errors.submit}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSubmitting ? "Signing up..." : buttonText}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {isSubmitted ? (
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-700/50 text-center">
          <div className="text-5xl mb-4">✓</div>
          <h3 className="text-2xl font-bold text-green-400 mb-2">
            You're on the list!
          </h3>
          <p className="text-gray-300">
            Thanks for signing up. We'll notify you when we launch.
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <input type="hidden" value={audienceType} readOnly />

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing up..." : buttonText}
            </button>

            <p className="text-xs text-gray-400 text-center">
              No spam, ever. Unsubscribe anytime.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
