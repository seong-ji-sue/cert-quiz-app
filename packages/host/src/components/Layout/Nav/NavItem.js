import React from 'react';
import NavRoot from '@/components/Layout/Nav/NavRoot';
import NavLeaf from '@/components/Layout/Nav/NavLeaf';

const NavItem = ({data, deep}) => {
	const hasChildren = (item) => 'content' in item && 'base' in item;

	return (
		<>
			{hasChildren(data) ? (
				<NavRoot
					deep={deep}
					title={data.title}
					content={data.content}
					base={data.base}
				/>
			) : (
				<NavLeaf deep={deep} title={data.title} url={data.url} />
			)}
		</>
	);
};

export default NavItem;
