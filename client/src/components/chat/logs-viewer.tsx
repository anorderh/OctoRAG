export type Log = {
    id: string | number;
    timestamp: string;
    content: string;
};

type LogsViewerProps = {
    logs: Log[];
};

export function LogsViewer({ logs }: LogsViewerProps) {
    return (
        <div
            className="
                border    
                bg-black
                rounded-lg
                h-[60vh]
                overflow-y-auto
                pr-2
                p-4
            ">
            <div className="flex flex-col gap-6">
                {logs.map((log) => (
                    <div key={log.id} className="flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground">
                            {log.timestamp}
                        </p>

                        <p className="text-sm leading-relaxed text-foreground">
                            {log.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
