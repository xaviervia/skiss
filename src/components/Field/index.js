import React from 'react'
import styles from './styles.css'

export default function Field ({children, prop, props}) {
  return <label className={styles.field}>
    <dl>
      <dt className={styles.fieldTitle}>{prop}</dt>
      <dd className={styles.fieldInputWrapper}>
        {children}
      </dd>
    </dl>
  </label>
}
