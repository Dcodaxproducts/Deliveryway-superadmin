import { Switch } from "@/components/ui/switch";
import { notificationChannels, alertTypes } from "@/constants/integration";

const AlertsAndNotificationsSection = () => {
    return (
        <section className="bg-white rounded-[14px] p-4 lg:p-[30px] shadow-sm space-y-8">
            <div>
                <h3 className="text-lg font-bold text-dark">Alert & Notifications</h3>
                <p className="text-sm text-gray">Configure how and where system alerts are delivered.</p>
            </div>
            <div>
                <h4 className="text-base text-dark mb-4">Notification Channels</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {notificationChannels.map((channel, index) => (
                        <ChannelToggle key={index} icon={<channel.icon size={18} />} label={channel.label} />
                    ))}
                </div>
            </div>
            <div>
                <h4 className="text-base text-dark mb-4">Alert Types</h4>
                <div className="space-y-4">
                    {alertTypes.map((alert, index) => (
                        <AlertTypeToggle key={index} icon={<alert.icon size={20} />} title={alert.title} description={alert.description} />
                    ))}
                </div>
            </div>
        </section>
    );
};

function ChannelToggle({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-[12px]">
            <div className="flex items-center gap-3 text-gray-400">
                {icon}
                <span className="text-base font-semibold">{label}</span>
            </div>
            <Switch className="data-[state=checked]:bg-primary" defaultChecked />
        </div>
    );
}

function AlertTypeToggle({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-[12px]">
            <div className="flex items-center gap-4">
                <div className="text-gray-400">
                    {icon}
                </div>
                <div>
                    <h5 className="text-base font-semibold text-dark">{title}</h5>
                    <p className="text-sm text-gray">{description}</p>
                </div>
            </div>
            <Switch className="data-[state=checked]:bg-primary" defaultChecked />
        </div>
    );
}

export default AlertsAndNotificationsSection;
