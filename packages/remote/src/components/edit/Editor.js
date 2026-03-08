'use client';

import React from 'react';
import PreviewPanel from '@/components/edit/PreviewPanel';
import EditorPanel from '@/components/edit/EditorPanel';
import styles from './Edit.module.scss';

const Editor = () => {
	return (
		<div className={styles.container}>
			<PreviewPanel />
			<EditorPanel />
		</div>
	);
};

export default Editor;
