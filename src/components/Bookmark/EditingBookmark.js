import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import core from 'core';

import './EditingBookmark.scss';

const propTypes = {
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  bookmarkText: PropTypes.string.isRequired,
};

const EditingBookmark = props => {
  const { className, onSave, onCancel, label, t } = props;
  const customClassName = `editing-bookmark ${className}`;

  const [bookmarkText, setBookmarkText] = React.useState(props.bookmarkText);

  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (core.getSelectedAnnotations().length === 0) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyPress = event => {
    // console.log('event', event.key);

    if (event.key === 'Enter') {
      onSave(bookmarkText);
    }
  };

  return (
    <div className={customClassName}>
      {/* {label && <div className="editing-label">{label}</div>} */}
      <input
        type="text"
        ref={inputRef}
        name="bookmark"
        className="editing-input"
        placeholder={t('action.name')}
        aria-label={t('action.name')}
        value={bookmarkText}
        onChange={e => {
          setBookmarkText(e.target.value);

          // console.log('e', e, e.target);
        }}
        onKeyPress={handleKeyPress}
      />
      <div className="editing-controls">
        <div className="cancel-button editing-pad" onClick={onCancel}>
          {t('action.cancel')}
        </div>
        <div className="editing-button" onClick={() => onSave(bookmarkText)}>
          {t('action.save')}
        </div>
      </div>
    </div>
  );
};

export default withTranslation()(EditingBookmark);
