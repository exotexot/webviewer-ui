/* eslint-disable react/jsx-key */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import Bookmark from 'components/Bookmark';
import EditingBookmark from 'components/Bookmark/EditingBookmark';
import OutlineNew from 'components/OutlineNew';
import Button from 'components/Button';

import actions from 'actions';
import selectors from 'selectors';

import './BookmarksPanel.scss';

import { useSelector } from 'react-redux';

const propTypes = {
  bookmarks: PropTypes.object,
  addBookmark: PropTypes.func.isRequired,
  removeBookmark: PropTypes.func,
  currentPage: PropTypes.number.isRequired,
  isDisabled: PropTypes.bool,
  t: PropTypes.func.isRequired,
  pageLabels: PropTypes.array.isRequired,
};

const BookmarksPanel = props => {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     isAdding: false,
  //   };
  // }

  const { isDisabled, bookmarks, addBookmark, removeBookmark, currentPage, t, pageLabels } = props;

  const [isAdding, setIsAdding] = React.useState(false);

  if (isDisabled) {
    return null;
  }

  const pageIndexes = Object.keys(bookmarks).map(pageIndex => parseInt(pageIndex, 10));

  const outlines = useSelector(state => selectors.getOutlines(state));

  const [bookmarkTitle, setBookmarkTitle] = React.useState('');
  React.useEffect(() => {
    let run = true;

    if (run) {
      let t = '';

      const newOutline = flatten(outlines);

      // Try to find the current bookmark Title
      if (bookmarks[currentPage - 1]) {
        t = bookmarks[currentPage - 1];
      } else if (newOutline.length > 0) {
        // Trying to find chapter title
        const chapter = findChapterTitle(currentPage);
        if (chapter) t = chapter;
      } else {
        // If it doesnt exist pre-populate with page number
        t = 'Page ';
        t += currentPage;
      }

      setBookmarkTitle(t);
    }

    return () => {
      run = false;
    };
  }, [outlines, currentPage, bookmarks]);

  const [alreadyBookmarked, setAlreadyBookmarked] = React.useState(false);
  React.useEffect(() => {
    const check = bookmarks.hasOwnProperty(currentPage - 1);
    setAlreadyBookmarked(check);
  }, [bookmarks, currentPage]);

  return (
    <div className="Panel BookmarksPanel" data-element="leftBookmarksPanel">
      {isAdding ? (
        <EditingBookmark
          className="adding"
          label={bookmarkTitle}
          bookmarkText={bookmarkTitle}
          onSave={newText => {
            addBookmark(currentPage - 1, newText);
            // this.setState({ isAdding: false });
            setIsAdding(false);
          }}
          onCancel={() => {
            // this.setState({ isAdding: false });
            setIsAdding(false);
          }}
        />
      ) : (
        <div className="bookmarks-panel-header">
          {bookmarkTitle}
          <Button
            dataElement="newBookmarkButton"
            className="bookmarks-panel-button"
            label={alreadyBookmarked ? 'Edit' : '+'}
            onClick={() => {
              // this.setState({ isAdding: true });
              setIsAdding(true);
            }}
          />
        </div>
      )}
      <div className="bookmarks-panel-row">
        {pageIndexes.map(pageIndex => (
          // <div className="bookmarks-panel-label">{`${t('component.bookmarkPage')} ${pageLabels[pageIndex]}`}</div> */}
          <OutlineNew
            label={bookmarks[pageIndex]}
            page={pageIndex + 1}
            activeMode="page"
            removeBookmark={removeBookmark}
            deletable={true}
          />
          //  <Bookmark text={bookmarks[pageIndex]} pageIndex={pageIndex} />
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  bookmarks: selectors.getBookmarks(state),
  isDisabled: selectors.isElementDisabled(state, 'leftBookmarksPanel'),
  currentPage: selectors.getCurrentPage(state),
  pageLabels: selectors.getPageLabels(state),
});

const mapDispatchToProps = {
  addBookmark: actions.addBookmark,
  editBookmark: actions.editBookmark,
  removeBookmark: actions.removeBookmark,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(BookmarksPanel));

const findChapterTitle = (outl, page) => {
  if (outl.length < 1) {
    return false;
  }

  const numbers = outl.map(a => a.Ac);
  const chapterNumber = numbers.reduce((a, b) => {
    let aDiff = Math.abs(a - page);
    let bDiff = Math.abs(b - page);

    if (aDiff === bDiff) {
      return a <= b ? a : b;
    } else {
      return bDiff < aDiff ? b : a;
    }
  });

  const chapter = outl
    .slice()
    .reverse()
    .find(el => el.Ac === chapterNumber);

  return chapter.name;
  // return "spas12t"
};

function flatten(array) {
  return array.reduce((acc, e) => {
    if (e.Ac === undefined) return acc;

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
