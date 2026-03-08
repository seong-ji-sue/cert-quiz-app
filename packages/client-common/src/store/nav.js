import {recoilPersist} from 'recoil-persist';
import {atom} from 'recoil';

const {persistAtom} = recoilPersist({
	key: 'recoil-persist',
	storage: typeof window !== 'undefined' ? sessionStorage : null,
});

export const navState = atom({
	key: 'nav',
	default: {structure: {}},
	effects_UNSTABLE: [persistAtom],
});
