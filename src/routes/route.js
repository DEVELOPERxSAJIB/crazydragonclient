import { createBrowserRouter } from "react-router-dom";
import PublicRouter from "./publicRoute/PublicRouter";
import CommonRouter from "./commonRoute/CommonRouter";
import PrivateRouter from "./privateRoute/PrivateRouter";
import AdminRouter from "./adminRoute/AdminRouter";


const routes = createBrowserRouter([...PublicRouter, ...AdminRouter, ...PrivateRouter, ...CommonRouter]);

export default routes;