/* eslint-disable no-undef */
import { render, screen } from '@testing-library/react';
import { ActiveLink } from '../../components/ActiveLink';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      asPath: '/',
    };
  },
}));

describe('ActiveLink component', () => {
  it('renders correctly', () => {
    render(
      <ActiveLink href="/" activeClassName="active">
        <a>Home</a>
      </ActiveLink>,
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('add active class if the link as currently active', () => {
    render(
      <ActiveLink href="/" activeClassName="active">
        <a>Home</a>
      </ActiveLink>,
    );

    expect(screen.getByText('Home')).toHaveClass('active');
  });
});
