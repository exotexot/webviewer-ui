import React from 'react';
import { withContentRect } from 'react-measure';
import PropTypes from 'prop-types';

import './SearchResult.scss';
import VirtualizedList from 'react-virtualized/dist/commonjs/List';
import CellMeasurer, { CellMeasurerCache } from 'react-virtualized/dist/commonjs/CellMeasurer';
import ListSeparator from 'components/ListSeparator';

import { useSelector } from 'react-redux';
import selectors from 'selectors';

const SearchResultListSeparatorPropTypes = {
  currentResultIndex: PropTypes.number.isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.object).isRequired,
  t: PropTypes.func.isRequired,
  pageLabels: PropTypes.arrayOf(PropTypes.any).isRequired,
};

function SearchResultListSeparator(props) {
  const { currentResultIndex, searchResults, t, pageLabels } = props;

  const previousIndex = currentResultIndex === 0 ? currentResultIndex : currentResultIndex - 1;
  const currentListItem = searchResults[currentResultIndex];
  const previousListItem = searchResults[previousIndex];

  const isFirstListItem = previousListItem === currentListItem;
  const isInDifferentPage = previousListItem.pageNum !== currentListItem.pageNum;

  if (isFirstListItem || isInDifferentPage) {
    const listSeparatorText = `${t('option.shared.page')} ${pageLabels[currentListItem.pageNum - 1]}`;
    return (
      <div role="cell">
        <ListSeparator>{listSeparatorText}</ListSeparator>
      </div>
    );
  }
  return null;
}

SearchResultListSeparator.propTypes = SearchResultListSeparatorPropTypes;

const SearchResultListItemPropTypes = {
  result: PropTypes.object.isRequired,
  currentResultIndex: PropTypes.number.isRequired,
  activeResultIndex: PropTypes.number.isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSearchResultClick: PropTypes.func,
};

function SearchResultListItem(props) {
  const { result, currentResultIndex, activeResultIndex, onSearchResultClick, searchResults } = props;
  const { ambientStr, resultStrStart, resultStrEnd, resultStr } = result;
  const textBeforeSearchValue = ambientStr.slice(0, resultStrStart);
  const searchValue = ambientStr === '' ? resultStr : ambientStr.slice(resultStrStart, resultStrEnd);
  const textAfterSearchValue = ambientStr.slice(resultStrEnd);

  const currentListItem = searchResults[currentResultIndex];
  const outlines = useSelector(state => selectors.getOutlines(state));

  function flatten(array) {
    return array.reduce( (acc, e) => {

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
    }, [] ); // initial value for the accumulator is []
  }

  const newOutline = flatten(outlines);


  // Finds chapter titles based on Outline Information.
  // This is relevant for the search module
  const findChapterTitle = (outline, page) => {

    if (outline.length < 1) {
      return false;
    }

    const numbers = outline.map(a => a.Ac);
    const chapterNumber = numbers.reduce((a, b) => {
      let aDiff = Math.abs(a - page);
      let bDiff = Math.abs(b - page);

      if (aDiff === bDiff) {
        return a <= b ? a : b;
      } else {
        return bDiff < aDiff ? b : a;
      }
    });

    const chapter = outline
      .slice()
      .reverse()
      .find(el => el.Ac === chapterNumber);


    return chapter.name;
    // return "spas12t"
  };

  const title = findChapterTitle(newOutline, currentListItem.pageNum);

  return (
    <button
      role="cell"
      className={`SearchResult ${currentResultIndex === activeResultIndex ? 'selected' : ''}`}
      onClick={() => {
        if (onSearchResultClick) {
          onSearchResultClick(currentResultIndex, result);
        }
      }}
    >
      <p> {title}</p>
      {textBeforeSearchValue}
      <span className="search-value">{searchValue}</span>
      {textAfterSearchValue}
    </button>
  );
}
SearchResultListItem.propTypes = SearchResultListItemPropTypes;

const SearchResultPropTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  activeResultIndex: PropTypes.number,
  searchStatus: PropTypes.oneOf(['SEARCH_NOT_INITIATED', 'SEARCH_IN_PROGRESS', 'SEARCH_DONE']),
  searchResults: PropTypes.arrayOf(PropTypes.object),
  t: PropTypes.func.isRequired,
  onClickResult: PropTypes.func,
  pageLabels: PropTypes.arrayOf(PropTypes.any),
};

function SearchResult(props) {
  const { height, searchStatus, searchResults, activeResultIndex, t, onClickResult, pageLabels } = props;
  const cellMeasureCache = React.useMemo(() => {
    return new CellMeasurerCache({ defaultHeight: 50, fixedWidth: true });
  }, []);
  const listRef = React.useRef(null);

  if (searchResults.length === 0) {
    // clear measure cache, when doing a new search
    cellMeasureCache.clearAll();
  }

  const rowRenderer = React.useCallback(
    function rowRendererCallback(rendererOptions) {
      const { index, key, parent, style } = rendererOptions;
      const result = searchResults[index];
      return (
        <CellMeasurer cache={cellMeasureCache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
          {({ registerChild }) => (
            <div role="row" ref={registerChild} style={style}>
              <SearchResultListSeparator
                currentResultIndex={index}
                searchResults={searchResults}
                pageLabels={pageLabels}
                t={t}
              />
              <SearchResultListItem
                result={result}
                searchResults={searchResults}
                currentResultIndex={index}
                activeResultIndex={activeResultIndex}
                onSearchResultClick={onClickResult}
              />
            </div>
          )}
        </CellMeasurer>
      );
    },
    [cellMeasureCache, searchResults, activeResultIndex, t, pageLabels],
  );

  React.useEffect(() => {
    if (listRef) {
      listRef.current?.scrollToRow(activeResultIndex);
    }
  }, [activeResultIndex]);

  if (height == null) {
    // eslint-disable-line eqeqeq
    // VirtualizedList requires width and height of the component which is calculated by withContentRect HOC.
    // On first render when HOC haven't yet set these values, both are undefined, thus having this check here
    // and skip rendering if values are missing
    return null;
  }

  if (searchStatus === 'SEARCH_DONE' && searchResults.length === 0) {
    return <div className="info">{t('message.noResults')}</div>;
  }

  return (
    <VirtualizedList
      width={200}
      height={height}
      overscanRowCount={10}
      rowCount={searchResults.length}
      deferredMeasurementCache={cellMeasureCache}
      rowHeight={cellMeasureCache.rowHeight}
      rowRenderer={rowRenderer}
      ref={listRef}
    />
  );
}
SearchResult.propTypes = SearchResultPropTypes;

function SearchResultWithContentRectHOC(props) {
  const { measureRef, contentRect, ...rest } = props;
  const { height } = contentRect.bounds;
  return (
    <div className="results" ref={measureRef}>
      <SearchResult height={height} {...rest} />
    </div>
  );
}
SearchResultWithContentRectHOC.propTypes = {
  contentRect: PropTypes.object,
  measureRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

export default withContentRect('bounds')(SearchResultWithContentRectHOC);
