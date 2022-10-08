import React, { useMemo } from 'react';

import styles from './styles.module.css';

interface EquiRowProps {
    children: React.ReactNode;
}
export function EquiRow(props: EquiRowProps) {
    const { children } = props;
    return (
        <div className={styles.equiRow}>
            {children}
        </div>
    );
}

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
    prevValue?: unknown;
    value: unknown;
}

function FormContainer(props: FormContainerProps) {
    const {
        children,
        value,
        prevValue,
    } = props;

    const stringPrevValue = useMemo(
        () => {
            if (!prevValue) {
                return undefined;
            }
            return JSON.stringify(
                prevValue,
                (_, v) => (v === undefined ? '__undefined__' : v),
                2,
            );
        },
        [prevValue],
    );

    const stringValue = useMemo(
        () => JSON.stringify(
            value,
            (_, v) => (v === undefined ? '__undefined__' : v),
            2,
        ),
        [value],
    );
    return (
        <div className={styles.container}>
            <div>
                <h3>Form</h3>
                {children}
            </div>
            {stringPrevValue && (
                <div>
                    <h3>Previous Value</h3>
                    <pre className={styles.codeBlock}>
                        <code>
                            {stringPrevValue}
                        </code>
                    </pre>
                </div>
            )}
            <div>
                <h3>Value</h3>
                <pre className={styles.codeBlock}>
                    <code>
                        {stringValue}
                    </code>
                </pre>
            </div>
        </div>
    );
}

export default FormContainer;
