/* eslint-disable no-undef */
import { render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';
import PostPreview, { getStaticProps } from '../../pages/posts/preview/[slug]';

const post = {
  slug: 'my-new-post', title: 'My New Post', content: '<p>Post excerpt</p>', updatedAt: '21 de Maio',
};

jest.mock('../../services/prismic');
jest.mock('next-auth/client');
jest.mock('next/router');

describe('Post preview page', () => {
  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<PostPreview post={post} />);

    expect(screen.getByText('My New Post'));
    expect(screen.getByText('Post excerpt'));
    expect(screen.getByText('Wanna continue reading?'));
  });

  it('redirects user to full post when user is subscribed', async () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce([
      { activeSubscription: 'fake-active-subscription' },
      false,
    ] as any);

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<PostPreview post={post} />);

    expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post');
  });

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'My New Post' }],
          content: [{ type: 'paragraph', text: 'My New Post Content' }],
        },
        last_publicashion_date: '04-01-2021',
      }),
    } as any);

    const response = await getStaticProps({
      params: { slug: 'my-new-post' },
    });

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My New Post',
            content: 'My New Post Content',
            updatedAt: '01 de abril de 2021',
          },
        },
      }),
    );
  });
});