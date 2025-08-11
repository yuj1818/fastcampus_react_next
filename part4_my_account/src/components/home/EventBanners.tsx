import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { css } from '@emotion/react';
import useEventBanners from './hooks/useEventBanners';
import withSuspense from '@shared/hocs/withSuspense';
import Flex from '@shared/Flex';
import Text from '@shared/Text';
import Skeleton from '@shared/Skeleton';
import ErrorBoundary from '@shared/ErrorBoundary';

function EventBanners() {
  const { data } = useEventBanners();

  return (
    <div style={{ padding: 24 }}>
      <Swiper spaceBetween={8}>
        {data?.map((banner) => {
          return (
            <SwiperSlide key={banner.id}>
              <Link href={banner.link}>
                <Flex
                  justify="space-between"
                  align="center"
                  style={{ backgroundColor: banner.backgroundColor }}
                  css={bannerStyles}
                >
                  <Flex direction="column">
                    <Text bold={true}>{banner.title}</Text>
                    <Text typography="t6">{banner.subTitle}</Text>
                  </Flex>
                  <Image src={banner.iconUrl} width={40} height={40} alt="" />
                </Flex>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

const bannerStyles = css`
  padding: 24px;
  border-radius: 8px;
`;

function WrapErrorBoundary() {
  return (
    <ErrorBoundary fallbackComponent={<></>}>
      <EventBanners />
    </ErrorBoundary>
  );
}

export function BannerSkeleton() {
  return (
    <div style={{ padding: 24 }}>
      <Skeleton width="100%" height={100} style={{ borderRadius: 8 }} />
    </div>
  );
}

export default withSuspense(WrapErrorBoundary, {
  fallback: <BannerSkeleton />,
});
