export const serverHealthStats = [
    { title: "CPU Usage", value: "42%", subValue: "100%", percentage: 42, status: "Healthy" as const },
    { title: "RAM Usage", value: "80%", subValue: "100%", percentage: 80, status: "Warning" as const },
    { title: "Disk Usage", value: "42%", subValue: "100%", percentage: 42, status: "Healthy" as const },
    { title: "System Uptime", value: "99%", percentage: 99, status: "Healthy" as const },
];

export const apiHealthStats = [
    { title: "API Success Rate", value: "99.2%", percentage: 99.2 },
    { title: "API Failure Rate", value: "0.8%", percentage: 0.8 },
];
