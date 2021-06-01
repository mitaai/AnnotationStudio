import React from 'react';

import styles from './DashboardChannels.module.scss';
import IdeaSpaceTile from './IdeaSpaceTile';
import TileBadge from '../TileBadge';

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
        <span className={styles.headerText}>
          Idea Spaces
        </span>
        <TileBadge text="New + " color="yellow" onClick={() => {}} />
      </div>
      <div className={styles.tileContainer}>
        {ideaSpaceTiles}
      </div>

    </div>
  );
}
