import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Outline from 'components/Outline';
import Icon from 'components/Icon';

import core from 'core';
import selectors from 'selectors';

import './SettingsPanel.scss';

function SettingsPanel() {
  const isDisabled = useSelector(state => selectors.isElementDisabled(state, 'settingsPanel'));
  // const outlines = useSelector(state => selectors.getOutlines(state));
  // const [t] = useTranslation();
  // const dispatch = useDispatch();

  return isDisabled ? null : (
    <div className="Panel SettingsPanel" data-element="settingsPanel">
      <p> Settings </p>
    </div>
  );
}

export default SettingsPanel;
