import { useEffect, useState } from "react";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import bg2 from "@/assets/bg2.png";
import { logout } from "@/services/logoutService"
interface User {
  firstname: string;
  lastname: string;
  email: string;
}

export default function AboutUsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("UserID");
    if (!id) {
      console.error("No user ID found in localStorage");
      return;
    }

    api
      .get(`/users/${id}`)
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading user info...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header>
        <nav className="flex items-center justify-between p-4 text-xs font-bold">
          <div>
            <a href="/">Home</a>
          </div>
          <div className="space-x-6">
            <a href="/invoice">Invoice</a>
            <a href="/quotation">Quotation</a>
            <a href="/about">About Us</a>
          </div>
            <a onClick={logout} className=" hover:font-bold cursor-pointer">Log out →</a>          
        </nav>

        <div className="relative w-full h-60 opacity-90">
          <img
            src={bg2}
            alt="banner"
            className="absolute inset-0 w-full h-full object-cover brightness-50"
          />
          <h1 className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
            About Us
          </h1>
        </div>
      </header>

      {/* User Card Section */}
      <main className="flex-grow flex justify-center items-center py-10">
        <Card className="w-[350px] shadow-xl border rounded-2xl bg-white text-center">
          <CardHeader>
            <Avatar className="w-24 h-24 mx-auto mb-3 bg-[rgb(13,84,144)] text-white">
              <AvatarFallback className="text-2xl font-bold">
                {user.firstname?.charAt(0)}
                {user.lastname?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl font-semibold text-[rgb(13,84,144)]">
              {user.firstname} {user.lastname}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 space-y-2">
            <p>
              <span className="font-semibold text-gray-800">Email:</span>{" "}
              {user.email}
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-auto flex items-center justify-center text-sm bg-[rgb(13,84,144)] text-white w-full p-3">
        <p>Use for Tailwind Demo © Faculty of ICT, Mahidol University</p>
      </footer>
    </div>
  );
}
