"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { signUpEmail } from "@/app/auth/action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignUp() {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const handleSubmit = async (formData: FormData) => {
		startTransition(async () => {
			const result = await signUpEmail({}, formData);
			
			if (result?.error) {
				toast.error(result.error);
			} else if (result?.success) {
				toast.success("Account created successfully!");
				router.push("/dashboard");
			}
		});
	};

	return (
		<form action={handleSubmit} className="space-y-3 sm:space-y-4">
			<div className="grid grid-cols-2 gap-2.5 sm:gap-4">
				<div className="space-y-1.5 sm:space-y-2">
					<Label htmlFor="firstName" className="text-foreground text-sm">
						First name
					</Label>
					<Input
						id="firstName"
						name="firstName"
						placeholder="Max"
						required
						className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-border h-10 sm:h-11 text-base"
					/>
				</div>
				<div className="space-y-1.5 sm:space-y-2">
					<Label htmlFor="lastName" className="text-foreground text-sm">
						Last name
					</Label>
					<Input
						id="lastName"
						name="lastName"
						placeholder="Robinson"
						required
						className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-border h-10 sm:h-11 text-base"
					/>
				</div>
			</div>
			
			<div className="space-y-1.5 sm:space-y-2">
				<Label htmlFor="email" className="text-foreground text-sm">
					Email
				</Label>
				<Input
					id="email"
					name="email"
					type="email"
					placeholder="m@example.com"
					required
					className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-border h-10 sm:h-11 text-base"
				/>
			</div>
			
			<div className="space-y-1.5 sm:space-y-2">
				<Label htmlFor="password" className="text-foreground text-sm">
					Password
				</Label>
				<Input
					id="password"
					name="password"
					type="password"
					autoComplete="new-password"
					placeholder="Password"
					required
					className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-border h-10 sm:h-11 text-base"
				/>
			</div>
			
			<div className="space-y-1.5 sm:space-y-2">
				<Label htmlFor="passwordConfirmation" className="text-foreground text-sm">
					Confirm Password
				</Label>
				<Input
					id="passwordConfirmation"
					name="passwordConfirmation"
					type="password"
					autoComplete="new-password"
					placeholder="Confirm Password"
					required
					className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-border h-10 sm:h-11 text-base"
				/>
			</div>
			
			<Button
				type="submit"
				className="w-full h-10 sm:h-11 text-base touch-manipulation active:scale-95"
				disabled={isPending}
			>
				{isPending ? (
					<Loader2 size={16} className="animate-spin mr-2" />
				) : null}
				Create an account
			</Button>
		</form>
	);
}