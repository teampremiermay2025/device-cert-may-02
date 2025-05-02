import React, { useRef, useState, useEffect } from 'react';
import { FanData } from '../hooks/Fan';
import RecentCard from './RecentCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  items: FanData[];
  onCardClick: (fan: number) => void;
}

const Carousel: React.FC<CarouselProps> = ({ items, onCardClick }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [visibleItems, setVisibleItems] = useState(6);

  useEffect(() => {
    const updateMaxScroll = () => {
      if (!carouselRef.current) return;
      const containerWidth = carouselRef.current.clientWidth;
      const totalWidth = items.length * 190;
      setMaxScroll(Math.max(0, totalWidth - containerWidth));
      setVisibleItems(Math.max(1, Math.floor(containerWidth / 190)));
    };

    updateMaxScroll();
    window.addEventListener('resize', updateMaxScroll);
    return () => window.removeEventListener('resize', updateMaxScroll);
  }, [items.length]);

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = visibleItems * 190;
    const newPosition = direction === 'left'
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(maxScroll, scrollPosition + scrollAmount);

    setScrollPosition(newPosition);
    carouselRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <button
          className={`w-8 h-8 rounded-full flex items-center justify-center ${scrollPosition <= 0 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => scroll('left')}
          disabled={scrollPosition <= 0}
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className={`w-8 h-8 rounded-full flex items-center justify-center ${scrollPosition >= maxScroll ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => scroll('right')}
          disabled={scrollPosition >= maxScroll}
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 px-2">No items to display.</p>
      ) : (
        <div
          ref={carouselRef}
          className="flex overflow-x-hidden gap-5 pb-4 pt-2 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, index) => (
            <div key={`${item.FAN}-${index}`} className="flex-shrink-0">
              <RecentCard item={item} onClick={onCardClick} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
