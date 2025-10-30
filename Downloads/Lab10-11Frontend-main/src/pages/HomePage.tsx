import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";
import { logout } from "@/services/logoutService"
export default function HomePage() {
  return (
    <div>
      <header className="flex items-center justify-between p-4">
        <div>
          <Link to="/">
            <img src={logo} alt="logo" className="w-12" />
          </Link>
        </div>
        <nav className="font-bold text-xs">
          <Link to="/quotation" className="pr-7">Quotation</Link>
          <Link to="/aboutus" className="pr-7">About Us</Link>
          <a onClick={logout} className=" hover:font-bold cursor-pointer">Log out →</a>          
        </nav>
      </header>

      <section className="hero-section flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-5xl font-bold pb-8">
          Empower Your<br /> Financial Decisions
        </h1>
        <p className="text-gray-500 font-medium">
          Track, manage, and simplify your finances with clarity <br />and confidence — anytime, anywhere
        </p>
        <div className="pt-8">
          <Link
            to="/login"
            className="bg-[rgb(13,84,144)] text-white rounded-md p-3"
          >
            Get started
          </Link>
          <a href="#" className="font-bold text-xs pl-5">
            Learn more →
          </a>
        </div>
      </section>

      <footer className="flex items-center justify-center text-sm bg-[rgb(13,84,144)] text-white w-full p-3">
        <p>Use for Tailwind Demo &copy; Faculty of ICT, Mahidol University</p>
      </footer>
    </div>
  );
}
