import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Search, LogOut, User, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const { data: user } = useQuery({
    queryKey: ['/api/users/current'],
  });
  
  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await apiRequest("POST", "/api/logout", {});
        // Redirect or refresh the page
        window.location.href = "/";
      } catch (error) {
        toast({
          title: "Logout failed",
          description: "There was an error logging out",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    toast({
      title: "Search",
      description: `Searching for: ${searchQuery}`,
    });
  };

  return (
    <header className="bg-yellow-200 text-black shadow-md z-10">
      <div className="px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">StarTenderManagement</h1>
          </div>
          
          <div className="flex items-center">
            <form onSubmit={handleSearch} className="relative mr-4">
              <Input
                type="text"
                placeholder="Search..."
                className="bg-white rounded-md px-3 py-1 focus:outline-none text-sm w-40 md:w-64 text-black placeholder:text-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-2 top-2 h-4 w-4 text-gray-500" />
            </form>
            
            <div className="flex items-center">
              <button className="mr-4 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
              </button>
              
              <div className="flex items-center">
                <User className="h-5 w-5 mr-1" />
                <span className="hidden md:inline">{user?.name || "Admin User"}</span>
                <button className="ml-4" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
