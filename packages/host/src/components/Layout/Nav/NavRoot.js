'use client';

import React from 'react';
import {useRecoilState} from 'recoil';
import NavItem from '@/components/Layout/Nav/NavItem';
import {navArrowDownIcon, navArrowUpIcon} from '@nextpr/client-common/icons';
import {navState} from '@nextpr/client-common/store/nav';

const NavRoot = ({title, content, deep, base}) => {
	const [nav, setNav] = useRecoilState(navState);
	const isOpened = nav.structure?.[base] ?? false;
	const onClickClose = () => {
		setNav({...nav, structure: {...nav.structure, [base]: !isOpened}});
	};

	return (
		<>
			<div key={title} onClick={onClickClose}>
				<div>
					<div>{title}</div>
					{isOpened ? navArrowUpIcon : navArrowDownIcon}
				</div>
			</div>
			{isOpened &&
				content.map((val, index) => (
					<NavItem key={index} data={val} deep={deep + 1} />
				))}
		</>
	);
};

export default NavRoot;
