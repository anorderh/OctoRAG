import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMessage } from '../../hooks/useMessage';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';

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
                className="rounded-3 p-2 d-inline-flex text-center justify-content-center align-items-center mb-3"
                style={{
                    backgroundColor: 'var(--color-ai)',
                    maxWidth: '60%',
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
                )}
            </div>
        </div>
    );
}
