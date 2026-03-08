import {ToastContainer} from 'react-toastify';
import styles from './Toast.module.scss';

const Toast = () => {
	return (
		<ToastContainer
			position='top-center'
			autoClose={3000}
			hideProgressBar
			draggable={false}
			className={styles.toast_container}
		/>
	);
};

export default Toast;
