import React from "react";
import { Outlet } from "react-router-dom";

import AuthBanner from "/images/auth-banner.jpg";

const BaseLayout = () => {
  return (
    <div className="grid h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center px-5">
        <Outlet />
      </div>
      <div className="bg-muted-foreground/20 hidden md:block">
        <img
          src={AuthBanner}
          alt="Auth Banner"
          className="h-screen w-full object-cover"
        />
      </div>
    </div>
  );
};

export default BaseLayout;
