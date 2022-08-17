/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import Router from 'next/router';
import styles from './Table.module.scss';

export default function Table({
  id = 'tableID',
  height,
  maxWidth = 1140,
  headerStyle = {},
  noColumnHeaders,
  columnHeaders = [{ header: 'Empty Table', flex: 1, minWidth: 100 }],
  rows = [],
  fadeOnScroll = true,
  hoverable = true,
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

  const [rowItemHoveredKey, setRowItemHoveredKey] = useState();

  const rowItemId = (i) => `row-item-${id}-${i}`;
  const rowHeight = height !== undefined ? `${height} - 65px` : undefined;

  const tableHeader = columnHeaders.map(
    ({
      header, flex, minWidth, style = {},
    }) => (
      <div style={{
        flex, minWidth, color: '#1F2532', fontWeight: 400, padding: 20, ...style,
      }}
      >
        {header}
      </div>
    ),
  );

  const rowItem = ({
    key, href, columns, hoverContent, deleteHovered,
  }, rowItemIndex) => (
    <>
      <div
        key={key}
        id={rowItemId(rowItemIndex)}
        className={`${styles.rowItem} ${deleteHovered && styles.deleteHovered} ${!hoverable && styles.noHover}`}
        style={{
          backgroundColor: rowItemIndex % 2 === 0 ? '#FFFFFF' : '#FDFDFD',
          ...(rowItemIndex === rows.length - 1 ? { borderBottom: 'none' } : {}),
        }}
        onClick={href ? (ev) => {
          if (ev.target.closest('.table-hover-content') === null) {
            Router.push({ pathname: href });
          }
        } : () => {}}
        onMouseEnter={() => setRowItemHoveredKey(key)}
        onMouseLeave={() => setRowItemHoveredKey()}
      >
        {hoverContent && <div className={`table-hover-content ${styles.hoverContent}`}>{hoverContent}</div>}
        {columns.map(({
          content, style, highlightOnHover, slideOnHover,
        }, columnIndex) => {
          let cnt = content;
          const contentStyle = {};
          const rowItemHovered = rowItemHoveredKey === key && !deleteHovered;
          if (slideOnHover) {
            if (slideOnHover.leftDisplacement) {
              contentStyle.paddingLeft = rowItemHovered ? slideOnHover.leftDisplacement : 0;
            } else if (slideOnHover.rightDisplacement) {
              contentStyle.paddingRight = rowItemHovered ? slideOnHover.leftDisplacement : 0;
            }

            cnt = (
              <div style={{
                transition: 'all 0.5s', position: 'relative', display: 'flex', flexDirection: 'row', height: '100%', ...contentStyle,
              }}
              >
                {slideOnHover.leftContent && (
                <div
                  className="table-hover-content"
                  style={{
                    transition: 'all 0.5s', width: 0, opacity: rowItemHovered ? 1 : 0, ...slideOnHover.leftContent.style,
                  }}
                >
                  {slideOnHover.leftContent.html}
                </div>
                )}
                <div>{content}</div>
                {slideOnHover.rightContent && (
                <div
                  className="table-hover-content"
                  style={{
                    transition: 'all 0.5s', width: 0, opacity: rowItemHovered ? 1 : 0, ...slideOnHover.rightContent.style,
                  }}
                >
                  {slideOnHover.rightContent.html}
                </div>
                )}
              </div>
            );
          }

          return (
            <div
              className={`${styles.cell} ${highlightOnHover && !deleteHovered ? styles.highlightOnHover : ''}`}
              style={{
                flex: columnHeaders[columnIndex].flex,
                minWidth: columnHeaders[columnIndex].minWidth,
                ...(style || {}),
              }}
            >
              {cnt}
            </div>
          );
        })}
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
    if (fadeOnScroll) {
      onScroll();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      maxWidth, display: 'flex', flexDirection: 'column', flex: 1, height: `calc(${height})`,
    }}
    >
      <div style={{
        backgroundColor: '#F8F8F8',
        display: 'flex',
        flexDirection: 'row',
        borderBottom: noColumnHeaders ? 'none' : '1px solid #EBEFF3',
        ...headerStyle,
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
