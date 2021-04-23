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

class BookmarksPanel extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isAdding: false,
    };
  }

  static propTypes = {
    bookmarks: PropTypes.object,
    addBookmark: PropTypes.func.isRequired,
    removeBookmark: PropTypes.func,
    currentPage: PropTypes.number.isRequired,
    isDisabled: PropTypes.bool,
    t: PropTypes.func.isRequired,
    pageLabels: PropTypes.array.isRequired,
  };

  render() {
    const { isDisabled, bookmarks, addBookmark, removeBookmark, currentPage, t, pageLabels } = this.props;

    if (isDisabled) {
      return null;
    }

    const pageIndexes = Object.keys(bookmarks).map(pageIndex => parseInt(pageIndex, 10));

    return (
      <div className="Panel BookmarksPanel" data-element="leftBookmarksPanel">
        {this.state.isAdding ? (
          <EditingBookmark
            className="adding"
            label={`${t('component.bookmarkPage')} ${pageLabels[currentPage - 1]}: ${t('component.newBookmark')}`}
            bookmarkText={''}
            onSave={newText => {
              addBookmark(currentPage - 1, newText);
              this.setState({ isAdding: false });
            }}
            onCancel={() => {
              this.setState({ isAdding: false });
            }}
          />
        ) : (
          <div className="bookmarks-panel-header">
            <Button
              dataElement="newBookmarkButton"
              className="bookmarks-panel-button"
              label={t('component.newBookmark')}
              onClick={() => {
                this.setState({ isAdding: true });
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
              editable
            />
            //  <Bookmark text={bookmarks[pageIndex]} pageIndex={pageIndex} />
          ))}
        </div>
      </div>
    );
  }
}

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
