"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useAuth } from "@/components/providers/auth-provider";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, LogIn, BrainCircuit, User, Settings } from "lucide-react"; // Added Settings
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export default function Header() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      if (!auth) {
        throw new Error("Firebase Auth not initialized");
      }
      await signOut(auth);
      toast({ title: "Logged out successfully." });
      router.push("/"); // Redirect to home/login page after logout
    } catch (error: any) {
      console.error("Logout error:", error);
       toast({
          title: "Logout failed",
          description: error.message || "Could not log out.",
          variant: "destructive",
       });
    }
  };

   const getInitials = (email?: string | null) => {
    if (!email) return <User className="h-4 w-4" />;
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors pl-2"> {/* Added pl-2 */}
           <BrainCircuit className="h-7 w-7" /> {/* Slightly larger icon */}
           <span className="font-bold text-xl tracking-tight"> {/* Slightly larger text */}
             Audio Insights {/* Updated company name */}
           </span>
         </Link>
        <nav>
          {user ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? user.email ?? 'User'} />
                            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                        </Avatar>
                     </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                        </p>
                         {userData?.isPremium && (
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="mt-1 inline-flex items-center rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary cursor-default">
                                            Premium Member
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>You have access to premium features.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     {/* Example: Link to a settings page */}
                     {/* <DropdownMenuItem onClick={() => router.push('/settings')}>
                       <Settings className="mr-2 h-4 w-4" />
                       <span>Settings</span>
                     </DropdownMenuItem>
                     <DropdownMenuSeparator /> */}
                     <DropdownMenuItem onClick={handleLogout}>
                         <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          ) : (
            /* No login button shown on login page itself */
            null
          )}
        </nav>
      </div>
    </header>
  );
}
