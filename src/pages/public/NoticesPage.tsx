import React, { useState } from 'react';
import { Notice } from '../../types';
import { Bell, Calendar, Search, Filter, AlertTriangle, ArrowRight, X, FileText } from 'lucide-react';

interface NoticesPageProps {
  notices: Notice[];
}

export const NoticesPage: React.FC<NoticesPageProps> = ({ notices }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);

  const categories = ['All', 'Academic', 'General', 'Examination', 'Holiday', 'Event', 'Urgent'];

  const filteredNotices = notices.filter((n) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Urgent' ? n.isUrgent : n.category === selectedCategory);
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#FFFDF9] text-[#3B2117] min-h-screen">
      {/* Header */}
      <div className="bg-[#4A2112] text-[#FFF4E2] py-12 px-4 border-b-4 border-[#D6A64F]">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold text-[#D6A64F] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-[#D6A64F]/50">
            Official Bulletin Board
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#FFF4E2]">
            School Notices & Circulars
          </h1>
          <p className="text-xs sm:text-sm text-[#E8D0B5] max-w-2xl mx-auto font-medium">
            Stay updated with academic circulars, exam routines, holiday schedules, and event announcements.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* Search & Category Filter */}
        <div className="bg-[#FFF4E2] p-4 rounded-xl border border-[#D6A64F] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search circulars by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:border-[#6B2E16]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-stone-600 shrink-0">Filter:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#6B2E16] text-[#FFF4E2]'
                    : 'bg-white text-stone-700 hover:bg-[#E8D0B5]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notices List */}
        {filteredNotices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E8D0B5]">
            <Bell className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-base text-stone-700">No notices found</h3>
            <p className="text-xs text-stone-500 mt-1">Please check back soon for upcoming circulars.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className={`bg-white border-2 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ${
                  notice.isUrgent
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-[#E8D0B5] hover:border-[#D6A64F]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#6B2E16] text-[#FFF4E2] uppercase">
                      {notice.category}
                    </span>
                    {notice.isUrgent && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-rose-600 text-white flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Urgent Notice</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#D6A64F]" />
                    <span>Published: {notice.publishedDate}</span>
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base sm:text-lg text-[#4A2112] mb-2">
                  {notice.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed line-clamp-3 mb-4">
                  {notice.description}
                </p>

                <div className="flex justify-between items-center pt-3 border-t border-[#E8D0B5]/60">
                  <button
                    onClick={() => setActiveNotice(notice)}
                    className="text-xs font-bold text-[#6B2E16] hover:text-[#D6A64F] flex items-center gap-1"
                  >
                    <span>Read Full Notice Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-stone-500 font-medium">
                    Office of Principal, SVMPS Semla
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Notice Reader Modal */}
      {activeNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-4 border-[#D6A64F] max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-[#E8D0B5]">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-[#6B2E16] text-[#FFF4E2] uppercase">
                  {activeNotice.category}
                </span>
                <span className="text-xs text-stone-500 ml-3">Date: {activeNotice.publishedDate}</span>
              </div>
              <button
                onClick={() => setActiveNotice(null)}
                className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-heading font-extrabold text-xl text-[#4A2112] mb-4">
              {activeNotice.title}
            </h3>

            <div className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line space-y-3 mb-6 bg-[#FFFDF9] p-4 rounded-xl border border-[#E8D0B5]">
              {activeNotice.description}
            </div>

            <div className="pt-4 border-t border-[#E8D0B5] flex justify-between items-center text-xs">
              <span className="font-bold text-[#6B2E16]">Saraswati Vidya Mandir Public School, Semla</span>
              <button
                onClick={() => setActiveNotice(null)}
                className="bg-[#6B2E16] text-[#FFF4E2] px-4 py-2 rounded-lg font-semibold hover:bg-[#4A2112]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
