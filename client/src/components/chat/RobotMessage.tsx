import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMessage } from '../../hooks/useMessage';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';
import { MessageMarkdown } from '../shared/MessageMarkdown';

type RobotMessageProps = ComponentProps & {
    messageId: string;
};

export function RobotMessage({ messageId }: RobotMessageProps) {
    const msg = useMessage(messageId);

    return (
        <div className="w-100 d-flex flex-row justify-content-start align-items-end gap-2">
            <div
                style={{
                    width: 50,
                    height: 50,
                    backgroundColor: 'var(--color-card)',
                    flexShrink: 0,
                }}
                className="rounded-circle shadow d-flex justify-content-center align-items-center">
                <FontAwesomeIcon
                    style={{
                        width: 25,
                        height: 25,
                    }}
                    icon="fa-solid fa-robot"
                />
            </div>
            <div
                className="rounded-3 p-3 justify-content-center align-items-center mb-3"
                style={{
                    border: '4px solid var(--color-ai)',
                    backgroundColor: 'var(--bg-ai)',
                    boxShadow: '0 0 0 2px rgba(0,0,0,0.25)',
                    maxWidth: '80%',
                    height: 'min-content',
                }}>
                {msg?.loading ? (
                    <FontAwesomeIcon
                        style={{
                            width: 25,
                            height: 25,
                        }}
                        icon="fa-solid fa-spinner"
                        spin
                    />
                ) : (
                    <MessageMarkdown message={msg!} />
                )}
            </div>
        </div>
    );
}
