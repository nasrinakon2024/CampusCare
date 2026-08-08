import React, { useState } from 'react';

export default function BookLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  // সার্চ হ্যান্ডলার ফাংশন
  const handleSearch = async (e) => {
    // যদি এন্টার বাটন চাপ পড়ে অথবা সার্চ করা হয়
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      setLoading(true);
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=9`);
        const data = await response.json();
        setBooks(data.items || []);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* সার্চ ইনপুট ফিল্ড */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search online books or notes by title, code, or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
          className="w-full px-4 py-3 bg-[#0f172a] border border-gray-700 rounded-xl focus:outline-none focus:border-red-600 text-white placeholder-gray-400"
        />
        <p className="text-xs text-gray-500 mt-2">বইয়ের নাম লিখে 키보ড-এর Enter প্রেস করুন...</p>
      </div>

      {/* লোডিং স্ট্যাটাস */}
      {loading && (
        <div className="text-center text-gray-400 py-6">বই খোঁজা হচ্ছে...</div>
      )}

      {/* রেজাল্ট গ্রিড */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && books.length > 0 ? (
          books.map((book) => {
            const info = book.volumeInfo || {};
            return (
              <div key={book.id} className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-md flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white line-clamp-1">{info.title || "Unknown Title"}</h3>
                  <p className="text-sm text-gray-400 mt-1">Author: {info.authors ? info.authors.join(', ') : "Unknown"}</p>
                </div>
                
                <div className="mt-5">
                  {info.previewLink ? (
                    <a
                      href={info.previewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition"
                    >
                      Read Online
                    </a>
                  ) : (
                    <span className="block text-center bg-gray-800 text-gray-500 py-2 rounded-lg">Link Not Available</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          !loading && searchTerm && (
            <div className="col-span-full text-center py-10 text-gray-500">
              কোনো বই পাওয়া যায়নি। অন্য নাম দিয়ে চেষ্টা করুন।
            </div>
          )
        )}
      </div>
    </div>
  );
}