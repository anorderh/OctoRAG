import { ChatStatus } from '../../shared/constants/chat-status.enums';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';

export type ChatStatusBadgeProps = ComponentProps & {
    status: ChatStatus;
};

export function ChatStatusBadge({ status }: ChatStatusBadgeProps) {
    if (status == ChatStatus.IDLE)
        return (
            <div className="badge p-2 bg-secondary rounded-2 fs-6">
                <span>IDLE</span>
            </div>
        );
    if (status == ChatStatus.LOADING)
        return (
            <div className="ms-auto badge p-2 bg-info rounded-2 fs-6">
                <span>LOADING</span>
            </div>
        );
    if (status == ChatStatus.READY)
        return (
            <div className="ms-auto badge p-2 bg-primary rounded-2 fs-6">
                <span>READY</span>
            </div>
        );
    if (status == ChatStatus.RESPONDING)
        return (
            <div className="ms-auto badge p-2 bg-warning rounded-2 fs-6">
                <span>RESPONDING</span>
            </div>
        );
}
