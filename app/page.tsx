'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. Initialize Supabase Client (This reads the keys you put in .env.local!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  // 2. State
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 3. Fetch Data from Database on Load
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    // Pull only reviews that still need a reply from Supabase
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'pending_reply')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
    } else {
      setReviews(data || []);
    }
    setIsLoading(false);
  };

  // 4. Functions
  const handleGenerateReply = async (reviewId: number, text: string, rating: number) => {
    setLoadingId(reviewId);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewText: text, rating }),
      });
      
      const data = await response.json();
      
      if (data.reply) {
        setReplies(prev => ({ ...prev, [reviewId]: data.reply }));
      } else {
        alert("Error: " + (data.error || "Failed to generate reply"));
      }
    } catch (error) {
      console.error("Failed to fetch reply:", error);
      alert("Something went wrong connecting to the backend.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleApprove = async (reviewId: number) => {
    // Permanently mark it as 'replied' in the Supabase database!
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'replied' })
      .eq('id', reviewId);

    if (error) {
      alert("Failed to update the database.");
      console.error(error);
      return;
    }

    alert("Awesome! Your reply has been permanently saved to the database.");
    // Remove the completed review from the screen
    setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
  };

  // 5. UI Rendering
  if (isLoading) {
    return <div className="p-8 max-w-4xl mx-auto text-center mt-20 text-xl font-semibold text-gray-500">Connecting to database...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8">Review Manager</h1>
      
      {reviews.length === 0 ? (
        <div className="text-center p-12 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-2xl font-bold text-green-700 mb-2">All Caught Up!</h2>
          <p className="text-green-600">You've replied to all customer reviews for the business.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border p-6 rounded-lg shadow-sm bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{review.author}</h3>
                  <div className="text-yellow-500">{"★".repeat(review.rating)}</div>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                  Needs Reply
                </span>
              </div>
              
              <p className="text-gray-700 mb-6">"{review.text}"</p>
              
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm text-gray-500 mb-2 font-semibold">AI Suggested Reply:</p>
                
                {replies[review.id] ? (
                  <textarea
                    value={replies[review.id]}
                    onChange={(e) => setReplies(prev => ({ ...prev, [review.id]: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md text-gray-800 mb-4 focus:outline-none focus:ring-2 focus:ring-black min-h-[120px] resize-y"
                  />
                ) : (
                  <p className="text-gray-400 mb-4 italic">Click below to draft a response...</p>
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleGenerateReply(review.id, review.text, review.rating)}
                    disabled={loadingId === review.id}
                    className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                  >
                    {loadingId === review.id ? "Generating..." : "Draft AI Reply"}
                  </button>
                  
                  {replies[review.id] && (
                    <button 
                      onClick={() => handleApprove(review.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Approve & Post
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}