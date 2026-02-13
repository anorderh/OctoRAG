import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ComponentProps } from '../../shared/interfaces/ComponentProps';

export type BadgeComponentProps = ComponentProps & {
    bsColor: 'primary' | 'danger' | 'success';
    text: string;
};

export function Badge({ text, bsColor }: BadgeComponentProps) {
    const bgClass = `bg-${bsColor}`;

    return (
        <div className={'border-primary p-3 rounded mx-2 ' + bgClass}>
            <FontAwesomeIcon icon="fa-solid fa-info-circle" className="me-2" />
            <span>{text}</span>
        </div>
    );
}
