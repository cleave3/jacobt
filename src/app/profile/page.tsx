import { getProfileMetrics } from "@/app/actions/profile";
import { ProfileClient } from "@/components/profile/ProfileClient";
import { redirect } from "next/navigation";

export const metadata = {
    title: "My Profile | Jacobt",
    description: "Manage your personal information, security, and preferences.",
};

export default async function ProfilePage() {
    const result = await getProfileMetrics();

    if (!result.success || !result.user || !result.metrics) {
        redirect("/login");
    }

    return (
        <ProfileClient
            user={result.user}
            metrics={result.metrics}
        />
    );
}
