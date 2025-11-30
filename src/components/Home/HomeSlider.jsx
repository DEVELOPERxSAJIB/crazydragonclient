import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import slide1 from "../../assets/slide/slide_home_3.jpg";
import slide2 from "../../assets/slide/Pasja_Restaurant.mp4";

const HomeSlider = () => {
  const scrollToSection = () => {
    document.getElementById("order-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="relative w-full h-[600px]">
        {/* Swiper Slider */}
        <Swiper
          slidesPerView={1}
          spaceBetween={0}
          loop={true}
          pagination={{ clickable: true }}
          autoplay={{ delay: 15000 }}
          navigation={true}
          modules={[Autoplay, Pagination]}
          className="h-full w-full"
        >
          <SwiperSlide>
            <img
              src={slide1}
              className="w-full h-[600px] object-cover"
              alt="slide1"
            />
          </SwiperSlide>

          <SwiperSlide>
            <video
              className="w-full h-[600px] object-cover"
              src={slide2}
              autoPlay
              loop
              muted
              playsInline
            />
          </SwiperSlide>
        </Swiper>

        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black/60 z-20 pointer-events-none"></div>

        {/* CONTENT */}
        <div className="absolute inset-0 z-30 flex items-end justify-start pb-32">
          <div className="w-full max-w-7xl mx-auto px-8">
            <p className="text-lg md:text-xl text-gray-200 mb-4">
              Welcome To Crazy Dragon
            </p>

            <h1 className="text-4xl md:text-[70px] font-medium text-white mb-6">
              It's hot.
              <br />
              Delicious.
              <br />
              Fast.
            </h1>

            <div className="flex gap-4">
              <button
                onClick={scrollToSection}
                className="px-6 cursor-pointer py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-md"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeSlider;
