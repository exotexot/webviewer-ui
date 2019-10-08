import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import core from 'core';
import { isMobile } from 'helpers/device';
import actions from 'actions';
import selectors from 'selectors';
import ThumbnailControls from 'components/ThumbnailControls';

import './Thumbnail.scss';

class Thumbnail extends React.PureComponent {
  static propTypes = {
    index: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    pageLabels: PropTypes.array.isRequired,
    canLoad: PropTypes.bool.isRequired,
    onLoad: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    updateAnnotations: PropTypes.func,
    updateSelectedPage: PropTypes.func,
    onDragStartCallback: PropTypes.func.isRequired,
    onDragOverCallback: PropTypes.func.isRequired,
    onClickCallback: PropTypes.func.isRequired,
    isSelected: PropTypes.bool,
    closeElement: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.thumbContainer = React.createRef();
    this.onLayoutChangedHandler = this.onLayoutChanged.bind(this);
    this.onDragStartHandler = this.onDragStart.bind(this);
    this.onDragOverHandler = this.onDragOver.bind(this);
  }

  componentDidMount() {
    const { onLoad, index } = this.props;

    onLoad(index, this.thumbContainer.current);
    core.addEventListener('layoutChanged', this.onLayoutChangedHandler);
  }

  componentDidUpdate(prevProps) {
    const { onLoad, onCancel, index } = this.props;

    if (!prevProps.canLoad && this.props.canLoad) {
      onLoad(index, this.thumbContainer.current);
    }
    if (prevProps.canLoad && !this.props.canLoad) {
      onCancel(index);
    }
  }

  componentWillUnmount() {
    const { onRemove, index } = this.props;
    core.removeEventListener('layoutChanged', this.onLayoutChangedHandler);
    onRemove(index);
  }

  onLayoutChanged(e, changes) {
    const { contentChanged, moved, added } = changes;
    const { index } = this.props;

    const currentPage = index + 1;
    const didLayoutChange = Object.keys(moved).length || added.length || contentChanged.some(changedPage => `${currentPage}` === changedPage);

    if (didLayoutChange) {
      const { thumbContainer } = this;
      const { current } = thumbContainer;

      core.loadThumbnailAsync(index, thumb => {
        thumb.className = 'page-image';
        current.removeChild(current.querySelector('.page-image'));
        current.appendChild(thumb);
        if (this.props.updateAnnotations) {
          this.props.updateAnnotations(index, thumb);
        }
      });
    }
  }

  handleClick = e => {
    const { index, closeElement, onClickCallback } = this.props;
    if (e.ctrlKey || e.metaKey) {
      onClickCallback(e, index);
    } else {
      core.setCurrentPage(index + 1);

      if (isMobile()) {
        closeElement('leftPanel');
      }
    }
  }

  onDragStart = e => {
    const { index } = this.props;
    this.props.onDragStartCallback(e, index);
  }

  onDragOver = e => {
    const { index } = this.props;
    this.props.onDragOverCallback(e, index);
  }

  render() {
    const { index, currentPage, pageLabels, isSelected } = this.props;
    const isActive = currentPage === index + 1;
    const pageLabel = pageLabels[index];
    const showControls = isActive;

    // onDragStart only the 'container' (where the canvas is in) so it's the thing showing while dragging, 'onDragOver' on the whole element so it cover the whole element
    return (
      <div className={`Thumbnail ${isActive ? 'active' : ''} ${isSelected ? 'selected': ''}`} onDragOver={this.onDragOverHandler} >
        <div className="container" ref={this.thumbContainer} onClick={this.handleClick}  onDragStart={this.onDragStartHandler} draggable></div>
        <div className="page-label">{pageLabel}</div>
        {showControls && <ThumbnailControls index={index}/>}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentPage: selectors.getCurrentPage(state),
  pageLabels: selectors.getPageLabels(state),
});

const mapDispatchToProps = {
  closeElement: actions.closeElement,
};

export default connect(mapStateToProps, mapDispatchToProps)(Thumbnail);