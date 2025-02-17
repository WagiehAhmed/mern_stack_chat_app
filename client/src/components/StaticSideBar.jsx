import { lazy } from "react";
// icons
import { PiChats } from "react-icons/pi";
import { GrGroup } from "react-icons/gr";
import { IoSearch } from "react-icons/io5";
import { BiLogOutCircle } from "react-icons/bi";
import { MdLightMode } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";

import { useChangeLanguage } from "../hooks/useChangeLanguage";
import { useChangeTheme } from "../hooks/useChangeTheme";
import { useLogout } from "../hooks/useLogout";
import { useDataContext } from "../context/DataContextProvider";
import { useToggle } from "../hooks/useToggle";
import { useTranslation } from "react-i18next";

const ProfileModal = lazy(() => import("./modals/ProfileModal"));
const SearchModal = lazy(() => import("./modals/SearchModal"));
import Avatar from "./Avatar";

import { IconButton } from "./basicComponents";
import { NavLink, useNavigate } from "react-router-dom";

export default function StaticSideBar() {
  const { t, i18n } = useTranslation();
  const [openProfile, profileTragger] = useToggle(false);
  const [openSearch, searchTragger] = useToggle(false);
  const { userDetails } = useDataContext();
  const { mutate: logout } = useLogout();
  const { mutate: changeTheme } = useChangeTheme();
  const { mutate: changeLanguage } = useChangeLanguage();
  return (
    <div className="h-full w-full bg-background-primary flex flex-col justify-between items-center p-2 ">
      <div className="flex flex-col justify-center items-center gap-1">
        <NavLink
          to="/chats"
          title={t("chatsLabel")}
          className={({ isActive }) =>
            `icon-button  ${isActive && "bg-accent text-white"}`
          }
        >
          <PiChats size={20} />
        </NavLink>
        <NavLink
          to="/groups"
          title={t("groupsLabel")}
          className={({ isActive }) =>
            `icon-button  ${isActive && "bg-accent text-white"}`
          }
        >
          <GrGroup size={20} />
        </NavLink>

        <IconButton
          onClick={searchTragger}
          title={t("searchLabel")}
          className=" transition-all duration-100 transform hover:scale-110 "
        >
          <IoSearch size={20} />
        </IconButton>
      </div>
      <div className="flex flex-col justify-center items-center gap-1">
        {userDetails?.theme === "light" ? (
          <IconButton
            title={t("themeLabel")}
            className="  transition-all duration-100 transform hover:scale-110"
            onClick={() => {
              changeTheme("dark");
            }}
          >
            <MdDarkMode size={20} />
          </IconButton>
        ) : (
          <IconButton
            title={t("themeLabel")}
            className="  transition-all duration-100 transform hover:scale-110"
            onClick={() => {
              changeTheme("light");
            }}
          >
            <MdLightMode size={20} />
          </IconButton>
        )}
        {userDetails?.lng === "ar" ? (
          <IconButton
            title={t("languageLabel")}
            className="  transition-all duration-100 transform hover:scale-110"
            onClick={() => {
              i18n.changeLanguage("en");
              changeLanguage(i18n.language);
            }}
          >
            <p className="font-bold text-md uppercase">en</p>
          </IconButton>
        ) : (
          <IconButton
            title={t("languageLabel")}
            className="transition-all duration-100 transform hover:scale-110"
            onClick={() => {
              i18n.changeLanguage("ar");
              changeLanguage(i18n.language);
            }}
          >
            <p className="font-bold text-md uppercase">ar</p>
          </IconButton>
        )}

        <Avatar
          userDetails={userDetails}
          onClick={profileTragger}
          dot={false}
        />
        <IconButton
          title={t("logoutLabel")}
          className="  transition-all duration-100 transform hover:scale-110"
          onClick={() => {
            logout();
          }}
        >
          <BiLogOutCircle size={20} />
        </IconButton>
      </div>

      {<ProfileModal onClose={profileTragger} open={openProfile} />}

      {<SearchModal onClose={searchTragger} open={openSearch} />}
    </div>
  );
}
