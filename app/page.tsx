'use client';

import React, { useState } from 'react';

// 1. Initial Data
const INITIAL_REVIEWS = [
  {
    id: 1,
    author: "Sarah M.",
    rating: 5,
    text: "Super clean facility and the new machines work great! Best laundromat in Omaha.",
    status: "pending_reply"
  },
  {
    id: 2,
    author: "David K.",
    rating: 3,
    text: "Good machines, but the coin machine was out of quarters.",
    status: "pending_reply"
  }
];

export default function Dashboard() {
  // 2. State
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [replies, setReplies] = useState<Record<number, string>>({});

  // 3. Functions
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

  const handleApprove = (reviewId: number) => {
    alert("Awesome! Your reply has been officially posted.");
    // Remove the completed review from the screen
    setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
  };

  // 4. UI Rendering
  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8">Review Manager</h1>
      
      {/* Show a success message if all reviews are done */}
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
                
                {/* Editable Text Area for the AI Draft */}
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