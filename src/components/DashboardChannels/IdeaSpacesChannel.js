import React from 'react';
import { NewButton } from './HelperComponents';

import styles from './DashboardChannels.module.scss';
import IdeaSpaceTile from './IdeaSpaceTile';

export default function IdeaSpacesChannel({
  width,
  left,
  opacity,
}) {
  const ideaSpaceTiles = [
    <IdeaSpaceTile name="Name of Idea Space" activityDate={new Date()} onClick={() => {}} numberOfAnnotations={0} />,
    <IdeaSpaceTile name="Name of Idea Space" activityDate={new Date()} onClick={() => {}} numberOfAnnotations={5} />,
  ];
  return (
    <div
      className={styles.channelContainer}
      style={{
        width, left, minWidth: 300, opacity,
      }}
    >
      <div className={styles.headerContainer}>
        <span className={`${styles.headerText} ${styles.headerLink}`}>
          Idea Spaces
        </span>
        <NewButton onClick={() => {}} />
      </div>
      <div className={styles.tileContainer}>
        {ideaSpaceTiles}
      </div>

    </div>
  );
}
