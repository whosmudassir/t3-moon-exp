"use client";
import React, { FC } from "react";

interface User {
  name?: string;
}

interface UserHeaderProps {
  handleLogout: () => void;
  user: User;
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const UserHeader: FC<UserHeaderProps> = ({ handleLogout, user }) => {
  const NavLink: FC<NavLinkProps> = ({ href, children }) => (
    <a href={href} className="text-xs text-gray-700 hover:text-black">
      {children}
    </a>
  );

  const UserLinks = [
    { href: "#", label: "Help" },
    { href: "#", label: "Orders & Returns" },
    { href: "#", label: `Hi, ${user.name || "User"}` },
  ];

  return (
    <div className="gap-4 space-x-6 bg-white px-3 py-1 text-right text-sm">
      {UserLinks.map((link, index) => (
        <NavLink key={index} href={link.href}>
          {link.label}
        </NavLink>
      ))}
      <button
        className="align-center cursor-pointer items-center justify-center gap-2 text-black hover:underline"
        onClick={handleLogout}
      >
        <p className="text-xs">Logout →</p>
      </button>
    </div>
  );
};

export default UserHeader;
