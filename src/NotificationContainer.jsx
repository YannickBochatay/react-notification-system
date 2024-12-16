import * as React from "react"
import PropTypes from "prop-types"
import * as Constants from "./constants"
import NotificationItem from "./NotificationItem"

export default class NotificationContainer extends React.Component {
  constructor(props) {
    super(props);
    // Fix position if width is overrided
    this._style = props.getStyles.container(props.position);

    this.itemRefs = []

    if (
      props.getStyles.overrideWidth
      && (props.position === Constants.positions.tc
        || props.position === Constants.positions.bc)
    ) {
      this._style.marginLeft = -(props.getStyles.overrideWidth / 2);
    }
  }

  render() {
    var notifications;

    if (
      [
        Constants.positions.bl,
        Constants.positions.br,
        Constants.positions.bc
      ].indexOf(this.props.position) > -1
    ) {
      this.props.notifications.reverse();
    }

    notifications = this.props.notifications.map((notification, index) => {

      if (!this.itemRefs[index]) this.itemRefs.push(React.createRef())

      return (
        <NotificationItem
          key={ notification.uid }
          notification={ notification }
          getStyles={ this.props.getStyles }
          onRemove={ this.props.onRemove }
          noAnimation={ this.props.noAnimation }
          allowHTML={ this.props.allowHTML }
          ref={ this.itemRefs[index] }
        >
          { this.props.children }
        </NotificationItem>
      );
    });

    return (
      <div
        className={ 'notifications-' + this.props.position }
        style={ this._style }
      >
        {notifications}
      </div>
    );
  }
}

NotificationContainer.propTypes = {
  position: PropTypes.string.isRequired,
  notifications: PropTypes.array.isRequired,
  getStyles: PropTypes.object,
  onRemove: PropTypes.func,
  noAnimation: PropTypes.bool,
  allowHTML: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};
