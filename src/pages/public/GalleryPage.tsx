import React, { useState } from 'react';
import { GalleryItem, SchoolProfile } from '../../types';
import { Image as ImageIcon, Sparkles, Filter, X } from 'lucide-react';

interface GalleryPageProps {
  gallery: GalleryItem[];
  profile: SchoolProfile | null;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ gallery, profile }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxImg, setLightboxImg] = useState<GalleryItem | null>(null);

  const categories = ['All', 'Campus', 'Events', 'Cultural', 'Sports', 'Celebrations'];

  const filteredItems = gallery.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <div className="bg-[#FFFDF9] text-[#3B2117] min-h-screen">
      {/* Header */}
      <div className="bg-[#4A2112] text-[#FFF4E2] py-12 px-4 border-b-4 border-[#D6A64F]">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-[#D6A64F] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-[#D6A64F]/50">
            Life At SVMPS
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#FFF4E2]">
            School Photo Gallery & Campus Life
          </h1>
          <p className="text-xs sm:text-sm text-[#E8D0B5] max-w-2xl mx-auto font-medium">
            Capturing the joyous milestones, cultural events, sports meets, and artistic murals at our Semla campus.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
                selectedCategory === cat
                  ? 'bg-[#6B2E16] text-[#FFF4E2] border-2 border-[#D6A64F]'
                  : 'bg-white text-stone-700 border border-[#E8D0B5] hover:bg-[#FFF4E2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E8D0B5]">
            <ImageIcon className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-base text-stone-700">No photos in this category</h3>
            <p className="text-xs text-stone-500 mt-1">Please select another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxImg(item)}
                className="group relative rounded-2xl overflow-hidden border-2 border-[#D6A64F] bg-stone-900 shadow-md cursor-pointer aspect-4/3"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D6A64F]">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5 leading-snug">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#D6A64F]">
            <div className="flex justify-between items-center p-4 bg-stone-950 text-white border-b border-stone-800">
              <div>
                <span className="text-[10px] text-[#D6A64F] font-bold uppercase">{lightboxImg.category}</span>
                <h4 className="text-sm font-bold">{lightboxImg.title}</h4>
              </div>
              <button
                onClick={() => setLightboxImg(null)}
                className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black">
              <img
                src={lightboxImg.imageUrl}
                alt={lightboxImg.title}
                className="max-h-[75vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
