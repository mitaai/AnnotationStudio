/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { debounce } from 'lodash';
import Link from 'next/link';
import {
  Search, ArrowRepeat, Plus, ThreeDots,
} from 'react-bootstrap-icons';
import styles from './DashboardChannels.module.scss';
// import SortChannelsIcon from './SortChannelsIcon';
import { RID } from '../../utils/docUIUtils';
import SortChannelsIcon from './SortChannelsIcon';

export default function ChannelHeader({
  setRefresh,
  selectedItem,
  setSelectedItem,
  asc,
  setAsc,
  headerText = '',
  createNewText = '',
  searchPlaceholderText = '',
  headerTextWidth = 0,
  headerLink = '',
  searchQuery,
  setSearchQuery = () => {},
  searchDisabled,
}) {
  const router = useRouter();
  const iconLabel = useRef();
  const updateIconLabel = (text, forceUpdateFunc) => {
    iconLabel.current = text;
    forceUpdateFunc();
  };
  const updateIconLabelDebounced = useRef(
    debounce(updateIconLabel, 750),
  ).current;
  const [hover, setHover] = useState();
  const [searchActive, setSearchActive] = useState();
  const [searchInputFocused, setSearchInputFocused] = useState();
  const [exitSearch, setExitSearch] = useState();
  const [, setForceUpdate] = useState();
  const [showSortPopover, setShowSortPopover] = useState();
  const spacing = 5;
  const iconWidths = 30;

  const containerBorderColor = (exitSearch && '#E20101') || (searchInputFocused ? '#355CBC' : '#bdbdbd');
  const searchInputBorder = `1px solid ${containerBorderColor}`;

  const forceUpdate = () => setForceUpdate(RID());
  const setIconLabel = (text) => {
    updateIconLabel(undefined, forceUpdate);
    if (text) {
      updateIconLabelDebounced(text, forceUpdate);
    }
  };

  const closeOptions = () => {
    setHover(); setIconLabel();
  };

  const states = {
    default: {
      container: {
        left: headerTextWidth + spacing,
        height: 20,
        width: 26,
        backgroundColor: '#eeeeee',
        borderColor: '#bdbdbd',
        borderRadius: 13,
      },
      threeDots: {
        opacity: 1,
        color: '#424242',
      },
      search: {
        opacity: 0,
        height: 18,
        borderRadius: '13px 0px 0px 13px',
        width: 0,
        left: 0,
      },
      searchInput: {
        opacity: 0,
        height: 18,
        width: 0,
        left: 0,
      },
      arrowDownUp: {
        opacity: 0,
        height: 18,
        borderRadius: 0,
        width: 0,
        left: 0,
      },
      arrowRepeat: {
        opacity: 0,
        height: 18,
        borderRadius: 0,
        width: 0,
        left: 0,
      },
      plus: {
        opacity: 0,
        height: 18,
        borderRadius: '0px 13px 13px 0px',
        width: 0,
        right: 0,
      },
      plusIcon: {
        transform: 'rotate(0deg)',
      },
    },
    hover: {
      container: {
        left: headerTextWidth + spacing,
        height: 26,
        width: iconWidths * 4,
        backgroundColor: '#eeeeee',
        borderColor: '#bdbdbd',
        borderRadius: 13,
      },
      threeDots: {
        opacity: 0,
        color: '#355CBC',
      },
      search: {
        opacity: 1,
        height: 22,
        borderRadius: '13px 0px 0px 13px',
        width: iconWidths,
        left: 0,
      },
      searchInput: {
        opacity: 0,
        height: 22,
        width: 0,
        left: iconWidths,
      },
      arrowDownUp: {
        opacity: 1,
        height: 22,
        borderRadius: 0,
        width: iconWidths,
        left: iconWidths,
      },
      arrowRepeat: {
        opacity: 1,
        height: 22,
        borderRadius: 0,
        width: iconWidths,
        left: iconWidths * 2,
      },
      plus: {
        opacity: 1,
        height: 22,
        borderRadius: '0px 13px 13px 0px',
        width: iconWidths,
        right: 0,
      },
      plusIcon: {
        transform: 'rotate(0deg)',
      },
    },
    search: {
      container: {
        left: 0,
        height: 32,
        width: '100%',
        backgroundColor: '#eeeeee',
        borderColor: containerBorderColor,
        borderRadius: 16,
      },
      threeDots: {
        opacity: 0,
        color: '#355CBC',
      },
      search: {
        opacity: 1,
        height: 30,
        borderRadius: '16px 0px 0px 16px',
        width: iconWidths,
        left: 0,
        backgroundColor: searchDisabled ? '#eeeeee' : '#fafafa',
      },
      searchInput: {
        opacity: 1,
        height: 32,
        width: `calc(100% - ${2 * iconWidths}px)`,
        left: iconWidths,
      },
      arrowDownUp: {
        opacity: 0,
        height: 30,
        borderRadius: 0,
        width: 0,
        left: iconWidths,
      },
      arrowRepeat: {
        opacity: 0,
        height: 30,
        borderRadius: 0,
        width: 0,
        left: iconWidths * 2,
      },
      plus: {
        opacity: 1,
        height: 30,
        borderRadius: '0px 16px 16px 0px',
        width: iconWidths,
        right: 0,
      },
      plusIcon: {
        transform: 'rotate(45deg)',
      },
    },
  };

  let state = states.default;
  if (searchActive) {
    state = states.search;
  } else if (hover) {
    state = states.hover;
  }

  useEffect(() => {
    setIconLabel();
    if (!searchActive && exitSearch) {
      setExitSearch();
      setSearchQuery();
    }

    if (searchActive) {
      setSearchQuery('');
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchActive]);

  useEffect(() => {
    if (showSortPopover && iconLabel.current) {
      setIconLabel();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSortPopover]);

  return (
    <div style={{
      position: 'relative',
      marginRight: 12,
      display: 'flex',
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    }}
    >
      <Link href={headerLink}>
        <span
          className={`${styles.headerText} ${styles.headerLink}`}
          style={{
            transition: 'all 0.25s',
            opacity: searchActive ? 0 : 1,
          }}
        >
          {headerText}
        </span>
      </Link>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={showSortPopover ? () => {} : closeOptions}
        style={{
          position: 'absolute',
          transition: 'all 0.25s',
          marginRight: 'auto',
          borderWidth: 1,
          borderStyle: 'solid',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          ...state.container,
        }}
      >
        <ThreeDots
          size={14}
          style={{
            transition: 'all 0.25s',
            position: 'absolute',
            zIndex: 0,
            left: 5,
            ...state.threeDots,
          }}
        />
        <div
          className={styles.optionContainer}
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '13px 0px 0px 13px',
            color: searchInputFocused && !exitSearch && containerBorderColor,
            ...state.search,
          }}
          onClick={() => setSearchActive(true)}
          onMouseEnter={showSortPopover ? () => {} : () => setIconLabel(`Search ${headerText}`)}
          onKeyDown={() => {}}
          tabIndex={-1}
          role="button"
        >
          <Search size={14} />
        </div>
        <input
          placeholder={searchPlaceholderText}
          value={searchQuery}
          disabled={searchDisabled}
          onChange={(ev) => setSearchQuery(ev.target.value)}
          onFocus={() => setSearchInputFocused(true)}
          onBlur={() => setSearchInputFocused()}
          style={{
            position: 'absolute',
            transition: 'all 0.25s',
            border: 'none',
            outline: 'none',
            borderTop: searchInputBorder,
            borderBottom: searchInputBorder,
            fontSize: 14,
            backgroundColor: searchDisabled ? '#eeeeee' : '#fafafa',
            fontStyle: searchQuery?.length > 0 ? 'normal' : 'italic',
            ...state.searchInput,
          }}
        />
        <SortChannelsIcon
          id={headerText}
          selected={selectedItem}
          setSelected={setSelectedItem}
          asc={asc}
          setAsc={setAsc}
          onMouseEnter={() => { setIconLabel(`Sort ${headerText}`); }}
          state={state}
          show={showSortPopover}
          setShow={setShowSortPopover}
        />

        <div
          className={styles.optionContainer}
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...state.arrowRepeat,
          }}
          onClick={() => setRefresh(true)}
          onKeyDown={() => {}}
          onMouseEnter={showSortPopover
            ? () => {}
            : () => setIconLabel('Refresh')}
          tabIndex={-1}
          role="button"
        >
          <ArrowRepeat
            size={14}
            style={{
              transition: 'all 0.25s',
            }}
          />
        </div>
        <div
          className={`${styles.optionContainer} ${searchActive ? styles.red : ''}`}
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...state.plus,
          }}
          onClick={searchActive
            ? () => setSearchActive()
            : () => router.push({
              pathname: '/groups/new',
            })}
          onKeyDown={() => {}}
          onMouseEnter={searchActive
            ? () => setExitSearch(true)
            : () => {
              if (!showSortPopover) {
                setIconLabel(createNewText);
              }
            }}
          onMouseLeave={searchActive
            ? () => setExitSearch()
            : () => {}}
          tabIndex={-1}
          role="button"
        >
          <Plus
            size={18}
            style={{
              transition: 'all 0.25s',
              ...state.plusIcon,
            }}
          />
        </div>
      </div>
      {!showSortPopover && (
      <span
        style={{
          position: 'absolute',
          zIndex: 2,
          transition: 'all 0.25s',
          lineHeight: '10px',
          height: 22,
          width: state.container.width,
          left: state.container.left,
          bottom: -22,
          flex: 1,
          opacity: !searchActive && hover && iconLabel.current ? 1 : 0,
          fontSize: 12,
          color: '#616161',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {iconLabel.current}
      </span>
      )}
    </div>
  );
}
