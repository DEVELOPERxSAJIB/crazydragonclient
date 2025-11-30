import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#491648] text-white">
      {/* Top Section */}
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Store Address */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold mb-3 text-lg text-white">
              Our Location
            </h4>
            <div className="text-white/80 text-[14px] space-y-1">
              <p className="font-medium text-white">Crazy Dragon</p>
              <p>Zeesluisweg 18</p>
              <p>2583 DR Den Haag</p>
              <p>Netherlands</p>
              <a
                href="https://www.google.com/maps/place/Zeesluisweg+18,+2583+DR+Den+Haag,+Netherlands"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-orange-400 hover:text-orange-300 underline text-sm"
              >
                View on Google Maps
              </a>
            </div>
          </div>

          {/* Payment Icons */}
          <div>
            <h4 className="font-semibold mb-3 text-lg text-white">We Accept</h4>
            <div className="flex gap-3 items-center flex-wrap">
              <img
                src="https://wallpapercat.com/w/full/b/4/2/1252531-3840x2160-desktop-4k-visa-card-wallpaper.jpg"
                alt="Visa"
                className="h-6 w-auto rounded-sm"
              />
              <img
                src="https://wallpapercat.com/w/full/b/1/4/1254803-3840x2160-desktop-4k-mastercard-background.jpg"
                alt="MasterCard"
                className="h-6 w-auto rounded-sm"
              />
              <img
                src="https://www.davisanddavislaw.com/wp-content/uploads/2024/11/card-3.png"
                alt="American Express"
                className="h-6 w-auto rounded-sm"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/9/96/Logo_Ideal_Indonesia.png"
                alt="iDEAL"
                className="h-6 w-auto bg-white rounded-sm p-1"
              />
            </div>
          </div>

          {/* Opening Hours */}
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold mb-3 text-lg text-white">
              Opening Hours
            </h4>
            <p className="text-white/80 text-[14px]">Everyday: 11:00 — 23:00</p>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold mb-3 text-lg text-white">Contact</h4>
            <p className="text-white/80 text-[14px]">+31 6 1234 5678</p>
            <p className="text-white/80 text-[14px] mt-1">
              info@crazydragon.nl
            </p>
          </div>

          {/* Social Media */}
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold mb-2 text-md text-white">Follow Us</h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
                aria-label="Instagram"
              >
                <FaInstagram size={16} className="text-white" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
                aria-label="Facebook"
              >
                <FaFacebookF size={16} className="text-white" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
                aria-label="TikTok"
              >
                <FaTiktok size={16} className="text-white" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-[#3a0f3a] text-white py-4">
        <p className="text-center text-sm">
          © {new Date().getFullYear()} Crazy Dragon — All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
