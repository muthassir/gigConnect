
import React from 'react';

export default function GigCard({ gig }) {
  return (
    <div className="border p-4 rounded shadow-sm">
      <h3 className="font-semibold">{gig.title}</h3>
      <p className="text-sm text-gray-600">{gig.summary || gig.description?.slice(0,120)}</p>
      <div className="mt-2 flex justify-between items-center">
        <span className="font-bold">₹{gig.price}</span>
        <button className="px-3 py-1 border rounded">View</button>
      </div>
    </div>
  );
}
