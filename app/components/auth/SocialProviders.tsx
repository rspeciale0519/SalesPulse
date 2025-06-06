import { Button } from "../ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FaGoogle, FaFacebook, FaXTwitter } from "react-icons/fa6";

export default function SocialProviders() {
  const supabase = createClientComponentClient();

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => handleSocialLogin('google')}
        >
          <FaGoogle className="h-4 w-4" />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => handleSocialLogin('facebook')}
        >
          <FaFacebook className="h-4 w-4" />
          Facebook
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={() => handleSocialLogin('twitter')}
        >
          <FaXTwitter className="h-4 w-4" />
          X
        </Button>
      </div>
    </div>
  );
}
