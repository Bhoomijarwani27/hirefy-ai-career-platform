import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function SocialLogin() {
  return (
    <div className="space-y-4">
      {/* Social Login Buttons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Google */}
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-center gap-2"
        >
          <FcGoogle className="size-5" />
          Continue with Google
        </Button>

        {/* GitHub */}
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-center gap-2"
        >
          <FaGithub className="size-5" />
          Continue with GitHub
        </Button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />

        <span className="text-xs font-medium text-muted-foreground">
          OR
        </span>

        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}