import React, { useCallback } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import core from 'core';
import { useSelector, shallowEqual } from 'react-redux';
import selectors from 'selectors';

import './OutlineNew.scss';

const propTypes = {
  label: PropTypes.string.isRequired,
  page: PropTypes.string.isRequired,
  wholeOutline: PropTypes.object.isRequired
};

function OutlineNew({ label, page, wholeOutline }) {

  const handleOutlineClick = useCallback(
    function() {
      core.setCurrentPage(page);
    },
    [page],
  );

  const [
    currentPage,
  ] = useSelector(
    state => [
      selectors.getCurrentPage(state),
    ],
    shallowEqual,
  );

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

    if (isActive) {
      const closest = closestSmaller(
        wholeOutline,
        currentPage
      );

      setActiveChapter(closest);
    }

    return () => {
      isActive = false;
    };
  }, [currentPage]);

  
  return (
    <div className="OutlineNew">
      <div className={classNames({ content: true, editable: false })}>
        
        <button 
          className="CustomButton"
          onClick={handleOutlineClick}
        >
          <div className={classNames({ row: true })}>
            {label} 
            <span className={classNames({ indicator: true, active: activeChapter === page })}>{page}</span>
          </div>
        </button>
       
      </div>
    </div>

  );
}

OutlineNew.propTypes = propTypes;

export default OutlineNew;
