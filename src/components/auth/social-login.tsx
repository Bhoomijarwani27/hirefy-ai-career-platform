import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function SocialLogin() {
  return (
    <div className="space-y-3">
        {/* Google Login */}
        <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-center gap-2"
            >
              <FcGoogle className="h-5 w-5" />
              Continue with Google
        </Button>

        {/* Github Login */}
        <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-center gap-2"
            >
              <FaGithub className="h-5 w-5" />
                Continue with Github
        </Button>
        <div className="flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-border" />

             <span className="text-sm text-muted-foreground">
              OR
            </span>

            <div className="h-px flex-1 bg-border" />
         </div>
     </div>
  );
}