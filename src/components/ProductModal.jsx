import { useState } from "react";
import { X, Plus, Minus, ShoppingCart } from "lucide-react";

const ProductModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedRecommendedAddons, setSelectedRecommendedAddons] = useState(
    []
  );
  const [notes, setNotes] = useState("");

  if (!isOpen || !product) return null;

  // Calculate total price
  const calculateTotal = () => {
    let total = product.price * quantity;

    // Add recommended addons total
    if (selectedRecommendedAddons.length > 0) {
      const recommendedTotal = selectedRecommendedAddons.reduce(
        (sum, addon) => sum + addon.price * addon.quantity,
        0
      );
      total += recommendedTotal;
    }

    return total.toFixed(2);
  };

  const handleAddToCart = () => {
    // Location check is now handled in ProductCard before opening modal

    const cartItem = {
      productId: product._id,
      quantity,
      selectedRecommendedAddons, // Include selected recommended addons
      notes: notes.trim(),
    };

    onAddToCart(cartItem);
    onClose();

    // Reset form
    setQuantity(1);
    setSelectedRecommendedAddons([]);
    setNotes("");
  };

  // Recommended Addons Handlers
  const handleRecommendedAddonToggle = (addon) => {
    const isSelected = selectedRecommendedAddons.some(
      (a) => a.product === addon._id
    );

    if (isSelected) {
      setSelectedRecommendedAddons(
        selectedRecommendedAddons.filter((a) => a.product !== addon._id)
      );
    } else {
      setSelectedRecommendedAddons([
        ...selectedRecommendedAddons,
        {
          product: addon._id,
          quantity: 1,
          price: addon.price,
          name: addon.name,
        },
      ]);
    }
  };

  const updateRecommendedAddonQuantity = (addonId, newQuantity) => {
    if (newQuantity < 1) {
      setSelectedRecommendedAddons(
        selectedRecommendedAddons.filter((a) => a.product !== addonId)
      );
    } else {
      setSelectedRecommendedAddons(
        selectedRecommendedAddons.map((a) =>
          a.product === addonId ? { ...a, quantity: newQuantity } : a
        )
      );
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-md rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Image */}
        <div className="p-4">
          <img
            src={
              product.image?.url ||
              product.image ||
              "https://via.placeholder.com/400x300?text=No+Image"
            }
            alt={product.name}
            className="w-full h-64 object-cover rounded-lg"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x300?text=No+Image";
            }}
          />
        </div>

        {/* Product Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 uppercase">
              {product.category?.name || product.category}
            </span>
            <span className="text-xl font-bold text-[#480A4C]">
              € {product.price.toFixed(2)}
            </span>
          </div>

          {product.description && (
            <p className="text-gray-600 text-sm mb-4">{product.description}</p>
          )}

          {product.halal && (
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mb-4">
              100% halal
            </span>
          )}
        </div>

        {/* Menu Options */}
        {/* Recommended Add-ons (Product-based) */}
        {product.recommendedAddons && product.recommendedAddons.length > 0 && (
          <div className="px-4 pb-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              🎯 Would you like to add?
            </h3>
            <div className="space-y-2">
              {product.recommendedAddons.map((addon) => {
                const selectedAddon = selectedRecommendedAddons.find(
                  (a) => a.product === addon._id
                );
                const isSelected = !!selectedAddon;

                return (
                  <div
                    key={addon._id}
                    className={`flex items-center p-3 border rounded-lg transition ${
                      isSelected
                        ? "border-[#480A4C] bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleRecommendedAddonToggle(addon)}
                      className="text-[#480A4C] focus:ring-[#480A4C] rounded cursor-pointer"
                    />
                    <div className="ml-3 flex-1 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {addon.image?.url && (
                          <img
                            src={addon.image.url}
                            alt={addon.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">
                            {addon.name}
                          </p>
                          <p className="text-sm text-[#480A4C] font-semibold">
                            €{addon.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateRecommendedAddonQuantity(
                                addon._id,
                                selectedAddon.quantity - 1
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-full border border-[#480A4C] text-[#480A4C] hover:bg-purple-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-semibold text-[#480A4C]">
                            {selectedAddon.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateRecommendedAddonQuantity(
                                addon._id,
                                selectedAddon.quantity + 1
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-full border border-[#480A4C] text-[#480A4C] hover:bg-purple-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        <div className="px-4 pb-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            Special instructions
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a note (e.g., no onions, extra sauce)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#480A4C] outline-0 resize-none"
            rows={3}
          />
        </div>

        {/* Footer - Quantity & Add to Cart */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-800">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className={`w-8 h-8 flex items-center justify-center rounded-full border ${
                  quantity <= 1
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-[#501053] text-[#501053] hover:bg-purple-50"
                }`}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-semibold w-8 text-[#501053] text-center">
                {quantity}
              </span>
              <button
                onClick={incrementQuantity}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-[#501053] text-[#501053] hover:bg-purple-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-[#480A4C] hover:bg-[#6E3B72] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to cart - € {calculateTotal()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
