import React, { useEffect } from "react";
import io from "socket.io-client";
import { Outlet } from "react-router-dom";
import { useDataContext } from "../../context/DataContextProvider";
import { useUserAllDetails } from "../../hooks/useUserAllDetails";
import StaticSideBar from "../StaticSideBar";
import { useTranslation } from "react-i18next";
// notification
import useSound from "use-sound";
import messageNotificationSound from "../../sounds/newMessage.mp3";
import { toast } from "react-toastify";

function HomePage() {
  const { t } = useTranslation();
  const { refetch } = useUserAllDetails();
  const { userDetails, setSocket, setOnlineUsers } = useDataContext();
  const [play] = useSound(messageNotificationSound);

  useEffect(() => {
    if (!userDetails) {
      refetch();
    }

    let socket = null;
    if (userDetails) {
      socket = io(import.meta.env.VITE_BACKEND_URL, {
        withCredentials: true,
        transports: ["websocket"],
        auth: {
          token: userDetails?.access_token,
        },
      });
      // socket
      socket.on("connect", () => {
        setSocket(socket);
      });
      // onlineUsers
      socket.on("onlineUsers", (online_users) => {
        setOnlineUsers(new Map(online_users));
      });

      socket.on("newMessage", ({ sender }) => {
        if (
          document.location.pathname === "/chats" ||
          document.location.pathname === "/groups"
        ) {
          toast.success(`${t("newMessage")} ${sender?.name}`);
          play();
        }
      });

      if (userDetails?.theme === "light") {
        document.body.classList.remove("dark");
        document.body.classList.add("light");
      } else {
        document.body.classList.remove("light");
        document.body.classList.add("dark");
      }
    }

    return () => {
      socket?.disconnect();
    };
  }, [userDetails]);

  console.log("HomePage");
  return (
    <div className="bg-background w-screen h-screen flex flex-row ">
      <div className={`w-14`}>
        {/* static side */}
        <StaticSideBar />
      </div>
      {/* outlet */}
      <div className={`flex-grow`}>
        <Outlet />
      </div>
    </div>
  );
}

export default HomePage;
