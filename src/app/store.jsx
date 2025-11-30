import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import productReducer from '../features/products/productSlice'
import cartReducer from '../features/cart/cartSlice'
import orderReducer from '../features/orders/orderSlice'
import paymentReducer from '../features/payment/paymentSlice'
import walletReducer from '../features/wallet/walletSlice'
import notificationReducer from '../features/notifications/notificationSlice'
import reviewReducer from '../features/reviews/reviewSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    payment: paymentReducer,
    wallet: walletReducer,
    notifications: notificationReducer,
    reviews: reviewReducer,
  },
})