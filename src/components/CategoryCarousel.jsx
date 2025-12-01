import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CategoryCarousel = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 mb-6">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 hover:bg-white transition-all duration-200"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} className="text-[#5A1E5A]" />
        </button>
      )}

      {/* Category Carousel */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-8"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {categories.map((category) => (
<button
  key={category}
  onClick={() => onSelectCategory(category)}
  className={`
    shrink-0 px-6 py-2.5 rounded-full text-sm font-semibold
    transition-all duration-300
    backdrop-blur-sm
    ${
      selectedCategory === category
        ? "bg-[#5A1E5A] text-white shadow-sm border border-[#6f2670]"
        : "bg-white/70 text-gray-700 border border-gray-200 hover:bg-white hover:border-[#5A1E5A] hover:text-[#5A1E5A] hover:shadow-sm"
    }
  `}
>
  {category}
</button>

        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 hover:bg-white transition-all duration-200"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} className="text-[#5A1E5A]" />
        </button>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryCarousel;
