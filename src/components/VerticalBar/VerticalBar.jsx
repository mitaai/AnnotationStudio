/* eslint-disable jsx-a11y/interactive-supports-focus */

import { useState } from 'react';
import { RID } from '../../utils/docUIUtils';
import CommentCard from '../CommentCard';

export default function VerticalBar({
  left = 0, top = 0, height = 430, fill = '#4568AC',
}) {
  const [hover, setHover] = useState();
  const [commentCardHeight, setCommentCardHeight] = useState(0);
  const [commentCardId] = useState(RID());

  const triangleHWRatio = 32 / 19;
  const triangleWidth = 5;
  const triangleHeight = triangleWidth * triangleHWRatio;

  const v = height - triangleHeight;

  const f = hover ? '#015999' : fill;

  return (
    <div
      style={{ position: 'absolute', left, top }}
      role="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover()}
      onFoucs={() => {}}
    >
      <div style={{
        position: 'absolute',
        left: -16.5,
        top: -commentCardHeight - 10,
        visibility: hover ? 'visible' : 'hidden',
        transition: 'all 0.25s',
      }}
      >
        <CommentCard id={commentCardId} type="success" setHeight={setCommentCardHeight} documents={[{ title: 'hello' }]} />
      </div>
      <svg width={triangleWidth} height={height} viewBox={`0 0 ${triangleWidth} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={`M-4.76837e-07 ${v}V${height}H${triangleWidth}L-4.76837e-07 ${v}Z`} fill={f} />
        <path d={`M-4.76837e-07 ${triangleHeight}V-2.38419e-07H${triangleWidth}L-4.76837e-07 ${triangleHeight}Z`} fill={f} />
        <rect width="3" height={height} fill={f} />
      </svg>
    </div>
  );
}
