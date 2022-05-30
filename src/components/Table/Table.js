import React, { useEffect } from 'react';
import $ from 'jquery';
import { ThreeDotsVertical } from 'react-bootstrap-icons';
import styles from './Table.module.scss';

export default function Table({
  id = 'tableID',
  height,
  maxWidth = 1140,
  columnHeaders = [{ header: 'Empty Table', flex: 1, minWidth: 100 }],
  rows = [],
}) {
  // example of rows
  /*
    [
        {
            columns: [
                { content, style }
            ]
        }
    ]
  */

  const rowItemId = (i) => `row-item-${id}-${i}`;
  const rowHeight = height !== undefined ? `${height} - 65px` : undefined;

  const tableHeader = columnHeaders.map(
    ({ header, flex }) => (
      <div style={{
        flex, color: '#1F2532', fontWeight: 400, padding: 20,
      }}
      >
        {header}
      </div>
    ),
  );

  const rowItem = ({ columns, moreOptions }, rowItemIndex) => (
    <>
      <div
        id={rowItemId(rowItemIndex)}
        className={styles.rowItem}
        style={{
          backgroundColor: rowItemIndex % 2 === 0 ? '#FFFFFF' : '#FDFDFD',
        }}
      >
        {columns.map(({ content, style, highlightOnHover }, columnIndex) => (
          <div
            className={`${styles.cell} ${highlightOnHover ? styles.highlightOnHover : ''}`}
            style={{
              flex: columnHeaders[columnIndex].flex,
              minWidth: columnHeaders[columnIndex].minWidth,
              ...(style || {}),
            }}
          >
            {content}
          </div>
        ))}
        {moreOptions && (
        <div className={styles.moreOptions}>
          <div style={{ position: 'absolute', width: 10 }}>
            <ThreeDotsVertical size={18} />
          </div>
        </div>
        )}
      </div>
    </>
  );

  const rowItems = rows.map(rowItem);

  const onScroll = () => {
    if (!rows || rows?.length === 0) {
      return;
    }

    rows.map((...args) => {
      const [, index] = args;
      const tableRow = $(`#${rowItemId(index)}`);
      if (tableRow) {
        const rowContainerHeight = $('#row-container').height();
        const h = tableRow.height();
        const threshold = h;
        const stage1Height = h;
        const { top } = tableRow.position();
        const bottom = top + h;

        if (rowContainerHeight - (threshold - stage1Height) < bottom) {
          const percentage = (bottom - (rowContainerHeight - (threshold - stage1Height))) / h;
          if (percentage <= 1) {
            tableRow.css(
              '-webkit-mask-image',
              `-webkit-linear-gradient(rgba(0, 0, 0, ${1 - percentage}) 0%, rgba(0, 0, 0, 0) ${(1 - percentage) * 100}%, rgba(0, 0, 0, 0) 100%)`,
            );
          }
        } else if (rowContainerHeight - threshold < bottom) {
          const percentage = (bottom - (rowContainerHeight - threshold)) / stage1Height;
          tableRow.css(
            '-webkit-mask-image',
            `-webkit-linear-gradient(rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, ${1 - percentage}) 100%)`,
          );
        } else {
          tableRow.css('-webkit-mask-image', 'none');
        }
      }

      return null;
    });
  };

  useEffect(() => {
    onScroll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      maxWidth, display: 'flex', flexDirection: 'column', flex: 1, height: `calc(${height})`,
    }}
    >
      <div style={{
        backgroundColor: '#F8F8F8', display: 'flex', flexDirection: 'row', borderBottom: '1px solid #EBEFF3',
      }}
      >
        {tableHeader}
      </div>
      <div
        id="row-container"
        style={{
          position: 'relative',
          overflowY: 'scroll',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          height: `calc(${rowHeight})`,
        }}
        onScroll={onScroll}
      >
        {rowItems}
      </div>
    </div>
  );
}
