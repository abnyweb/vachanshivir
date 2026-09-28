import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

interface BookItem {
  id: string;
  title: string;
  author: string;
  publisher?: string;
  coverImage: string;
}

const BOOKS_BY_YEAR: Record<string, BookItem[]> = {
  '2026': [
    {
      id: 'b26-1',
      title: 'Union With Christ',
      author: 'Sinclair B. Ferguson',
      publisher: 'Reformed Trust',
      coverImage: 'https://m.media-amazon.com/images/I/81I3RkO0g2L._AC_UF1000,1000_QL80_.jpg',
    },
    {
      id: 'b26-2',
      title: 'The Compelling Community',
      author: 'Mark Dever & Jamie Dunlop',
      publisher: '9Marks / Crossway',
      coverImage: 'https://m.media-amazon.com/images/I/71R2QpM5K-L._AC_UF1000,1000_QL80_.jpg',
    },
    {
      id: 'b26-3',
      title: 'Holiness More Than A Preacher\'s Words',
      author: 'Brother Andy',
      publisher: 'For The Truth',
      coverImage: 'https://m.media-amazon.com/images/I/71+2K-V5vWL._AC_UF1000,1000_QL80_.jpg',
    },
    {
      id: 'b26-4',
      title: 'Love The Ones Who Drive You Crazy',
      author: 'Jamie Dunlop',
      publisher: '9Marks / Crossway',
      coverImage: 'https://m.media-amazon.com/images/I/71-Sj8p+51L._AC_UF1000,1000_QL80_.jpg',
    },
    {
      id: 'b26-5',
      title: 'ESV Global Study Bible',
      author: 'Crossway Bibles',
      publisher: 'Crossway',
      coverImage: 'https://m.media-amazon.com/images/I/91rD-L1zV2L._AC_UF1000,1000_QL80_.jpg',
    },
    {
      id: 'b26-6',
      title: 'The Nicene Creed',
      author: 'Kevin DeYoung',
      publisher: 'Crossway',
      coverImage: 'https://m.media-amazon.com/images/I/71P4e8a83xL._AC_UF1000,1000_QL80_.jpg',
    },
  ],
  '2024': [
    {
      id: 'b24-1',
      title: 'The Gospel & Pastoral Ministry',
      author: 'John Piper & D.A. Carson',
      publisher: 'Crossway',
      coverImage: 'https://m.media-amazon.com/images/I/71R2QpM5K-L._AC_UF1000,1000_QL80_.jpg',
    },
    {
      id: 'b24-2',
      title: 'Expositional Preaching',
      author: 'David Helm',
      publisher: '9Marks',
      coverImage: 'https://m.media-amazon.com/images/I/71-Sj8p+51L._AC_UF1000,1000_QL80_.jpg',
    },
  ],
  '2023': [
    {
      id: 'b23-1',
      title: 'Church Membership',
      author: 'Jonathan Leeman',
      publisher: '9Marks',
      coverImage: 'https://m.media-amazon.com/images/I/81I3RkO0g2L._AC_UF1000,1000_QL80_.jpg',
    },
  ],
  '2022': [
    {
      id: 'b22-1',
      title: 'Corporate Worship',
      author: 'Matt Merker',
      publisher: '9Marks',
      coverImage: 'https://m.media-amazon.com/images/I/71P4e8a83xL._AC_UF1000,1000_QL80_.jpg',
    },
  ],
  '2021': [
    {
      id: 'b21-1',
      title: 'Evangelism',
      author: 'J. Mack Stiles',
      publisher: '9Marks',
      coverImage: 'https://m.media-amazon.com/images/I/91rD-L1zV2L._AC_UF1000,1000_QL80_.jpg',
    },
  ],
  '2020': [
    {
      id: 'b20-1',
      title: 'Church Discipline',
      author: 'Jonathan Leeman',
      publisher: '9Marks',
      coverImage: 'https://m.media-amazon.com/images/I/71+2K-V5vWL._AC_UF1000,1000_QL80_.jpg',
    },
  ],
  '2019': [
    {
      id: 'b19-1',
      title: 'What Is the Gospel?',
      author: 'Greg Gilbert',
      publisher: '9Marks',
      coverImage: 'https://m.media-amazon.com/images/I/81I3RkO0g2L._AC_UF1000,1000_QL80_.jpg',
    },
  ],
};

const YEARS = ['2026', '2024', '2023', '2022', '2021', '2020', '2019'];

export const FreeBooksSection: React.FC = () => {
  const { language } = useLanguage();
  const lang = language;
  const [selectedYear, setSelectedYear] = useState('2026');

  const currentBooks = BOOKS_BY_YEAR[selectedYear] || BOOKS_BY_YEAR['2026'];

  return (
    <section id="free-books" className="bg-[#F8F9FA] text-slate-900 py-20 lg:py-28 border-b border-slate-200">
      <div className="shell text-center max-w-6xl mx-auto space-y-10">
        {/* Eyebrow & Title */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold tracking-[0.3em] text-crossgold-dark uppercase font-mono">
            {lang === 'hi' ? 'निःशुल्क साहित्य' : 'COMPLIMENTARY'}
          </div>
          <h2 className="font-raleway text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950">
            {lang === 'hi' ? (
              <>निःशुल्क <span className="font-raleway italic text-navy font-black">पुस्तकें</span></>
            ) : (
              <>Free <span className="font-raleway italic text-navy font-black">Books</span></>
            )}
          </h2>
          <div className="w-16 h-1 bg-crossgold mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Year Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          {YEARS.map((yr) => {
            const isSelected = selectedYear === yr;
            return (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-5 py-3 rounded-2xl transition-all duration-300 font-raleway text-xs sm:text-sm ${
                  isSelected
                    ? 'bg-navy text-white font-black shadow-brutal-sm scale-105 border-2 border-crossgold'
                    : 'bg-white text-slate-700 font-bold border-2 border-navy/15 hover:border-navy hover:text-navy shadow-sm'
                }`}
              >
                <span className="block text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                  {lang === 'hi' ? 'शिविर' : 'SHIVIR'}
                </span>
                <span className="text-base font-black">{yr}</span>
              </button>
            );
          })}
        </div>

        {/* Books Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 pt-4 text-left">
          {currentBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl border-2 border-navy/15 p-3.5 shadow-sm hover:shadow-brutal-sm hover:border-navy hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200 shadow-inner relative">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback visual book cover if external image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-[10px] font-mono uppercase text-white font-bold tracking-wider">
                    {lang === 'hi' ? 'निःशुल्क वितरित' : 'Distributed Free'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-raleway text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-navy transition-colors">
                  {book.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-sans truncate">{book.author}</p>
                {book.publisher && (
                  <span className="inline-block text-[9px] font-mono text-navy font-bold uppercase bg-navy-50 px-2 py-0.5 rounded border border-navy/20 mt-1">
                    {book.publisher}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FreeBooksSection;
