import React, { useState, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Outline from 'components/Outline';
import OutlineContext from 'components/Outline/Context';
import Icon from 'components/Icon';
import Button from 'components/Button';
import OutlineControls from 'components/OutlineControls';
import OutlineTextInput from 'components/OutlineTextInput';
import DataElementWrapper from 'components/DataElementWrapper';

import core from 'core';
import outlineUtils from 'helpers/OutlineUtils';
import DataElements from 'constants/dataElement';
import actions from 'actions';
import selectors from 'selectors';

import './OutlinesPanel.scss';
import OutlineNew from 'components/OutlineNew';

function OutlinesPanel() {
  const isDisabled = useSelector(state => selectors.isElementDisabled(state, DataElements.OUTLINES_PANEL));
  const outlines = useSelector(state => selectors.getOutlines(state));
  const [selectedOutlinePath, setSelectedOutlinePath] = useState(null);
  const [isAddingNewOutline, setIsAddingNewOutline] = useState(false);
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const nextPathRef = useRef(null);

  // use layout effect to avoid flickering in the panel
  useLayoutEffect(() => {
    setIsAddingNewOutline(false);

    if (nextPathRef.current !== null) {
      setSelectedOutlinePath(nextPathRef.current);
      nextPathRef.current = null;
    }
  }, [outlines]);

  async function addNewOutline(e) {
    const name = e.target.value;

    if (!name) {
      setIsAddingNewOutline(false);
      return;
    }

    const currentPage = core.getCurrentPage();
    let nextPath;
    if (outlines.length === 0) {
      nextPath = await outlineUtils.addRootOutline(name, currentPage);
    } else {
      nextPath = await outlineUtils.addNewOutline(name, selectedOutlinePath, currentPage);
    }

    nextPathRef.current = nextPath;
    reRenderPanel();
  }

  function reRenderPanel() {
    core.getOutlines(outlines => {
      dispatch(actions.setOutlines(outlines));
    });
  }

  // This function flattens the Outline array in a one-dimensional array and removes broken CAT references
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

  const newOutline = flatten(outlines);

  return isDisabled ? null : (
    <div className="Panel OutlinesPanel" data-element={DataElements.OUTLINES_PANEL}>
      <OutlineContext.Provider
        value={{
          setSelectedOutlinePath,
          selectedOutlinePath,
          setIsAddingNewOutline,
          isAddingNewOutline,
          isOutlineSelected: outline => outlineUtils.getPath(outline) === selectedOutlinePath,
          addNewOutline,
          reRenderPanel,
        }}
      >
        <OutlineControls />
        <div className="Outlines">
          {!isAddingNewOutline && outlines.length === 0 && (
            <div className="no-outlines">
              <Icon className="empty-icon" glyph="illustration - empty state - outlines" />
              <div className="msg">{t('message.noOutlines')}</div>
            </div>
          )}
          {/* {outlines.map(outline => (
            <Outline key={outlineUtils.getOutlineId(outline)} outline={outline} />
          ))} */}

          {newOutline.map(outline => (
            <OutlineNew label={outline.name} page={outline.Ac} wholeOutline={newOutline} activeMode="chapter" />
          ))}

          {isAddingNewOutline && selectedOutlinePath === null && (
            <OutlineTextInput
              className="marginLeft"
              defaultValue={t('message.untitled')}
              onEnter={addNewOutline}
              onEscape={() => setIsAddingNewOutline(false)}
              onBlur={addNewOutline}
            />
          )}
        </div>
        <DataElementWrapper className="addNewOutlineButtonContainer" dataElement="addNewOutlineButtonContainer">
          <Button
            dataElement="addNewOutlineButton"
            img="icon-menu-add"
            label={t('option.outlineControls.add')}
            onClick={() => setIsAddingNewOutline(true)}
          />
        </DataElementWrapper>
      </OutlineContext.Provider>
    </div>
  );
}

export default React.memo(OutlinesPanel);
