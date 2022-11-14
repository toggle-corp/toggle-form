import React from 'react';

import styles from './styles.module.css';

interface Props {
    value: string | null | undefined;
}

function NonFieldError(props: Props) {
    const {
        value,
    } = props;

    if (!value) {
        return null;
    }

    return (
        <p className={styles.nonFieldError}>
            {value}
        </p>
    );
}

export default NonFieldError;
