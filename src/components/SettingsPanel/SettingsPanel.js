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
  const outlines = useSelector(state => selectors.getOutlines(state));

  const [mul, setMul] = React.useState(1);

  return (
    <div className="Panel SettingsPanel" data-element="settingsPanel">
      <p> Settings </p>

      {/* <button
        onClick={() => {
          window.utils.setCanvasMultiplier(mul);
          setMul(mul + 1);
          alert(`test  ${mul}`);
        }}
      >
        <p>Test</p>
      </button> */}
    </div>
  );
}

export default SettingsPanel;
