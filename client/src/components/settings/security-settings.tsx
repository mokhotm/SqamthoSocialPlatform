import { UserSettings } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface SecuritySettingsProps {
  settings: UserSettings;
  onUpdate: (settings: Partial<UserSettings>) => void;
}

export function SecuritySettings({ settings, onUpdate }: SecuritySettingsProps) {
  return (
    <div className="space-y-4">
      <Label>Security</Label>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security
            </p>
          </div>
          <Switch
            id="twoFactor"
            checked={settings?.securitySettings?.twoFactorEnabled}
            onCheckedChange={(checked) =>
              onUpdate({
                securitySettings: {
                  ...settings?.securitySettings,
                  twoFactorEnabled: checked,
                },
              })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="loginAlerts">Login Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Get notified of new sign-ins
            </p>
          </div>
          <Switch
            id="loginAlerts"
            checked={settings?.securitySettings?.loginAlerts}
            onCheckedChange={(checked) =>
              onUpdate({
                securitySettings: {
                  ...settings?.securitySettings,
                  loginAlerts: checked,
                },
              })
            }
          />
        </div>

        {settings?.securitySettings?.activeSessions && 
         settings.securitySettings.activeSessions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium">Active Sessions</h3>
            <div className="mt-2 space-y-2">
              {settings.securitySettings.activeSessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="flex items-center justify-between p-2 text-sm border rounded"
                >
                  <div>
                    <p className="font-medium">{session.deviceInfo}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.location} • Last active: {session.lastActive}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updatedSessions = settings.securitySettings.activeSessions.filter(
                        (s) => s.sessionId !== session.sessionId
                      );
                      onUpdate({
                        securitySettings: {
                          ...settings.securitySettings,
                          activeSessions: updatedSessions,
                        },
                      });
                    }}
                  >
                    End Session
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {settings?.securitySettings?.trustedDevices && 
         settings.securitySettings.trustedDevices.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium">Trusted Devices</h3>
            <div className="mt-2 space-y-2">
              {settings.securitySettings.trustedDevices.map((device) => (
                <div
                  key={device.deviceId}
                  className="flex items-center justify-between p-2 text-sm border rounded"
                >
                  <div>
                    <p className="font-medium">{device.deviceName}</p>
                    <p className="text-xs text-muted-foreground">
                      Last used: {device.lastUsed}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updatedDevices = settings.securitySettings.trustedDevices.filter(
                        (d) => d.deviceId !== device.deviceId
                      );
                      onUpdate({
                        securitySettings: {
                          ...settings.securitySettings,
                          trustedDevices: updatedDevices,
                        },
                      });
                    }}
                  >
                    Remove Device
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
