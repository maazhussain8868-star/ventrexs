'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  ExternalLink, 
  Send, 
  CheckCircle2, 
  Building2, 
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CustomerFeedbackSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const { reviewRequests, reviewSettings, businessProfile, submitCustomerFeedback, showToast } = useApp();

  const requestId = params.id as string;
  const request = reviewRequests.find(r => r.id === requestId);

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedAspects, setSelectedAspects] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPositiveResult, setIsPositiveResult] = useState(false);

  const businessName = businessProfile?.name || 'Apex Comfort HVAC & Energy';
  const customerName = request?.customerName || 'Valued Customer';
  const technicianName = request?.technicianName || 'our service specialist';
  const googleReviewUrl = reviewSettings?.googleReviewUrl || 'https://google.com';

  const aspectsList = [
    { id: 'punctuality', label: 'On-Time Arrival' },
    { id: 'cleanliness', label: 'Worksite Cleanliness' },
    { id: 'communication', label: 'Clear Communication' },
    { id: 'technical_skill', label: 'Quality & Craftsmanship' },
    { id: 'pricing_transparency', label: 'Fair & Clear Pricing' },
  ];

  const toggleAspect = (id: string) => {
    setSelectedAspects(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      showToast({ title: 'Please select a star rating', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitCustomerFeedback({
        reviewRequestId: request?.id || requestId,
        customerName,
        customerPhone: request?.customerPhone,
        customerEmail: request?.customerEmail,
        jobId: request?.jobId,
        rating,
        feedbackText,
        serviceAspects: selectedAspects,
        channel: request?.channel || 'web',
      });

      setIsPositiveResult(result.isPositive);
      setIsSubmitted(true);
    } catch (err: any) {
      showToast({ title: 'Submission failed', description: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-variant/20 flex flex-col justify-between py-8 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Business Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-on-surface">{businessName}</h1>
          <p className="text-xs text-on-surface-variant">Service Satisfaction & Quality Feedback</p>
        </div>

        {/* Survey Box */}
        <div className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-xl">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-lg font-bold text-on-surface">
                  Hi {customerName}, how was your service?
                </h2>
                <p className="text-xs text-on-surface-variant">
                  We recently completed work with {technicianName}. Please rate your experience:
                </p>

                {/* 5-Star Interactive Rating Bar */}
                <div className="flex items-center justify-center gap-2 py-4">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-9 h-9 transition-colors ${
                            isFilled
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-outline-variant hover:text-amber-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {rating > 0 && (
                  <p className="text-xs font-bold text-on-surface animate-in fade-in">
                    {rating === 5 && '★★★★★ Outstanding Experience!'}
                    {rating === 4 && '★★★★☆ Great Service'}
                    {rating === 3 && '★★★☆☆ Average Experience'}
                    {rating === 2 && '★★☆☆☆ Needs Improvement'}
                    {rating === 1 && '★☆☆☆☆ Unsatisfactory'}
                  </p>
                )}
              </div>

              {/* Conditional Feedback Prompts based on rating */}
              {rating > 0 && (
                <div className="space-y-4 pt-2 border-t border-outline-variant/60 animate-in fade-in">
                  {rating >= 4 ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 space-y-1">
                      <strong className="block font-bold">We are thrilled you had a great experience!</strong>
                      <p>
                        Thank you! We would truly appreciate your feedback on our review page.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 space-y-1">
                      <strong className="block font-bold">We are sorry your experience wasn&apos;t what you expected.</strong>
                      <p>
                        Please tell us what went wrong so our management team can assist and resolve this.
                      </p>
                    </div>
                  )}

                  {/* Quality aspects tags */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-2">
                      What stood out to you? (Optional)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {aspectsList.map((aspect) => {
                        const isSelected = selectedAspects.includes(aspect.id);
                        return (
                          <button
                            type="button"
                            key={aspect.id}
                            onClick={() => toggleAspect(aspect.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-primary text-on-primary border-primary shadow-xs'
                                : 'bg-surface-variant/40 border-outline-variant text-on-surface-variant hover:bg-surface-variant'
                            }`}
                          >
                            {aspect.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed comment */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">
                      {rating >= 4 ? 'Tell us what you liked (Optional)' : 'How can we make this right?'}
                    </label>
                    <textarea
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder={
                        rating >= 4 
                          ? 'Share any specific details about the technician or service...'
                          : 'Please share what happened so our team can follow up directly...'
                      }
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-surface-variant/40 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-on-surface leading-relaxed"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 text-xs font-bold gap-2 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </div>
              )}
            </form>
          ) : (
            <div className="text-center space-y-5 py-4 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-on-surface">Thank You, {customerName}!</h3>
                {isPositiveResult ? (
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Your feedback means the world to our small business and helps other homeowners in our community find quality service.
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    We have received your feedback. An operations manager has been notified and will review your comments to make things right.
                  </p>
                )}
              </div>

              {/* If 4-5 stars: Direct Google Review Button */}
              {isPositiveResult && googleReviewUrl && (
                <div className="p-4 rounded-2xl bg-surface-variant/40 border border-outline-variant/60 space-y-3">
                  <p className="text-xs font-bold text-on-surface">
                    Would you mind sharing your review on Google?
                  </p>
                  <a
                    href={googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-on-primary-fixed-variant transition-all"
                  >
                    <Star className="w-4 h-4 fill-white" />
                    Post on Google Reviews
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-on-surface-variant flex items-center justify-center gap-1">
          <HeartHandshake className="w-3.5 h-3.5 text-primary" />
          <span>Powered by Ventrexs AI Customer Experience Engine</span>
        </div>
      </div>
    </div>
  );
}
