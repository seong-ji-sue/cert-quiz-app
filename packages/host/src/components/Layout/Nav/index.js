import {navContent} from '@/contents/nav';
import NavItem from '@/components/Layout/Nav/NavItem';

const Nav = () => {
	return (
		<div>
			<div>next/js 컴포넌트 테스트</div>
			<div>
				{navContent.map((v) => (
					<NavItem key={v.title} data={v} deep={0} />
				))}
			</div>
		</div>
	);
};

export default Nav;
