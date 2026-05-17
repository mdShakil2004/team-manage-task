import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { Shield, KeyRound, Moon, Sun, Bell } from "lucide-react";

export const Route = createFileRoute("/app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user, theme, toggleTheme } = useApp();
  return (
    <>
      <PageHeader title="Settings" description="Manage your profile, security, and preferences." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); toast.success("Profile updated"); }} className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16"><AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">{user.initials}</AvatarFallback></Avatar>
                  <div>
                    <Button type="button" variant="outline" size="sm">Change avatar</Button>
                    <p className="text-xs text-muted-foreground mt-2">PNG or JPG, up to 2MB.</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Full name</Label><Input defaultValue={user.name} /></div>
                  <div className="space-y-1.5"><Label>Email</Label><Input type="email" defaultValue={user.email} /></div>
                  <div className="space-y-1.5"><Label>Title</Label><Input defaultValue={user.title} /></div>
                  <div className="space-y-1.5"><Label>Time zone</Label><Input defaultValue="UTC−05:00 (New York)" /></div>
                </div>
                <div className="flex justify-end"><Button type="submit">Save changes</Button></div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4" /> Password</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); toast.success("Password updated"); }} className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5"><Label>Current</Label><Input type="password" required /></div>
                  <div className="space-y-1.5"><Label>New</Label><Input type="password" required /></div>
                  <div className="space-y-1.5"><Label>Confirm</Label><Input type="password" required /></div>
                </div>
                <div className="flex justify-end"><Button type="submit" variant="outline">Update password</Button></div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <NotifRow label="Task assignments" desc="When someone assigns a task to you" defaultChecked />
              <Separator />
              <NotifRow label="Mentions & comments" desc="When you're @mentioned anywhere" defaultChecked />
              <Separator />
              <NotifRow label="Project updates" desc="Status changes on projects you're a member of" />
              <Separator />
              <NotifRow label="Weekly digest" desc="A summary email every Monday morning" defaultChecked />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Theme</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Use light or dark mode.</div>
                </div>
                <Button variant="outline" size="sm" onClick={toggleTheme}>
                  {theme === "light" ? <><Moon className="h-4 w-4 mr-1.5" /> Dark</> : <><Sun className="h-4 w-4 mr-1.5" /> Light</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-success" /> Account security</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs text-success-foreground">
                Two-factor authentication is enabled.
              </div>
              <Button variant="outline" className="w-full" size="sm">Manage active sessions</Button>
              <Button variant="outline" className="w-full" size="sm">Download account data</Button>
              <Separator />
              <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" size="sm">Delete account</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function NotifRow({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
