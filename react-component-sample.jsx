
/**
 *	Sample ReactJS component using ES6 with babel and webpack.
 */


import React from 'react';
import NotificationSystem from 'react-notification-system';

class Notification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        openNotifications: []
    };
    this.showErrorMessage = this.showErrorMessage.bind(this);
    this.correspondenceError = this.correspondenceError.bind(this);
    this.systemError = this.systemError.bind(this);
    this.showSuccessMessage = this.showSuccessMessage.bind(this);
    this.correspondenceSuccess = this.correspondenceSuccess.bind(this);
    this.validationError = this.validationError.bind(this);
    this.settingsSuccess = this.settingsSuccess.bind(this);
    this.authenticationError = this.authenticationError.bind(this);
    this.passwordSuccess = this.passwordSuccess.bind(this);
    this.showWarningMessage = this.showWarningMessage.bind(this);
    this.accountIsLockedOut = this.accountIsLockedOut.bind(this);
  }

  handleDialogs(notification) {
    let dialogs = this.state.openNotifications||[];
    dialogs.push(notification);
    if (dialogs.length > 5) {
      this.refs.notificationSystem.removeNotification(dialogs.shift());
    }
    this.setState({ openNotifications: dialogs });
  }

  showErrorMessage(title, message) {
    const params = {
      title: title,
      message: message,
      level: 'error',
      position: 'tr',
      style: false,
      autoDismiss: 0,
      onAdd: handleDialogs
    };
    this.refs.notificationSystem.addNotification(params);
  };

  showSuccessMessage(title, message) {
    this.refs.notificationSystem.addNotification({
      title: title,
      message: message,
      level: 'success',
      position: 'tr',
      style: false,
      autoDismiss: 0,
      onAdd: handleDialogs
    });
  }

  showWarningMessage(title, message) {
    this.refs.notificationSystem.addNotification({
      title: title,
      message: message,
      level: 'warning',
      position: 'tr',
      style: false,
      autoDismiss: 0,
      onAdd: handleDialogs
    });
  }

  correspondenceError(message) {
    this.showErrorMessage('Correspondence Error', message);
  }

  correspondenceSuccess() {
    this.showSuccessMessage('Correspondence Success', 'Correspondence sent successfully!');
  }

  accountIsLockedOut(message){
    this.showErrorMessage('Account Locked-Out', message);
  }

  systemError(message) {
    this.showErrorMessage(
      'System Error',
      (
        <div>
          <p>{'Oops! Something went wrong!'}</p>
          <p>{'Help us improve your experience by sending an error report via chat or email us at support@mediref.com.au'}</p>
          <p>{'Message: '+message}</p>
        </div>
      )
    );
  }

  settingsSuccess(message) {
    this.showSuccessMessage('Settings Success', message);
  }

  validationError(message) {
    this.showErrorMessage('Validation Error', message);
  }

  authenticationError(message) {
    this.showErrorMessage('Authentication Error', message);
  }

  passwordSuccess(message) {
    this.showSuccessMessage('Forgot Password Success', message);
  }

  render() {
    return (
      <NotificationSystem ref="notificationSystem" />
    );
  }
}

export default Notification;