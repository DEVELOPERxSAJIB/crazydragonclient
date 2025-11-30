import Layouts from "../../components/Layouts/Layouts";
import Home from "../../pages/Home";
import ProductsPage from "../../pages/Products";
import ProductDetail from "../../pages/ProductDetail";
import Checkout from "../../pages/Checkout";
import OrderSuccess from "../../pages/OrderSuccess";

const CommonRouter = [
  {
    element: <Layouts />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/products",
        element: <ProductsPage />,
      },
      {
        path: "/product/:id",
        element: <ProductDetail />,
      },
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/order-success/:orderId",
        element: <OrderSuccess />,
      },
    ],
  },
];

export default CommonRouter;
