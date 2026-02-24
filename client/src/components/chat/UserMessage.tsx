import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMessage } from '../../hooks/useMessage';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';

type UserMessageProps = ComponentProps & {
    messageId: string;
};

export function UserMessage({ messageId }: UserMessageProps) {
    const msg = useMessage(messageId);
    return (
        <div className="w-100 d-flex flex-row justify-content-end align-items-end gap-2">
            <div
                className="rounded-3 p-3 justify-content-center align-items-center mb-3"
                style={{
                    border: '4px solid var(--color-user)',
                    backgroundColor: 'var(--bg-user)',
                    maxWidth: '80%',
                    height: 'min-content',
                }}>
                <span
                    style={{
                        flex: 'inline-block',
                        whiteSpace: 'pre-wrap', // respects newlines
                        wordBreak: 'break-word', // breaks long words
                        overflowWrap: 'anywhere',
                        textAlign: 'left',
                    }}>
                    {msg?.content ?? ''}
                </span>
            </div>
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
                        width: 20,
                        height: 20,
                    }}
                    icon="fa-solid fa-user"
                />
            </div>
        </div>
    );
}
