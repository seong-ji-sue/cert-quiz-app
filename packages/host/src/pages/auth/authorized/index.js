import React from 'react';
import styles from './authorized.module.scss';
import {useForm} from 'react-hook-form';
import {authState} from '@nextpr/client-common/store/auth';
import {useSetRecoilState} from 'recoil';
import {bffReqApi} from '@nextpr/client-common/api';
import Axios from '@nextpr/client-common/axios';
import PublicProvider from '@/provider/PublicProvider';

const content = {
	id: {label: '아이디', placeholder: '아이디를 입력하세요'},
	password: {label: '비밀번호', placeholder: '비밀번호를 입력하세요'},
	submit: {label: '로그인'},
};

const Page = () => {
	const {register, handleSubmit} = useForm();
	const setAuthState = useSetRecoilState(authState);

	const onSubmit = async ({userId, password}) => {
		try {
			const res = await Axios.post(bffReqApi.auth.login, {
				id: userId,
				password,
			});

			if (res.data) setAuthState(res.data);
		} catch (e) {
			console.error(e);
			alert('로그인에 실패했습니다.');
		}
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.card}>
				<h1 className={styles.title}>로그인</h1>

				<form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
					<div className={styles.field}>
						<label className={styles.label} htmlFor='userId'>
							{content.id.label}
						</label>
						<input
							{...register('userId')}
							id='userId'
							type='text'
							className={styles.input}
							placeholder={content.id.placeholder}
						/>
					</div>

					<div className={styles.field}>
						<label className={styles.label} htmlFor='password'>
							{content.password.label}
						</label>
						<input
							{...register('password')}
							id='password'
							type='password'
							className={styles.input}
							placeholder={content.password.placeholder}
						/>
					</div>

					<button type='submit' className={styles.button}>
						{content.submit.label}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Page;

export const getStaticProps = async () => {
	// 이 페이지는 빌드 시점에 정적으로 생성됩니다.
	// 데이터 페칭이 필요 없으므로 props는 비어있습니다.
	return {
		props: {},
	};
};

Page.getLayout = (page) => {
	return <PublicProvider>{page}</PublicProvider>;
};
