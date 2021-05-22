/* eslint-disable no-undef */
import { render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { getSession } from 'next-auth/client';

import { getPrismicClient } from '../../services/prismic';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';

const post = {
  slug: 'my-new-post', title: 'My New Post', content: '<p>Post excerpt</p>', updatedAt: '21 de Maio',
};

jest.mock('../../services/prismic');
jest.mock('next-auth/client');

describe('Post page', () => {
  it('renders correctly', () => {
    render(<Post post={post} />);

    expect(screen.getByText('My New Post'));
    expect(screen.getByText('Post excerpt'));
  });

  it('redirects user if no subscription is found', async () => {
    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null,
    } as any);

    const response = await getServerSideProps({
      params: {
        slug: 'my-new-post',
      },
    }) as any;

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/',
        }),
      }),
    );
  });

  it('loads initial data', async () => {
    const getSessionMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(getPrismicClient);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription',
    } as any);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'My New Post' }],
          content: [{ type: 'paragraph', text: 'My New Post Content' }],
        },
        last_publicashion_date: '04-01-2021',
      }),
    } as any);

    const response = await getServerSideProps({
      params: { slug: 'my-new-post' },
    } as any);

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
