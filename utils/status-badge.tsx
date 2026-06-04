const StatusBadge = ({ status }: { status: string }) => (
    <span className={`text-sm ${status === 'Active' ? 'text-green' : 'text-primary'}`}>
        {status}
    </span>
);

export default StatusBadge;