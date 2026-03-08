import {atom} from 'recoil';
import {recoilPersist} from 'recoil-persist';

const {persistAtom} = recoilPersist({
	key: 'recoil-persist',
	storage: typeof window !== 'undefined' ? sessionStorage : null,
});

export const authState = atom({
	key: 'auth',
	default: {},
	effects_UNSTABLE: [persistAtom],
});
