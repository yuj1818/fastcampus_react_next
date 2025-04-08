import React from 'react';
import classNames from 'classnames/bind';
import styles from './Video.module.scss';

import Section from '@shared/Section';

const cx = classNames.bind(styles);

function Video() {
  return (
    <Section className={cx('container')}>
      <video
        autoPlay={true}
        muted={true}
        loop={true}
        poster="/assets/poster.jpg"
      >
        <source src="/assets/main.mp4" />
      </video>
    </Section>
  );
}

export default Video;
