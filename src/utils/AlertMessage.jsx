import { toast } from "react-hot-toast";

const AlertMessage = ({ type = "success", msg }) => {
  if (type === "error") {
    return toast.error(msg);
  }
  return toast.success(msg);
};

export default AlertMessage;
