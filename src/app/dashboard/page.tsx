"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, orderBy, Timestamp, type DocumentData } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useAuth } from "@/components/providers/auth-provider";
import { db, storage } from "@/lib/firebase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileAudio, Download, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components
import { useToast } from "@/hooks/use-toast";

interface Summary extends DocumentData {
  id: string;
  fileName: string;
  summaryText: string;
  generatedTimestamp: Timestamp;
  userId: string;
}

// Placeholder for calling the Cloud Function (replace with actual implementation if needed)
async function getAudioAccessUrl(fileName: string): Promise<{ url?: string; error?: string }> {
  console.log("Attempting to get audio access URL for:", fileName);
  // In a real app, you'd make an HTTPS call to your Firebase Function here.
  // This requires setting up Firebase Functions and deploying `getAudioAccessUrl`.
  // Example using fetch:
  /*
  try {
    const token = await auth.currentUser?.getIdToken(); // Get Firebase Auth ID token
    const response = await fetch('/api/getAudioAccessUrl', { // Or your function URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ fileName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || 'Failed to get audio URL' };
    }

    const data = await response.json();
    return { url: data.url };
  } catch (error: any) {
    console.error("Error calling getAudioAccessUrl function:", error);
    return { error: error.message || 'Failed to get audio URL' };
  }
  */

  // Simulate based on premium status for prototype
  // This is NOT secure and only for frontend demonstration
  const { user, userData } = useAuth(); // Use the hook directly inside the component/handler function
  if (!user || !auth || !storage) return { error: "User not authenticated or Firebase not initialized" };


  if (userData?.isPremium) {
     try {
        // Construct the storage path
        const storagePath = `uploads/${user.uid}/${fileName}`;
        const storageRef = ref(storage, storagePath);
        // Generate a download URL (this doesn't enforce premium server-side)
        const url = await getDownloadURL(storageRef);
        return { url };
     } catch (error: any) {
        console.error("Error getting download URL from storage:", error);
         if (error.code === 'storage/object-not-found') {
             return { error: "Audio file not found." };
         }
        return { error: "Could not generate audio link." };
     }
  } else {
    return { error: "Premium access required." };
  }
}


export default function DashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loadingSummaries, setLoadingSummaries] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if not logged in after auth check is complete
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && db) { // Check if db is initialized
      setLoadingSummaries(true);
      setError(null);
      const summariesCol = collection(db, "summaries");
      const q = query(
        summariesCol,
        where("userId", "==", user.uid),
        orderBy("generatedTimestamp", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const fetchedSummaries: Summary[] = [];
          querySnapshot.forEach((doc) => {
            fetchedSummaries.push({ id: doc.id, ...doc.data() } as Summary);
          });
          setSummaries(fetchedSummaries);
          setLoadingSummaries(false);
        },
        (err) => {
          console.error("Error fetching summaries:", err);
          setError("Failed to load summaries. Please try again later.");
          setLoadingSummaries(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } else if (!user) {
       // If user logs out, clear summaries and stop loading
       setSummaries([]);
       setLoadingSummaries(false);
    } else if (!db) {
        // If db is not initialized
        setError("Database connection failed. Please try again later.");
        setLoadingSummaries(false);
    }
  }, [user]); // Rerun when user changes

   const handleListenDownload = async (fileName: string) => {
    toast({ title: "Processing...", description: "Getting audio link..." });
    const result = await getAudioAccessUrl(fileName); // Call placeholder function

    if (result.url) {
      toast({
        title: "Success!",
        description: "Opening audio link.",
      });
      // Open the URL in a new tab
       window.open(result.url, '_blank');
    } else {
      toast({
        title: "Access Denied",
        description: result.error || "Could not get audio link.",
        variant: "destructive",
      });
    }
  };


  // Show loading state while auth or summaries are loading
  if (authLoading || (user && loadingSummaries)) {
    return (
       <div className="space-y-6">
         <h1 className="text-3xl font-bold">Your Audio Summaries</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                 <Card key={index}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-1" />
                        <Skeleton className="h-4 w-1/4 mt-1" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-32" />
                    </CardFooter>
                </Card>
              ))}
          </div>
       </div>
    );
  }

  // If user is definitely not logged in (should be handled by redirect, but as fallback)
  if (!user) {
    return null; // Or a message indicating redirection
  }


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Your Audio Summaries</h1>

       {error && (
        <Alert variant="destructive">
           <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {summaries.length === 0 && !loadingSummaries && !error && (
         <Alert>
           <FileAudio className="h-4 w-4" />
          <AlertTitle>No Summaries Yet</AlertTitle>
          <AlertDescription>
            You haven't uploaded any audio files for summarization. Uploads from your device will appear here once processed.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaries.map((summary) => (
          <Card key={summary.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileAudio className="w-5 h-5 text-primary" />
                <span className="truncate flex-1" title={summary.fileName}>
                  {summary.fileName}
                </span>
              </CardTitle>
              <CardDescription>
                Summarized on:{" "}
                {summary.generatedTimestamp?.toDate().toLocaleDateString()}{" "}
                {summary.generatedTimestamp?.toDate().toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-foreground line-clamp-4"> {/* Added line-clamp */}
                  {summary.summaryText}
              </p>
            </CardContent>
            <CardFooter>
              {userData?.isPremium ? (
                <Button
                  variant="secondary"
                  size="sm"
                   onClick={() => handleListenDownload(summary.fileName)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Listen / Download Audio
                </Button>
              ) : (
                 <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                         <Button variant="outline" size="sm" disabled className="cursor-not-allowed">
                            <Download className="mr-2 h-4 w-4" />
                            Listen / Download Audio
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upgrade to Premium to access original audio.</p>
                      </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
