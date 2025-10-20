"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignIn from "@/components/sign-in";

export default function AuthClient() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background p-3 sm:p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-2xl">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-center text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
              Welcome to Sunx
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Sign in to continue
            </p>
          </CardHeader>
          
          <CardContent className="pt-0 px-4 sm:px-6">
            <SignIn />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
