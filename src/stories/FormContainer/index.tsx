import React, { useMemo } from 'react';

import styles from './styles.css';

interface RowProps {
    children: React.ReactNode;
}

export function Row(props: RowProps) {
    const { children } = props;
    return (
        <div className={styles.row}>
            {children}
        </div>
    );
}

interface FormContainerProps {
    children: React.ReactNode;
    value: unknown;
}

function FormContainer(props: FormContainerProps) {
    const { children, value } = props;

    const stringValue = useMemo(
        () => JSON.stringify(
            value,
            (_, v) => (v === undefined ? '__undefined' : v),
            2,
        ),
        [value],
    );
    return (
        <div className={styles.container}>
            {children}
            <pre className={styles.codeBlock}>
                <code>
                    {stringValue}
                </code>
            </pre>
        </div>
    );
}

export default FormContainer;
