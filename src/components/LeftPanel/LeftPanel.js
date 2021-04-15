import React from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import LeftPanelTabs from 'components/LeftPanelTabs';
import ThumbnailsPanel from 'components/ThumbnailsPanel';
import OutlinesPanel from 'components/OutlinesPanel';
import BookmarksPanel from 'components/BookmarksPanel';
import LayersPanel from 'components/LayersPanel';
import NotesPanel from 'components/NotesPanel';
import SignaturePanel from 'components/SignaturePanel';
import CustomElement from 'components/CustomElement';
import ResizeBar from 'components/ResizeBar';
import Icon from 'components/Icon';

import core from 'core';
import selectors from 'selectors';
import actions from 'actions';
import useMedia from 'hooks/useMedia';

import './LeftPanel.scss';
import SettingsPanel from 'components/SettingsPanel';
import SearchPanel from 'components/SearchPanel';

const LeftPanel = () => {
  const isMobile = useMedia(
    // Media queries
    ['(max-width: 640px)'],
    [true],
    // Default value
    false,
  );

  const isTabletAndMobile = useMedia(
    // Media queries
    ['(max-width: 900px)'],
    [true],
    // Default value
    false,
  );

  const [
    currentToolbarGroup,
    isToolsHeaderOpen,
    isOpen,
    isDisabled,
    activePanel,
    customPanels,
    currentWidth,
    notesInLeftPanel,
  ] = useSelector(
    state => [
      selectors.getCurrentToolbarGroup(state),
      selectors.isElementOpen(state, 'toolsHeader'),
      selectors.isElementOpen(state, 'leftPanel'),
      selectors.isElementDisabled(state, 'leftPanel'),
      selectors.getActiveLeftPanel(state),
      selectors.getCustomPanels(state),
      selectors.getLeftPanelWidth(state),
      selectors.getNotesInLeftPanel(state),
    ],
    shallowEqual,
  );

  const minWidth = 320;
  const dispatch = useDispatch();

  const onDrop = e => {
    // this is mainly for the thumbnail panel, to prevent the broswer from loading a document that dropped in
    e.preventDefault();
  };

  const onDragOver = e => {
    // when dragging over the "LeftPanel", change the cursor to "Move" from "Copy"
    e.preventDefault();
  };

  const getDisplay = panel => (panel === activePanel ? 'flex' : 'none');

  let style = {};
  if (!isMobile) {
    style = { width: `${currentWidth}px`, minWidth: `${currentWidth}px` };
  }

  const isVisible = !(!isOpen || isDisabled);

  return (
    <div
      className={classNames({
        Panel: true,
        LeftPanel: true,
        'closed': !isVisible,
        'tools-header-open': isToolsHeaderOpen && currentToolbarGroup !== 'toolbarGroup-View',
      })}
      onDrop={onDrop}
      onDragOver={onDragOver}
      data-element="leftPanel"
    >
      <div className="left-panel-container" style={style}>
        {isMobile && (
          <div className="close-container">
            <div
              className="close-icon-container"
              onClick={() => {
                dispatch(actions.closeElements(['leftPanel']));
              }}
            >
              <Icon glyph="ic_close_black_24px" className="close-icon" />
            </div>
          </div>
        )}
        {/* <div className="left-panel-header">
          <LeftPanelTabs />
        </div> */}

        {activePanel === 'outlinesPanel' && <OutlinesPanel />}
        {activePanel === 'thumbnailsPanel' && <ThumbnailsPanel />}
        {activePanel === 'leftSearchPanel' && <SearchPanel />}
        {activePanel === 'leftBookmarksPanel' && <BookmarksPanel />}
        {activePanel === 'settingsPanel' && <SettingsPanel />}

        {activePanel === 'layersPanel' && <LayersPanel />}
        {core.isFullPDFEnabled() && activePanel === 'signaturePanel' && <SignaturePanel />}
        {notesInLeftPanel && activePanel === 'notesPanel' && <NotesPanel currentLeftPanelWidth={currentWidth} />}
        {/* {customPanels.map(({ panel }, index) => (
          <CustomElement
            key={panel.dataElement || index}
            className={`Panel ${panel.dataElement}`}
            display={getDisplay(panel.dataElement)}
            dataElement={panel.dataElement}
            render={panel.render}
          />
        ))} */}
      </div>
      {!isTabletAndMobile && (
        <ResizeBar
          dataElement="leftPanelResizeBar"
          minWidth={minWidth}
          onResize={_width => {
            dispatch(actions.setLeftPanelWidth(_width));
          }}
        />
      )}
    </div>
  );
};

export default LeftPanel;
