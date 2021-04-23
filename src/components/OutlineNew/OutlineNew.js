import React, { useCallback } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import core from 'core';
import { useSelector, shallowEqual } from 'react-redux';
import selectors from 'selectors';

import './OutlineNew.scss';
import Icon from 'components/Icon';

const propTypes = {
  label: PropTypes.string.isRequired,
  page: PropTypes.string.isRequired,
  wholeOutline: PropTypes.object,
  activeMode: PropTypes.string,
  editable: PropTypes.bool,
  removeBookmark: PropTypes.func,
};

function OutlineNew({ label, page, wholeOutline, activeMode = 'page', editable = false, removeBookmark }) {
  const handleOutlineClick = useCallback(
    function () {
      core.setCurrentPage(page);
    },
    [page],
  );

  const handleDeleteClick = useCallback(function () {
    const result = confirm('Delete bookmark\nDo you want to delete this bookmark?');
    if (result) {
      removeBookmark(page - 1);
    }
  }, []);

  const [currentPage] = useSelector(state => [selectors.getCurrentPage(state)], shallowEqual);
  const closestSmaller = (outline, page, returnIndex = false) => {
    let pages = [];

    outline.forEach(element => {
      pages.push(element.Ac);
    });

    let filtered = pages.filter(num => num <= page);
    let closest = Math.max(...filtered);

    const index = pages.indexOf(closest);

    return returnIndex ? index : closest;
  };

  const [activeChapter, setActiveChapter] = React.useState(0);
  React.useEffect(() => {
    let isActive = true;

    if (isActive && wholeOutline !== undefined) {
      const closest = closestSmaller(wholeOutline, currentPage);

      setActiveChapter(closest);
    }

    return () => {
      isActive = false;
    };
  }, [currentPage]);

  const mode = activeMode === 'chapter' ? activeChapter === page : currentPage === page;

  return (
    <div className="OutlineNew">
      <div className={classNames({ content: true, editable: false })}>
        {editable && (
          <button className="delete" onClick={handleDeleteClick}>
            <div className="icon-container">
              <Icon glyph="icon-close" />
            </div>
          </button>
        )}

        <button className="CustomButton" onClick={handleOutlineClick}>
          <div className={classNames({ row: true })}>
            {label}
            <span className={classNames({ indicator: true, active: mode })}>{page}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

OutlineNew.propTypes = propTypes;

export default OutlineNew;
