import Layouts from "../../components/Layouts/Layouts";
import ForgetPassword from "../../pages/auth/ForgetPassword";
import RegisterVerify from "../../pages/auth/RegisterVerify";
import Registration from "../../pages/auth/Registration";
import ResetPassword from "../../pages/auth/ResetPassword";
import Singin from "../../pages/auth/Singin";
import PublicGuard from "./PublicGuard";

const PublicRouter = [
  {
    element: <Layouts />,
    children: [
      {
        element: <PublicGuard />,
        children: [
          {
            path: "/signin",
            element: <Singin />,
          },
          {
            path: "/register",
            element: <Registration />,
          },
          {
            path: "/register/:token",
            element: <RegisterVerify />,
          },
          {
            path: "/forget-password",
            element: <ForgetPassword />,
          },
          {
            path: "/reset-password/:token",
            element: <ResetPassword />,
          },
        ],
      },
    ],
  },
];

export default PublicRouter;
