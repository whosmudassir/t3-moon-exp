import { useState } from "react";
import { CiSearch, CiShoppingCart } from "react-icons/ci";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => (
  <a href={href} className="text-xs text-gray-700 hover:text-black">
    {children}
  </a>
);

interface MobileMenuProps {
  isMenuOpen: boolean;
  links: { href: string; label: string }[];
}

const MobileMenu = ({ isMenuOpen, links }: MobileMenuProps) => {
  if (!isMenuOpen) return null;

  return (
    <nav className="absolute left-0 top-full z-10 w-full bg-white px-6 py-4 shadow-lg lg:hidden">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="block py-2 text-xs text-gray-700 hover:text-black"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

interface Link {
  href: string;
  label: string;
}

const HeaderLinks: Link[] = [
  { href: "#", label: "Categories" },
  { href: "#", label: "Sale" },
  { href: "#", label: "Clearance" },
  { href: "#", label: "New stock" },
  { href: "#", label: "Trending" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative bg-white shadow-md">
      {/* Main Navigation */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="text-lg font-bold">ECOMMERCE</div>

        {/* Hamburger Menu */}
        <button
          className="block text-xs text-gray-700 focus:outline-none lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden space-x-6 lg:flex">
          {HeaderLinks.map((link, index) => (
            <NavLink key={index} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center space-x-4 lg:flex">
          <button>
            <CiSearch />
          </button>
          <button>
            <CiShoppingCart />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isMenuOpen={isMenuOpen} links={HeaderLinks} />

      {/* Top Banner */}
      <div className="bg-gray-200 py-2 text-center text-sm">
        <span>Get 10% off on business sign up</span>
      </div>
    </header>
  );
}
