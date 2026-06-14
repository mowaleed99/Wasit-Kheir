import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { usePostApiAuthGoogle } from "@/api/generated/auth/auth";
import { useQueryClient } from "@tanstack/react-query";


export const useGoogleAuth = (onSuccess?: () => void) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const { mutateAsync: googleSignIn } = usePostApiAuthGoogle();

    const signInWithGoogle = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);

            // Extract the Google OAuth credential — this gives us the raw Google
            // id_token (audience = Web Client ID) that the backend validates,
            // NOT the Firebase user token from result.user.getIdToken().
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const idToken = credential?.idToken;

            if (!idToken) {
                throw new Error("Could not retrieve Google ID token from credential.");
            }


            await googleSignIn({ data: { idToken } });

            // Wait briefly for auth cookie to be set
            await new Promise((resolve) => setTimeout(resolve, 200));
            await queryClient.invalidateQueries({ queryKey: ["/api/Users/me"] });

            onSuccess?.();
        } catch (err: any) {
            if (err?.code === "auth/popup-closed-by-user") {
                // User dismissed the popup — not an error
                setError(null);
            } else if (err?.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err?.message) {
                setError(err.message);
            } else {
                setError("Google sign-in failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return { signInWithGoogle, isLoading, error };
};
