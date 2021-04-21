import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import SearchResult from 'components/SearchResult';
import SearchOverlay from 'components/SearchOverlay';
import Icon from 'components/Icon';
import getClassName from 'helpers/getClassName';
import DataElementWrapper from 'components/DataElementWrapper';

import './SearchPanel.scss';
import useSearch from 'hooks/useSearch';

import { useSelector } from 'react-redux';
import selectors from 'selectors';

const propTypes = {
  isOpen: PropTypes.bool,
  isMobile: PropTypes.bool,
  pageLabels: PropTypes.array,
  currentWidth: PropTypes.number,
  closeSearchPanel: PropTypes.func,
  setActiveResult: PropTypes.func,
};

function noop() {}

function SearchPanel(props) {
  const { isOpen, currentWidth, pageLabels, closeSearchPanel = noop, setActiveResult = noop, isMobile = false } = props;

  const { t } = useTranslation();
  const { searchStatus, searchResults, activeSearchResultIndex } = useSearch();

  const outlines = useSelector(state => selectors.getOutlines(state));

  function flatten(array) {
    return array.reduce((acc, e) => {
      if (e.Ac === undefined) {
        return acc;
      }

      if (Array.isArray(e.children) && e.children.length > 0) {
        // if the element is an array, fall flatten on it again and then take the returned value and concat it.
        acc.push({ name: e.name, Ac: e.Ac });
        return acc.concat(flatten(e.children));
      } else {
        // otherwise just concat the value
        return acc.concat(e);
      }
    }, []); // initial value for the accumulator is []
  }

  const newOutline = flatten(outlines);

  const onCloseButtonClick = React.useCallback(
    function onCloseButtonClick() {
      if (closeSearchPanel) {
        closeSearchPanel();
      }
    },
    [closeSearchPanel],
  );

  const onClickResult = React.useCallback(
    function onClickResult(resultIndex, result) {
      setActiveResult(result);
      if (isMobile) {
        closeSearchPanel();
      }
    },
    [setActiveResult, closeSearchPanel],
  );

  const className = getClassName('Panel SearchPanel', { isOpen });
  const style = isMobile ? {} : { width: `${currentWidth}px`, minWidth: `${currentWidth}px` };

  return (
    <DataElementWrapper className={className} dataElement="leftSearchPanel" style={style}>
      {isMobile && (
        <div className="close-container">
          <button className="close-icon-container" onClick={onCloseButtonClick}>
            <Icon glyph="ic_close_black_24px" className="close-icon" />
          </button>
        </div>
      )}
      <SearchOverlay
        searchStatus={searchStatus}
        searchResults={searchResults}
        activeResultIndex={activeSearchResultIndex}
        isPanelOpen={isOpen}
      />
      <SearchResult
        t={t}
        searchStatus={searchStatus}
        searchResults={searchResults}
        activeResultIndex={activeSearchResultIndex}
        onClickResult={onClickResult}
        pageLabels={pageLabels}
        outline={newOutline}
      />
    </DataElementWrapper>
  );
}

SearchPanel.propTypes = propTypes;

export default SearchPanel;
