import React from 'react';
import styles from './EditorPanel.module.scss';
import Section from '@/components/edit/EditorPanel/Section';

const EditorPanel = () => {
	return (
		<div className={styles.container}>
			EditorPanel
			<Section />
		</div>
	);
};

export default EditorPanel;
